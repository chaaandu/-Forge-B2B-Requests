/**
 * Build the catalogue straight from the POS database.
 *
 * Used two ways:
 *  - by the site at runtime (src/lib/catalog.ts), cached and refreshed every
 *    few minutes, so a team's edits in the POS reach buyers without anyone
 *    running anything;
 *  - by `npm run catalog:sync`, which writes the same result to
 *    data/catalog.json — the snapshot the site falls back on when the
 *    database can't be reached.
 *
 * Everything runs inside a READ ONLY transaction, so nothing in here can write
 * to the till's database.
 *
 * The POS is a till, and its catalogue is shaped for cashiers: the same cookie
 * entered three times at three sizes, a size option a student named "Weight",
 * a TEST product. A buyer should see one product with choices, so the steps
 * below are, in order:
 *
 *   1. read ACTIVE products of active, branded teams;
 *   2. one listing per POS variant group (or per lone SKU);
 *   3. drop what data/curation.json hides;
 *   4. tidy titles and option names;
 *   5. merge a brand's listings that are really one product (same title, or
 *      the same title at different sizes) into one listing with options;
 *   6. file each listing under a collection — curation rules first, then the
 *      brand's own collection;
 *   7. slugs, featured picks, order.
 */
import pg from "pg";
import brandsFile from "../../data/brands.json";
import curationFile from "../../data/curation.json";
import type { Brand, Catalog, CollectionId, Listing, Variant } from "./catalog-types";
import { ventureName } from "./venture-name";

type BrandEntry = Omit<Brand, "logo">;
const brandEntries = brandsFile as BrandEntry[];

interface Curation {
  hide: { brand: string; match: string; why: string }[];
  hideSkus: string[];
  hideBrands: string[];
  blankPhotos?: string[];
  collectionRules: { brand: string; match: string; collection: CollectionId; onlyIn?: CollectionId[] }[];
  featured: string[];
}
const curation = curationFile as unknown as Curation;

interface Row {
  id: string;
  teamCode: string;
  teamLogo: string | null;
  sku: string;
  name: string;
  description: string | null;
  unitPriceMinor: number;
  compareAtPriceMinor: number | null;
  variantGroupId: string | null;
  variantOptionValues: string[];
  groupTitle: string | null;
  groupOptions: { name: string; values: string[] }[] | null;
  images: string[];
}

/**
 * Only SKUs that are on sale. In Mesa a SKU has ONE status across every
 * channel, and the POS is the system of record that pushes it to Shopify:
 *
 *   ACTIVE   on sale — on the till, on the team's Shopify store, or both
 *            (salesChannel BOTH, POS_ONLY or SHOPIFY_ONLY; all three count)
 *   DRAFT    not on sale anywhere yet          → never shown here
 *   ARCHIVED taken off sale, till and Shopify  → never shown here
 *
 * So `status = 'ACTIVE'` is the whole rule, and there is deliberately no
 * filter on salesChannel: a POS_ONLY SKU is fully on sale, just not online.
 */
const QUERY = `
  select p.id, t.code as "teamCode", t."logoUrl" as "teamLogo", p.sku, p.name, p.description,
         p."unitPriceMinor", p."compareAtPriceMinor",
         p."variantGroupId", p."variantOptionValues",
         g.title as "groupTitle",
         (select json_agg(json_build_object('name', o.name, 'values', o.values) order by o.position)
            from "ProductVariantOption" o where o."groupId" = g.id) as "groupOptions",
         coalesce((select array_agg(i.url order by i.position)
            from "ProductImage" i where i."productId" = p.id), '{}') as images
    from "Product" p
    join "Team" t on t.id = p."teamId"
    left join "ProductVariantGroup" g on g.id = p."variantGroupId"
   where p.status = 'ACTIVE' and t."isActive" and t.code is not null
     and p."unitPriceMinor" > 0
   order by t.code, p."variantGroupId" nulls last, p."variantPosition" nulls last, p.sku`;

export async function readRows(dbUrl: string): Promise<Row[]> {
  // Supabase URLs carry `sslmode=require`, which node-postgres now reads as
  // "verify the chain" — the pooler's chain doesn't verify, so TLS is set here.
  const url = new URL(dbUrl);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("schema");
  const client = new pg.Client({
    connectionString: url.toString(),
    ssl: url.hostname === "localhost" ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10_000,
    statement_timeout: 20_000,
  });
  await client.connect();
  try {
    await client.query("BEGIN READ ONLY");
    const res = await client.query<Row>(QUERY);
    await client.query("COMMIT");
    return res.rows;
  } finally {
    await client.end();
  }
}

