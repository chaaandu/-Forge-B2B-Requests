"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { SplitReveal } from "@/components/motion/reveal";
import { Icon3D } from "@/components/icon3d";

export interface IndexRow {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  count: number;
  image: string | null;
}

/**
 * The shelves as a type index: on a mouse, a photo from the shelf you are
 * over follows the pointer; on a phone, each row carries its own thumbnail.
 */
export function CategoryIndex({ rows }: { rows: IndexRow[] }) {
  const root = useRef<HTMLElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const el = float.current;
      if (!el || reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
      const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      const r = gsap.quickTo(el, "rotate", { duration: 0.9, ease: "power3" });
      let last = 0;
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
        r(gsap.utils.clamp(-12, 12, (e.clientX - last) * 0.6));
        last = e.clientX;
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  const current = rows.find((r) => r.id === active);

  return (
    <section ref={root} className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
          What they <em className="text-royal">make.</em>
        </SplitReveal>
        <Link href="/catalogue" className="text-sm font-semibold text-violet underline-offset-4 hover:underline">
          The whole catalogue →
        </Link>
      </div>

      <ul onPointerLeave={() => setActive(null)} className="border-t border-ink/15">
        {rows.map((row, i) => (
          <li key={row.id} onPointerEnter={() => setActive(row.id)}>
            <Link
              href={`/catalogue?collection=${row.id}`}
              data-cursor="Shop"
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-ink/15 py-5 transition-colors duration-500 hover:bg-ink hover:text-paper sm:gap-8 sm:py-7"
            >
              <span className="w-10 pl-2 text-xs font-semibold tabular-nums text-ink/40 transition group-hover:text-orchid sm:w-16 sm:pl-4">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 items-center gap-4">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-paper-2 md:hidden">
                  {row.image && <Image src={row.image} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-[clamp(1.8rem,4.6vw,4.2rem)] leading-[0.95] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-4">
                    {row.name}
                  </span>
                  <span className="mt-1 block text-sm text-ink/50 transition group-hover:translate-x-4 group-hover:text-paper/60">
                    {row.blurb}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-3 pr-2 sm:pr-4">
                <Icon3D
                  name={row.icon}
                  size={64}
                  className="hidden size-12 transition duration-500 group-hover:-rotate-12 group-hover:scale-110 sm:block"
                />
                <span className="text-sm font-semibold tabular-nums text-ink/50 group-hover:text-paper/70">{row.count}</span>
                <ArrowUpRight className="size-6 -rotate-45 opacity-0 transition duration-500 group-hover:rotate-0 group-hover:opacity-100" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div
        ref={float}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block"
        style={{ opacity: current?.image ? 1 : 0, transition: "opacity .35s" }}
      >
        <div className="relative -ml-[140px] -mt-[180px] h-[360px] w-[280px] overflow-hidden rounded-[32px] bg-paper-2 shadow-2xl">
          {rows.map(
            (r) =>
              r.image && (
                <Image
                  key={r.id}
                  src={r.image}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover transition duration-500"
                  style={{ opacity: r.id === active ? 1 : 0, transform: r.id === active ? "scale(1)" : "scale(1.15)" }}
                />
              ),
          )}
        </div>
      </div>
    </section>
  );
}
