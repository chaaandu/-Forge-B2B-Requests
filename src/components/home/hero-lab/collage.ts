"use client";

/**
 * The cohort, drawn into one wide picture.
 *
 * Three of the hero experiments need the same raw material: a seamless,
 * horizontally tiling band of the founders' cut-out portraits over paper,
 * big enough to read when it shows through letterforms or wraps a WebGL
 * plane. Everything it loads is same-origin (portraits are static files,
 * product photos come back through our own image route), so the canvas
 * stays untainted and can be handed to `toBlob` or `texImage2D`. Discs that
 * hang over an edge are drawn again on the far side, so the band tiles.
 */

const PAPER = "#f3ede3";
const TINTS = ["#f3d9fa", "#e4a7f3", "#eae2d4", "#cbb4f4"];

export interface CollageOptions {
  /** Pixel size of the band. Width should be even so it can tile. */
  width?: number;
  height?: number;
  /** Portraits across the band. Fewer = larger faces. */
  columns?: number;
  /** Rows of portraits. */
  rows?: number;
  /** Paper, or the dark ground. */
  ground?: string;
}

const load = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Draws `photos` as a grid of discs on `ground`, and returns the canvas.
 * The first and last half-column repeat, so the band can scroll forever.
 */
export async function buildCollage(photos: string[], opts: CollageOptions = {}): Promise<HTMLCanvasElement | null> {
  const { width = 2400, height = 1200, columns = 8, rows = 4, ground = PAPER } = opts;
  if (!photos.length) return null;

  const loaded = (await Promise.all(photos.map(load))).filter((i): i is HTMLImageElement => Boolean(i));
  if (!loaded.length) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d");
  if (!g) return null;

  g.fillStyle = ground;
  g.fillRect(0, 0, width, height);

  const cw = width / columns;
  const ch = height / rows;
  const disc = Math.min(cw, ch) * 0.82;

  // A repeatable wobble, so the grid never looks like a spreadsheet.
  const jitter = (n: number) => {
    const x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  // One disc, and a copy of it across the seam if it hangs over an edge,
  // so the band can be repeated side by side without a join showing.
  const disc_ = (img: HTMLImageElement, cx: number, cy: number, size: number, tint: string) => {
    for (const x of [cx, cx - width, cx + width]) {
      if (x + size / 2 < 0 || x - size / 2 > width) continue;
      g.save();
      g.beginPath();
      g.arc(x, cy, size / 2, 0, Math.PI * 2);
      g.closePath();
      g.fillStyle = tint;
      g.fill();
      g.clip();
      // Portraits are head-and-shoulders cut-outs: sit them on the disc's
      // floor and let the crown run past the top, as the wall does.
      const ratio = img.naturalWidth / img.naturalHeight || 1;
      const dh = size * 1.12;
      const dw = dh * ratio;
      g.drawImage(img, x - dw / 2, cy - dh / 2 + size * 0.06, dw, dh);
      g.restore();
    }
  };

  let n = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const img = loaded[Math.abs((row * columns + col) % loaded.length)];
      const jx = (jitter(n) - 0.5) * cw * 0.2;
      const jy = (jitter(n + 99) - 0.5) * ch * 0.2;
      const size = disc * (0.78 + jitter(n + 7) * 0.34);
      // Offset every other row, the way the founder wall stacks.
      const cx = col * cw + cw / 2 + (row % 2 ? cw / 2 : 0) + jx;
      const cy = row * ch + ch / 2 + jy;
      n++;
      disc_(img, cx, cy, size, TINTS[Math.floor(jitter(n + 3) * TINTS.length) % TINTS.length]);
    }
  }
  return canvas;
}
