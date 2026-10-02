"use client";

import Link from "@/components/link";
import { useRef, useState } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitReveal } from "@/components/motion/reveal";
import { Roll } from "@/components/layout/header";

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/**
 * The donation calculator, for gifting: people × budget = what goes to
 * student founders, drawn against what the whole cohort actually sold last
 * week. Honest arithmetic only: no multipliers, no "lives changed".
 */
export function ImpactCalculator({ cohortLast7, cohortTotal, founders }: { cohortLast7: number; cohortTotal: number; founders: number }) {
  const [people, setPeople] = useState(150);
  const [budget, setBudget] = useState(1000);
  const total = people * budget;
  const shown = useRef({ v: total });
  const out = useRef<HTMLParagraphElement>(null);

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
        onUpdate: () => void (out.current!.textContent = inr(shown.current.v)),
      });
    },
    { dependencies: [total] },
  );

  const weekShare = cohortLast7 > 0 ? (total / cohortLast7) * 100 : 0;
  const lifeShare = cohortTotal > 0 ? (total / cohortTotal) * 100 : 0;
  const barMax = Math.max(total, cohortLast7, 1);
  const pct = (n: number) => (n >= 10 ? Math.round(n).toLocaleString("en-IN") : n.toFixed(1));
  const fill = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;

  return (
    <section className="relative overflow-hidden bg-aubergine-2 text-paper">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-violet/30 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-60 -left-40 size-[520px] rounded-full bg-orchid/10 blur-[120px]" />
      <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-36">
        <div>
          <SplitReveal className="font-display text-[clamp(2.8rem,6vw,6rem)] leading-[0.92]">
            Same budget. <em className="text-orchid">Way more impact.</em>
          </SplitReveal>
          <div className="mt-14 space-y-12">
            <label className="block">
              <span className="flex items-baseline justify-between text-sm font-semibold text-paper/70">
                How many people? <span className="font-display text-4xl tabular-nums text-paper">{people.toLocaleString("en-IN")}</span>
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
                Budget per gift <span className="font-display text-4xl tabular-nums text-paper">{inr(budget)}</span>
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

        <div className="flex flex-col justify-end rounded-[40px] bg-paper/[0.05] p-7 ring-1 ring-paper/10 backdrop-blur sm:p-12">
          <p className="text-sm font-semibold text-paper/60">Straight to student founders</p>
          <p ref={out} className="font-display mt-2 text-[clamp(3.4rem,8vw,8rem)] leading-none tabular-nums text-orchid">
            {inr(total)}
          </p>

          {cohortLast7 > 0 && (
            <div className="mt-10 space-y-4">
              {[
                { label: "Your order", v: total, tone: "bg-orchid" },
                { label: `All ${founders} founders, last 7 days`, v: cohortLast7, tone: "bg-paper/35" },
              ].map((b) => (
                <div key={b.label}>
                  <p className="flex justify-between text-xs font-semibold text-paper/60">
                    <span>{b.label}</span>
                    <span className="tabular-nums">{inr(b.v)}</span>
                  </p>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-paper/10">
                    <div
                      className={`h-full rounded-full ${b.tone} transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                      style={{ width: `${(b.v / barMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 space-y-3 border-t border-paper/10 pt-7 text-lg leading-snug text-paper/75">
            {weekShare > 0 && (
              <p>
                That’s <span className="font-semibold text-paper">{pct(weekShare)}%</span> of what all {founders}&nbsp;founders sold last
                week, combined.
              </p>
            )}
            {lifeShare > 0 && (
              <p>
                Or <span className="font-semibold text-paper">{pct(lifeShare)}%</span> of everything they’ve sold, ever.
              </p>
            )}
          </div>
          <div className="mt-9">
            <Magnetic>
              <Link
                href="/catalogue"
                data-cursor="Go"
                className="group inline-flex rounded-full bg-orchid px-8 py-5 font-semibold text-aubergine transition-colors hover:bg-paper"
              >
                <Roll>Build this list</Roll>
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
