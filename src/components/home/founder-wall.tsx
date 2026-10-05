"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { finePointer, gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { SplitReveal } from "@/components/motion/reveal";
import { useTransitionNav } from "@/components/motion/transition";
import { cn } from "@/lib/cn";
import { firstNames } from "@/lib/founders";

export interface WallFace {
  name: string;
  photo: string;
  brand: string;
  brandSlug: string;
  teamCode: string;
  sold: number;
}

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/**
 * Every founder in the cohort, on one wall, all in the same black and white
 * on the same ground. Reach for one and their whole squad comes into colour
 * while everyone else steps back, with a card that follows the pointer.
 * On a phone, a tap opens that card at the bottom of the screen instead.
 */
export function FounderWall({ faces }: { faces: WallFace[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [sheet, setSheet] = useState<number | null>(null);
  const go = useTransitionNav();

  // With the card up, a tap on another face swaps to that founder (their own
  // handler does it), a tap on the card is left alone, and a tap on anything
  // else shuts it. Listening for a click, not a press, so scrolling the wall
  // never closes it.
  useEffect(() => {
    if (sheet === null) return;
    const away = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest("[data-wall-face]") || t?.closest("[data-wall-card]")) return;
      setSheet(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setSheet(null);
    document.addEventListener("click", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", away);
      document.removeEventListener("keydown", esc);
    };
  }, [sheet]);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (!reducedMotion())
        gsap.from(ref.current.querySelectorAll("[data-face-in]"), {
          scale: 0.2,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: { each: 0.012, from: "random" },
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        });
      if (!finePointer() || !card.current) return;
      const x = gsap.quickTo(card.current, "x", { duration: 0.5, ease: "power3" });
      const y = gsap.quickTo(card.current, "y", { duration: 0.5, ease: "power3" });
      const move = (e: PointerEvent) => {
        // Keep the card on screen: flip to the left of the pointer near the right edge.
        const flip = e.clientX > window.innerWidth - 340;
        x(e.clientX + (flip ? -300 : 28));
        y(e.clientY + 24);
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: ref },
  );

  const team = (i: number | null) => (i === null ? null : faces[i].teamCode);
  const lit = team(active ?? sheet);
  const info = (i: number) => {
    const f = faces[i];
    // "Parin & Praval", "Arpita, Jenessa & Zalak"
    const mates = firstNames(faces.filter((m) => m.teamCode === f.teamCode && m.photo !== f.photo));
    return { f, mates };
  };

  const shown = active ?? sheet;
  const detail = shown !== null ? info(shown) : null;

  return (
    <section id="founders" className="mx-auto max-w-[1500px] scroll-mt-16 px-5 py-24 sm:px-8">
      <SplitReveal className="font-display mb-14 text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
        Meet the <em className="text-royal">{faces.length} founders.</em>
      </SplitReveal>

      <div ref={ref} className="grid grid-cols-6 gap-1.5 sm:grid-cols-9 sm:gap-2 lg:grid-cols-13" onPointerLeave={() => setActive(null)}>
        {faces.map((f, i) => {
          const on = lit === f.teamCode;
          const dim = lit !== null && !on;
          return (
            <button
              key={f.photo}
              type="button"
              aria-label={`${f.name}, ${f.brand}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
              onClick={(e) => {
                if (finePointer() && (e.nativeEvent as PointerEvent).pointerType !== "touch") go?.(`/brands/${f.brandSlug}`);
                else setSheet(i);
              }}
              data-cursor="Meet"
              data-wall-face
              className="relative aspect-square"
            >
              <span data-face-in className="absolute inset-0 block">
                <span
                  className={cn(
                    "absolute inset-0 overflow-hidden rounded-full transition-[transform,opacity,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    on ? "z-10 scale-[1.12] bg-orchid-soft" : "bg-paper-2",
                    dim && "opacity-30",
                  )}
                >
                  <Image
                    src={f.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 110px, (min-width: 640px) 11vw, 16vw"
                    className={cn("object-cover object-top transition duration-500", on ? "grayscale-0" : "grayscale")}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Pointer card */}
      <div
        ref={card}
        aria-hidden
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-50 hidden w-[280px] rounded-3xl bg-ink p-5 text-paper shadow-2xl transition-opacity duration-300 pointer-fine:block",
          active !== null ? "opacity-100" : "opacity-0",
        )}
      >
        {active !== null && detail && (
          <>
            <p className="font-display text-3xl leading-[0.95]">{detail.f.name}</p>
            <p className="mt-2 text-sm font-semibold text-orchid">Co-founder, {detail.f.brand}</p>
            {detail.mates && <p className="mt-1 text-sm text-paper/60">with {detail.mates}</p>}
            {detail.f.sold > 0 && (
              <p className="mt-4 border-t border-paper/10 pt-3 text-sm text-paper/70">
                <span className="font-display text-2xl text-paper">{inr(detail.f.sold)}</span> sold so far, as a squad
              </p>
            )}
            <p className="mt-3 text-sm font-semibold text-orchid">Click to meet the squad →</p>
          </>
        )}
      </div>

      {/* Phone sheet */}
      <div
        data-wall-card
        className={cn(
          "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-3xl bg-ink p-5 text-paper shadow-2xl transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sheet !== null ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[120%] opacity-0",
        )}
      >
        {sheet !== null && detail && (
          <div className="flex items-start gap-4">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-orchid-soft">
              <Image src={detail.f.photo} alt="" fill sizes="64px" className="object-cover object-top" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl leading-none">{detail.f.name}</p>
              <p className="mt-1.5 text-sm font-semibold text-orchid">Co-founder, {detail.f.brand}</p>
              {detail.mates && <p className="text-sm text-paper/60">with {detail.mates}</p>}
              <Link
                href={`/brands/${detail.f.brandSlug}`}
                className="mt-4 inline-flex items-center gap-1 rounded-full bg-orchid px-4 py-2 text-sm font-semibold text-aubergine"
              >
                Meet the squad <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSheet(null)}
              className="grid size-9 place-items-center rounded-full bg-paper/10"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
