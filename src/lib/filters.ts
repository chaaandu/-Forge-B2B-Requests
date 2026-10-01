export interface Filters {
  q: string;
  /** A collection id, or "" for everything. */
  collection: string;
  /** An occasion id (lib/occasions) — a set of collections. Ignored when `collection` is set. */
  occasion: string;
  brand: string;
  price: string;
  sort: string;
}

export const NO_FILTERS: Filters = { q: "", collection: "", occasion: "", brand: "", price: "", sort: "" };

export function filtersFrom(sp: Record<string, string | string[] | undefined>): Filters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return {
    q: one("q"),
    collection: one("collection"),
    occasion: one("occasion"),
    brand: one("brand"),
    price: one("price"),
    sort: one("sort"),
  };
}
