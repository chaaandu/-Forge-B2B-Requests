import "server-only";
import type { CatalogView } from "./catalog";
import { TIERS } from "./hampers";

/**
 * A photo for every hamper pick, keyed `amount:id`, found among its brand's
 * live products by the pick's `match`, else the brand's first photo. Looked
 * up on every refresh, so a team's new product shot shows up here too.
 */
export function pickPhotos(catalog: CatalogView): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const t of TIERS) {
    for (const p of t.picks) {
      const shots = catalog.listingsOf(p.brand).filter((l) => l.images[0]);
      const re = new RegExp(p.match, "i");
      out[`${t.amount}:${p.id}`] = (shots.find((l) => re.test(l.title)) ?? shots[0])?.images[0] ?? null;
    }
  }
  return out;
}
