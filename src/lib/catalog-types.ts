/**
 * The catalogue as the site sees it — built from the POS database by
 * src/lib/catalog-build.ts, live at runtime and as the data/catalog.json
 * fallback snapshot.
 */

/**
 * The shelves, in the order a corporate buyer reaches for them: ready-made
 * hampers first. `icon` is a Fluent 3D emoji in public/icons3d (MIT, Microsoft).
 */
export const COLLECTIONS = [
  { id: "hampers", name: "Gift Hampers", short: "Hampers", icon: "wrapped-gift", blurb: "Ready-made boxes and combos" },
  { id: "snacks", name: "Savoury Snacks", short: "Savoury", icon: "peanuts", blurb: "Chips, makhana, nuts and dry fruits" },
  { id: "sweets", name: "Sweet Treats", short: "Sweet", icon: "cookie", blurb: "Cookies, chocolates, brittles, honey" },
  { id: "beverages", name: "Tea, Coffee & Cocoa", short: "Tea & Coffee", icon: "hot-beverage", blurb: "Teas, coffees and hot chocolate" },
  { id: "fragrance", name: "Fragrance & Self-care", short: "Fragrance", icon: "lotion-bottle", blurb: "Perfumes and self-care" },
  { id: "home", name: "Home & Candles", short: "Home", icon: "candle", blurb: "Candles, diffusers, mugs, ceramics" },
  { id: "apparel", name: "Apparel", short: "Apparel", icon: "t-shirt", blurb: "Shirts, kurtas, linen, sarees, tees" },
  { id: "accessories", name: "Bags & Accessories", short: "Accessories", icon: "handbag", blurb: "Totes, jewellery, socks, patches" },
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
