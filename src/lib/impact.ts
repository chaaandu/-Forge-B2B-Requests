import "server-only";

/**
 * What the cohort has actually sold, from the BYOB master's published feed —
 * the same numbers the leaderboard at fb.mesaschool.co.in/live shows.
 * Refreshed with the catalogue; if the feed is down the counters simply hide.
 */
const FEED =
  process.env.IMPACT_CSV_URL ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIPEG2OyaUG4epSSXmvtiHClz9jUwDKuHIUy1de4gw6AevZMBM2oODC5W8DwqbRDQspTqqM34DalBd/pub?gid=1357679077&single=true&output=csv";

export interface VentureImpact {
  revenue: number;
  units: number;
  last7: number;
}

export interface Impact {
  /** By POS team code (`C135`). */
  byTeam: Record<string, VentureImpact>;
  revenue: number;
  units: number;
  last7: number;
}

const EMPTY: Impact = { byTeam: {}, revenue: 0, units: 0, last7: 0 };

export async function getImpact(teamCodes: string[]): Promise<Impact> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return EMPTY;
    const [header, ...lines] = (await res.text()).trim().split(/\r?\n/).map(splitCsv);
    const col = (name: string) => header.indexOf(name);
    const wanted = new Set(teamCodes);
    const byTeam: Record<string, VentureImpact> = {};
    for (const row of lines) {
      const code = `C${row[col("team_id")]?.replace(/^VBC/, "")}`;
      if (!wanted.has(code)) continue;
      byTeam[code] = {
        revenue: Number(row[col("total_revenue")]) || 0,
        units: Number(row[col("total_units")]) || 0,
        last7: Number(row[col("last7_revenue")]) || 0,
      };
    }
    const sum = (k: keyof VentureImpact) => Math.round(Object.values(byTeam).reduce((n, v) => n + v[k], 0));
    return { byTeam, revenue: sum("revenue"), units: sum("units"), last7: sum("last7") };
  } catch {
    return EMPTY;
  }
}

/** Enough CSV for a sheet export: quoted fields with commas in them. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && quoted && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (c === '"') {
      quoted = !quoted;
    } else if (c === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}