/** A listing before it has a slug, a collection or a featured flag. */
interface Draft {
  brand: BrandEntry;
  title: string;
  description: string | null;
  options: { name: string; values: string[] }[];
  variants: Variant[];
  images: string[];
}

export interface BuildReport {
  catalog: Catalog;
  unbrandedTeams: string[];
  hidden: { brand: string; title: string; why: string }[];
  merged: { brand: string; title: string; from: number }[];
}

export async function buildCatalog(dbUrl: string, imageBase: string, mediaBase?: string): Promise<BuildReport> {
  const rows = await readRows(dbUrl);
  const base = imageBase.replace(/\/$/, "");
  const media = mediaBase?.replace(/\/$/, "");
  // The POS stores `/files/products/<uuid>.jpg` and serves it through its own
  // API — which rate-limits per network and is what the tills talk to. With the
  // storage bucket's public URL configured, photos are fetched from there
  // instead, so a busy afternoon on this site can never slow a till down.
  const absolute = (path: string) =>
    path.startsWith("http") ? path : media && path.startsWith("/files/") ? `${media}/${path.slice("/files/".length)}` : `${base}${path}`;

  // An uploaded "photo" that's only an empty backdrop counts as no photo.
  const photosOf = (r: Row) => r.images.filter((p) => !curation.blankPhotos?.some((id) => p.includes(id)));

  // ── 1–2. rows → one draft per variant group / lone SKU ──────────────────
  const brandByCode = new Map(brandEntries.map((b) => [b.teamCode, b]));
  const logos = new Map<string, string | null>();
  const unbranded = new Set<string>();
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    if (!brandByCode.has(r.teamCode)) {
      unbranded.add(r.teamCode);
      continue;
    }
    logos.set(r.teamCode, r.teamLogo ? absolute(r.teamLogo) : null);
    if (curation.hideBrands.includes(r.teamCode) || curation.hideSkus.includes(`${r.teamCode}:${r.sku}`)) continue;
    const key = r.variantGroupId ?? r.id;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  let drafts: Draft[] = [...groups.values()].map((members) => {
    const first = members[0];
    const grouped = first.variantGroupId !== null && !!first.groupOptions?.length;
    const title = tidyTitle(grouped ? (first.groupTitle ?? first.name) : first.name);
    return {
      brand: brandByCode.get(first.teamCode)!,
      title,
      description: members.map((m) => tidyText(m.description)).find(Boolean) ?? null,
      options: grouped ? first.groupOptions!.map((o) => ({ name: o.name.trim(), values: o.values })) : [],
      variants: members.map((m) => ({
        sku: m.sku,
        label: grouped && m.variantOptionValues.length ? m.variantOptionValues.join(" / ") : tidyTitle(m.name),
        options: grouped ? m.variantOptionValues : [],
        priceMinor: m.unitPriceMinor,
        compareAtMinor: m.compareAtPriceMinor && m.compareAtPriceMinor > m.unitPriceMinor ? m.compareAtPriceMinor : null,
        image: photosOf(m)[0] ? absolute(photosOf(m)[0]) : null,
      })),
      images: [...new Set(members.flatMap((m) => photosOf(m).map(absolute)))],
    };
  });

  // "Juzzle Assorted Collection" under Juzzle, "Ember & Oak Lavender Candle"
  // under Ember & Oak: the brand is printed above every title already.
  for (const d of drafts) {
    const t = d.title.replace(new RegExp(`^${escapeRx(d.brand.name)}[\\s:|–—-]+`, "i"), "");
    if (t !== d.title && t.length > 2) d.title = t[0].toUpperCase() + t.slice(1);
  }

  // ── 3. hide ─────────────────────────────────────────────────────────────
  const hidden: BuildReport["hidden"] = [];
  drafts = drafts.filter((d) => {
    const rule = curation.hide.find(
      (h) => (h.brand === "*" || h.brand === d.brand.slug) && (rx(h.match).test(d.title) || rx(h.match).test(d.description ?? "")),
    );
    if (rule) hidden.push({ brand: d.brand.name, title: d.title, why: rule.why });
    return !rule;
  });

  // ── 4. options as a buyer should see them ───────────────────────────────
  for (const d of drafts) {
    // Only offer values some SKU actually has.
    d.options = d.options
      .map((o, i) => ({ ...o, values: o.values.filter((v) => d.variants.some((x) => x.options[i] === v)) }))
      // "Weight: XS, S, M, L" — a size option a student named by mistake.
      .map((o) => (o.values.length && o.values.every((v) => CLOTHING_SIZE.test(v.trim())) ? { ...o, name: "Size" } : o));
    // A variant group holding one SKU isn't a choice. Fold its weight into the
    // title (`Almond Blueberry` + `25` → `Almond Blueberry 25g`) so it can line
    // up with its siblings entered as separate products.
    if (d.variants.length === 1 && d.options.length) {
      const [v] = d.variants;
      const weight = d.options.findIndex((o) => /weight|size|qty|grams?/i.test(o.name));
      const value = weight >= 0 ? v.options[weight] : undefined;
      if (value && /^\d+(\.\d+)?\s*(g|gm|kg|ml|l)?$/i.test(value) && !SIZE_TOKEN.test(d.title)) {
        d.title = `${d.title} ${/[a-z]$/i.test(value) ? value.replace(/\s+/g, "") : `${value}${/^ml|ml/i.test(d.options[weight].name) ? "ml" : "g"}`}`;
      }
      d.options = [];
      d.variants = [{ ...v, label: d.title, options: [] }];
    }
  }

  // ── 5. merge what is really one product ─────────────────────────────────
  const merged: BuildReport["merged"] = [];
  const byKey = new Map<string, Draft[]>();
  for (const d of drafts) {
    const key = `${d.brand.slug}|${baseTitle(d.title).key}`;
    byKey.set(key, [...(byKey.get(key) ?? []), d]);
  }
  drafts = [...byKey.values()].flatMap((set) => {
    if (set.length === 1) return set;
    const one = mergeDrafts(set);
    if (one) merged.push({ brand: one.brand.name, title: one.title, from: set.length });
    return one ? [one] : set;
  });

  // ── 6–7. collection, slug, featured, order ──────────────────────────────
  const slugBase = (d: Draft) => `${d.brand.slug}-${slugify(d.title)}`;
  const baseCount = new Map<string, number>();
  for (const d of drafts) baseCount.set(slugBase(d), (baseCount.get(slugBase(d)) ?? 0) + 1);

  const listings: Listing[] = drafts.map((d) => {
    // Where two of a brand's listings still share a title, both get their first
    // SKU appended — SKU codes are never renumbered, so those links stay put.
    const sb = slugBase(d);
    const prices = d.variants.map((v) => v.priceMinor);
    return {
      slug: baseCount.get(sb)! > 1 ? `${sb}-${slugify(d.variants[0].sku)}` : sb,
      brand: d.brand.slug,
      title: d.title,
      // A description that only repeats the title says nothing.
      description: d.description && d.description.toLowerCase() !== d.title.toLowerCase() ? d.description : null,
      collection: collectionFor(d),
      images: d.images.slice(0, 8),
      options: d.options,
      variants: d.variants,
      priceFromMinor: Math.min(...prices),
      priceToMinor: Math.max(...prices),
      featured: false,
    };
  });

  if (curation.featured.length) {
    for (const l of listings) l.featured = curation.featured.includes(l.slug);
  } else {
    // Each brand's best-photographed listing, so the front page shows every maker.
    const best = new Map<string, Listing>();
    for (const l of listings) {
      const cur = best.get(l.brand);
      if (l.images.length && (!cur || l.images.length > cur.images.length)) best.set(l.brand, l);
    }
    for (const l of best.values()) l.featured = true;
  }

  // Photographed listings first within each brand: blank tiles read as an empty shop.
  listings.sort(
    (a, b) => a.brand.localeCompare(b.brand) || Number(!a.images.length) - Number(!b.images.length) || a.title.localeCompare(b.title),
  );

  const brands: Brand[] = brandEntries
    .filter((b) => listings.some((l) => l.brand === b.slug))
    .map((b) => ({ ...b, name: ventureName(b.name), logo: logos.get(b.teamCode) ?? null }));

  return {
    catalog: { generatedAt: new Date().toISOString(), brands, listings },
    unbrandedTeams: [...unbranded],
    hidden,
    merged,
  };
}

