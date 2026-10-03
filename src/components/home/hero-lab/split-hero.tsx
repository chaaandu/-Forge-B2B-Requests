"use client";

import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { buildCollage } from "./collage";

/**
 * Idea 4 — "Open it."
 *
 * The page arrives as a sheet of paper with the line on it. Then the first
 * scroll does not scroll: it opens. The paper parts down the middle like
 * wrapping coming off, and the whole cohort is standing behind it. One
 * gesture carries the argument — a gift, unwrapped, with people inside.
 *
 * The hero holds for one screen of scroll and then lets go, so the rest of
 * the page behaves normally.
 */
export function SplitHero({ photos, founders, brands }: { photos: string[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const [band, setBand] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let live = true;
    buildCollage(photos, { width: 2200, height: 1100, columns: 9, rows: 5, ground: "#1d1033" }).then((c) => {
      if (!c || !live) return;
      c.toBlob((blob) => {
        if (!blob || !live) return;
        url = URL.createObjectURL(blob);
        setBand(url);
      });
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [photos]);

  useGSAP(
    () => {
      const el = root.current!;
      if (reducedMotion()) return;

      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(el.querySelectorAll("[data-line]"), { yPercent: 110, duration: 1.4, stagger: 0.1 })
          .from(el.querySelectorAll("[data-foot] > *"), { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.5);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      // One screen of scroll opens the wrapping, then the page carries on.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "+=110%", scrub: 0.8, pin: true, anticipatePin: 1 },
      });
      tl.to("[data-left]", { xPercent: -102, boxShadow: "14px 0 46px -8px rgb(29 16 51 / 0.45)", ease: "power2.inOut" }, 0)
        .to("[data-right]", { xPercent: 102, boxShadow: "-14px 0 46px -8px rgb(29 16 51 / 0.45)", ease: "power2.inOut" }, 0)
        .to("[data-type]", { scale: 0.86, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
        .to("[data-foot]", { opacity: 0, y: 30, ease: "power2.in", duration: 0.4 }, 0)
        .fromTo("[data-behind]", { scale: 1.16 }, { scale: 1, ease: "none" }, 0)
        .fromTo("[data-reveal]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.4 }, 0.5);

      return () => void tl.scrollTrigger?.kill();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate hidden h-[calc(100svh-4rem)] overflow-hidden bg-aubergine-2 md:block">
      {/* Behind the wrapping: everyone. */}
      <div
        data-behind
        aria-hidden
        className="absolute inset-0 bg-aubergine-2 bg-cover bg-center"
        style={band ? { backgroundImage: `url(${band})` } : undefined}
      />
      <div aria-hidden className="absolute inset-0 bg-aubergine-2/45" />

      <div data-reveal className="absolute inset-x-0 bottom-0 z-20 px-8 pb-12 text-center opacity-0">
        <p className="font-display text-[clamp(2rem,3.4vw,3.4rem)] leading-none text-paper">
          All {founders} of them. <em className="text-orchid">Keep going.</em>
        </p>
      </div>

      {/* The wrapping itself: two halves of one sheet. */}
      <div data-left aria-hidden className="absolute inset-y-0 left-0 z-10 w-[50.1%] bg-paper" />
      <div data-right aria-hidden className="absolute inset-y-0 right-0 z-10 w-[50.1%] bg-paper" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-between px-8 pb-10 pt-4">
        <div data-type className="flex flex-1 items-center">
          <h1 className="font-display w-full text-center text-[clamp(3.6rem,10.4vw,11rem)] leading-[0.9] text-ink">
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
        </div>

        <div data-foot className="pointer-events-auto grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-ink/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands.
          </p>
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group inline-flex items-center gap-3 justify-self-center rounded-full bg-aubergine px-8 py-5 text-base font-semibold text-paper transition-colors hover:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <span className="group inline-flex items-center gap-2 justify-self-center text-sm font-semibold text-ink/70 md:justify-self-end">
            Scroll to open
            <span className="grid size-10 animate-bounce place-items-center rounded-full border border-ink/20">
              <ArrowDown className="size-4" />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
