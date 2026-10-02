import brands from "../../data/brands.json";

type Entry = { slug: string; teamCode: string; aliases?: string[] };
const entries = brands as Entry[];

/**
 * A brand's old slugs (it was renamed: BizFits became Pehchaan) → its
 * current one. Applied to anything that may still carry an old slug: a gift
 * list saved in a browser, a shared list link, a bookmarked URL.
 */
const CANONICAL: Record<string, string> = Object.fromEntries(entries.flatMap((b) => (b.aliases ?? []).map((a) => [a, b.slug])));
export const canonicalBrand = (slug: string) => CANONICAL[slug] ?? slug;

/** Brand slug (current or old) → POS team code, for client components that only hold a slug. */
export const TEAM_OF: Record<string, string> = Object.fromEntries(
  entries.flatMap((b) => [[b.slug, b.teamCode] as const, ...(b.aliases ?? []).map((a) => [a, b.teamCode] as const)]),
);

/** Every rename, for the redirects in next.config.ts. */
export const RENAMES: { from: string; to: string }[] = entries.flatMap((b) => (b.aliases ?? []).map((a) => ({ from: a, to: b.slug })));
