"use client";

import Link from "@/components/link";
import { useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { cn } from "@/lib/cn";

/**
 * Concept — "Pull back."
 *
 * Not a poster with an effect behind it. One camera move.
 *
 * It opens on a single gift, close enough to touch. Then the camera pulls
 * back, and the gift turns out to be one of a handful; keep going and the
 * handful is a shelf; keep going and the shelf is the whole cohort, a wall
 * of everything a hundred and seventeen students made this year. The
 * argument of the site happens as a movement rather than a sentence: one
 * gift is one company is one of many.
 *
 * It is a single scaled plane, so the browser moves one layer however many
 * things are on it, and the words are handed over in the gaps.
 */

export interface Tile {
  src: string;
  kind: "product" | "face";
}

const GRID = 7; // odd, so one tile sits dead centre and the camera starts there
const FROM = 11; // how close the first frame is

const STAGES = [
  { at: 0.0, big: "Every gift here", small: "is someone’s first company." },
  { at: 0.34, big: "Made by a student", small: "who started a company this year." },
  { at: 0.62, big: "Thirty-seven of them", small: "are selling right now." },
];

export function PullbackHero({ tiles, founders, brands }: { tiles: Tile[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const plane = el.querySelector<HTMLElement>("[data-plane]")!;
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]", plane);
      const centre = Math.floor((GRID * GRID) / 2);

      if (reducedMotion()) {
        // No camera: show the wall, settled, with the line over it.
        gsap.set(plane, { scale: 1 });
        gsap.set("[data-stage]", { opacity: 0 });
        gsap.set('[data-stage="0"]', { opacity: 1 });
        gsap.set(["[data-end]", "[data-floor]"], { opacity: 1, y: 0 });
        return;
      }

      gsap.set(plane, { scale: FROM });
      gsap.set("[data-stage]", { opacity: 0, y: 18 });
      gsap.set('[data-stage="0"]', { opacity: 1, y: 0 });
      gsap.set(["[data-end]", "[data-floor]"], { opacity: 0, y: 24 });
      // Everything but the first gift waits in the dark until the camera finds it.
      gsap.set(
        cells.filter((_, i) => i !== centre),
        { opacity: 0 },
      );

      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(plane, { scale: FROM * 1.18, duration: 2, ease: "power2.out" })
          .from(el.querySelectorAll('[data-stage="0"] [data-line]'), { yPercent: 115, duration: 1.3, stagger: 0.1 }, 0.3);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=340%", scrub: 0.9, pin: true, anticipatePin: 1 },
      });

      // The move itself: one long pull back, eased so it never feels linear.
      tl.to(plane, { scale: 1, ease: "power1.inOut", duration: 1 }, 0);

      // The rest of the wall lights up as it comes into frame, ring by ring
      // out from the first gift, so the reveal follows the camera.
      cells.forEach((cell, i) => {
        if (i === centre) return;
        const ring = Math.max(Math.abs((i % GRID) - (centre % GRID)), Math.abs(Math.floor(i / GRID) - Math.floor(centre / GRID)));
        tl.to(cell, { opacity: 1, duration: 0.1, ease: "none" }, Math.min(0.02 + (ring - 1) * 0.12, 0.72));
      });

      // The words are handed over in the gaps between those reveals.
      STAGES.forEach((_, i) => {
        if (i > 0) tl.to(`[data-stage="${i}"]`, { opacity: 1, y: 0, duration: 0.07 }, STAGES[i].at);
        if (i < STAGES.length - 1) tl.to(`[data-stage="${i}"]`, { opacity: 0, y: -18, duration: 0.07 }, STAGES[i + 1].at - 0.07);
      });
      tl.to('[data-stage="2"]', { opacity: 0, y: -18, duration: 0.07 }, 0.86)
        .to("[data-end]", { opacity: 1, y: 0, duration: 0.1 }, 0.88)
        .to("[data-veil]", { opacity: 0.42, duration: 0.34, ease: "none" }, 0.66)
        .to("[data-floor]", { opacity: 1, duration: 0.12 }, 0.84);

      return () => void tl.scrollTrigger?.kill();
    },
    { scope: root, dependencies: [tiles.length] },
  );

  return (
    <section ref={root} className="relative isolate hidden h-[calc(100svh-4rem)] overflow-hidden bg-ink md:block">
      {/* The wall. One plane, scaled. */}
      <div className="absolute inset-0 grid place-items-center">
        <div
          data-plane
          className="grid aspect-square w-[max(100vh,100vw)] origin-center will-change-transform"
          style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
        >
          {tiles.slice(0, GRID * GRID).map((t, i) => (
            <div key={`${t.src}-${i}`} data-cell className="relative overflow-hidden bg-aubergine-2">
              {/* Plain img: these are decoration at wildly varying scale, and
                  one fetch each beats the optimiser's many sizes here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                alt=""
                loading={i === Math.floor((GRID * GRID) / 2) ? "eager" : "lazy"}
                className={cn("absolute inset-0 size-full", t.kind === "face" ? "object-cover object-top opacity-90" : "object-cover")}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lighting, not spectacle: hold the middle so type always reads. */}
      <div
        data-veil
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(27_20_33/0.55)_0%,rgb(27_20_33/0.86)_48%,rgb(27_20_33/0.97)_100%)]"
      />
      {/* A floor for the closing words, so they never sit on a busy tile. */}
      <div
        data-floor
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-ink via-ink/80 to-transparent opacity-0"
      />

      {/* The words, handed over as the camera moves. */}
      <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1500px] flex-col justify-center px-8">
        {STAGES.map((s, i) => (
          <div key={s.big} data-stage={i} className="absolute inset-x-8 w-[min(50rem,64vw)]">
            <h1 className="font-display text-balance text-[clamp(2.6rem,6.2vw,6.4rem)] leading-[0.9] text-paper">
              <span className="block overflow-hidden">
                <span data-line className="block">
                  {s.big}
                </span>
              </span>
              <span className="block overflow-hidden">
                <span data-line className="block italic text-orchid">
                  {s.small}
                </span>
              </span>
            </h1>
          </div>
        ))}
      </div>

      {/* Where it lands. */}
      <div data-end className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-8 pb-[clamp(1.5rem,5vh,3.5rem)]">
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
