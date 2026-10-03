"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { FitImage } from "@/components/fit-image";
import { cn } from "@/lib/cn";

/**
 * Concept 1 — "The index."
 *
 * Nobody else can build this page, because nobody else has thirty-seven
 * companies that students started this year and a number next to each one
 * that moves. So the hero is not a sentence with a picture behind it: it is
 * the cohort itself, set as an editorial index, with the money in the
 * right-hand column.
 *
 * The index walks slowly on its own. Put your pointer on any line and the
 * whole hero becomes that venture — their product fills the window, their
 * faces arrive, the line inverts — and lifting off hands it back. Reading
 * and browsing are the same gesture.
 */

export interface Venture {
  rank: number;
  name: string;
  slug: string;
  tagline: string;
  revenue: number;
  image: string | null;
  people: { name: string; photo: string }[];
}

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
const firsts = (p: { name: string }[]) => {
  const n = p.map((x) => x.name.split(" ")[0]);
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} & ${n.at(-1)}` : (n[0] ?? "");
};

export function LedgerHero({
  ventures,
  founders,
  brands,
  earned,
}: {
  ventures: Venture[];
  founders: number;
  brands: number;
  earned: number;
}) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const walk = useRef<gsap.core.Tween | null>(null);
  const [held, setHeld] = useState<number | null>(null);
  const [auto, setAuto] = useState(0);

  const shown = held ?? auto;
  const venture = ventures[shown] ?? ventures[0];

  // With nobody reading it, the window changes on its own.
  useEffect(() => {
    if (held !== null || reducedMotion() || ventures.length < 2) return;
    const t = setTimeout(() => setAuto((v) => (v + 1) % ventures.length), 3600);
    return () => clearTimeout(t);
  }, [auto, held, ventures.length]);

  useGSAP(
    () => {
      const el = root.current!;
      if (reducedMotion()) return;

      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(el.querySelectorAll("[data-line]"), { yPercent: 112, duration: 1.3, stagger: 0.09 })
          .from(el.querySelector("[data-window]"), { opacity: 0, scale: 1.06, duration: 1.5 }, 0.2)
          .from(el.querySelectorAll("[data-say] > *"), { y: 22, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.45)
          .from(el.querySelector("[data-rule]"), { scaleX: 0, transformOrigin: "left", duration: 1.2 }, 0.5)
          .from(el.querySelectorAll("[data-row]"), { y: 18, opacity: 0, duration: 0.7, stagger: 0.04 }, 0.6);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      // The index walks. Half the rows are a copy, so it never shows an end.
      walk.current = gsap.to(track.current, {
        yPercent: -50,
        duration: ventures.length * 2.4,
        ease: "none",
        repeat: -1,
        delay: 2.6,
      });
      return () => void walk.current?.kill();
    },
    { scope: root, dependencies: [ventures.length] },
  );

  const hold = (i: number | null) => {
    setHeld(i);
    if (i === null) walk.current?.play();
    else walk.current?.pause();
  };

  const rows = [...ventures, ...ventures];

  return (
    <section
      ref={root}
      onMouseLeave={() => hold(null)}
      className="relative isolate hidden h-[calc(100svh-4rem)] overflow-hidden md:flex md:flex-col"
    >
      <div className="mx-auto grid w-full max-w-[1500px] shrink-0 grid-cols-[1fr_auto] items-end gap-10 px-8 pt-[clamp(1rem,4vh,3rem)]">
        <div>
          <h1 className="font-display text-[clamp(3rem,8.2vw,8.6rem)] leading-[0.86] tracking-[-0.02em] text-ink">
            <span className="block overflow-hidden">
              <span data-line className="block">
                Every gift here
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block">
                is someone’s
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block italic text-royal">
                first company.
              </span>
            </span>
          </h1>

          <div data-say className="mt-[clamp(1rem,3vh,2rem)] flex items-center gap-7">
            <Link
              href="/catalogue"
              data-cursor="Go"
              className="group inline-flex rounded-full bg-aubergine px-7 py-4 text-[15px] font-semibold text-paper transition-colors hover:bg-violet"
            >
              <Roll>Start gifting</Roll>
            </Link>
            <p className="text-[15px] leading-snug text-ink/60">
              {founders}&nbsp;student founders.
              <br />
              {brands}&nbsp;first companies.
            </p>
          </div>
        </div>

        {/* The window: whatever line you are on, seen properly. */}
        <div className="hidden w-[clamp(15rem,23vw,22rem)] lg:block">
          <div data-window className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-paper-2">
            {ventures.map((v, i) => (
              <div
                key={v.slug}
                className={cn(
                  "absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  i === shown ? "opacity-100" : "opacity-0",
                )}
              >
                {v.image && <FitImage src={v.image} alt="" sizes="360px" priority={i === 0} />}
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-14">
              <span className="flex">
                {venture.people.slice(0, 4).map((p, i) => (
                  <span
                    key={p.photo}
                    className="relative size-7 overflow-hidden rounded-full bg-orchid-soft ring-2 ring-ink/40"
                    style={{ marginLeft: i ? -8 : 0 }}
                  >
                    <Image src={p.photo} alt="" fill sizes="56px" className="object-cover object-top" />
                  </span>
                ))}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-paper">{firsts(venture.people)}</span>
            </div>
          </div>
          <p className="mt-3 flex items-baseline justify-between gap-3 text-[12px] text-ink/50">
            <span className="truncate">{venture.tagline}</span>
            <span className="shrink-0 tabular-nums text-ink/70">{inr(venture.revenue)}</span>
          </p>
        </div>
      </div>

      {/* The index itself. */}
      <div className="mx-auto mt-[clamp(1rem,3.5vh,2.5rem)] flex w-full min-h-0 max-w-[1500px] flex-1 flex-col px-8">
        <div className="flex shrink-0 items-baseline justify-between gap-6 pb-2 text-[11px] tabular-nums text-ink/40">
          <span>The cohort, by what they have sold</span>
          <span>
            Live · <span className="font-semibold text-ink/70">{inr(earned)}</span> earned this year
          </span>
        </div>
        <div data-rule aria-hidden className="h-px w-full shrink-0 bg-ink/20" />
        <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
          <div ref={track}>
            {rows.map((v, i) => {
              const idx = i % ventures.length;
              const on = shown === idx;
              return (
                <Link
                  key={`${v.slug}-${i}`}
                  href={`/brands/${v.slug}`}
                  data-row
                  data-cursor="Meet"
                  onMouseEnter={() => hold(idx)}
                  onFocus={() => hold(idx)}
                  className={cn(
                    "group grid h-[clamp(2.6rem,5.2vh,3.4rem)] grid-cols-[2.5rem_minmax(0,13rem)_minmax(0,1fr)_minmax(0,11rem)_auto] items-center gap-6 border-b border-ink/10 px-3 transition-colors duration-300",
                    on ? "bg-ink text-paper" : "text-ink",
                  )}
                >
                  <span className={cn("text-[11px] tabular-nums", on ? "text-orchid" : "text-ink/35")}>
                    {String(v.rank).padStart(2, "0")}
                  </span>
                  <span className="font-display truncate text-[clamp(1.05rem,1.5vw,1.5rem)] leading-none">{v.name}</span>
                  <span className={cn("truncate text-[13px]", on ? "text-paper/70" : "text-ink/50")}>{firsts(v.people)}</span>
                  <span className={cn("truncate text-[13px]", on ? "text-paper/70" : "text-ink/45")}>{v.tagline}</span>
                  <span className="flex items-center gap-3">
                    <span className={cn("text-[13px] font-semibold tabular-nums", on ? "text-orchid" : "text-ink/70")}>
                      {inr(v.revenue)}
                    </span>
                    <ArrowUpRight className={cn("size-4 transition", on ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0")} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
