"use client";

import { useEffect, useRef } from "react";
import { HAMPERS, rupees, TIERS } from "@/lib/hampers";
import type { DoodleName } from "@/components/doodles";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/base-path";
import { Doodle } from "@/components/doodle";

/**
 * The hampers' shelves, as the store's arched shop windows, but with their
 * own drawings: the box itself, growing from Mini to Grand, with the budget
 * beneath. Choosing one filters the page in place and stays
 * lit. Each window is a real link (`/hampers?for=500`), so a new tab or a
 * copied link still lands on that shelf.
 */
/**
 * Each shelf's own window: a tint of its own, and a little taller than the
 * one before, so the row steps up from Mini to Grand like the boxes do.
 */
const WINDOW: Record<string, { tint: string; ratio: string }> = {
  all: { tint: "bg-paper-2", ratio: "aspect-[1/1.2]" },
  500: { tint: "bg-[#f7e6c8]", ratio: "aspect-[1/0.95]" },
  1000: { tint: "bg-orchid-soft", ratio: "aspect-[1/1.06]" },
  1500: { tint: "bg-mist-2", ratio: "aspect-[1/1.17]" },
  3000: { tint: "bg-[#f1d5dd]", ratio: "aspect-[1/1.28]" },
  5000: { tint: "bg-[#e2d4f3]", ratio: "aspect-[1/1.4]" },
};

export function HamperStrip({ active, onSelect }: { active: number | null; onSelect: (amount: number | null) => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const tiles: { amount: number | null; label: string; icon: DoodleName; note: string }[] = [
    { amount: null, label: "All", icon: "hamper-all", note: `${HAMPERS.length} hampers` },
    ...TIERS.map((t) => ({ amount: t.amount, label: t.label, icon: t.icon as DoodleName, note: rupees(t.amount) })),
  ];

  // Keep the chosen window in view when the strip scrolls sideways, without moving the page.
  const first = useRef(true);
  useEffect(() => {
    const el = strip.current;
    const tile = el?.querySelector<HTMLElement>(`[data-tier="${active ?? "all"}"]`);
    if (!el || !tile || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2, behavior: first.current ? "auto" : "smooth" });
    first.current = false;
  }, [active]);

  return (
    <div ref={strip} role="group" aria-label="Hamper sizes" className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
      <div className="flex min-w-max items-end gap-2.5 sm:gap-3 lg:gap-4">
        {tiles.map((t) => {
          const on = active === t.amount;
          return (
            <a
              key={t.amount ?? "all"}
              href={withBase(t.amount ? `/hampers?for=${t.amount}` : "/hampers")}
              data-tier={t.amount ?? "all"}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelect(t.amount);
              }}
              aria-current={on ? "true" : undefined}
              className="group flex w-[84px] shrink-0 flex-col items-center text-center sm:w-28 xl:w-32"
            >
              <span
                className={cn(
                  "flex w-full items-end justify-center rounded-t-full rounded-b-[20px] pb-[8%] transition-[background-color,color,scale,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  WINDOW[t.amount ?? "all"].ratio,
                  on
                    ? "bg-aubergine text-paper"
                    : cn(WINDOW[t.amount ?? "all"].tint, "text-aubergine pointer-fine:group-hover:brightness-95"),
                  "group-active:scale-95",
                )}
              >
                <Doodle name={t.icon} hover="group" className="w-[80%]" />
              </span>
              <span
                className={cn("mt-2 text-[13px] leading-tight transition-colors", on ? "font-bold text-ink" : "font-semibold text-ink/65")}
              >
                {t.label}
              </span>
              <span className="mt-0.5 text-[11px] tabular-nums text-ink/45">{t.note}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
