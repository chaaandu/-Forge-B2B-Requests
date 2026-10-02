import type { ReactNode } from "react";

/**
 * The site's illustration set: hand-drawn, printed in two inks.
 *
 * Every drawing is an ink outline (`currentColor`, so it can flip to paper on
 * a dark ground) over a flat colour shape printed slightly off-register, the
 * way a risograph or a rubber stamp lands. One grid (96), one stroke, round
 * ends, three fill colours from the Forge palette: that is what makes them a
 * family, and what makes them belong on paper next to Fraunces.
 *
 * Shapes only; `Doodle` (doodle.tsx) draws and animates them.
 */

export const ORCHID = "#e4a7f3";
export const MARIGOLD = "#f3b14e";
export const LILAC = "#cbb4f4";

export interface DoodleArt {
  /** The off-register colour shape. */
  fill: ReactNode;
  /** Stroked ink lines: these draw themselves in. */
  ink: ReactNode;
  /** Solid ink details (chocolate chips, eyes). */
  dots?: ReactNode;
}

export const DOODLES = {
  gift: {
    fill: <path d="M21 45 C34 44 62 44 75 45 L74 83 C60 85 36 85 22 83 Z" fill={ORCHID} />,
    ink: (
      <>
        <path d="M15 35.5 C30 34 66 34 81 35.5 L80.5 46 C66 47 30 47 15.5 46 Z" />
        <path d="M19 46.5 L20 82 C34 84.5 62 84.5 76 82 L77 46.5" />
        <path d="M44.5 35 L45 83.5" />
        <path d="M51.5 35 L52 83.5" />
        <path d="M48 34.5 C42 26 31 19.5 28.5 26.5 C26.5 32 37 35.5 48 34.5" />
        <path d="M48 34.5 C54 26 65 19.5 67.5 26.5 C69.5 32 59 35.5 48 34.5" />
        <path d="M84 19 L88.5 14.5" />
        <path d="M86.5 28 L92 28" />
      </>
    ),
  },
  chips: {
    fill: <path d="M27 24 C40 22 56 22 69 24 C72 42 72 62 69 80 C56 82 40 82 27 80 C24 62 24 42 27 24 Z" fill={MARIGOLD} />,
    ink: (
      <>
        <path d="M25 22 L29 17 L33 22 L37 17 L41 22 L45 17 L49 22 L53 17 L57 22 L61 17 L65 22 L69 17 L71 22" />
        <path d="M25 82 L29 87 L33 82 L37 87 L41 82 L45 87 L49 82 L53 87 L57 82 L61 87 L65 82 L69 87 L71 82" />
        <path d="M25 22 C21.5 42 21.5 62 25 82" />
        <path d="M71 22 C74.5 42 74.5 62 71 82" />
        <path d="M48 39 C58 39 63.5 45.5 63.5 53 C63.5 60.5 57.5 66 48 66 C38.5 66 32.5 60.5 32.5 53 C32.5 45.5 38 39 48 39 Z" />
        <path d="M40 56 C41.5 50.5 46 48 50.5 49 C53 49.5 55 48.5 56.5 51 C56 55.5 51.5 58.5 47 58.5 C43.5 58.5 41 57.5 40 56 Z" />
      </>
    ),
    dots: (
      <>
        <circle cx="81" cy="70" r="1.8" />
        <circle cx="15" cy="62" r="1.5" />
      </>
    ),
  },
  cookie: {
    fill: <circle cx="49" cy="52" r="30" fill={ORCHID} />,
    ink: (
      <>
        <path d="M77.5 44.8 A30 30 0 1 1 58.3 21.8 C62 29 66.5 27.5 67 33.5 C71.5 33 74 37 72 40.5 C75.5 40.5 78 42 77.5 44.8 Z" />
      </>
    ),
    dots: (
      <>
        <path d="M36 38 c2.2 -1.4 4.6 -0.2 4.6 2.2 c0 2.2 -2.2 3.4 -4.4 3.2 c-2.4 -0.2 -2.6 -3.8 -0.2 -5.4 Z" />
        <path d="M53 49 c2.4 -1 4.6 0.6 4.2 2.8 c-0.4 2.2 -2.8 3 -4.8 2.4 c-2 -0.6 -1.8 -4.2 0.6 -5.2 Z" />
        <path d="M33 60 c2 -1.6 4.8 -0.6 5 1.8 c0.2 2.2 -2 3.6 -4.2 3.2 c-2.2 -0.4 -3 -3.4 -0.8 -5 Z" />
        <path d="M58 65 c2.2 -1.2 4.6 0.2 4.4 2.6 c-0.2 2.2 -2.6 3.2 -4.6 2.6 c-2 -0.6 -2 -4 0.2 -5.2 Z" />
        <path d="M44 71.5 c1.8 -1.2 4 -0.2 4 1.8 c0 1.8 -1.8 2.8 -3.6 2.6 c-1.8 -0.2 -2.2 -3.2 -0.4 -4.4 Z" />
        <circle cx="76" cy="25" r="1.7" />
        <circle cx="83" cy="33" r="1.3" />
      </>
    ),
  },
  mug: {
    fill: <path d="M26 42 L70 42 L66 80 C64 85 60 86 56 86 L40 86 C36 86 32 85 30 80 Z" fill={LILAC} />,
    ink: (
      <>
        <path d="M25 41 C38 40 58 40 71 41 L67 79 C66 84 62 86 56 86 L40 86 C34 86 30 84 29 79 Z" />
        <path d="M69.5 50 C80 47 84.5 58 80.5 64 C77 69 71 69 67.5 68" />
        <path d="M37 33 C33 28 41 25 37 18" />
        <path d="M48 31 C44 25 52 22 48 13" />
        <path d="M59 33 C55 28 63 25 59 18" />
        <path d="M30 50 C42 52 54 52 69 50" />
      </>
    ),
  },
  perfume: {
    fill: (
      <path d="M27 41 C27 36 31 34 36 34 L60 34 C65 34 69 36 69 41 L69 79 C69 84 65 86 60 86 L36 86 C31 86 27 84 27 79 Z" fill={ORCHID} />
    ),
    ink: (
      <>
        <path d="M37 15 C37 13 39 12 41 12 L55 12 C57 12 59 13 59 15 L59 27 L37 27 Z" />
        <path d="M41 27 L41 34" />
        <path d="M55 27 L55 34" />
        <path d="M27 41 C27 36 31 34 36 34 L60 34 C65 34 69 36 69 41 L69 79 C69 84 65 86 60 86 L36 86 C31 86 27 84 27 79 Z" />
        <path d="M37 52.5 C44 52 52 52 59 52.5 L58.5 70 C51 70.5 44 70.5 37.5 70 Z" />
        <path d="M81 13 C81.6 19 82.6 20.4 88 22 C82.6 23.6 81.6 25 81 31 C80.4 25 79.4 23.6 74 22 C79.4 20.4 80.4 19 81 13 Z" />
      </>
    ),
    dots: (
      <>
        <path d="M48 66 C42.5 61.5 42.5 57.5 45.2 56.8 C47 56.4 48 58.2 48 58.2 C48 58.2 49 56.4 50.8 56.8 C53.5 57.5 53.5 61.5 48 66 Z" />
        <circle cx="87" cy="36" r="1.6" />
      </>
    ),
  },
  candle: {
    fill: (
      <>
        <path d="M28 51 L28 82 C28 86 31 87 35 87 L61 87 C65 87 68 86 68 82 L68 51 Z" fill={ORCHID} />
      </>
    ),
    ink: (
      <>
        <path d="M27 50 L28 81 C28 85 31 87 35 87 L61 87 C65 87 68 85 68 81 L69 50" />
        <path d="M27 50 C27 44.5 69 44.5 69 50 C69 55.5 27 55.5 27 50 Z" />
        <path d="M48 48 C48.6 45 47.4 42.5 48 39.5" />
        <path d="M48 39.5 C40 33 43 22 49 12.5 C52 22 57 31 48 39.5 Z" />
        <path d="M34 22 L29.5 18.5" />
        <path d="M62 22 L66.5 18.5" />
        <path d="M32 33 L26.5 33" />
        <path d="M64 33 L69.5 33" />
        <path d="M28 64 C41 66 55 66 68 64" />
      </>
    ),
    dots: <path d="M48 37 C43 32.5 45 25 48.6 19 C50.4 25 53 31 48 37 Z" fill={MARIGOLD} />,
  },
  tee: {
    fill: (
      <path
        d="M34 17 C38 24 43 27 48 27 C53 27 58 24 62 17 L75 23 L85 40 L75 46.5 L69 41 L69.5 85 C55 87 41 87 26.5 85 L27 41 L21 46.5 L11 40 L21 23 Z"
        fill={LILAC}
      />
    ),
    ink: (
      <>
        <path d="M34 17 C38 24 43 27 48 27 C53 27 58 24 62 17 L75 23 L85 40 L75 46.5 L69 41 L69.5 85 C55 87 41 87 26.5 85 L27 41 L21 46.5 L11 40 L21 23 Z" />
        <path d="M38.5 19.5 C41.5 26 45 29.5 48 29.5 C51 29.5 54.5 26 57.5 19.5" />
        <path d="M54.5 50 L64.5 50 L64 60 C61 62 58 62 55 60 Z" />
      </>
    ),
  },
  tote: {
    fill: <path d="M22 39 C38 38 58 38 74 39 L71 85 C56 87 40 87 25 85 Z" fill={MARIGOLD} />,
    ink: (
      <>
        <path d="M22 39 C38 38 58 38 74 39 L71 85 C56 87 40 87 25 85 Z" />
        <path d="M35 39 C34 25 41 17.5 48 17.5 C55 17.5 62 25 61 39" />
        <path d="M40.5 39 C40.5 30 44 24.5 48 24.5 C52 24.5 55.5 30 55.5 39" />
        <path d="M48 50.5 L51 58 L59 58.3 L52.6 63 L55 71 L48 66.2 L41 71 L43.4 63 L37 58.3 L45 58 Z" />
      </>
    ),
  },
  phone: {
    fill: <path d="M32 12 C32 9 34 8 37 8 L59 8 C62 8 64 9 64 12 L64 84 C64 87 62 88 59 88 L37 88 C34 88 32 87 32 84 Z" fill={ORCHID} />,
    ink: (
      <>
        <path d="M32 12 C32 9 34 8 37 8 L59 8 C62 8 64 9 64 12 L64 84 C64 87 62 88 59 88 L37 88 C34 88 32 87 32 84 Z" />
        <path d="M44 14 L52 14" />
        <path d="M40 39 C40 35.5 42.5 34 46 34 L53 34 C56.5 34 58 35.5 58 39 L58 45 C58 48.5 56.5 50 53 50 L47 50 L42.5 54.5 L43 50 C41 49.5 40 48 40 45 Z" />
        <path d="M24 36 C19 42 19 54 24 60" />
        <path d="M17 30 C9 40 9 56 17 66" />
        <path d="M72 36 C77 42 77 54 72 60" />
        <path d="M79 30 C87 40 87 56 79 66" />
      </>
    ),
    dots: <circle cx="48" cy="81" r="2.2" />,
  },
  sparkle: {
    fill: <path d="M44 14 C46 34 52 40 72 42 C52 44 46 50 44 70 C42 50 36 44 16 42 C36 40 42 34 44 14 Z" fill={MARIGOLD} />,
    ink: (
      <>
        <path d="M44 14 C46 34 52 40 72 42 C52 44 46 50 44 70 C42 50 36 44 16 42 C36 40 42 34 44 14 Z" />
        <path d="M74 62 C75 70 77 72 84 73 C77 74 75 76 74 84 C73 76 71 74 64 73 C71 72 73 70 74 62 Z" />
      </>
    ),
    dots: <circle cx="21" cy="75" r="2.4" />,
  },
  bag: {
    fill: <path d="M24 34 L72 34 L76 86 L20 86 Z" fill={ORCHID} />,
    ink: (
      <>
        <path d="M23.5 34 C38 33 58 33 72.5 34 L76 85 C58 87 38 87 20 85 Z" />
        <path d="M36 34 C36 23 42 18 48 18 C54 18 60 23 60 34" />
        <path d="M38 57 C42 63.5 54 63.5 58 57" />
      </>
    ),
    dots: (
      <>
        <circle cx="40" cy="48" r="2.4" />
        <circle cx="56" cy="48" r="2.4" />
      </>
    ),
  },
  arrow: {
    fill: null,
    ink: (
      <>
        <path d="M10 66 C24 30 60 18 84 40" />
        <path d="M84 40 L72.5 39.5" />
        <path d="M84 40 L82 28.5" />
      </>
    ),
  },
  heart: {
    fill: <path d="M48 82 C20 62 12 44 22 32 C30 22 42 25 48 36 C54 25 66 22 74 32 C84 44 76 62 48 82 Z" fill={ORCHID} />,
    ink: <path d="M48 82 C20 62 12 44 22 32 C30 22 42 25 48 36 C54 25 66 22 74 32 C84 44 76 62 48 82 Z" />,
  },
} satisfies Record<string, DoodleArt>;

export type DoodleName = keyof typeof DOODLES;

/** The raw drawing, for placing inside another SVG (the journey's gift rider). */
export function DoodleArtwork({ name, offset = [4, 3] }: { name: DoodleName; offset?: [number, number] }) {
  const art: DoodleArt = DOODLES[name];
  return (
    <>
      {art.fill && (
        <g data-dfill transform={`translate(${offset[0]} ${offset[1]})`}>
          {art.fill}
        </g>
      )}
      <g data-dink fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        {art.ink}
      </g>
      {art.dots && (
        <g data-ddots fill="currentColor">
          {art.dots}
        </g>
      )}
    </>
  );
}
