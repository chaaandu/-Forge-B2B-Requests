"use client";

import Link from "@/components/link";
import { useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { Brand, Listing } from "@/lib/catalog-types";
import { useDialog } from "@/hooks/use-dialog";
import { FitImage } from "@/components/fit-image";
import { AddToList } from "./add-to-list";

/** A bottom sheet on phones, a centred card on desktop. */
export function QuickAdd({ listing, brand, onClose }: { listing: Listing; brand: Brand; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState(listing.images[0] ?? null);
  useDialog(ref, true, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div onClick={onClose} className="absolute inset-0 animate-[rise_0.3s_both] bg-aubergine/45 backdrop-blur-sm" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={listing.title}
        className="relative max-h-[92dvh] w-full max-w-3xl animate-rise overflow-y-auto rounded-t-3xl bg-paper shadow-2xl sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          <X className="size-5" />
        </button>
        <div className="grid sm:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-square overflow-hidden bg-tile sm:aspect-auto sm:min-h-full">
            {image && (
              <div key={image} className="absolute inset-0 animate-[rise_0.4s_both]">
                <FitImage src={image} alt={listing.title} sizes="(min-width: 640px) 360px, 100vw" />
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <Link href={`/brands/${brand.slug}`} className="text-sm font-semibold text-violet hover:underline">
              {brand.name}
            </Link>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-ink">{listing.title}</h2>
            {listing.description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink/60">{listing.description}</p>}
            <div className="mt-6">
              <AddToList
                listing={listing}
                brand={brand}
                onAdded={() => setTimeout(onClose, 700)}
                onVariantChange={(v) => v.image && setImage(v.image)}
              />
            </div>
            <Link
              href={`/products/${listing.slug}`}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-royal hover:text-violet"
            >
              Full details <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
