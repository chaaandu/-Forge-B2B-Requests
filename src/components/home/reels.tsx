"use client";

import Link from "@/components/link";
import { useEffect, useRef } from "react";
import { SplitReveal } from "@/components/motion/reveal";

export interface ReelCard {
  video: string;
  poster: string;
  brand: string;
  brandSlug: string;
}

/**
 * The teams' own reels, in their own voice. Each plays muted while it's on
 * screen and stops when it isn't, so a dozen videos never run at once.
 */
export function Reels({ reels }: { reels: ReelCard[] }) {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vids = row.current?.querySelectorAll("video");
    if (!vids?.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.6 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  if (!reels.length) return null;
  return (
    <section className="py-28">
      <div className="mx-auto mb-12 flex max-w-[1500px] flex-wrap items-end justify-between gap-6 px-5 sm:px-8">
        <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
          From their <em className="text-royal">stalls.</em>
        </SplitReveal>
        <p className="max-w-sm text-lg leading-snug text-ink/65">
          Shot, edited and posted by the founders themselves. Sound off; it&apos;s their pitch, not ours.
        </p>
      </div>
      <div ref={row} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8">
        {reels.map((r, i) => (
          <Link
            key={r.video}
            href={`/brands/${r.brandSlug}`}
            data-cursor="Meet"
            className="group relative aspect-[9/16] w-[62vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-ink sm:w-[260px]"
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
              <span className="mt-1 block text-xs font-semibold text-orchid">Meet the team →</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
