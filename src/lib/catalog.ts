import "server-only";
import { unstable_cache } from "next/cache";
import snapshot from "../../data/catalog.json";
import { buildCatalog } from "./catalog-build";
import { urlEnv } from "./env";
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
 * Falls back to the committed data/catalog.json snapshot when there's no
 * database configured or it can't be reached, so a POS outage never takes the
 * shop down with it.
 */
const loadCatalog = unstable_cache(
  async (): Promise<Catalog> => {
    const dbUrl = urlEnv("POS_DATABASE_URL");
    const imageBase = urlEnv("POS_PUBLIC_BASE_URL");
    if (!dbUrl || !imageBase) return snapshot as Catalog;
    try {
      const { catalog } = await buildCatalog(dbUrl, imageBase, urlEnv("POS_MEDIA_BASE_URL"));
      return catalog;
    } catch (err) {
      console.error("[catalog] POS unreachable, serving the snapshot instead:", err);
      return snapshot as Catalog;
    }
  },
  ["catalog-v7"],
  { revalidate: REFRESH_SECONDS, tags: ["catalog"] },
);

export async function getCatalog(): Promise<CatalogView> {
  return view(await loadCatalog());
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
    brand: (slug) => brands.get(slug),
    listing: (slug) => listings.get(slug),
    listingsOf: (slug) => c.listings.filter((l) => l.brand === slug),
    listingsIn: (id) => c.listings.filter((l) => l.collection === id),
    findVariant: (brandSlug, sku) => {
      const hit = skus.get(`${brandSlug}:${sku}`);
      return hit && { ...hit, brand: brands.get(brandSlug)! };
    },
    totals: { brands: c.brands.length, listings: c.listings.length, skus: skus.size },
  };
  views.set(c, v);
  return v;
}

export function getCollection(id: string) {
  return COLLECTIONS.find((c) => c.id === id);
}
