"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Draggable, finePointer, gsap, reducedMotion, SplitText, useGSAP } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/magnetic";
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

// Each sticker's tilt and how deep it floats. Where it sits is worked out on
// the screen it's on (see `arrange`), because no fixed spot fits every screen.
const STICKERS = [
  { r: -8, d: 1.4 },
  { r: 6, d: 0.8 },
  { r: 7, d: 1.1 },
  { r: -5, d: 1.6 },
  { r: -9, d: 0.7 },
  { r: 4, d: 0.5 },
  { r: 10, d: 0.9 },
  { r: -3, d: 0.6 },
  { r: 5, d: 1.2 },
  { r: -6, d: 1.0 },
];

/** Repeatable "random": the same screen always gets the same arrangement. */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}
interface Slot {
  x: number;
  y: number;
  size: number;
}

const TAG = 20; // the name tag hanging under each sticker
const GAP = 18; // breathing room from the edges, the headline and the buttons

/**
 * Lay the stickers out in the free space around the headline: a band above it,
 * the gutters beside it and a band below it. Each band takes as many stickers
 * as fit at a size that fits; leftovers simply aren't shown.
 */
function arrange(width: number, title: Box, foot: Box): Slot[] {
  const slots: Slot[] = [];
  const band = (top: number, bottom: number, left: number, right: number, max: number, perRow: number, salt: number) => {
    const h = bottom - top;
    const w = right - left;
    const size = Math.min(max, h - TAG);
    if (size < 64 || w < size) return;
    const n = Math.max(1, Math.min(perRow, Math.floor(w / (size * 1.9))));
    const cell = w / n;
    for (let i = 0; i < n; i++) {
      const spare = cell - size;
      slots.push({
        x: left + i * cell + spare * (0.15 + 0.7 * jitter(i, salt)),
        y: top + (h - size - TAG) * jitter(i, salt + 1),
        size: size * (0.82 + 0.18 * jitter(i, salt + 2)),
      });
    }
  };
  const gutter = (left: number, right: number, top: number, bottom: number, salt: number) => {
    const w = right - left;
    const size = Math.min(130, w);
    if (size < 70) return;
    const h = bottom - top;
    const n = Math.max(1, Math.min(2, Math.floor(h / (size * 1.6))));
    for (let i = 0; i < n; i++) {
      const cell = h / n;
      slots.push({ x: left + (w - size) / 2, y: top + i * cell + (cell - size - TAG) * jitter(i, salt), size });
    }
  };
  band(GAP, title.t - GAP, GAP, width - GAP, 140, 5, 1);
  gutter(GAP, title.l - GAP, title.t, title.b, 7);
  gutter(title.r + GAP, width - GAP, title.t, title.b, 11);
  band(title.b + GAP, foot.t - GAP, GAP, width - GAP, 116, 4, 3);
  return slots;
}

