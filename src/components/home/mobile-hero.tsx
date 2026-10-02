"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { Roll } from "@/components/layout/header";
import { Doodle } from "@/components/doodle";
import { cn } from "@/lib/cn";

/**
 * The phone's hero: the line, and the site's own drawings instead of
 * photos. Two takes while Mesa picks one: ?hero=line|pill. The real heading is one sr-only h1.
 */

export type MobileHeroVariant = "line" | "pill";

const LINE = "Every gift here is someone’s first company.";

function whenReady(play: () => void) {
  if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
  else play();
}

function Scribble({ delay = 0 }: { delay?: number }) {
  return (
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
        className="[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[scribble_1.1s_cubic-bezier(0.65,0,0.35,1)_forwards] motion-reduce:[stroke-dashoffset:0]"
        style={{ animationDelay: `${delay}s` }}
      />
    </svg>
  );
}

function Headline() {
  return (
    <p aria-hidden className="font-display relative z-10 text-center text-[clamp(2.8rem,13.2vw,4.3rem)] leading-[0.9] text-ink">
      <span data-hline className="block">
        Every gift here
      </span>
      <span data-hline className="block">
        is someone’s
      </span>
      <span data-hline className="block">
        <span className="relative inline-block italic text-royal">
          first company.
          <Scribble delay={0.85} />
        </span>
      </span>
    </p>
  );
}

/** The gift-with-faces line: a rounded pill of founders right after "someone’s". */
function PillHeadline({ faces }: { faces: string[] }) {
  return (
    <p aria-hidden className="font-display relative z-10 text-center text-[clamp(2.4rem,10.8vw,3.6rem)] leading-[0.95] text-ink">
      <span data-hline className="block">
        Every gift here
      </span>
      <span data-hline className="block whitespace-nowrap">
        is someone’s{" "}
        <span
          data-pill
          className="relative inline-flex h-[0.86em] translate-y-[0.1em] items-center rounded-full bg-orchid-soft px-[0.1em] align-baseline"
        >
          {faces.slice(0, 4).map((src, i) => (
            <span
              key={src}
              className="relative size-[0.7em] overflow-hidden rounded-full bg-paper-2 ring-[2.5px] ring-orchid-soft"
              style={{ marginLeft: i ? "-0.2em" : 0 }}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover object-top" />
            </span>
          ))}
        </span>
      </span>
      <span data-hline className="block">
        <span className="relative inline-block italic text-royal">
          first company.
          <Scribble delay={0.85} />
        </span>
      </span>
    </p>
  );
}

/**
 * One ribbon, drawn by hand: it ties a bow over the line, wraps down round
 * it, runs past the buttons and on into the next section, drawing itself
 * further as you scroll, so the page reads as one story to follow.
 */
function Ribbon() {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      // The hero section it lives in (its parent), measured fresh each time.
      const el = svg.current?.parentElement;
      const line = path.current;
      if (!el || !line || !svg.current) return;
      const shape = () => {
        const box = el.getBoundingClientRect();
        const r = (sel: string) => el.querySelector(sel)!.getBoundingClientRect();
        const t = r("[data-headline]");
        const f = r("[data-mfoot]");
        const W = box.width;
        const H = box.height;
        const ht = t.top - box.top;
        const hb = t.bottom - box.top;
        const ft = f.top - box.top;
        const cx = W / 2;
        const cy = Math.max(30, ht - 40);
        svg.current!.setAttribute("viewBox", `0 0 ${W} ${H + 260}`);
        Object.assign(svg.current!.style, { width: `${W}px`, height: `${H + 260}px` });
        line.setAttribute(
          "d",
          [
            `M ${cx} ${cy}`,
            // the bow: a loop each side of the knot
            `C ${cx - 30} ${cy - 36}, ${cx - 56} ${cy - 4}, ${cx} ${cy}`,
            `C ${cx + 30} ${cy - 36}, ${cx + 56} ${cy - 4}, ${cx} ${cy}`,
            // down the left side, wrapping under the line
            `C ${cx - 24} ${cy + 12}, ${22} ${ht - 30}, ${12} ${ht + 12}`,
            `C ${4} ${(ht + hb) / 2}, ${10} ${hb + 4}, ${W * 0.3} ${hb + 22}`,
            `C ${W * 0.56} ${hb + 34}, ${W - 8} ${hb + 14}, ${W - 14} ${(hb + ft) / 2}`,
            // past the buttons on the right, and out into what comes next
            `C ${W - 20} ${ft + 40}, ${W - 6} ${H - 40}, ${W - 34} ${H + 40}`,
            `C ${W - 70} ${H + 110}, ${W * 0.4} ${H + 92}, ${W * 0.16} ${H + 150}`,
          ].join(" "),
        );
      };
      shape();
      if (reducedMotion()) return;
      gsap.set(line, { drawSVG: "0%" });
      let ready = false;
      // The first stretch (the bow and the wrap) draws itself in; the rest follows the scroll.
      whenReady(() =>
        gsap.to(line, { drawSVG: "34%", duration: 1.8, delay: 0.3, ease: "power2.inOut", onComplete: () => void (ready = true) }),
      );
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom+=260 bottom",
        onUpdate: (self) => ready && gsap.set(line, { drawSVG: `${34 + 66 * self.progress}%` }),
      });
      let timer = 0;
      const onResize = () => {
        clearTimeout(timer);
        timer = window.setTimeout(shape, 150);
      };
      window.addEventListener("resize", onResize);
      return () => {
        st.kill();
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: svg },
  );

  return (
    <svg ref={svg} aria-hidden className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible">
      <path ref={path} fill="none" stroke="#e4a7f3" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MobileHero({
  variant,
  faces,
  founders,
  brands,
}: {
  variant: MobileHeroVariant;
  faces: string[];
  founders: number;
  brands: number;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from("[data-hline]", { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.08 })
        .from("[data-pill]", { scale: 0.4, opacity: 0, duration: 0.9, ease: "back.out(2)" }, 0.45)
        .from("[data-mfoot] > *", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.5);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  return (
    <section ref={root} className={cn("relative isolate md:hidden", variant === "line" ? "z-10" : "overflow-hidden")}>
      <h1 className="sr-only">{LINE}</h1>
      {variant === "line" && <Ribbon />}
      <div className="relative flex min-h-[calc(100svh-4rem)] flex-col gap-8 px-5 pb-10 pt-2">
        <div className="relative flex flex-1 flex-col items-center justify-center">
          {variant === "pill" ? (
            <>
              <span aria-hidden className="mb-5 w-[30vw] max-w-40 text-aubergine">
                <Doodle name="gift" hover="self" delay={0.15} className="w-full" />
              </span>
              <span data-headline>
                <PillHeadline faces={faces} />
              </span>
            </>
          ) : (
            <span data-headline>
              <Headline />
            </span>
          )}
        </div>

        <div data-mfoot className="relative z-10 flex flex-col items-center gap-5 text-center">
          <p className="text-lg leading-snug text-ink/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands.
          </p>
          <Link
            href="/catalogue"
            className="group inline-flex rounded-full bg-aubergine px-8 py-4 text-base font-semibold text-paper transition-colors active:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <a href="#founders" className="inline-flex items-center gap-2 bg-paper text-sm font-semibold text-ink/70">
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