// ── collections ─────────────────────────────────────────────────────────────

function collectionFor(d: Draft): CollectionId {
  const home = d.brand.collection;
  const text = d.title;
  for (const r of curation.collectionRules) {
    if (r.brand !== "*" && r.brand !== d.brand.slug) continue;
    if (r.onlyIn && !r.onlyIn.includes(home)) continue;
    if (rx(r.match).test(text)) return r.collection;
  }
  return home;
}

// ── merging ─────────────────────────────────────────────────────────────────

const SIZE_TOKEN = /\(?\b(\d+(?:\.\d+)?\s?(?:g|gm|gms|kg|ml|l|ltr|pcs?))\b\)?|\bjar\b/i;
const CLOTHING_SIZE = /^(xxs|xs|s|m|l|xl|xxl|xxxl|[2-5]xl|free ?size|\d{2})$/i;

/** `Almond Blueberry 100g` → key `almond blueberry`, size `100g`. Plural last word folded. */
function baseTitle(title: string): { key: string; display: string; size: string | null } {
  const m = title.match(SIZE_TOKEN);
  const raw = m ? (m[1] ?? m[0]).replace(/\s+/g, "").toLowerCase() : null;
  const size = raw === "jar" ? "Jar" : raw;
  const display = (m ? title.replace(m[0], " ") : title)
    .replace(/\s+/g, " ")
    .replace(/\(\s*\)/g, "")
    .trim()
    .replace(/[\s|–—-]+$/, "");
  const key = display
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(\w{3,})s$/, "$1");
  return { key, display, size };
}

