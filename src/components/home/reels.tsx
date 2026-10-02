"use client";

import Link from "@/components/link";
import { useEffect, useRef } from "react";
import { SplitReveal } from "@/components/motion/reveal";
import { DragRail } from "@/components/motion/drag-rail";

export interface ReelCard {
  video: string;
  poster: string;
  brand: string;
  brandSlug: string;
}

/**
 * The teams' own reels, in their own voice. One plays at a time: the one
 * under your pointer, otherwise the one nearest the middle of the screen.
 * Five videos decoding at once is what makes a page stutter as you scroll.
 */
export function Reels({ reels }: { reels: ReelCard[] }) {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = row.current;
    const rail = el?.parentElement;
    const vids = [...(el?.querySelectorAll("video") ?? [])];
    if (!el || !rail || !vids.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const visible = new Set<HTMLVideoElement>();
    let hovered: HTMLVideoElement | null = null;
    let playing: HTMLVideoElement | null = null;
    let frame = 0;

    const pick = () => {
      let next = hovered && visible.has(hovered) ? hovered : null;
      if (!next) {
        let best = Infinity;
        for (const v of visible) {
          const r = v.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - window.innerWidth / 2);
          if (d < best) [best, next] = [d, v];
        }
      }
      if (next === playing) return;
      playing?.pause();
      playing = next;
      playing?.play().catch(() => {});
    };
    const soon = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(pick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) visible.add(v);
          else visible.delete(v);
        }
        soon();
      },
      { threshold: 0.6 },
    );
    vids.forEach((v) => io.observe(v));
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovered = (e.target as Element).closest("a")?.querySelector("video") ?? null;
      soon();
    };
    const out = () => {
      hovered = null;
      soon();
    };
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerleave", out);
    rail.addEventListener("scroll", soon, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerover", over);
      el.removeEventListener("pointerleave", out);
      rail.removeEventListener("scroll", soon);
      playing?.pause();
    };
  }, []);

  if (!reels.length) return null;
  return (
    <section className="py-28">
      <div className="mx-auto mb-12 flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
        <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
          Straight from their <em className="text-royal">stalls.</em>
        </SplitReveal>
        <p className="max-w-sm text-lg leading-snug text-ink/65">
          <span className="block">Shot, edited and posted by the founders.</span>
          <span className="block">Zero agencies were involved.</span>
        </p>
      </div>
      <DragRail>
        <div ref={row} className="flex w-max gap-4 px-5 pb-6 pt-2 sm:px-8">
          {reels.map((r, i) => (
            <Link
              key={r.video}
              href={`/brands/${r.brandSlug}`}
              data-cursor="Meet"
              className="group relative aspect-[9/16] w-[62vw] shrink-0 overflow-hidden rounded-[28px] bg-ink sm:w-[260px]"
              style={{ transform: `rotate(${i % 2 ? 1.5 : -1.5}deg)` }}
            >
              <video
                src={r.video}
                poster={r.poster}
                muted
                loop
                playsInline
                preload="none"
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 pt-16">
                <span className="font-display block text-2xl leading-none text-paper">{r.brand}</span>
                <span className="mt-1 block text-xs font-semibold text-orchid">Meet the squad</span>
              </span>
            </Link>
          ))}
        </div>
      </DragRail>
    </section>
  );
}
