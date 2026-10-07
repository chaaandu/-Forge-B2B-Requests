import data from "../../data/hampers.json";
import brands from "../../data/brands.json";
import { TEAM_OF } from "./brand-teams";
import { withBase } from "./base-path";
import type { ListItem } from "./request-list";

/**
 * Forge Hampers: fifteen ready-made boxes across five budgets, each packed
 * with products from several teams, plus a build-your-own at every budget
 * (data/hampers.json). They aren't POS products, so on a gift list they sit
 * under a brand of their own, and everything that resolves a list line (the
 * request route, a shared list, the list's faces and links) asks here first.
 *
 *   hamper-7               ready-made hamper no. 7
 *   custom-1500-2.5.9      built from the ₹1,500 budget's picks 2, 5 and 9
 */
export const HAMPER_BRAND = "forge-hampers";
export const HAMPER_BRAND_NAME = "Forge Hampers";

/** A build-your-own needs enough in it to be a hamper. */
export const MIN_PICKS = 3;

export interface HamperPick {
  id: number;
  what: string;
  brand: string;
  brandName: string;
  teamCode: string;
  /** Finds the pick's photo among its brand's products. */
  match: string;
}
export interface HamperLine extends HamperPick {
  qty: number;
}
export interface Hamper {
  no: number;
  slug: string;
  name: string;
  /** Who it's meant for: "For new joiners". */
  for: string;
  amount: number;
  image: string;
  items: HamperLine[];
  teamCodes: string[];
}
export interface HamperTier {
  amount: number;
  /** Its size: "Mini" to "Grand". */
  label: string;
  /** Its section's heading: "Small But Mighty". */
  title: string;
  /** A drawing of that size in components/doodles.tsx. */
  icon: string;
  blurb: string;
  picks: HamperPick[];
  hampers: Hamper[];
  /** As many things as the fullest ready-made hamper at this budget. */
  maxPicks: number;
}

const brandName = new Map((brands as { slug: string; name: string }[]).map((b) => [b.slug, b.name]));
const unique = <T>(xs: T[]) => [...new Set(xs)];

export const TIERS: HamperTier[] = data.tiers.map((t) => {
  const picks: HamperPick[] = t.picks.map((p) => ({
    ...p,
    brandName: brandName.get(p.brand) ?? p.brand,
    teamCode: TEAM_OF[p.brand] ?? "",
  }));
  const pick = new Map(picks.map((p) => [p.id, p]));
  const hampers: Hamper[] = t.hampers.map((h) => {
    const items = h.items.map((i) => ({ ...pick.get(i.pick)!, qty: (i as { qty?: number }).qty ?? 1 }));
    return {
      no: h.no,
      slug: `hamper-${h.no}`,
      name: `Hamper ${h.no}`,
      for: h.for,
      amount: t.amount,
      image: withBase(`/hampers/hamper-${h.no}.webp`),
      items,
      teamCodes: unique(items.map((i) => i.teamCode).filter(Boolean)),
    };
  });
  return {
    amount: t.amount,
    label: t.label,
    title: t.title,
    icon: t.icon,
    blurb: t.blurb,
    picks,
    hampers,
    maxPicks: Math.max(...hampers.map((h) => h.items.length)),
  };
});

export const HAMPERS: Hamper[] = TIERS.flatMap((t) => t.hampers);

export const isHamper = (brand: string) => brand === HAMPER_BRAND;
export const tierOf = (amount: number) => TIERS.find((t) => t.amount === amount);
export const hamperBySlug = (slug: string) => HAMPERS.find((h) => h.slug === slug);

/** `₹1,500` — budgets are whole rupees. */
export const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

/** The SKU of a build-your-own: same picks, same SKU, whatever order they were tapped in. */
export const customSku = (amount: number, ids: number[]) => `custom-${amount}-${[...ids].sort((a, b) => a - b).join(".")}`;

