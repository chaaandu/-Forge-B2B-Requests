"use client";

import { useState } from "react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { ProductCard } from "@/components/product/product-card";
import { QuickAdd } from "@/components/product/quick-add";
import { DragRail } from "@/components/motion/drag-rail";

/** A row of products you can throw sideways (mouse) or swipe (touch), each addable in place. */
export function ListingRail({ listings, brands }: { listings: Listing[]; brands: Brand[] }) {
  const [quick, setQuick] = useState<Listing | null>(null);
  const brandBySlug = new Map(brands.map((b) => [b.slug, b]));

  return (
    <>
      <DragRail className="-mx-5 sm:-mx-8">
        <div className="flex w-max gap-5 px-5 pb-4 sm:px-8">
          {listings.map((l) => (
            <div key={l.slug} className="w-[72vw] shrink-0 sm:w-[300px]">
              <ProductCard listing={l} brand={brandBySlug.get(l.brand)!} onQuickAdd={() => setQuick(l)} />
            </div>
          ))}
        </div>
      </DragRail>
      {quick && <QuickAdd listing={quick} brand={brandBySlug.get(quick.brand)!} onClose={() => setQuick(null)} />}
    </>
  );
}
