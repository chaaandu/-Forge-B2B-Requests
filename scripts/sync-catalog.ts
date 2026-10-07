/**
 * Refresh the fallback snapshot, data/catalog.json, from the POS.
 *
 *   npm run catalog:sync
 *
 * The site reads the POS live (see src/lib/catalog.ts), so a new or archived
 * SKU shows up there within ten minutes on its own. This snapshot is what the
 * build prerenders product pages and the sitemap from, and what the site falls
 * back to if the POS is unreachable — so it has to be kept fresh, or archived
 * products linger on prerendered pages until the next deploy. A GitHub Action
 * (.github/workflows/catalog-sync.yml) runs this every morning and commits the
 * result, which redeploys the site.
 *
 * Only SKUs that are on sale make it in: status ACTIVE, which in Mesa means
 * offered on the till, on the team's Shopify store, or both. Drafts and
 * archived SKUs never do. See the query in src/lib/catalog-build.ts.
 *
 * Every photo is also looked at once (scripts/photo-check.ts): one that is
 * only an empty backdrop goes on the blank list in data/photo-check.json and
 * is treated as no photo, so it never fills a tile on the site. Photos
 * already looked at aren't downloaded again.
 *
 * The file is only rewritten when the catalogue itself changed. The snapshot
 * carries a `generatedAt` stamp, and rewriting it for that alone would commit
 * and redeploy the site every day for nothing.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog, photoId } from "../src/lib/catalog-build";
import { checkPhotos } from "./photo-check";
import type { Catalog } from "../src/lib/catalog-types";

const dbUrl = process.env.POS_DATABASE_URL;
const imageBase = process.env.POS_PUBLIC_BASE_URL;
if (!dbUrl || !imageBase) {
  console.error("Set POS_DATABASE_URL and POS_PUBLIC_BASE_URL (in .env.local, or as secrets for the GitHub Action).");
  process.exit(1);
}

/** Hand a value to the next step of a GitHub Action; a no-op anywhere else. */
const output = (name: string, value: string) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
};
/** Write to the run's summary page in GitHub; a no-op anywhere else. */
const summary = (md: string) => {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md + "\n");
};

const path = resolve(import.meta.dirname, "../data/catalog.json");
const before: Catalog | null = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;

// ── photos: look at the ones not seen before, and leave out the blank ones ──
const checkPath = resolve(import.meta.dirname, "../data/photo-check.json");
const check: { "//": string; blank: string[]; checked: string[] } = JSON.parse(readFileSync(checkPath, "utf8"));
let report = await buildCatalog(dbUrl, imageBase, process.env.POS_MEDIA_BASE_URL, check.blank);
const photos = new Map(
  report.catalog.listings
    .flatMap((l) => [...l.images, ...l.variants.map((v) => v.image)])
    .flatMap((u) => (u ? [[photoId(u), u] as const] : [])),
);
const known = new Set([...check.blank, ...check.checked]);
const fresh = new Map([...photos].filter(([id]) => !known.has(id)));
const found = fresh.size ? await checkPhotos(fresh) : { blank: [], fine: [] };
console.log(`Photos: ${photos.size} on sale, ${fresh.size} not seen before, ${found.blank.length} of them blank.`);
if (found.blank.length) report = await buildCatalog(dbUrl, imageBase, process.env.POS_MEDIA_BASE_URL, [...check.blank, ...found.blank]);
// `checked` keeps only photos still in use, so it doesn't grow forever; `blank` keeps everything.
const nextCheck = {
  "//": check["//"],
  blank: [...new Set([...check.blank, ...found.blank])].sort(),
  checked: [...new Set([...check.checked, ...found.fine])].filter((id) => photos.has(id)).sort(),
};
const checkChanged = JSON.stringify(nextCheck) !== JSON.stringify(check);
if (checkChanged) writeFileSync(checkPath, JSON.stringify(nextCheck, null, 2) + "\n");

const { catalog, unbrandedTeams, hidden, merged } = report;

const skus = catalog.listings.reduce((n, l) => n + l.variants.length, 0);
console.log(`Read ${catalog.listings.length} listings (${skus} SKUs) from ${catalog.brands.length} brands.`);

// Everything but the timestamp: is there anything new to say?
const content = (c: Catalog) => JSON.stringify({ ...c, generatedAt: undefined });
if (before && content(before) === content(catalog)) {
  // New photos looked at, nothing on the site changes: the list is still
  // committed, so they aren't downloaded again tomorrow.
  if (checkChanged) {
    const looked = `${fresh.size} new photos checked (${found.blank.length} blank)`;
    console.log(`No change to the catalogue; ${looked}.`);
    output("changed", "true");
    output("line", looked);
    summary(`### Catalogue unchanged\n\n${looked}.`);
    process.exit(0);
  }
  console.log(`No change since ${before.generatedAt}. Nothing written.`);
  output("changed", "false");
  summary(`### Catalogue unchanged\n\n${skus} SKUs on sale, same as ${before.generatedAt}. Nothing committed, no deploy.`);
  process.exit(0);
}

writeFileSync(path, JSON.stringify(catalog, null, 1) + "\n");

// What moved, by SKU, for the commit message and the run summary.
const bySku = (c: Catalog | null) =>
  new Map(
    (c?.listings ?? []).flatMap((l) =>
      l.variants.map((v) => [`${l.brand}:${v.sku}`, `${l.title}${v.label !== l.title ? ` · ${v.label}` : ""}`] as const),
    ),
  );
const was = bySku(before);
const now = bySku(catalog);
const added = [...now].filter(([k]) => !was.has(k));
const removed = [...was].filter(([k]) => !now.has(k));
const edited = !added.length && !removed.length;

const line = edited
  ? `prices, photos or details changed (${skus} SKUs)`
  : [
      added.length && `+${added.length} SKU${added.length === 1 ? "" : "s"}`,
      removed.length && `−${removed.length} SKU${removed.length === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(", ") + ` (${skus} on sale)`;
const withBlanks = found.blank.length ? `${line}; ${found.blank.length} blank photo${found.blank.length === 1 ? "" : "s"} left out` : line;
console.log(`Wrote data/catalog.json: ${withBlanks}.`);
output("changed", "true");
output("line", withBlanks);

const list = (rows: (readonly [string, string])[]) =>
  rows
    .slice(0, 60)
    .map(([k, t]) => `| ${k.split(":")[0]} | ${t} |`)
    .join("\n") + (rows.length > 60 ? `\n| … | and ${rows.length - 60} more |` : "");
summary(`### Catalogue updated: ${withBlanks}`);
if (added.length) summary(`\n**New on sale (${added.length})**\n\n| Brand | SKU |\n| --- | --- |\n${list(added)}`);
if (removed.length)
  summary(
    `\n**No longer on sale (${removed.length})** — archived, drafted or deleted in the POS\n\n| Brand | SKU |\n| --- | --- |\n${list(removed)}`,
  );

if (added.length) console.log(`  new on sale (${added.length}):\n` + added.map(([k, t]) => `    ${k}  ${t}`).join("\n"));
if (removed.length) console.log(`  no longer on sale (${removed.length}):\n` + removed.map(([k, t]) => `    ${k}  ${t}`).join("\n"));
if (hidden.length) {
  console.log(`  hidden by data/curation.json (${hidden.length}):`);
  for (const h of hidden) console.log(`    ${h.brand} — ${h.title}  [${h.why}]`);
}
if (merged.length) console.log(`  merged into one product with options: ${merged.length}`);
if (unbrandedTeams.length) console.log(`  skipped — no brand in data/brands.json: ${unbrandedTeams.join(", ")}`);