/**
 * Fold several of a brand's listings into one, or return null when they can't
 * be told apart well enough to offer as choices.
 */
function mergeDrafts(set: Draft[]): Draft | null {
  const brand = set[0].brand;
  const allSimple = set.every((d) => d.options.length === 0 && d.variants.length === 1);
  const optionNames = (d: Draft) => d.options.map((o) => o.name.toLowerCase()).join("|");
  const sameOptions = set.every((d) => d.options.length > 0 && optionNames(d) === optionNames(set[0]));

  const title = set.map((d) => baseTitle(d.title).display).sort((a, b) => a.length - b.length)[0];
  const images = [...new Set(set.flatMap((d) => d.images))];
  const description = set.map((d) => d.description).find(Boolean) ?? null;

  if (allSimple) {
    const variants = set.map((d) => d.variants[0]).sort((a, b) => a.priceMinor - b.priceMinor);
    const owner = new Map(set.map((d) => [d.variants[0].sku, d]));
    const sizes = variants.map((v) => baseTitle(owner.get(v.sku)!.title).size);
    const shortDescs = variants.map((v) => {
      const desc = owner.get(v.sku)!.description;
      return desc && desc.length <= 40 ? desc : null;
    });

    let name: string;
    let labels: string[];
    if (sizes.some(Boolean) && distinct(sizes.map((s) => s ?? "Regular"))) {
      name = "Size";
      labels = sizes.map((s) => s ?? "Regular");
    } else if (shortDescs.every(Boolean) && distinct(shortDescs as string[])) {
      name = "Style";
      labels = shortDescs as string[];
    } else if (distinct(variants.map((v) => String(v.priceMinor)))) {
      name = "Pack";
      labels = variants.map((v) => `₹${(v.priceMinor / 100).toLocaleString("en-IN")} pack`);
    } else if (variants.every((v) => v.image) && distinct(variants.map((v) => v.image!))) {
      // Same name, same price, different photos: different designs.
      name = "Design";
      labels = variants.map((_, i) => `Design ${i + 1}`);
    } else {
      return null;
    }
    return {
      brand,
      title,
      description,
      options: [{ name, values: labels }],
      variants: variants.map((v, i) => ({ ...v, label: labels[i], options: [labels[i]] })),
      images,
    };
  }

  // One listing with a size option, others entered separately at other sizes
  // (Almond Dragées 100g/250g as a group, 50g on its own): one size option.
  const grouped = set.filter((d) => d.options.length === 1);
  const loose = set.filter((d) => d.options.length === 0 && d.variants.length === 1);
  if (
    grouped.length &&
    grouped.length + loose.length === set.length &&
    grouped.every((d) => d.options[0].name.toLowerCase() === grouped[0].options[0].name.toLowerCase()) &&
    loose.every((d) => baseTitle(d.title).size)
  ) {
    const variants = [
      ...grouped.flatMap((d) => d.variants),
      ...loose.map((d) => {
        const size = baseTitle(d.title).size!;
        return { ...d.variants[0], label: size, options: [size] };
      }),
    ].sort((a, b) => a.priceMinor - b.priceMinor);
    if (distinct(variants.map((v) => v.options[0]))) {
      return {
        brand,
        title,
        description,
        options: [{ name: grouped[0].options[0].name, values: variants.map((v) => v.options[0]) }],
        variants,
        images,
      };
    }
  }

  if (sameOptions) {
    const tuples = set.flatMap((d) => d.variants.map((v) => v.options.join("|")));
    if (distinct(tuples)) {
      // Halves of one variant group split in the POS (100g/250g here, 50g
      // there): one product, every size.
      const options = set[0].options.map((o, i) => ({
        name: o.name,
        values: unique(set.flatMap((d) => d.variants.map((v) => v.options[i]))),
      }));
      const variants = set.flatMap((d) => d.variants).sort((a, b) => a.priceMinor - b.priceMinor);
      return { brand, title, description, options, variants, images };
    }
    // The same sized product in several designs: Design becomes the first option.
    const labels = set.map((d, i) => (d.description && d.description.length <= 40 ? d.description : `Design ${i + 1}`));
    if (!distinct(labels)) return null;
    return {
      brand,
      title,
      description: null,
      options: [{ name: "Design", values: labels }, ...set[0].options],
      variants: set.flatMap((d, i) =>
        d.variants.map((v) => ({
          ...v,
          label: `${labels[i]} / ${v.label}`,
          options: [labels[i], ...v.options],
          image: v.image ?? d.images[0] ?? null,
        })),
      ),
      images,
    };
  }

  return null;
}

