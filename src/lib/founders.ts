import founders from "../../data/founders.json";
import { withBase } from "./base-path";

/**
 * The people behind each brand: name and studio portrait, by POS team code.
 * Portraits are the cohort's own cut-outs (450×440, transparent), copied from
 * the leaderboard, where they are already shown publicly.
 */
export interface Founder {
  slug: string;
  name: string;
  photo: string;
}

const byTeam = founders as Record<string, { slug: string; name: string }[]>;

export function foundersOf(teamCode: string): Founder[] {
  return (byTeam[teamCode] ?? []).map((f) => ({ ...f, photo: withBase(`/founders/${teamCode}/${f.slug}.webp`) }));
}

export const allFounders = (): (Founder & { teamCode: string })[] =>
  Object.keys(byTeam).flatMap((teamCode) => foundersOf(teamCode).map((f) => ({ ...f, teamCode })));

/** "Pragati, Annashri & Kavya" — first names, the way people introduce a team. */
export function firstNames(people: Founder[]): string {
  const names = people.map((p) => p.name.split(" ")[0]);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} & ${names.at(-1)}`;
}
