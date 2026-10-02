/**
 * The catalogue as the site sees it — built from the POS database by
 * src/lib/catalog-build.ts, live at runtime and as the data/catalog.json
 * fallback snapshot.
 */

/**
 * The shelves, in the order a corporate buyer reaches for them: ready-made
 * hampers first. `icon` names a drawing in components/doodles.tsx.
 */
export const COLLECTIONS = [
  { id: "hampers", name: "Gift Hampers", short: "Hampers", icon: "gift", blurb: "Ready-made boxes. Zero effort, full credit" },
  { id: "snacks", name: "Savoury Snacks", short: "Savoury", icon: "chips", blurb: "Chips, makhana, nuts. The good crunch" },
  { id: "sweets", name: "Sweet Treats", short: "Sweet", icon: "cookie", blurb: "Cookies, chocolates, brittles. Kuch meetha?" },
  { id: "beverages", name: "Tea, Coffee & Cocoa", short: "Tea & Coffee", icon: "mug", blurb: "For every 4pm slump" },
  { id: "fragrance", name: "Fragrance & Self-care", short: "Fragrance", icon: "perfume", blurb: "Perfumes that start conversations" },
  { id: "home", name: "Home & Candles", short: "Home", icon: "candle", blurb: "Candles, diffusers, mugs, ceramics" },
  { id: "apparel", name: "Apparel", short: "Apparel", icon: "tee", blurb: "Shirts, kurtas, linen, sarees, tees" },
  { id: "accessories", name: "Bags & Accessories", short: "Accessories", icon: "tote", blurb: "Totes, jewellery, socks, patches" },
] as const;

export type CollectionId = (typeof COLLECTIONS)[number]["id"];

export interface Brand {
  /** The POS team code — `C135`. Travels with every request line so the team can be told. */
  teamCode: string;
  slug: string;
  name: string;
  tagline: string;
  collection: CollectionId;
  website: string | null;
  instagram: string | null;
  /** The team's logo as uploaded in the POS, or null until they upload one. */
  logo: string | null;
}

/** One sellable SKU. Prices are integer paise, exactly as the POS stores them. */
export interface Variant {
  sku: string;
  /** `M / Black`, or the product's own name for a listing with no options. */
  label: string;
  /** This SKU's answer to each of the listing's options, in the options' order. */
  options: string[];
  priceMinor: number;
  compareAtMinor: number | null;
  image: string | null;
}

/** What a buyer browses: one product, with every size/flavour of it inside. */
export interface Listing {
  slug: string;
  brand: string;
  title: string;
  description: string | null;
  collection: CollectionId;
  images: string[];
  options: { name: string; values: string[] }[];
  variants: Variant[];
  priceFromMinor: number;
  priceToMinor: number;
  featured: boolean;
}

export interface Catalog {
  generatedAt: string;
  brands: Brand[];
  listings: Listing[];
}