const plural = (noun: string) => (/(s|x|ch|sh)$/i.test(noun) ? `${noun}es` : `${noun}s`);

/** What's in a hamper, counted: "1 Perfume, 1 Candle, 2 Snack Packs". The same thing from two brands counts as two. */
export function contentsLine(lines: { what: string; qty: number }[]): string {
  const counts = new Map<string, number>();
  for (const l of lines) counts.set(l.what, (counts.get(l.what) ?? 0) + l.qty);
  return [...counts].map(([what, n]) => `${n} ${n > 1 ? plural(what) : what}`).join(", ");
}

/** "Dry fruits by Savore", "Crispy Bingo by Haulties ×2". */
export const describeLine = (l: { what: string; brandName: string; qty?: number }) =>
  `${l.what} by ${l.brandName}${l.qty && l.qty > 1 ? ` ×${l.qty}` : ""}`;

export interface ResolvedHamper {
  sku: string;
  title: string;
  /** The line under the title on a gift list. */
  label: string;
  amount: number;
  /** A ready-made hamper's photo; null for a build-your-own. */
  image: string | null;
  lines: HamperLine[];
  teamCodes: string[];
  /** Where on the site it lives, without the base path. */
  href: string;
  custom: boolean;
}

/**
 * A hamper SKU → what's in it, or null if it doesn't name one. A built hamper
 * is checked against its budget: only that budget's picks, between
 * MIN_PICKS and its maxPicks, so a doctored link can't put a ₹5,000 hamper's
 * contents in a ₹500 one.
 */
export function resolveHamper(sku: string): ResolvedHamper | null {
  const ready = hamperBySlug(sku);
  if (ready) {
    return {
      sku,
      title: ready.name,
      label: `${rupees(ready.amount)} hamper`,
      amount: ready.amount,
      image: ready.image,
      lines: ready.items,
      teamCodes: ready.teamCodes,
      href: `/hampers#${ready.slug}`,
      custom: false,
    };
  }
  const m = /^custom-(\d+)-(\d+(?:\.\d+)*)$/.exec(sku);
  const tier = m && tierOf(Number(m[1]));
  if (!m || !tier) return null;
  const ids = unique(m[2].split(".").map(Number));
  const lines = ids.map((id) => tier.picks.find((p) => p.id === id)).filter((p): p is HamperPick => Boolean(p));
  if (lines.length !== ids.length || lines.length < MIN_PICKS || lines.length > tier.maxPicks) return null;
  return {
    sku: customSku(tier.amount, ids),
    title: `Your own ${rupees(tier.amount)} hamper`,
    label: lines.map((l) => l.brandName).join(", "),
    amount: tier.amount,
    image: null,
    lines: lines.map((l) => ({ ...l, qty: 1 })),
    teamCodes: unique(lines.map((l) => l.teamCode).filter(Boolean)),
    href: `/hampers#build-${tier.amount}`,
    custom: true,
  };
}

/** The teams behind a gift-list line: one for a product, several for a hamper. */
export function teamsOf(item: { brand: string; sku: string }): string[] {
  if (isHamper(item.brand)) return resolveHamper(item.sku)?.teamCodes ?? [];
  const t = TEAM_OF[item.brand];
  return t ? [t] : [];
}

/** Where a gift-list line links to. */
export function hrefOf(item: { brand: string; sku: string; listing: string }): string {
  if (isHamper(item.brand)) return resolveHamper(item.sku)?.href ?? "/hampers";
  return `/products/${item.listing}`;
}

/** A resolved hamper as a gift-list line. A build-your-own borrows its first pick's photo. */
export function hamperListItem(h: ResolvedHamper, fallbackImage: string | null = null): Omit<ListItem, "qty"> {
  return {
    brand: HAMPER_BRAND,
    sku: h.sku,
    listing: "",
    title: h.title,
    brandName: HAMPER_BRAND_NAME,
    label: h.label,
    priceMinor: h.amount * 100,
    image: h.image ?? fallbackImage,
  };
}