export function Hero({ faces, founders, brands }: { faces: HeroFace[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const go = useTransitionNav();

  useGSAP(
    () => {
      const el = root.current!;
      const title = el.querySelector<HTMLElement>("[data-title]")!;
      const stickers = gsap.utils.toArray<HTMLElement>("[data-sticker]");

      // Measure the headline and the buttons, then put the stickers in the
      // space that's left. Re-run when the screen changes.
      const place = () => {
        const host = el.getBoundingClientRect();
        const box = (els: Element[]): Box => {
          const rs = els.map((e) => e.getBoundingClientRect());
          return {
            l: Math.min(...rs.map((r) => r.left)) - host.left,
            t: Math.min(...rs.map((r) => r.top)) - host.top,
            r: Math.max(...rs.map((r) => r.right)) - host.left,
            b: Math.max(...rs.map((r) => r.bottom)) - host.top,
          };
        };
        const underline = el.querySelector("[data-underline]");
        const slots = arrange(
          host.width,
          box([title, ...(underline ? [underline] : [])]),
          box([...el.querySelectorAll("[data-hero-foot] > *")]),
        );
        stickers.forEach((s, i) => {
          const slot = slots[i];
          if (!slot) return void (s.style.display = "none");
          Object.assign(s.style, { display: "", left: `${slot.x}px`, top: `${slot.y}px`, width: `${slot.size}px` });
        });
      };
      let resizeTimer = 0;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          placeUnderline();
          place();
        }, 150);
      };
      window.addEventListener("resize", onResize);
      const line = el.querySelector<SVGPathElement>("[data-underline] path");
      // The underline is redrawn in real pixels for the width it has to span:
      // a stretched SVG would thicken the stroke, and a non-scaling stroke
      // would make the draw-on animation stop partway along.
      const placeUnderline = () => {
        const svg = el.querySelector<SVGSVGElement>("[data-underline]");
        // SplitText clones the italic phrase once per word, so measure every
        // piece, and only those on its last line if it ever wraps.
        const rects = [...el.querySelectorAll("[data-underline-target]")].map((t) => t.getBoundingClientRect()).filter((r) => r.width > 0);
        if (!svg || !line || !rects.length) return;
        const lastBottom = Math.max(...rects.map((r) => r.bottom));
        const last = rects.filter((r) => r.bottom > lastBottom - r.height / 2);
        const left = Math.min(...last.map((r) => r.left));
        const right = Math.max(...last.map((r) => r.right));
        const a = { left, width: right - left, bottom: lastBottom, height: Math.max(...last.map((r) => r.height)) };
        const b = el.getBoundingClientRect();
        const w = Math.round(a.width);
        const h = Math.max(14, Math.round(a.height * 0.2));
        Object.assign(svg.style, {
          left: `${a.left - b.left}px`,
          top: `${a.bottom - b.top - a.height * 0.12}px`,
          width: `${w}px`,
          height: `${h}px`,
        });
        svg.classList.remove("invisible");
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        line.setAttribute(
          "d",
          `M4 ${h * 0.62} C ${w * 0.18} ${h * 0.12}, ${w * 0.32} ${h * 0.95}, ${w * 0.5} ${h * 0.55} S ${w * 0.82} ${h * 0.2}, ${w - 4} ${h * 0.58}`,
        );
        line.setAttribute("stroke-width", String(Math.max(4, h * 0.32)));
      };
      placeUnderline();
      place();

      title.classList.remove("js-reveal");
      if (reducedMotion()) return () => window.removeEventListener("resize", onResize);

      const split = SplitText.create(title, {
        type: "lines,words,chars",
        mask: "lines",
        // Masks get .line-mask's room (globals.css), so descenders and the
        // italic's swashes aren't shaved off.
        linesClass: "line",
        autoSplit: true,
        onSplit: () => {
          placeUnderline();
          place();
        },
      });

      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(split.chars, { yPercent: 160, rotate: 12, duration: 1.3, stagger: 0.022 })
        .fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.1, ease: "power2.inOut" }, 0.75)
        // Drawn: hand the stroke back, so a resize that lengthens it never shows a gap.
        .set(line, { clearProps: "strokeDasharray,strokeDashoffset" })
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
          window.removeEventListener("resize", onResize);
          drags.forEach((d) => d.kill());
        };
      }
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 hidden md:block">
        {faces.slice(0, STICKERS.length).map((f, i) => {
          const s = STICKERS[i];
          return (
            <div key={f.photo} data-sticker data-depth={s.d} className="absolute" style={{ display: "none" }}>
              <div data-lean>
                <div data-drag data-slug={f.brandSlug} data-cursor="Drag" className="cursor-grab active:cursor-grabbing">
                  <div data-float>
                    <div style={{ transform: `rotate(${s.r}deg)` }}>
                      <span className="relative block aspect-square overflow-hidden rounded-full bg-orchid-soft shadow-[0_22px_45px_-20px_rgb(42_24_73/0.55)] ring-[5px] ring-paper">
                        <Image
                          src={f.photo}
                          alt=""
                          fill
                          sizes="(min-width: 1440px) 150px, 11vw"
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

      {/* Sized, shaped and shown by placeUnderline once the headline is laid out. */}
      <svg data-underline aria-hidden className="pointer-events-none invisible absolute overflow-visible">
        <path fill="none" stroke="#e4a7f3" strokeLinecap="round" />
      </svg>

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1500px] flex-col justify-center gap-10 px-5 pb-10 pt-6 sm:px-8 md:justify-between md:gap-0">
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
          className="js-reveal font-display mx-auto max-w-[15ch] text-center text-[clamp(2.9rem,min(12vw,15.5vh),10.5rem)] leading-[0.88] text-ink md:my-auto md:py-0"
        >
          Every gift here is someone’s{" "}
          <em data-underline-target className="text-royal">
            first company.
          </em>
        </h1>

        <div data-hero-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-ink/70">
            {/* A number never ends a line apart from its noun. */}
            {founders}&nbsp;student founders. {brands}&nbsp;brands.
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