const distinct = (xs: string[]) => new Set(xs.map((x) => x.toLowerCase())).size === xs.length;
const unique = (xs: string[]) => [...new Set(xs)];
const rx = (pattern: string) => new RegExp(pattern, "i");
const escapeRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── cleaning ────────────────────────────────────────────────────────────────

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const SMALL_WORDS = new Set(["and", "of", "with", "in", "for"]);
const UNIT = /^\d*(?:ml|g|gm|gms|kg|l|ltr|pcs?)$/i;
const ACRONYMS = new Set(["RCB", "FSS", "USA", "UK", "DIY", "XS", "XL", "XXL", "F1", "SK1", "VL101", "N"]);

/**
 * `pudina Makhana 40g` → `Pudina Makhana 40g`; `BLACK BLAZE 50ml` → `Black Blaze 50ml`.
 * Short capitals (`FSS`, `RCB`) are left as acronyms; units stay lower-case.
 */
const tidyTitle = (s: string) => {
  // Separators the way the site writes them: "Aroma Oil · Cinnamon", never
  // an em dash, a lone hyphen between words, or a row of pipes.
  const clean = stripInvisible(s)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s+[—–|]\s+|\s+-\s+/g, " · ");
  // Typed with caps lock on: every word gets title-cased, not just the long ones.
  const letters = clean.replace(/[^a-z]/gi, "");
  const shouting = letters.length > 3 && letters.replace(/[^A-Z]/g, "").length / letters.length > 0.8;
  return clean
    .split(" ")
    .map((w) => {
      if (UNIT.test(w)) return w.toLowerCase();
      if (ACRONYMS.has(w)) return w;
      if (/^[A-Z][A-Z'’]{3,}$/.test(w) || (shouting && /^[A-Z][A-Z'’]+$/.test(w))) return w[0] + w.slice(1).toLowerCase();
      if (/^[a-z][a-z'’]*$/.test(w) && w.length > 1 && !SMALL_WORDS.has(w)) return w[0].toUpperCase() + w.slice(1);
      return w;
    })
    .join(" ")
    .replace(/^./, (c) => c.toUpperCase());
};

/** Zero-width spaces and BOMs pasted in from other apps. */
const stripInvisible = (s: string) => s.replace(new RegExp("[\\u200B-\\u200D\\uFEFF]", "g"), "");

const tidyText = (s: string | null) => {
  const t = s
    ? stripInvisible(s)
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s*[—–]\s*/g, ", ")
    : "";
  return t ? t[0].toUpperCase() + t.slice(1) : null;
};
