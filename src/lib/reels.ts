import "server-only";

/**
 * The teams' own Instagram reels, as the leaderboard plays them: a hand-kept
 * tab in the BYOB master lists them, and a daily job copies each video to R2
 * (`<media>/<shortcode>/{720.mp4,poster.jpg}`), because Instagram's embed
 * can't autoplay. Only reels whose copy exists are returned.
 */
const LIST =
  process.env.REELS_CSV_URL ??
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIPEG2OyaUG4epSSXmvtiHClz9jUwDKuHIUy1de4gw6AevZMBM2oODC5W8DwqbRDQspTqqM34DalBd/pub?gid=1453701252&single=true&output=csv";
export const REELS_MEDIA = process.env.REELS_MEDIA_URL ?? "https://pub-d6f784b7081a4ae0b24e347586220702.r2.dev/reels";

export interface Reel {
  teamCode: string;
  shortcode: string;
  video: string;
  poster: string;
  addedAt: string;
}

export async function getReels(): Promise<Reel[]> {
  try {
    const [csv, added] = await Promise.all([
      fetch(LIST, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }).then((r) => r.text()),
      fetch(`${REELS_MEDIA}/added.json`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }).then(
        (r) => r.json() as Promise<Record<string, string>>,
      ),
    ]);
    const seen = new Set<string>();
    return csv
      .trim()
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.split(","))
      .flatMap(([team, , url]) => {
        const shortcode = url?.match(/\/reel\/([^/?]+)/)?.[1];
        if (!team || !shortcode || !added[shortcode] || seen.has(shortcode)) return [];
        seen.add(shortcode);
        return [
          {
            teamCode: `C${team.replace(/^VBC/, "")}`,
            shortcode,
            video: `${REELS_MEDIA}/${shortcode}/720.mp4`,
            poster: `${REELS_MEDIA}/${shortcode}/poster.jpg`,
            addedAt: added[shortcode],
          },
        ];
      })
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  } catch {
    return [];
  }
}
