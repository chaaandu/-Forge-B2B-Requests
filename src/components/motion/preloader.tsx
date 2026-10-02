"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "./gsap";

export const INTRO_DONE = "forge:intro-done";

/**
 * The first second of the first visit: faces arrive around a counter that
 * rolls to the size of the cohort, then the page is let in. Only when the
 * inline script in <head> has marked the page (`html.intro`): once per
 * session, never with reduced motion. Anything waiting on it listens for
 * INTRO_DONE.
 */
export function Preloader({ faces, total }: { faces: string[]; total: number }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const html = document.documentElement;
      if (!html.classList.contains("intro") || !root.current) return;
      const el = root.current;
      el.style.animation = "none"; // the script is running; the CSS failsafe can stand down
      const count = { v: 0 };
      const num = el.querySelector("[data-num]")!;
      const finish = () => {
        sessionStorage.setItem("forge-intro", "1");
        html.classList.remove("intro");
        window.dispatchEvent(new Event(INTRO_DONE));
      };
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-pface]", { scale: 0, opacity: 0, duration: 0.7, stagger: { each: 0.045, from: "random" }, ease: "back.out(2)" })
        .to(
          count,
          {
            v: total,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => void (num.textContent = String(Math.round(count.v)).padStart(3, "0")),
          },
          0,
        )
        .from("[data-pline]", { yPercent: 120, duration: 0.7 }, 0.15)
        .to("[data-pface]", { scale: 0, opacity: 0, duration: 0.45, stagger: { each: 0.02, from: "edges" }, ease: "power3.in" }, 1.35)
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.85, ease: "expo.inOut" }, 1.45)
        .add(finish, 1.75);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[90] items-center justify-center bg-aubergine-2 text-paper"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      {faces.map((src, i) => {
        const a = (i / faces.length) * Math.PI * 2;
        return (
          <span
            key={src}
            data-pface
            className="absolute size-16 overflow-hidden rounded-full bg-orchid-soft ring-4 ring-aubergine-2 sm:size-24"
            style={{ left: `calc(50% + ${Math.cos(a) * 34}vmin - 3rem)`, top: `calc(50% + ${Math.sin(a) * 30}vmin - 3rem)` }}
          >
            <Image src={src} alt="" fill sizes="96px" className="object-cover object-top" priority />
          </span>
        );
      })}
      <div className="text-center">
        <p data-num className="font-display text-[clamp(5rem,16vw,13rem)] leading-none tabular-nums text-orchid">
          000
        </p>
        <div className="overflow-hidden">
          <p data-pline className="text-sm font-bold uppercase tracking-[0.35em] text-paper/70">
            founders, one store
          </p>
        </div>
      </div>
    </div>
  );
}
