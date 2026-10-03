"use client";

import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { reducedMotion } from "@/components/motion/gsap";
import { Roll } from "@/components/layout/header";
import { BASE_PATH } from "@/lib/base-path";

/**
 * Concept — "Look closer."
 *
 * The screen is a wall of gifts. You carry a lens, and everywhere the lens
 * falls the gift is replaced by the student who made it — same square,
 * same instant, their face instead of their product. Move it and the wall
 * keeps swapping back and forth under your hand.
 *
 * The whole proposition of the business is that sentence performed as one
 * gesture: a gift, and a person behind it. You do not read the claim, you
 * uncover it, and you cannot uncover it without meeting somebody.
 *
 * Two walls are composed once into offscreen canvases, so a frame is two
 * draws and a clipped circle no matter how many squares are on screen.
 */

export interface Pair {
  product: string;
  face: string;
  name: string;
  brand: string;
  slug: string;
}

const COLS = 9;
const ROWS = 5;
const TILE = 340;
const sized = (src: string, w: number) => `${BASE_PATH}/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

const load = (src: string) =>
  new Promise<HTMLImageElement | null>((res) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });

/** A gift fills its square; a person is kept whole inside theirs. */
function cell(g: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, s: number, whole: boolean) {
  const r = img.naturalWidth / img.naturalHeight || 1;
  let w: number;
  let h: number;
  if (whole) {
    // Contain, sat on the floor of the square: heads never get cut off.
    h = s * 0.94;
    w = h * r;
    if (w > s) {
      w = s;
      h = s / r;
    }
  } else {
    w = s;
    h = s / r;
    if (h < s) {
      h = s;
      w = s * r;
    }
  }
  g.save();
  g.beginPath();
  g.rect(x, y, s, s);
  g.clip();
  g.drawImage(img, x + (s - w) / 2, whole ? y + (s - h) : y + (s - h) / 2, w, h);
  g.restore();
}

export function LensHero({ pairs, founders, brands }: { pairs: Pair[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const view = useRef<HTMLCanvasElement>(null);
  const [under, setUnder] = useState<Pair | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = view.current;
    const host = root.current;
    if (!canvas || !host) return;
    const g = canvas.getContext("2d", { alpha: false });
    if (!g) return;
    const cells = pairs.slice(0, COLS * ROWS);
    let live = true;
    let gifts: HTMLCanvasElement | null = null;
    let faces: HTMLCanvasElement | null = null;
    let raf = 0;

    (async () => {
      const [ps, fs] = await Promise.all([
        Promise.all(cells.map((c) => load(sized(c.product, 384)))),
        Promise.all(cells.map((c) => load(sized(c.face, 384)))),
      ]);
      if (!live) return;

      const make = (imgs: (HTMLImageElement | null)[], ground: string, whole: boolean) => {
        const c = document.createElement("canvas");
        c.width = COLS * TILE;
        c.height = ROWS * TILE;
        const gg = c.getContext("2d")!;
        gg.fillStyle = ground;
        gg.fillRect(0, 0, c.width, c.height);
        imgs.forEach((img, i) => {
          if (!img) return;
          cell(gg, img, (i % COLS) * TILE, Math.floor(i / COLS) * TILE, TILE, whole);
        });
        return c;
      };
      gifts = make(ps, "#1d1033", false);
      faces = make(fs, "#3a2168", true);
      setReady(true);
    })();

    // Where the lens is, and where it is heading.
    const aim = { x: 0.5, y: 0.5, r: 0 };
    const now = { x: 0.5, y: 0.5, r: 0 };
    let idle = true;
    const t0 = performance.now();

    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      aim.x = (e.clientX - b.left) / b.width;
      aim.y = (e.clientY - b.top) / b.height;
      aim.r = 1;
      idle = false;
    };
    const onLeave = () => {
      aim.r = 0;
      idle = true;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(host.clientWidth * dpr);
      canvas.height = Math.round(host.clientHeight * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    let lastCell = -1;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!gifts || !faces) return;
      const w = host.clientWidth;
      const h = host.clientHeight;

      // With nobody holding it, the lens wanders on a slow figure of eight.
      if (idle && !reducedMotion()) {
        const t = (performance.now() - t0) / 1000;
        aim.x = 0.5 + Math.sin(t * 0.26) * 0.3;
        aim.y = 0.5 + Math.sin(t * 0.41) * 0.22;
        aim.r = 1;
      }
      now.x += (aim.x - now.x) * 0.12;
      now.y += (aim.y - now.y) * 0.12;
      now.r += (aim.r - now.r) * 0.07;

      // Cover-fit the wall to the window.
      const scale = Math.max(w / gifts.width, h / gifts.height);
      const dw = gifts.width * scale;
      const dh = gifts.height * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      g.drawImage(gifts, dx, dy, dw, dh);
      // Hold the gifts back a touch so the lens reads as the lit part.
      g.fillStyle = "rgba(29,16,51,0.45)";
      g.fillRect(0, 0, w, h);

      const lx = now.x * w;
      const ly = now.y * h;
      const radius = Math.min(w, h) * 0.245 * now.r;

      if (radius > 1) {
        g.save();
        g.beginPath();
        g.arc(lx, ly, radius, 0, Math.PI * 2);
        g.clip();
        // A real loupe magnifies: the faces sit slightly larger inside it.
        const m = 1.14;
        g.drawImage(faces, dx - (lx - dx) * (m - 1), dy - (ly - dy) * (m - 1), dw * m, dh * m);
        g.restore();

        g.beginPath();
        g.arc(lx, ly, radius, 0, Math.PI * 2);
        g.strokeStyle = "rgba(228,167,243,0.9)";
        g.lineWidth = 2;
        g.stroke();

        // Who is under the glass right now.
        const u = (lx - dx) / (dw / COLS);
        const v = (ly - dy) / (dh / ROWS);
        const i = Math.floor(Math.min(ROWS - 1, Math.max(0, v))) * COLS + Math.floor(Math.min(COLS - 1, Math.max(0, u)));
        if (i !== lastCell && cells[i]) {
          lastCell = i;
          setUnder(cells[i]);
        }
      }
    };
    raf = requestAnimationFrame(draw);

    const onResize = () => size();
    window.addEventListener("resize", onResize);
    return () => {
      live = false;
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [pairs]);

  return (
    <section ref={root} data-cursor=" " className="relative isolate hidden h-[calc(100svh-4rem)] overflow-hidden bg-aubergine-2 md:block">
      <canvas ref={view} aria-hidden className="absolute inset-0 size-full" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-aubergine-2 via-aubergine-2/85 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-aubergine-2/80 to-transparent"
      />

      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1500px] flex-col justify-between px-8 py-[clamp(1.5rem,5vh,3rem)]">
        <h1 className="font-display max-w-[14ch] text-[clamp(2.6rem,5.6vw,5.8rem)] leading-[0.9] text-paper [text-shadow:0_4px_30px_rgb(29_16_51/0.8)]">
          Every gift here is someone’s <em className="italic text-orchid">first company.</em>
        </h1>

        <div className="flex items-end justify-between gap-10">
          <div className="pointer-events-auto flex items-center gap-6">
            <Link
              href="/catalogue"
              data-cursor="Go"
              className="group inline-flex rounded-full bg-orchid px-7 py-4 text-[15px] font-semibold text-aubergine transition-colors hover:bg-paper"
            >
              <Roll>Start gifting</Roll>
            </Link>
            <p className="text-[15px] leading-snug text-paper/60">
              {founders}&nbsp;student founders.
              <br />
              {brands}&nbsp;first companies.
            </p>
          </div>

          {/* Whoever the glass is over, named. */}
          <div className="pointer-events-auto min-w-0 text-right">
            <p className="text-[11px] uppercase-none tracking-wide text-paper/40">
              {ready ? "Move the lens. Every gift has someone behind it." : "Loading the wall…"}
            </p>
            {under && (
              <Link href={`/brands/${under.slug}`} className="group mt-1 block">
                <span className="font-display block text-[clamp(1.4rem,2.4vw,2.4rem)] leading-none text-paper">{under.name}</span>
                <span className="mt-1 block text-[13px] text-orchid">{under.brand} ↗</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
