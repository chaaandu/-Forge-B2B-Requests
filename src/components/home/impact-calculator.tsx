"use client";

import Link from "@/components/link";
import { useRef, useState } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitReveal } from "@/components/motion/reveal";

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/**
 * The donation calculator, for gifting: people × budget = what goes to
 * student founders, set against what the whole cohort actually sold last
 * week. Honest arithmetic only — no multipliers, no "lives changed".
 */
export function ImpactCalculator({ cohortLast7, cohortTotal }: { cohortLast7: number; cohortTotal: number }) {
  const [people, setPeople] = useState(150);
  const [budget, setBudget] = useState(1000);
  const total = people * budget;
  const shown = useRef({ v: total });
  const out = useRef<HTMLParagraphElement>(null);

  // The total rolls to its new value rather than jumping.
  useGSAP(
    () => {
      if (!out.current) return;
      if (reducedMotion()) {
        out.current.textContent = inr(total);
        return;
      }
      gsap.to(shown.current, {
        v: total,
        duration: 0.6,
        ease: "power3.out",
        onUpdate: () => (out.current!.textContent = inr(shown.current.v)),
      });
    },
    { dependencies: [total] },
  );

  const weeks = cohortLast7 > 0 ? total / cohortLast7 : 0;
  const share = cohortTotal > 0 ? (total / cohortTotal) * 100 : 0;
  const fill = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <section className="relative overflow-hidden bg-aubergine-2 text-paper">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-violet/30 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1500px] gap-16 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:py-36">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orchid">Your gifting, in their revenue</p>
          <SplitReveal className="font-display mt-6 text-[clamp(2.8rem,6vw,6rem)] leading-[0.9]">
            See what your <em className="text-orchid">gifting budget</em> does.
          </SplitReveal>
          <div className="mt-14 space-y-12">
            <label className="block">
              <span className="flex items-baseline justify-between text-sm font-semibold text-paper/70">
                People you&apos;re gifting{" "}
                <span className="font-display text-3xl text-paper tabular-nums">{people.toLocaleString("en-IN")}</span>
              </span>
              <input
                type="range"
                min={10}
                max={2000}
                step={10}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="range mt-5"
                style={{ ["--fill" as string]: fill(people, 10, 2000) }}
              />
            </label>
            <label className="block">
              <span className="flex items-baseline justify-between text-sm font-semibold text-paper/70">
                Budget per gift <span className="font-display text-3xl text-paper tabular-nums">{inr(budget)}</span>
              </span>
              <input
                type="range"
                min={250}
                max={5000}
                step={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="range mt-5"
                style={{ ["--fill" as string]: fill(budget, 250, 5000) }}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col justify-end rounded-[40px] bg-paper/[0.05] p-8 ring-1 ring-paper/10 backdrop-blur sm:p-12">
          <p className="text-sm font-semibold text-paper/60">Goes to student founders</p>
          <p ref={out} className="font-display mt-2 text-[clamp(3.5rem,8vw,8rem)] leading-none tabular-nums text-orchid">
            {inr(total)}
          </p>
          <div className="mt-10 space-y-4 border-t border-paper/10 pt-8 text-lg leading-snug text-paper/75">
            {weeks > 0 && (
              <p>
                That&apos;s{" "}
                <span className="font-semibold text-paper">
                  {weeks >= 1.05 ? `${weeks.toFixed(1)}×` : `${Math.round(weeks * 100)}% of`}
                </span>{" "}
                what all the founders together sold in the last seven days.
              </p>
            )}
            {share > 0 && (
              <p>
                Or <span className="font-semibold text-paper">{share >= 10 ? Math.round(share) : share.toFixed(1)}%</span> of everything the
                cohort has sold since they started.
              </p>
            )}
            <p className="text-base text-paper/50">Bulk orders are quoted below retail, so the exact figure comes with our call.</p>
          </div>
          <div className="mt-10">
            <Magnetic>
              <Link
                href="/catalogue"
                data-cursor="Go"
                className="inline-flex rounded-full bg-orchid px-8 py-5 font-semibold text-aubergine transition hover:bg-paper"
              >
                Build this gift list
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
