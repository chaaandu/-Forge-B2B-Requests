"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { customSku, hamperListItem, MIN_PICKS, resolveHamper, rupees, type HamperTier } from "@/lib/hampers";
import { foundersOf } from "@/lib/founders";
import { cn } from "@/lib/cn";
import { FitImage } from "@/components/fit-image";
import { FacePile } from "@/components/face-pile";
import { HamperSheet } from "./hamper-sheet";
import { HamperAdd } from "./hamper-add";

/**
 * Build your own hamper at one budget. Only that budget's picks are on offer
 * (what its three ready-made hampers are made from), so whatever is chosen
 * fits it, and no prices are shown: the budget is the price. Between
 * MIN_PICKS and as many as the fullest ready-made hamper holds.
 */
export function HamperBuilder({ tier, photos, onClose }: { tier: HamperTier; photos: Record<string, string | null>; onClose: () => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const full = picked.length >= tier.maxPicks;
  const photo = (id: number) => photos[`${tier.amount}:${id}`] ?? null;
  const toggle = (id: number) =>
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= tier.maxPicks ? cur : [...cur, id]));

  const resolved = picked.length >= MIN_PICKS ? resolveHamper(customSku(tier.amount, picked)) : null;
  const item = resolved ? hamperListItem(resolved, photo(picked[0])) : null;
  const short = MIN_PICKS - picked.length;

  return (
    <HamperSheet label={`Build your own ${rupees(tier.amount)} hamper`} onClose={onClose} wide>
      {(close) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto overscroll-contain">
            <div className="px-6 pb-5 pr-16 pt-6 sm:px-8 sm:pt-8">
              <h2 className="font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[0.92] text-ink">
                Your own <em className="text-royal">{rupees(tier.amount)} hamper.</em>
              </h2>
              <p className="mt-3 max-w-lg text-ink/60">
                Pick {MIN_PICKS} or more products. Everything here fits the {rupees(tier.amount)} budget, so there’s no maths to do. We’ll
                pack it and confirm it on the call.
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-x-3 gap-y-5 px-6 pb-6 sm:grid-cols-3 sm:px-8 lg:grid-cols-4">
              {tier.picks.map((p) => {
                const on = picked.includes(p.id);
                const off = full && !on;
                const src = photo(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-pressed={on}
                      disabled={off}
                      className={cn("group block w-full text-left transition", off && "opacity-40")}
                    >
                      <span
                        className={cn(
                          "relative block aspect-square overflow-hidden rounded-2xl bg-tile ring-offset-2 ring-offset-paper transition",
                          on ? "ring-2 ring-royal" : "ring-1 ring-black/5 group-hover:ring-ink/30",
                        )}
                      >
                        {src && <FitImage src={src} alt="" sizes="(min-width: 1024px) 200px, (min-width: 640px) 30vw, 45vw" />}
                        <span
                          className={cn(
                            "absolute right-2 top-2 grid size-8 place-items-center rounded-full shadow transition duration-300",
                            on ? "bg-aubergine text-orchid" : "bg-paper/90 text-ink group-hover:rotate-90",
                          )}
                        >
                          {on ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-4" strokeWidth={2.2} />}
                        </span>
                      </span>
                      <span className="mt-2 block text-sm font-semibold leading-tight text-ink">{p.what}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
                        <FacePile photos={foundersOf(p.teamCode).map((f) => f.photo)} max={3} size={16} />
                        <span className="truncate">{p.brandName}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Always in reach: what's in so far, how many, and add. */}
          <div className="border-t border-ink/10 bg-paper px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
            <HamperAdd
              item={item}
              images={[photo(picked[0] ?? -1)]}
              aside={
                <p className="min-w-0 text-sm leading-tight">
                  <span className="block font-semibold text-ink">
                    {full ? "That’s a full box" : picked.length ? `${picked.length} picked` : "Pick 3 or more"}
                  </span>
                  <span className="block truncate text-ink/50">
                    {picked.length ? picked.map((id) => tier.picks.find((p) => p.id === id)!.what).join(", ") : "Tap to add"}
                  </span>
                </p>
              }
              hint={`Pick ${short} more`}
              onAdded={() => setTimeout(close, 700)}
            />
          </div>
        </div>
      )}
    </HamperSheet>
  );
}
