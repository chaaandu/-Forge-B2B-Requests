"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { useRequestList } from "@/lib/request-list";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { FitImage } from "@/components/fit-image";

const SIZES = "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 50vw";

export function ProductCard({
  listing,
  brand,
  onQuickAdd,
  priority,
}: {
  listing: Listing;
  brand: Brand;
  onQuickAdd: () => void;
  priority?: boolean;
}) {
  const list = useRequestList();
  const inList = list.ready && listing.variants.some((v) => list.has(brand.slug, v.sku));
  const [front, back] = listing.images;
  const cheapest = listing.variants.reduce((a, b) => (b.priceMinor < a.priceMinor ? b : a));
  const choices = listing.options.map((o) => describeOption(o.name, o.values.length)).join(" · ");

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link href={`/products/${listing.slug}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-tile">
          {front && (
            <div
              className={cn(
                "absolute inset-0 transition duration-700 ease-out-soft group-hover:scale-[1.03]",
                back && "group-hover:opacity-0",
              )}
            >
              <FitImage src={front} alt={listing.title} sizes={SIZES} priority={priority} />
            </div>
          )}
          {back && (
            <div className="absolute inset-0 opacity-0 transition duration-700 ease-out-soft group-hover:scale-[1.03] group-hover:opacity-100">
              <FitImage src={back} alt="" sizes={SIZES} />
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onQuickAdd}
          aria-label={inList ? `${listing.title} is on your list — change quantity` : `Add ${listing.title} to your request list`}
          className={cn(
            "absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-lg shadow-black/10 transition active:scale-95",
            inList ? "bg-royal text-white" : "bg-white/95 text-royal backdrop-blur hover:bg-royal hover:text-white",
          )}
        >
          {inList ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-5" strokeWidth={2.2} />}
        </button>
      </div>

      <div className="mt-3.5 space-y-0.5">
        <p className="text-xs font-medium text-ink/50">{brand.name}</p>
        <Link href={`/products/${listing.slug}`}>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{listing.title}</h3>
        </Link>
        {choices && <p className="text-xs text-ink/50">{choices}</p>}
        <p className="pt-1 text-sm tabular-nums text-ink">
          {listing.variants.length > 1 && listing.priceFromMinor !== listing.priceToMinor && <span className="text-ink/50">From </span>}
          <span className="font-semibold">{formatINR(listing.priceFromMinor)}</span>
          {cheapest.compareAtMinor && <span className="ml-1.5 text-xs text-ink/40 line-through">{formatINR(cheapest.compareAtMinor)}</span>}
        </p>
      </div>
    </article>
  );
}

const NOUNS: Record<string, string> = {
  size: "sizes",
  weight: "sizes",
  flavour: "flavours",
  flavor: "flavours",
  colour: "colours",
  color: "colours",
  design: "designs",
  style: "styles",
  pack: "pack sizes",
  fragrance: "fragrances",
  scent: "scents",
};

/** `4 sizes`, `3 flavours` — or `3 options` when a team named the option something only they'd understand. */
function describeOption(name: string, n: number) {
  return `${n} ${NOUNS[name.trim().toLowerCase()] ?? "options"}`;
}
