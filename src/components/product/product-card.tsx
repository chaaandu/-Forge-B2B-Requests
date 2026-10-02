"use client";

import Link from "@/components/link";
import { Check, Plus } from "lucide-react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { useRequestList } from "@/lib/request-list";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { FitImage } from "@/components/fit-image";
import { FounderStack } from "@/components/founder-stack";

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
        <Link
          href={`/products/${listing.slug}`}
          data-cursor="View"
          className="relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-paper-2"
        >
          {front && (
            <div
              className={cn(
                "absolute inset-0 transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                back && "group-hover:opacity-0",
              )}
            >
              <FitImage src={front} alt={listing.title} sizes={SIZES} priority={priority} />
            </div>
          )}
          {back && (
            <div className="absolute inset-0 opacity-0 transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100">
              <FitImage src={back} alt="" sizes={SIZES} />
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onQuickAdd}
          aria-label={inList ? `${listing.title} is on your list. Change quantity` : `Add ${listing.title} to your gift list`}
          className={cn(
            "absolute bottom-3 right-3 grid size-11 place-items-center rounded-full shadow-lg shadow-black/10 transition duration-300 active:scale-90",
            inList ? "bg-aubergine text-orchid" : "bg-paper text-ink hover:rotate-90 hover:bg-orchid",
          )}
        >
          {inList ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-5" strokeWidth={2.2} />}
        </button>
      </div>

      {/* Makers, name, brand, price: each on its own line, so a long brand name
          never pushes the price into the middle of it on a narrow card. */}
      <div className="mt-4 min-w-0 space-y-1 px-1">
        <FounderStack teamCode={brand.teamCode} />
        <Link href={`/products/${listing.slug}`} className="block pt-0.5">
          <h3 className="font-display-straight line-clamp-2 text-[1.15rem] leading-[1.12] text-ink sm:text-[1.35rem]">{listing.title}</h3>
        </Link>
        <p className="truncate text-[13px] font-semibold text-ink/75 sm:text-sm">{brand.name}</p>
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm tabular-nums text-ink">
          <span>
            {listing.variants.length > 1 && listing.priceFromMinor !== listing.priceToMinor && <span className="text-ink/55">from </span>}
            <span className="font-semibold">{formatINR(listing.priceFromMinor)}</span>
          </span>
          {cheapest.compareAtMinor && <span className="text-xs text-ink/35 line-through">{formatINR(cheapest.compareAtMinor)}</span>}
          {choices && <span className="hidden text-xs text-ink/45 sm:inline">· {choices}</span>}
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
