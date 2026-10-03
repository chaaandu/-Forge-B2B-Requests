"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef, useState } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { useTransitionNav } from "@/components/motion/transition";
import { Roll } from "@/components/layout/header";
import { FitImage } from "@/components/fit-image";
import { cn } from "@/lib/cn";

/**
 * Concept 2 — "Walk the window."
 *
 * A gifting buyer wants to see the gifts. So the hero is not a picture of
 * the idea, it is the shelf: real products at real size, running off both
 * edges, that you push along with a trackpad or a hand. The sentence sits
 * over it like a title on a shop window, and the thing you are looking at
 * names itself in the corner.
 *
 * The craft is in the detail: each photo drifts inside its own frame as the
 * rail moves, so the row has depth instead of sliding like one flat strip;
 * the rail carries momentum and wraps for ever; and the caption changes
 * with whatever is nearest the middle.
 */

export interface ShelfItem {
  slug: string;
  title: string;
  brand: string;
  brandSlug: string;
  price: string;
  image: string;
  people: { name: string; photo: string }[];
}

const CARD = 0.27; // of the viewport width
const GAP = 28;

export function ShelfHero({ items, founders, brands }: { items: ShelfItem[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(0);
  const go = useTransitionNav();

  useGSAP(
    () => {
      const el = root.current!;
      const strip = rail.current!;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", strip);
      if (!cards.length) return;

      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(cards, { yPercent: 14, opacity: 0, duration: 1.4, stagger: 0.07 })
          .from(el.querySelectorAll("[data-line]"), { yPercent: 112, duration: 1.3, stagger: 0.09 }, 0.15)
          .from(el.querySelectorAll("[data-say] > *"), { y: 20, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.6);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();

      if (reducedMotion()) return;

      // One long strip of cards, wrapped: x is virtual and never runs out.
      const step = () => window.innerWidth * CARD + GAP;
      const span = () => step() * items.length;
      let x = 0;
      let v = 0; // what the pointer or wheel just added
      const drift = -0.22; // and the slow walk underneath it

      const wrap = (n: number) => gsap.utils.wrap(-span(), 0, n);
      const place = () => {
        const s = step();
        const total = span();
        const mid = window.innerWidth / 2;
        let best = Infinity;
        let bestI = 0;
        cards.forEach((card, i) => {
          // Each card sits at its own slot, wrapped around the strip.
          const at = gsap.utils.wrap(-s, total - s, x + i * s);
          card.style.transform = `translate3d(${at}px,0,0)`;
          // The photo drifts inside its frame: depth, not a sliding strip.
          const centre = at + s / 2;
          const off = (centre - mid) / mid; // -1 … 1
          const inner = card.querySelector<HTMLElement>("[data-shot]");
          if (inner) inner.style.transform = `translate3d(${(-off * 7).toFixed(2)}%,0,0) scale(1.16)`;
          const d = Math.abs(centre - mid);
          if (d < best) {
            best = d;
            bestI = i % items.length;
          }
        });
        setNear((p) => (p === bestI ? p : bestI));
      };

      const tick = (_t: number, ms: number) => {
        const dt = Math.min(ms, 34) / 16.67;
        x = wrap(x + (v + drift) * dt);
        v *= 0.9;
        place();
      };
      gsap.ticker.add(tick);
      place();

      // Trackpads scroll sideways; wheels scroll down. Both push the shelf.
      const onWheel = (e: WheelEvent) => {
        const by = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(by) < 1) return;
        e.preventDefault();
        v -= by * 0.55;
      };
      el.addEventListener("wheel", onWheel, { passive: false });

      // And a hand can throw it.
      let down = false;
      let lastX = 0;
      let moved = 0;
      const start = (e: PointerEvent) => {
        down = true;
        lastX = e.clientX;
        moved = 0;
        v = 0;
        el.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!down) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        moved += Math.abs(dx);
        x = wrap(x + dx);
        v = dx * 0.9;
        place();
      };
      const end = (e: PointerEvent) => {
        if (!down) return;
        down = false;
        // A push is a push; a tap is a tap.
        if (moved < 6) {
          const slug = (e.target as Element | null)?.closest<HTMLElement>("[data-card]")?.dataset.slug;
          if (slug) go?.(`/products/${slug}`);
        }
      };
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", () => (down = false));

      const onResize = () => place();
      window.addEventListener("resize", onResize);
      return () => {
        gsap.ticker.remove(tick);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("pointerdown", start);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", end);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root, dependencies: [items.length] },
  );

  const it = items[near] ?? items[0];

  return (
    <section
      ref={root}
      className="relative isolate hidden h-[calc(100svh-4rem)] touch-none select-none overflow-hidden bg-paper md:block"
      data-cursor="Drag"
    >
      {/* The shelf. */}
      <div className="absolute inset-x-0 top-[30%] h-[52%]">
        <div ref={rail} className="relative size-full">
          {items.map((p) => (
            <article
              key={p.slug}
              data-card
              data-slug={p.slug}
              className="absolute inset-y-0 left-0 will-change-transform"
              style={{ width: `${CARD * 100}vw`, paddingRight: GAP }}
            >
              <div className="relative h-[82%] overflow-hidden rounded-[2px] bg-paper-2">
                <div data-shot className="absolute inset-0 will-change-transform">
                  <FitImage src={p.image} alt="" sizes="40vw" />
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4 pt-3">
                <p className="min-w-0 truncate text-[13px] font-semibold text-ink">{p.title}</p>
                <p className="shrink-0 text-[13px] tabular-nums text-ink/50">{p.price}</p>
              </div>
              <p className="truncate text-[12px] text-ink/45">{p.brand}</p>
            </article>
          ))}
        </div>
      </div>

      {/* The title on the window. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto max-w-[1500px] px-8 pt-[clamp(0.75rem,3.5vh,2.5rem)]">
        <h1 className="font-display max-w-[16ch] text-[clamp(2.4rem,5.6vw,5.6rem)] leading-[0.88] tracking-[-0.02em] text-ink">
          <span className="block overflow-hidden">
            <span data-line className="block">
              Every gift here is someone’s
            </span>
          </span>
          <span className="block overflow-hidden">
            <span data-line className="block italic text-royal">
              first company.
            </span>
          </span>
        </h1>
      </div>

      {/* Whatever is in front of you, named. */}
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1500px] items-end justify-between gap-8 px-8 pb-[clamp(1rem,3.5vh,2.2rem)]">
        <div data-say className="flex items-center gap-7">
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group pointer-events-auto inline-flex rounded-full bg-aubergine px-7 py-4 text-[15px] font-semibold text-paper transition-colors hover:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <p className="text-[15px] leading-snug text-ink/60">
            {founders}&nbsp;student founders.
            <br />
            {brands}&nbsp;first companies.
          </p>
        </div>

        <div className="pointer-events-auto flex min-w-0 items-center gap-3">
          <span className="hidden text-[11px] tabular-nums text-ink/35 lg:inline">Drag, or scroll sideways</span>
          <Link
            href={`/brands/${it.brandSlug}`}
            className="group flex min-w-0 items-center gap-3 rounded-full bg-ink/[0.05] py-2 pl-2 pr-5 transition-colors hover:bg-ink/10"
          >
            <span className="flex shrink-0">
              {it.people.slice(0, 3).map((q, i) => (
                <span
                  key={q.photo}
                  className="relative size-8 overflow-hidden rounded-full bg-orchid-soft ring-2 ring-paper"
                  style={{ marginLeft: i ? -10 : 0 }}
                >
                  <Image src={q.photo} alt="" fill sizes="64px" className="object-cover object-top" />
                </span>
              ))}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-semibold text-ink">{it.brand}</span>
              <span className={cn("block truncate text-[11px] text-ink/50")}>Meet the founders</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
