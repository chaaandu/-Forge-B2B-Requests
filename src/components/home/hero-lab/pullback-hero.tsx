"use client";

import Link from "@/components/link";
import { useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { BASE_PATH } from "@/lib/base-path";
import { cn } from "@/lib/cn";

/**
 * Concept — "Pull back."
 *
 * One camera move instead of a poster. It opens close on a single gift;
 * the camera pulls back and the gift turns out to be one of a handful,
 * then a shelf, then the whole cohort. The argument happens as a movement:
 * one gift is one company is one of many.
 *
 * A note on how it is built, because the obvious way does not work.
 * Scaling one plane that holds the whole wall asks the compositor to
 * rasterise a layer fifteen thousand pixels across — about a gigabyte —
 * and the frame rate collapses. So nothing is scaled. Each frame every
 * tile is given its own position and size, and tiles outside the view are
 * taken out of the page, so the browser only ever paints the few you can
 * actually see, each at its true size.
 */

export interface Tile {
  src: string;
  kind: "product" | "face";
}

const COLS = 9;
const ROWS = 5;
const CENTRE = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);

const STAGES = [
  { from: 0.0, big: "Every gift here", small: "is someone’s first company." },
  { from: 0.3, big: "Made by a student", small: "who started a company this year." },
  { from: 0.58, big: "Thirty-seven of them", small: "are selling right now." },
];

/** Our own image route, so tiles arrive tile-sized instead of full size. */
const sized = (src: string, w: number) => `${BASE_PATH}/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

export function PullbackHero({ tiles, founders, brands }: { tiles: Tile[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const cells = tiles.slice(0, COLS * ROWS);

  useGSAP(
    () => {
      const el = root.current!;
      const stage = el.querySelector<HTMLElement>("[data-stage-box]")!;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-cell]", stage);
      const captions = gsap.utils.toArray<HTMLElement>("[data-stage]", el);
      const veil = el.querySelector<HTMLElement>("[data-veil]")!;
      const floor = el.querySelector<HTMLElement>("[data-floor]")!;
      const end = el.querySelector<HTMLElement>("[data-end]")!;
      const ease = gsap.parseEase("power1.inOut");

      /** Lay the wall out for a camera that is `t` of the way back. */
      const frame = (t: number) => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        // At the end the whole wall is in view; at the start one tile fills it.
        const out = Math.max(w / COLS, h / ROWS);
        const close = Math.max(w, h) * 1.02;
        const size = gsap.utils.interpolate(close, out, ease(t));
        const cCol = Math.floor(COLS / 2);
        const cRow = Math.floor(ROWS / 2);

        for (let i = 0; i < nodes.length; i++) {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const x = w / 2 + (col - cCol - 0.5) * size;
          const y = h / 2 + (row - cRow - 0.5) * size;
          const node = nodes[i];
          // Out of frame is out of the page: this is what keeps it smooth.
          if (x > w || y > h || x + size < 0 || y + size < 0) {
            if (node.style.visibility !== "hidden") node.style.visibility = "hidden";
            continue;
          }
          if (node.style.visibility === "hidden") node.style.visibility = "";
          node.style.width = `${Math.ceil(size)}px`;
          node.style.height = `${Math.ceil(size)}px`;
          node.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
          if (i !== CENTRE) {
            // Neighbours come up as the camera finds them, ring by ring.
            const ring = Math.max(Math.abs(col - cCol), Math.abs(row - cRow));
            node.style.opacity = String(gsap.utils.clamp(0, 1, (t - (0.04 + (ring - 1) * 0.1)) / 0.16));
          }
        }
      };

      /** The words are handed over in the gaps between those reveals. */
      const words = (t: number) => {
        let live = 0;
        STAGES.forEach((s, i) => (t >= s.from ? (live = i) : null));
        const done = t > 0.84;
        captions.forEach((c, i) => {
          const on = !done && i === live;
          c.style.opacity = on ? "1" : "0";
          c.style.transform = `translate3d(0, ${on ? 0 : i < live ? -18 : 18}px, 0)`;
        });
        // The room comes up as the wall arrives, so it ends lit, not muddy.
        veil.style.opacity = String(gsap.utils.interpolate(1, 0.26, gsap.utils.clamp(0, 1, (t - 0.5) / 0.42)));
        const show = gsap.utils.clamp(0, 1, (t - 0.84) / 0.1);
        floor.style.opacity = String(show);
        end.style.opacity = String(show);
        end.style.transform = `translate3d(0, ${(1 - show) * 24}px, 0)`;
      };

      if (reducedMotion()) {
        frame(1);
        words(1);
        return;
      }
      frame(0);
      words(0);

      // A slow settle into the opening frame, so it does not simply appear.
      const open = { v: 1 };
      const play = () => gsap.to(open, { v: 0, duration: 1.9, ease: "power2.out", onUpdate: () => frame(0.014 * open.v) });
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=320%",
          scrub: 0.75,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            frame(self.progress);
            words(self.progress);
          },
        },
      });

      const onResize = () => frame(tl.scrollTrigger?.progress ?? 0);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        tl.scrollTrigger?.kill();
      };
    },
    { scope: root, dependencies: [cells.length] },
  );

  return (
    <section ref={root} className="relative isolate hidden h-[calc(100svh-4rem)] overflow-hidden bg-ink md:block">
      <div data-stage-box className="absolute inset-0">
        {cells.map((t, i) => (
          <div
            key={`${t.src}-${i}`}
            data-cell
            className="absolute left-0 top-0 overflow-hidden bg-aubergine-2 will-change-transform"
            style={{ opacity: i === CENTRE ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sized(t.src, i === CENTRE ? 1920 : 640)}
              alt=""
              loading={i === CENTRE ? "eager" : "lazy"}
              decoding="async"
              className={cn("size-full object-cover", t.kind === "face" && "object-top")}
            />
          </div>
        ))}
      </div>

      {/* Lighting, not spectacle. */}
      <div
        data-veil
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(27_20_33/0.52)_0%,rgb(27_20_33/0.86)_50%,rgb(27_20_33/0.97)_100%)]"
      />
      <div
        data-floor
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-ink via-ink/80 to-transparent opacity-0"
      />

      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1500px] flex-col justify-center px-8">
        {STAGES.map((s, i) => (
          <div key={s.big} data-stage={i} className="absolute inset-x-8 w-[min(50rem,64vw)]">
            <h1 className="font-display text-balance text-[clamp(2.6rem,6.2vw,6.4rem)] leading-[0.9] text-paper">
              {s.big}
              <br />
              <em className="italic text-orchid">{s.small}</em>
            </h1>
          </div>
        ))}
      </div>

      <div
        data-end
        className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-8 pb-[clamp(1.5rem,5vh,3.5rem)] opacity-0"
      >
        <p className="font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.88] text-paper">
          {founders}&nbsp;founders. {brands}&nbsp;first companies.
          <br />
          <em className="italic text-orchid">All of it, giftable.</em>
        </p>
        <div className="mt-7 flex items-center gap-6">
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group pointer-events-auto inline-flex rounded-full bg-orchid px-7 py-4 text-[15px] font-semibold text-aubergine transition-colors hover:bg-paper"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <Link href="/brands" className="pointer-events-auto text-[15px] font-semibold text-paper/70 hover:text-paper">
            <Roll>Meet the founders</Roll>
          </Link>
        </div>
      </div>
    </section>
  );
}
