import "server-only";
import { unstable_cache } from "next/cache";
import snapshot from "../../data/catalog.json";
import { buildCatalog, RULES_VERSION } from "./catalog-build";
import { urlEnv } from "./env";
import { canonicalBrand } from "./brand-teams";
import { COLLECTIONS, type Brand, type Catalog, type CollectionId, type Listing } from "./catalog-types";

/**
 * How stale the site may be behind the POS. A team that adds a product, edits
 * a price or archives something sees it on the site within this long — no
 * sync to run, no redeploy.
 */
export const REFRESH_SECONDS = 600;

/**
 * The live catalogue: read from the POS, cached for REFRESH_SECONDS, and
 * rebuilt in the background once stale (visitors never wait on the database).
 *
 * A failed read throws out of the cache rather than being cached, so the
 * snapshot that stands in for it lasts one request, not ten minutes.
 */
const loadLive = unstable_cache(
  async (dbUrl: string, imageBase: string, mediaBase: string | undefined): Promise<Catalog> =>
    (await buildCatalog(dbUrl, imageBase, mediaBase)).catalog,
  // Keyed on the hand edits and the blank-photo list too, so a change to
  // either is read fresh rather than served from the old cache.
  ["catalog-v13", RULES_VERSION],
  { revalidate: REFRESH_SECONDS, tags: ["catalog"] },
);

export type CatalogSource = "live" | "snapshot";

/** Where the last catalogue came from, and why not live if it didn't. For /api/catalog-status. */
export const health: { source: CatalogSource; reason: string | null } = { source: "snapshot", reason: "not loaded yet" };

/**
 * The catalogue, falling back to the committed data/catalog.json snapshot when
 * there's no database configured, when the POS can't be reached (so a POS
 * outage never takes the shop down), and during `next build`.
 *
 * Why not at build: the build renders every page across several workers at
 * once, each with its own cache, and every one of them would open a database
 * connection in the same second — past the read-only login's connection
 * limit. Pages are built from the snapshot and pick up live data on their
 * first revalidation, within REFRESH_SECONDS of the deploy.
 */
export async function getCatalog(): Promise<CatalogView> {
  const dbUrl = urlEnv("POS_DATABASE_URL");
  const imageBase = urlEnv("POS_PUBLIC_BASE_URL");
  const fallback = (reason: string) => {
    health.source = "snapshot";
    health.reason = reason;
    return view(snapshot as Catalog);
  };
  if (process.env.NEXT_PHASE === "phase-production-build") return fallback("building");
  if (!dbUrl || !imageBase) return fallback("POS_DATABASE_URL or POS_PUBLIC_BASE_URL is not set");
  try {
    const live = await loadLive(dbUrl, imageBase, urlEnv("POS_MEDIA_BASE_URL"));
    health.source = "live";
    health.reason = null;
    return view(live);
  } catch (err) {
    console.error("[catalog] POS unreachable, serving the snapshot instead:", err);
    // Never echo a connection string back out.
    return fallback(String((err as Error)?.message ?? err).replace(/\w+:\/\/[^\s@]+@/g, "…@"));
  }
}

export interface CatalogView extends Catalog {
  brand(slug: string): Brand | undefined;
  listing(slug: string): Listing | undefined;
  listingsOf(brandSlug: string): Listing[];
  listingsIn(collection: CollectionId): Listing[];
  /** Find a SKU by brand + code (SKU codes are only unique within a team). */
  findVariant(brandSlug: string, sku: string): { listing: Listing; variant: Listing["variants"][number]; brand: Brand } | undefined;
  totals: { brands: number; listings: number; skus: number };
}

// One view per catalogue object, so the lookup maps are built once per refresh.
const views = new WeakMap<Catalog, CatalogView>();

function view(c: Catalog): CatalogView {
  const cached = views.get(c);
  if (cached) return cached;
  const brands = new Map(c.brands.map((b) => [b.slug, b]));
  const listings = new Map(c.listings.map((l) => [l.slug, l]));
  const skus = new Map<string, { listing: Listing; variant: Listing["variants"][number] }>();
  for (const l of c.listings) for (const v of l.variants) skus.set(`${l.brand}:${v.sku}`, { listing: l, variant: v });

  const v: CatalogView = {
    ...c,
    brand: (slug) => brands.get(canonicalBrand(slug)),
    listing: (slug) => listings.get(slug),
    listingsOf: (slug) => c.listings.filter((l) => l.brand === slug),
    listingsIn: (id) => c.listings.filter((l) => l.collection === id),
    findVariant: (brandSlug, sku) => {
      const slug = canonicalBrand(brandSlug);
      const hit = skus.get(`${slug}:${sku}`);
      return hit && { ...hit, brand: brands.get(slug)! };
    },
    totals: { brands: c.brands.length, listings: c.listings.length, skus: skus.size },
  };
  views.set(c, v);
  return v;
}

export function getCollection(id: string) {
  return COLLECTIONS.find((c) => c.id === id);
}
