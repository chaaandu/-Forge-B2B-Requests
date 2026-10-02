"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Brand, Listing, Variant } from "@/lib/catalog-types";
import { useRequestList } from "@/lib/request-list";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { QtyStepper } from "@/components/request/qty-stepper";
import { flyToList } from "@/components/motion/fly";
import { FitImage } from "@/components/fit-image";

const PRESETS = [10, 25, 50, 100, 250];

/**
 * Pick a variant, pick a quantity, add. Shared by the quick-add sheet and the
 * product page so the two can never disagree about how adding works.
 */
export function AddToList({
  listing,
  brand,
  onAdded,
  onVariantChange,
}: {
  listing: Listing;
  brand: Brand;
  onAdded?: () => void;
  /** Lets the gallery beside it show the photo of what's selected. */
  onVariantChange?: (variant: Variant) => void;
}) {
  const list = useRequestList();
  const [picked, setPicked] = useState<string[]>(() => listing.variants[0].options);
  const variant = listing.options.length ? listing.variants.find((v) => v.options.every((o, i) => o === picked[i])) : listing.variants[0];
  const inList = variant ? list.qtyOf(brand.slug, variant.sku) : 0;
  const [qty, setQty] = useState(inList || 25);
  const [justAdded, setJustAdded] = useState(false);

  // Values that exist alongside the other current choices; the rest are shown struck out.
  const available = (optionIndex: number, value: string) =>
    listing.variants.some((v) => v.options[optionIndex] === value && v.options.every((o, i) => i === optionIndex || o === picked[i]));

  // An option whose every value has its own photo is shown as photo swatches.
  const swatchFor = (optionIndex: number, value: string) => listing.variants.find((v) => v.options[optionIndex] === value)?.image ?? null;
  // Only for options you choose by looking — a design, a colour, a print. A
  // size picked from four product photos is a guessing game.
  const isVisual = (optionIndex: number) => {
    if (!/design|style|colou?r|print|pattern|shade/i.test(listing.options[optionIndex].name)) return false;
    const imgs = listing.options[optionIndex].values.map((v) => swatchFor(optionIndex, v));
    return imgs.every(Boolean) && new Set(imgs).size === imgs.length && listing.options[optionIndex].values.length > 1;
  };

  const choose = (optionIndex: number, value: string) => {
    const next = picked.map((p, i) => (i === optionIndex ? value : p));
    // If the combination doesn't exist, jump to the nearest one that does.
    const chosen =
      listing.variants.find((v) => v.options.every((o, i) => o === next[i])) ??
      listing.variants.find((v) => v.options[optionIndex] === value);
    if (!chosen) return;
    setPicked(chosen.options);
    onVariantChange?.(chosen);
    const already = list.qtyOf(brand.slug, chosen.sku);
    if (already) setQty(already);
  };

  const add = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!variant) return;
    list.add({
      brand: brand.slug,
      sku: variant.sku,
      qty,
      listing: listing.slug,
      title: listing.title,
      brandName: brand.name,
      label: variant.label,
      priceMinor: variant.priceMinor,
      image: variant.image ?? listing.images[0] ?? null,
    });
    flyToList(e.currentTarget, variant.image ?? listing.images[0] ?? null);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    onAdded?.();
  };

  return (
    <div className="space-y-7">
      {listing.options.map((opt, oi) => (
        <fieldset key={opt.name}>
          <legend className="mb-3 text-sm font-semibold text-ink">
            {opt.name}. <span className="font-normal text-ink/50">{picked[oi]}</span>
          </legend>
          {isVisual(oi) ? (
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const on = picked[oi] === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => choose(oi, val)}
                    aria-label={val}
                    aria-pressed={on}
                    title={val}
                    className={cn(
                      "relative size-14 overflow-hidden rounded-xl bg-tile ring-offset-2 transition",
                      on ? "ring-2 ring-royal" : "ring-1 ring-black/10 hover:ring-ink/40",
                    )}
                  >
                    <FitImage src={swatchFor(oi, val)!} alt="" sizes="56px" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {opt.values.map((val) => {
                const on = picked[oi] === val;
                const ok = available(oi, val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => choose(oi, val)}
                    aria-pressed={on}
                    className={cn(
                      "min-w-14 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition",
                      on ? "border-royal text-ink" : "border-black/10 text-ink/80 hover:border-ink/30",
                      !ok && !on && "text-ink/30 line-through decoration-1",
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
      ))}

      <div>
        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-ink">{variant ? formatINR(variant.priceMinor) : "Pick one"}</span>
          {variant?.compareAtMinor && <span className="text-sm text-ink/40 line-through">{formatINR(variant.compareAtMinor)}</span>}
          <span className="text-sm text-ink/50">retail, per unit</span>
        </p>
        {variant && <p className="mt-1 break-all font-mono text-[11px] text-ink/40">SKU {variant.sku}</p>}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">
          How many? <span className="font-normal text-ink/50">A rough number is fine.</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <QtyStepper value={qty} onChange={setQty} />
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
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!variant}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-white transition disabled:opacity-40",
          justAdded ? "bg-aubergine" : "bg-royal hover:bg-aubergine",
        )}
      >
        {justAdded ? <Check className="size-5" /> : <Plus className="size-5" />}
        {justAdded
          ? "Added. Nice pick."
          : inList
            ? `Update to ${qty.toLocaleString("en-IN")}`
            : `Add ${qty.toLocaleString("en-IN")} to gift list`}
      </button>
    </div>
  );
}
