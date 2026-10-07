/**
 * Spot product photos that are only an empty backdrop: a team uploads a dark
 * gradient, or a plain red card, and it fills a tile on the home page with
 * nothing in it. Used by the daily sync (sync-catalog.ts).
 *
 * A real product photo has edges: the product's outline, a label, a shadow.
 * An empty backdrop has almost none. Shrunk to 128px and run through an edge
 * filter, the nine blanks found so far scored 1.3 to 1.9; the plainest real
 * photos (a small charm on white, a pale mug on white) 5.5 and up.
 */
import sharp from "sharp";

/** Average edge strength below which a photo is an empty backdrop. */
const BLANK_BELOW = 3;

export async function edgeScore(image: Buffer): Promise<number> {
  const { data } = await sharp(image)
    .flatten({ background: "#ffffff" })
    .greyscale()
    .resize(128, 128, { fit: "fill" })
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  for (const v of data) sum += v;
  return sum / data.length;
}

/**
 * Look at each photo not seen before, a few at a time. Returns the ones that
 * are blank and the ones that are fine; a photo that couldn't be downloaded
 * is in neither, so it's tried again tomorrow.
 */
export async function checkPhotos(urls: Map<string, string>, concurrency = 8): Promise<{ blank: string[]; fine: string[] }> {
  const blank: string[] = [];
  const fine: string[] = [];
  const queue = [...urls];
  const worker = async () => {
    for (let next = queue.shift(); next; next = queue.shift()) {
      const [id, url] = next;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
        if (!res.ok) continue;
        const score = await edgeScore(Buffer.from(await res.arrayBuffer()));
        (score < BLANK_BELOW ? blank : fine).push(id);
      } catch {
        /* unreachable or unreadable: try again next run */
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { blank, fine };
}
