"use client";

import { useState } from "react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { AddToList } from "./add-to-list";
import { Gallery } from "./gallery";

/** Gallery and options side by side, sharing which photo is showing. */
export function ProductView({
  listing,
  brand,
  children,
  after,
}: {
  listing: Listing;
  brand: Brand;
  /** Above the options: brand, title, description. */
  children: React.ReactNode;
  /** Below the add button. */
  after?: React.ReactNode;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
      <Gallery images={listing.images} title={listing.title} active={active} onSelect={setActive} />
      <div className="lg:sticky lg:top-24 lg:self-start">
        {children}
        <div className="mt-8 border-t border-black/5 pt-8">
          <AddToList
            listing={listing}
            brand={brand}
            onVariantChange={(v) => {
              const i = v.image ? listing.images.indexOf(v.image) : -1;
              if (i >= 0) setActive(i);
            }}
          />
        </div>
        {after}
      </div>
    </div>
  );
}
