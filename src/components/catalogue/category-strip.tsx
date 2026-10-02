"use client";

import { useEffect, useRef } from "react";
import { COLLECTIONS } from "@/lib/catalog-types";
import type { DoodleName } from "@/components/doodles";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/base-path";
import { Doodle } from "@/components/doodle";

/**
 * Every shelf as a little arched shop window with its drawing inside. It's
 * the store's category picker: choosing one filters the grid below in place,
 * and the chosen window stays lit (dark, with its drawing in paper ink), so
 * the strip never disappears and you always see where you are. Scrolls
 * sideways on a phone, keeping the chosen window in view.
 *
 * Each window is a real link to its filtered store, so a new tab, a copied
 * link or a browser without scripts still gets there; a plain click is
 * caught and filters in place instead.
 */
export function CategoryStrip({
  active,
  counts,
  only,
  occasion,
  onSelect,
}: {
  /** The chosen collection id, or "" for everything. */
  active: string;
  /** Gifts per collection id, plus `all`. */
  counts: Record<string, number>;
  /** Limit the windows to these collections (an occasion's shelves). */
  only?: readonly string[];
  /** The occasion being browsed, kept in each window's link. */
  occasion?: string;
  onSelect: (id: string) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const tiles: { id: string; label: string; icon: DoodleName }[] = [
    { id: "", label: "All", icon: "sparkle" },
    ...COLLECTIONS.filter((c) => !only || only.includes(c.id)).map((c) => ({ id: c.id, label: c.short, icon: c.icon })),
  ];

  // Keep the chosen window in view when the strip scrolls sideways. The strip
  // scrolls itself (not scrollIntoView), so the page never jumps.
  const first = useRef(true);
  useEffect(() => {
    const el = strip.current;
    const tile = el?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (!el || !tile || el.scrollWidth <= el.clientWidth) return;
    const left = tile.offsetLeft - (el.clientWidth - tile.offsetWidth) / 2;
    el.scrollTo({ left, behavior: first.current ? "auto" : "smooth" });
    first.current = false;
  }, [active]);

  return (
    <div ref={strip} role="group" aria-label="Categories" className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8">
      <div className="flex min-w-max gap-2.5 sm:gap-3 lg:min-w-0 lg:gap-4">
        {tiles.map((t) => {
          const on = active === t.id;
          const n = counts[t.id || "all"] ?? 0;
          return (
            <a
              key={t.id || "all"}
              href={withBase(`/catalogue${query(t.id, occasion)}`)}
              data-cat={t.id}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelect(t.id);
              }}
              aria-current={on ? "true" : undefined}
              className="group flex w-[76px] shrink-0 flex-col items-center text-center sm:w-24 lg:w-auto lg:flex-1"
            >
              <span
                className={cn(
                  "grid aspect-[5/6] w-full place-items-center rounded-t-full rounded-b-[20px] transition-[background-color,color,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  on ? "bg-aubergine text-paper" : "bg-paper-2 text-aubergine pointer-fine:group-hover:bg-orchid-soft",
                  !on && n === 0 && "opacity-50",
                  "group-active:scale-95",
                )}
              >
                <Doodle name={t.icon} hover="group" className="mt-[18%] w-[62%]" />
              </span>
              <span
                className={cn("mt-2 text-[13px] leading-tight transition-colors", on ? "font-bold text-ink" : "font-semibold text-ink/65")}
              >
                {t.label}
              </span>
              <span className="mt-0.5 text-[11px] tabular-nums text-ink/45">
                {n} {n === 1 ? "gift" : "gifts"}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

const query = (collection: string, occasion?: string) => {
  const q = new URLSearchParams();
  if (collection) q.set("collection", collection);
  if (occasion) q.set("occasion", occasion);
  const s = q.toString();
  return s ? `?${s}` : "";
};
