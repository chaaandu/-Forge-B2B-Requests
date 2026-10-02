import brands from "../../data/brands.json";

/** Brand slug → POS team code, for client components that only hold a slug. */
export const TEAM_OF: Record<string, string> = Object.fromEntries(
  (brands as { slug: string; teamCode: string }[]).map((b) => [b.slug, b.teamCode]),
);
