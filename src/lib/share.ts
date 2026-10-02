import { canonicalBrand } from "./brand-teams";

/**
 * A request list as a URL-safe string: `brand~sku~qty` joined by `|`, then
 * base64url. Only identities and quantities travel — names and prices are
 * looked up again from the catalogue on the other end, and notes stay private
 * to whoever wrote them.
 */
export interface SharedLine {
  brand: string;
  sku: string;
  qty: number;
}

export function encodeList(lines: SharedLine[]): string {
  const raw = lines.map((l) => [l.brand, l.sku, l.qty].join("~")).join("|");
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeList(encoded: string): SharedLine[] {
  try {
    return atob(encoded.replace(/-/g, "+").replace(/_/g, "/"))
      .split("|")
      .map((part) => part.split("~"))
      .filter((p) => p.length === 3)
      .map(([brand, sku, qty]) => ({ brand: canonicalBrand(brand), sku, qty: Math.max(1, Math.round(Number(qty)) || 1) }))
      .slice(0, 200);
  } catch {
    return [];
  }
}
