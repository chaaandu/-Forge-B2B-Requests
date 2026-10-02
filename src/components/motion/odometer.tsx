"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, reducedMotion, useGSAP } from "./gsap";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DIGITS = [...Array(20).keys()].map((i) => i % 10);

/**
 * A number on a mechanical counter: every digit is a reel of 0–9 (twice
 * round) that spins to its place, Indian-grouped (₹26,00,153). The final
 * value is in the markup, so it reads right with no JavaScript at all.
 */
export function Odometer({
  value,
  prefix = "",
  className,
  delay = 0,
}: {
  value: number;
  prefix?: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = prefix + inr.format(value);

  useGSAP(
    () => {
      if (!ref.current || reducedMotion()) return;
      const reels = ref.current.querySelectorAll<HTMLElement>("[data-reel]");
      reels.forEach((reel, i) => {
        const d = Number(reel.dataset.reel);
        // The markup carries the final position as a CSS transform for no-JS;
        // GSAP would read it as pixels and add its own percentage on top.
        reel.style.transform = "";
        gsap.fromTo(
          reel,
          { yPercent: 0 },
          {
            yPercent: -(10 + d) * 5,
            duration: 1.6 + i * 0.08,
            ease: "expo.out",
            delay,
            scrollTrigger: { trigger: ref.current, start: "top 95%", once: true },
          },
        );
      });
    },
    { scope: ref, dependencies: [value] },
  );

  return (
    <span ref={ref} className={cn("inline-flex tabular-nums", className)} aria-label={text}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="inline-block h-[1.15em] overflow-hidden leading-[1.15em]">
            <span data-reel={ch} className="block" style={{ transform: `translateY(-${(10 + Number(ch)) * 5}%)` }}>
              {DIGITS.map((d, j) => (
                <span key={j} className="block h-[1.15em]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} aria-hidden className="inline-block h-[1.15em] leading-[1.15em]">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
