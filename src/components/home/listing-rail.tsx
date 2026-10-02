"use client";

import { useState } from "react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { ProductCard } from "@/components/product/product-card";
import { QuickAdd } from "@/components/product/quick-add";

/** A horizontal, snap-scrolling row of products that can be added in place. */
export function ListingRail({ listings, brands }: { listings: Listing[]; brands: Brand[] }) {
  const [quick, setQuick] = useState<Listing | null>(null);
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  return (
    <>
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8">
        {listings.map((l) => (
          <div key={l.slug} className="w-[70vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard listing={l} brand={brandBySlug.get(l.brand)!} onQuickAdd={() => setQuick(l)} />
          </div>
        ))}
      </div>
      {quick && <QuickAdd listing={quick} brand={brandBySlug.get(quick.brand)!} onClose={() => setQuick(null)} />}
    </>
  );
}
