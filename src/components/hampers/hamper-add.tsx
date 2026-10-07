"use client";

import { useState, type ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { useRequestList, type ListItem } from "@/lib/request-list";
import { cn } from "@/lib/cn";
import { QtyStepper } from "@/components/request/qty-stepper";
import { flyToList } from "@/components/motion/fly";

const PRESETS = [10, 25, 50, 100, 250];

/**
 * How many, then add: the hampers' version of the product page's AddToList,
 * with the same presets and the same button, so adding a hamper feels like
 * adding anything else. `item` is null until there's something to add (a
 * build-your-own with too few picks), and `hint` says why. With an `aside`
 * (the builder's tally) it takes the presets' place, beside a smaller stepper.
 */
export function HamperAdd({
  item,
  images,
  hint,
  aside,
  onAdded,
}: {
  item: Omit<ListItem, "qty"> | null;
  /** Photos already on screen for the fly-to-list, best first. */
  images: (string | null | undefined)[];
  hint?: string;
  aside?: ReactNode;
  onAdded?: () => void;
}) {
  const list = useRequestList();
  const inList = item ? list.qtyOf(item.brand, item.sku) : 0;
  const [qty, setQty] = useState(inList || 25);
  const [justAdded, setJustAdded] = useState(false);

  const add = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!item) return;
    list.add({ ...item, qty });
    flyToList(e.currentTarget, images);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    onAdded?.();
  };

  return (
    <div className={aside ? "space-y-3" : "space-y-4"}>
      <div className={cn("flex items-center gap-2", aside ? "justify-between" : "flex-wrap")}>
        {aside}
        <QtyStepper value={qty} onChange={setQty} size={aside ? "sm" : "md"} />
        {/* The presets wrap as one group, never one stray number on its own line. */}
        {!aside && (
          <div className="flex gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQty(p)}
                aria-pressed={qty === p}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-semibold tabular-nums transition",
                  qty === p ? "bg-royal text-white" : "bg-tile text-ink/60 hover:text-ink",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        // Until the page is interactive a click would be lost, so the button says so.
        disabled={!item || !list.ready}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-white transition disabled:opacity-40",
          justAdded ? "bg-aubergine" : "bg-royal hover:bg-aubergine",
        )}
      >
        {justAdded ? <Check className="size-5" /> : <Plus className="size-5" />}
        {justAdded
          ? "Added. Nice pick."
          : !item && hint
            ? hint
            : inList
              ? `Update to ${qty.toLocaleString("en-IN")} hampers`
              : `Add ${qty.toLocaleString("en-IN")} hampers to gift list`}
      </button>
    </div>
  );
}
