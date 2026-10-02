"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, SplitText, useGSAP } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/magnetic";
import { CountUp } from "@/components/motion/count-up";

export interface HeroFace {
  name: string;
  brand: string;
  brandSlug: string;
  photo: string;
}

// Where each sticker sits, how big, how far it tilts, and how deep it floats.
const SPOTS = [
  { l: "2%", t: "14%", s: 150, r: -8, d: 1.4 },
  { l: "16%", t: "62%", s: 118, r: 6, d: 0.8 },
  { l: "74%", t: "8%", s: 132, r: 7, d: 1.1 },
  { l: "86%", t: "44%", s: 168, r: -5, d: 1.6 },
  { l: "62%", t: "70%", s: 104, r: -9, d: 0.7 },
  { l: "40%", t: "4%", s: 92, r: 4, d: 0.5 },
  { l: "-2%", t: "74%", s: 96, r: 10, d: 0.9 },
  { l: "93%", t: "78%", s: 88, r: -3, d: 0.6 },
];

export function Hero({
  faces,
  founders,
  brands,
  earned,
  units,
}: {
  faces: HeroFace[];
  founders: number;
  brands: number;
  earned: number;
  units: number;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const stickers = gsap.utils.toArray<HTMLElement>("[data-sticker]");
      const title = root.current!.querySelector("[data-title]")!;
      const split = SplitText.create(title, { type: "lines,words", mask: "lines" });
      gsap.set(title, { visibility: "visible" });

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(split.lines, { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.1 })
        .from(
          stickers,
          {
            scale: 0,
            rotate: () => gsap.utils.random(-40, 40),
            opacity: 0,
            duration: 1.3,
            stagger: { each: 0.06, from: "random" },
            ease: "back.out(1.6)",
          },
          0.35,
        )
        .from("[data-hero-foot] > *", { y: 30, opacity: 0, duration: 1, stagger: 0.08 }, 0.7);

      // Stickers lean toward the pointer, each by its own depth.
      if (window.matchMedia("(pointer: fine)").matches) {
        const movers = stickers.map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" }),
          d: Number(el.dataset.depth),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => (m.x(nx * 60 * m.d), m.y(ny * 40 * m.d)));
        };
        window.addEventListener("pointermove", move);
        // Scroll carries them up and away at different speeds.
        stickers.forEach((el) =>
          gsap.to(el, {
            yPercent: -120 * Number(el.dataset.depth),
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          }),
        );
        return () => window.removeEventListener("pointermove", move);
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate min-h-[100svh] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
        {faces.slice(0, SPOTS.length).map((f, i) => {
          const s = SPOTS[i];
          return (
            <Link
              key={f.photo}
              href={`/brands/${f.brandSlug}`}
              tabIndex={-1}
              data-sticker
              data-depth={s.d}
              data-cursor="Meet"
              className="pointer-events-auto absolute block will-change-transform"
              style={{ left: s.l, top: s.t, width: s.s }}
            >
              <span className="block" style={{ transform: `rotate(${s.r}deg)` }}>
                <span className="relative block aspect-square overflow-hidden rounded-full bg-orchid-soft shadow-[0_18px_40px_-18px_rgb(42_24_73/0.45)] ring-[5px] ring-paper">
                  <Image src={f.photo} alt="" fill sizes="170px" className="object-cover object-top" priority={i < 4} />
                </span>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-paper shadow-lg">
                  {f.name.split(" ")[0]} · {f.brand}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mx-auto flex min-h-[100svh] max-w-[1500px] flex-col justify-between px-5 pb-10 pt-6 sm:px-8">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-ink/60">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-violet" />
          </span>
          {earned > 0 ? (
            <>
              Live from the leaderboard: <CountUp value={earned} prefix="₹" className="tabular-nums text-ink" /> earned by student founders,{" "}
              {units.toLocaleString("en-IN")} products sold
            </>
          ) : (
            <>Forge · Mesa School of Business</>
          )}
        </p>

        {/* Phones get the people too: a row of real faces over the headline. */}
        <div className="mt-10 flex flex-col items-center gap-3 md:hidden">
          <div className="flex -space-x-3">
            {faces.slice(0, 7).map((f) => (
              <span
                key={f.photo}
                data-sticker
                data-depth="0"
                className="relative size-12 overflow-hidden rounded-full bg-orchid-soft ring-[3px] ring-paper"
              >
                <Image src={f.photo} alt="" fill sizes="96px" className="object-cover object-top" />
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-ink/55">{founders} founders behind this page</span>
        </div>

        <h1
          data-title
          className="font-display mx-auto max-w-[14ch] py-10 text-center text-[clamp(3.6rem,13.5vw,10.5rem)] leading-[0.86] text-ink [visibility:hidden] motion-reduce:[visibility:visible] md:py-0"
        >
          Every gift here is someone&apos;s <em className="scribble text-royal">first company.</em>
        </h1>

        <div data-hero-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-md text-lg leading-snug text-ink/70">
            {founders} student founders. {brands} brands. Order gifts for your team, and your budget becomes{" "}
            <span className="font-semibold text-ink">their revenue.</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Link
                href="/catalogue"
                data-cursor="Go"
                className="inline-flex items-center gap-3 rounded-full bg-aubergine px-8 py-5 text-base font-semibold text-paper transition hover:bg-violet"
              >
                Start a gift list
              </Link>
            </Magnetic>
          </div>
          <a
            href="#founders"
            className="group inline-flex items-center gap-2 justify-self-end text-sm font-semibold text-ink/70 hover:text-ink"
          >
            Meet the founders
            <span className="grid size-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-ink">
              <ArrowDown className="size-4 transition group-hover:translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
