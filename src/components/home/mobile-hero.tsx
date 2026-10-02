"use client";

import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { Doodle } from "@/components/doodle";

/**
 * The phone's hero. No photos here: one gift from the site's own drawings,
 * the line, and the two things to do. The desktop hero (hero.tsx) takes
 * over from md up.
 */

const LINE = "Every gift here is someone’s first company.";

/** The intro curtain only runs on a first visit; wait for it when it does. */
function whenReady(play: () => void) {
  if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
  else play();
}

export function MobileHero({ founders, brands }: { founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-hline]", { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.08 })
        .from("[data-mfoot] > *", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.5);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden md:hidden">
      <h1 className="sr-only">{LINE}</h1>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col gap-8 px-5 pb-10 pt-2">
        <div className="flex flex-1 flex-col items-center justify-center">
          <span aria-hidden className="mb-6 w-[42vw] max-w-52 text-aubergine">
            <Doodle name="gift" delay={0.15} className="w-full" />
          </span>
          {/* The line is drawn here and read from the h1 above, so it is never said twice. */}
          <p aria-hidden className="font-display text-center text-[clamp(2.8rem,13.2vw,4.3rem)] leading-[0.9] text-ink">
            <span data-hline className="block">
              Every gift here
            </span>
            <span data-hline className="block">
              is someone’s
            </span>
            <span data-hline className="block">
              <span className="relative inline-block italic text-royal">
                first company.
                <svg
                  aria-hidden
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                  className="absolute -bottom-[0.1em] left-0 h-[0.2em] w-full overflow-visible"
                >
                  <path
                    d="M2 6 C 18 1.5, 34 9.5, 50 5 S 82 2.5, 98 5.5"
                    pathLength={1}
                    fill="none"
                    stroke="#e4a7f3"
                    strokeWidth={3.4}
                    strokeLinecap="round"
                    className="[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[scribble_1.1s_cubic-bezier(0.65,0,0.35,1)_0.85s_forwards] motion-reduce:[stroke-dashoffset:0]"
                  />
                </svg>
              </span>
            </span>
          </p>
        </div>

        <div data-mfoot className="flex flex-col items-center gap-5 text-center">
          <p className="text-lg leading-snug text-ink/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands.
          </p>
          <Link
            href="/catalogue"
            className="group inline-flex rounded-full bg-aubergine px-8 py-4 text-base font-semibold text-paper transition-colors active:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <a href="#founders" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70">
            Meet the founders
            <span className="grid size-9 place-items-center rounded-full border border-ink/20">
              <ArrowDown className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
