"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Draggable, finePointer, gsap, reducedMotion, SplitText, useGSAP } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/magnetic";
import { Odometer } from "@/components/motion/odometer";
import { INTRO_DONE } from "@/components/motion/preloader";
import { useTransitionNav } from "@/components/motion/transition";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Roll } from "@/components/layout/header";

export interface HeroFace {
  name: string;
  brand: string;
  brandSlug: string;
  photo: string;
}

// Where each sticker sits, how big, how far it tilts, and how deep it floats.
const SPOTS = [
  { l: "3%", t: "16%", s: 150, r: -8, d: 1.4 },
  { l: "17%", t: "60%", s: 118, r: 6, d: 0.8 },
  { l: "73%", t: "10%", s: 132, r: 7, d: 1.1 },
  { l: "85%", t: "42%", s: 168, r: -5, d: 1.6 },
  { l: "63%", t: "68%", s: 104, r: -9, d: 0.7 },
  { l: "40%", t: "5%", s: 92, r: 4, d: 0.5 },
  { l: "-1%", t: "74%", s: 96, r: 10, d: 0.9 },
  { l: "92%", t: "78%", s: 88, r: -3, d: 0.6 },
];

export function Hero({ faces, founders, brands, earned }: { faces: HeroFace[]; founders: number; brands: number; earned: number }) {
  const root = useRef<HTMLElement>(null);
  const go = useTransitionNav();

  useGSAP(
    () => {
      const el = root.current!;
      const title = el.querySelector<HTMLElement>("[data-title]")!;
      const line = el.querySelector<SVGPathElement>("[data-underline] path");
      const placeUnderline = () => {
        const target = el.querySelector<HTMLElement>("[data-underline-target]");
        const svg = el.querySelector<SVGSVGElement>("[data-underline]");
        if (!target || !svg) return;
        const a = target.getBoundingClientRect();
        const b = el.getBoundingClientRect();
        Object.assign(svg.style, { left: `${a.left - b.left}px`, top: `${a.bottom - b.top - a.height * 0.16}px`, width: `${a.width}px` });
      };
      placeUnderline();
      window.addEventListener("resize", placeUnderline);

      if (reducedMotion()) {
        gsap.set(title, { visibility: "visible" });
        return () => window.removeEventListener("resize", placeUnderline);
      }

      const split = SplitText.create(title, { type: "lines,words,chars", mask: "lines", autoSplit: true, onSplit: placeUnderline });
      gsap.set(title, { visibility: "visible" });
      const stickers = gsap.utils.toArray<HTMLElement>("[data-sticker]");

      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(split.chars, { yPercent: 160, rotate: 12, duration: 1.3, stagger: 0.022 })
        .fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" }, 0.75)
        .from(
          [...stickers, ...gsap.utils.toArray<HTMLElement>("[data-mface]")],
          {
            scale: 0,
            rotate: () => gsap.utils.random(-50, 50),
            opacity: 0,
            duration: 1.3,
            stagger: { each: 0.06, from: "random" },
            ease: "back.out(1.7)",
          },
          0.3,
        )
        .from("[data-hero-foot] > *", { y: 40, opacity: 0, duration: 1, stagger: 0.08 }, 0.6);

      const play = () => tl.play();
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      if (finePointer()) {
        // Stickers: lean toward the pointer (outer), drift up on scroll (outer),
        // can be thrown (drag), and bob while left alone (float).
        const movers = stickers.map((s) => ({
          x: gsap.quickTo(s.querySelector("[data-lean]"), "x", { duration: 1.2, ease: "power3" }),
          y: gsap.quickTo(s.querySelector("[data-lean]"), "y", { duration: 1.2, ease: "power3" }),
          d: Number(s.dataset.depth),
        }));
        const lean = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => (m.x(nx * 60 * m.d), m.y(ny * 40 * m.d)));
        };
        window.addEventListener("pointermove", lean);
        stickers.forEach((s) => {
          gsap.to(s, {
            yPercent: -110 * Number(s.dataset.depth),
            ease: "none",
            scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
          });
          gsap.to(s.querySelector("[data-float]"), {
            y: gsap.utils.random(-14, 14),
            rotate: gsap.utils.random(-4, 4),
            duration: gsap.utils.random(2.4, 3.8),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });
        const drags = stickers.map(
          (s) =>
            Draggable.create(s.querySelector("[data-drag]"), {
              type: "x,y",
              bounds: el,
              inertia: true,
              edgeResistance: 0.7,
              zIndexBoost: true,
              onPress() {
                gsap.to(this.target, { scale: 1.08, duration: 0.25 });
              },
              onRelease() {
                gsap.to(this.target, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
              },
              onClick() {
                const slug = (this.target as HTMLElement).dataset.slug;
                if (slug) go?.(`/brands/${slug}`);
              },
            })[0],
        );
        return () => {
          window.removeEventListener("pointermove", lean);
          window.removeEventListener("resize", placeUnderline);
          drags.forEach((d) => d.kill());
        };
      }
      return () => window.removeEventListener("resize", placeUnderline);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate min-h-[100svh] overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 hidden md:block">
        {faces.slice(0, SPOTS.length).map((f, i) => {
          const s = SPOTS[i];
          return (
            <div key={f.photo} data-sticker data-depth={s.d} className="absolute" style={{ left: s.l, top: s.t, width: s.s }}>
              <div data-lean>
                <div data-drag data-slug={f.brandSlug} data-cursor="Drag" className="cursor-grab active:cursor-grabbing">
                  <div data-float>
                    <div style={{ transform: `rotate(${s.r}deg)` }}>
                      <span className="relative block aspect-square overflow-hidden rounded-full bg-orchid-soft shadow-[0_22px_45px_-20px_rgb(42_24_73/0.55)] ring-[5px] ring-paper">
                        <Image
                          src={f.photo}
                          alt=""
                          fill
                          sizes="170px"
                          className="pointer-events-none object-cover object-top"
                          priority={i < 4}
                          draggable={false}
                        />
                      </span>
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-paper shadow-lg">
                        {f.name.split(" ")[0]} · {f.brand}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <svg
        data-underline
        aria-hidden
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute h-[0.5em] text-[clamp(2.9rem,12vw,10.5rem)]"
      >
        <path
          d="M4 15 C 70 4, 130 22, 200 12 S 330 6, 396 14"
          fill="none"
          stroke="#e4a7f3"
          strokeWidth="7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mx-auto flex min-h-[100svh] max-w-[1500px] flex-col justify-center gap-10 px-5 pb-10 pt-6 sm:px-8 md:justify-between md:gap-0">
        <p className="inline-flex w-fit items-center gap-3 rounded-full bg-ink/[0.05] py-1.5 pl-3 pr-4 text-[13px] font-semibold text-ink/65">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-violet" />
          </span>
          {earned > 0 ? (
            <span className="flex flex-wrap items-center gap-x-1.5">
              <span className="font-bold text-violet">LIVE</span>
              <Odometer value={earned} prefix="₹" delay={0.4} className="font-bold text-ink" />
              <span>earned by student founders. And counting.</span>
            </span>
          ) : (
            <span>Forge · Mesa School of Business</span>
          )}
        </p>

        <div className="flex flex-col items-center gap-3 md:hidden">
          <div className="flex -space-x-3">
            {faces.slice(0, 7).map((f) => (
              <span key={f.photo} data-mface className="relative size-12 overflow-hidden rounded-full bg-orchid-soft ring-[3px] ring-paper">
                <Image src={f.photo} alt="" fill sizes="96px" className="object-cover object-top" />
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-ink/55">The founders behind this page</span>
        </div>

        <h1
          data-title
          className="font-display mx-auto max-w-[15ch] text-center text-[clamp(2.9rem,12vw,10.5rem)] leading-[0.88] text-ink [visibility:hidden] motion-reduce:[visibility:visible] md:py-0"
        >
          Every gift here is someone&apos;s{" "}
          <em data-underline-target className="inline-block whitespace-nowrap text-royal">
            first company.
          </em>
        </h1>

        <div data-hero-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-ink/70">
            {founders} student founders. {brands} brands. <span className="font-semibold text-ink">Zero boring hampers.</span>
          </p>
          <div className="flex justify-center">
            <Magnetic>
              <Link
                href="/catalogue"
                data-cursor="Go"
                className="group inline-flex items-center gap-3 rounded-full bg-aubergine px-8 py-5 text-base font-semibold text-paper transition-colors hover:bg-violet"
              >
                <Roll>Start gifting</Roll>
              </Link>
            </Magnetic>
          </div>
          <a
            href="#founders"
            onClick={(e) => {
              const lenis = getLenis();
              if (!lenis) return;
              e.preventDefault();
              lenis.scrollTo("#founders", { offset: -40, duration: 1.6 });
            }}
            className="group inline-flex items-center gap-2 justify-self-center text-sm font-semibold text-ink/70 hover:text-ink md:justify-self-end"
          >
            <Roll>Meet the founders</Roll>
            <span className="grid size-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              <ArrowDown className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
