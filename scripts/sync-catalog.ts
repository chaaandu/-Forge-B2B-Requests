/**
 * Refresh the fallback snapshot, data/catalog.json, from the POS.
 *
 *   npm run catalog:sync
 *
 * The site reads the POS live (see src/lib/catalog.ts); this snapshot is only
 * what it shows if the POS database is unreachable, or when no database is
 * configured at all. Run it now and then and commit the result.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildCatalog } from "../src/lib/catalog-build";

const dbUrl = process.env.POS_DATABASE_URL;
const imageBase = process.env.POS_PUBLIC_BASE_URL;
if (!dbUrl || !imageBase) {
  console.error("Set POS_DATABASE_URL and POS_PUBLIC_BASE_URL in .env.local first (see .env.example).");
  process.exit(1);
}

const { catalog, unbrandedTeams, hidden, merged } = await buildCatalog(dbUrl, imageBase, process.env.POS_MEDIA_BASE_URL);
writeFileSync(resolve(import.meta.dirname, "../data/catalog.json"), JSON.stringify(catalog, null, 1) + "\n");

const skus = catalog.listings.reduce((n, l) => n + l.variants.length, 0);
console.log(`Wrote ${catalog.listings.length} listings (${skus} SKUs) from ${catalog.brands.length} brands.`);
console.log(`  featured: ${catalog.listings.filter((l) => l.featured).length}`);
if (hidden.length) {
  console.log(`  hidden by data/curation.json (${hidden.length}):`);
  for (const h of hidden) console.log(`    ${h.brand} — ${h.title}  [${h.why}]`);
}
if (merged.length) {
  console.log(`  merged into one product with options (${merged.length}):`);
  for (const m of merged) console.log(`    ${m.brand} — ${m.title}  (${m.from} listings)`);
}
if (unbrandedTeams.length) console.log(`  skipped — no brand in data/brands.json: ${unbrandedTeams.join(", ")}`);
