"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { SplitReveal } from "@/components/motion/reveal";
import { Doodle } from "@/components/doodle";
import { FitImage } from "@/components/fit-image";
import { Roll } from "@/components/layout/header";
import type { DoodleName } from "@/components/doodles";

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
 * over follows the pointer; on a touch screen, where nothing follows a
 * finger, each row leads with its photo instead, big and uncropped.
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
          What’s in <em className="text-royal">store.</em>
        </SplitReveal>
        <Link href="/catalogue" className="group shrink-0 whitespace-nowrap text-sm font-semibold text-violet">
          <Roll>Browse everything</Roll>
        </Link>
      </div>

      <ul onPointerLeave={() => setActive(null)} className="border-t border-ink/15">
        {rows.map((row) => (
          <li key={row.id} onPointerEnter={() => setActive(row.id)}>
            <Link
              href={`/catalogue?collection=${row.id}`}
              data-cursor="Shop"
              className="group flex items-center gap-4 border-b border-ink/15 py-4 transition-colors duration-500 sm:gap-6 sm:py-5 pointer-fine:gap-8 pointer-fine:py-7 pointer-fine:hover:bg-ink pointer-fine:hover:text-paper"
            >
              <span className="relative aspect-square w-[34%] max-w-44 shrink-0 overflow-hidden rounded-[22px] bg-paper-2 pointer-fine:hidden">
                {row.image && <FitImage src={row.image} alt="" sizes="(min-width: 640px) 176px, 34vw" />}
              </span>
              <span aria-hidden className="hidden w-4 shrink-0 pointer-fine:block" />
              <span className="min-w-0 flex-1">
                <span className="font-display block text-[clamp(1.6rem,4.6vw,4.2rem)] leading-[0.95] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-fine:group-hover:translate-x-4">
                  {unbroken(row.name)}
                </span>
                <span className="mt-1.5 block text-sm leading-snug text-ink/50 transition pointer-fine:group-hover:translate-x-4 pointer-fine:group-hover:text-paper/60">
                  {row.blurb}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-violet pointer-fine:hidden">
                  {row.count} gifts <ArrowRight className="size-4" />
                </span>
              </span>
              <span className="hidden items-center gap-3 pr-4 pointer-fine:flex">
                <Doodle
                  name={row.icon as DoodleName}
                  hover="group"
                  className="size-14 text-aubergine transition-colors duration-500 group-hover:text-paper"
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
        className="pointer-events-none fixed left-0 top-0 z-30 hidden pointer-fine:block"
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

/** A hyphenated word ("Self-care") wraps as a whole, never as "Self-" and "care". */
function unbroken(text: string) {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    part.includes("-") && !/\s/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
