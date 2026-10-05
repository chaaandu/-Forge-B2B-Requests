"use client";

import Link from "@/components/link";
import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { Roll } from "@/components/layout/header";
import { BASE_PATH } from "@/lib/base-path";
import { cn } from "@/lib/cn";

/**
 * The hero — "Pull back."
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
 * tile is given its own position and size, tiles outside the view are
 * taken out of the page, and the pictures arrive tile-sized. The browser
 * only ever paints the few squares you can actually see.
 *
 * The wall turns with the window: nine across on a laptop, five across on
 * a phone held upright, so it always fills the screen without stretching.
 */

export interface Tile {
  src: string;
  kind: "product" | "face";
}

/** 45 squares either way; the middle one is 22 in both arrangements. */
const COUNT = 45;
const LANDSCAPE = { cols: 9, rows: 5 };
const PORTRAIT = { cols: 5, rows: 9 };
const CENTRE = 22;

const sized = (src: string, w: number) => `${BASE_PATH}/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

export function Hero({ tiles, founders, brands, listings }: { tiles: Tile[]; founders: number; brands: number; listings: number }) {
  const root = useRef<HTMLElement>(null);
  const cells = tiles.slice(0, COUNT);

  // The bar above is transparent until you scroll, and this hero is dark, so
  // it has to be told to switch to light type while it is over us.
  useEffect(() => {
    document.documentElement.classList.add("hero-dark");
    window.dispatchEvent(new Event("hero:dark"));
    return () => {
      document.documentElement.classList.remove("hero-dark");
      window.dispatchEvent(new Event("hero:dark"));
    };
  }, []);

  // One gift, one student, the shelf, then everyone. Each line says
  // something the one before it could not, and names its own noun, so the
  // counts never read as the same thing twice.
  const stages = [
    { from: 0.0, lead: "Every gift here", tail: "is someone’s first company." },
    { from: 0.3, lead: "Made by a student", tail: "who started a company this year." },
    { from: 0.58, lead: `${brands} companies.`, tail: `${listings} things to give.` },
  ];

  useGSAP(
    () => {
      const el = root.current!;
      const stage = el.querySelector<HTMLElement>("[data-stage-box]")!;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-cell]", stage);
      const captions = gsap.utils.toArray<HTMLElement>("[data-stage]", el);
      const veil = el.querySelector<HTMLElement>("[data-veil]")!;
      const floor = el.querySelector<HTMLElement>("[data-floor]")!;
      const endBig = el.querySelector<HTMLElement>("[data-end-big]")!;
      const endCta = el.querySelector<HTMLElement>("[data-end-cta]")!;
      const hint = el.querySelector<HTMLElement>("[data-hint]")!;
      const ease = gsap.parseEase("power1.inOut");

      /** Lay the wall out for a camera that is `t` of the way back. */
      const frame = (t: number) => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const { cols, rows } = w >= h ? LANDSCAPE : PORTRAIT;
        // At the end the whole wall is in view; at the start one tile fills it.
        const out = Math.max(w / cols, h / rows);
        const close = Math.max(w, h) * 1.02;
        const size = gsap.utils.interpolate(close, out, ease(t));
        const cCol = Math.floor(cols / 2);
        const cRow = Math.floor(rows / 2);

        for (let i = 0; i < nodes.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = w / 2 + (col - cCol - 0.5) * size;
          const y = h / 2 + (row - cRow - 0.5) * size;
          const node = nodes[i];
          // Out of frame is out of the page: this is what keeps it smooth.
          if (row >= rows || x > w || y > h || x + size < 0 || y + size < 0) {
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
            node.style.opacity = String(gsap.utils.clamp(0, 1, (t - (0.04 + (ring - 1) * 0.09)) / 0.16));
          }
        }
      };

      /** The words are handed over in the gaps between those reveals. */
      const words = (t: number) => {
        let live = 0;
        stages.forEach((s, i) => (t >= s.from ? (live = i) : null));
        const done = t > 0.84;
        captions.forEach((c, i) => {
          const on = !done && i === live;
          c.style.opacity = on ? "1" : "0";
          c.style.transform = `translate3d(0, ${on ? 0 : i < live ? -16 : 16}px, 0)`;
        });
        // The room comes up as the wall arrives, so it ends lit, not muddy.
        veil.style.opacity = String(gsap.utils.interpolate(1, 0.26, gsap.utils.clamp(0, 1, (t - 0.5) / 0.42)));
        hint.style.opacity = String(gsap.utils.clamp(0, 1, 1 - t / 0.12));
        const show = gsap.utils.clamp(0, 1, (t - 0.84) / 0.1);
        floor.style.opacity = String(show);
        endBig.style.opacity = String(show);
        endBig.style.transform = `translate3d(0, ${(1 - show) * 16}px, 0)`;
        endCta.style.opacity = String(show);
        endCta.style.pointerEvents = show > 0.6 ? "auto" : "none";
      };

      if (reducedMotion()) {
        frame(1);
        words(1);
        // The line still has to be on the page, so show it over the settled
        // wall and drop the closing headline that would otherwise repeat it.
        captions[0].style.opacity = "1";
        captions[0].style.transform = "none";
        endBig.style.display = "none";
        return;
      }
      frame(0);
      words(0);

      // A slow settle into the opening frame, so it does not simply appear.
      const open = { v: 1 };
      gsap.to(open, { v: 0, duration: 1.9, ease: "power2.out", onUpdate: () => frame(0.014 * open.v) });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          // A shorter move on a phone, where scrolling costs more effort.
          end: () => (window.innerWidth < 768 ? "+=220%" : "+=320%"),
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
    <section
      ref={root}
      // Full height and pulled up under the sticky bar, so the wall fills the
      // screen from the first pixel: the bar floats on it, the pin starts at
      // scroll zero instead of after the bar has gone, and nothing shows
      // underneath while the camera is running.
      className="relative isolate -mt-16 h-[100svh] overflow-hidden bg-ink"
    >
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
              src={sized(t.src, i === CENTRE ? 1200 : 384)}
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-ink via-ink/85 to-transparent opacity-0"
      />

      {/* Every line lands in the same place, bottom left, so the eye never
          has to go looking: only the words change under the camera. The
          well is two lines deep whatever is in it, and the way in sits
          below it from the start, so nothing shifts when it arrives. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-5 pb-[clamp(1.25rem,5vh,3.5rem)] sm:px-8">
        <div className="relative min-h-[1.9em] w-[min(68rem,88vw)] text-[clamp(2.05rem,6.8vw,5.8rem)] sm:text-[clamp(2.3rem,5.5vw,5.8rem)]">
          {stages.map((s, i) => {
            const Tag = i === 0 ? "h1" : "p";
            return (
              <Tag
                key={s.lead}
                data-stage={i}
                className="font-display absolute inset-x-0 bottom-0 text-balance text-[1em] leading-[0.92] text-paper"
              >
                {s.lead}
                <br />
                <em className="italic text-orchid">{s.tail}</em>
              </Tag>
            );
          })}
          <p data-end-big className="font-display absolute inset-x-0 bottom-0 text-[1em] leading-[0.92] text-paper opacity-0">
            {founders}&nbsp;founders.
            <br />
            <em className="italic text-orchid">One store.</em>
          </p>
        </div>

        <div data-end-cta className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0 sm:mt-7">
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group inline-flex rounded-full bg-orchid px-6 py-3.5 text-[15px] font-semibold text-aubergine transition-colors hover:bg-paper sm:px-7 sm:py-4"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <Link href="/brands" className="text-[15px] font-semibold text-paper/70 hover:text-paper">
            <Roll>Meet the founders</Roll>
          </Link>
        </div>
      </div>

      {/* Out of the way of the words, in the corner. */}
      <div
        data-hint
        aria-hidden
        className="pointer-events-none absolute bottom-[clamp(1.25rem,5vh,3.5rem)] right-5 text-[12px] font-semibold text-paper/45 sm:right-8"
      >
        <span className="inline-flex items-center gap-2">
          Scroll <ArrowDown className="size-3.5 animate-bounce" />
        </span>
      </div>
    </section>
  );
}
