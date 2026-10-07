"use client";

import { useState } from "react";
import Link from "@/components/link";
import { HAMPERS, rupees, TIERS, type Hamper } from "@/lib/hampers";
import { DragRail } from "@/components/motion/drag-rail";
import { BuildCollage, HamperCard } from "./hamper-card";
import { HamperDetail } from "./hamper-detail";

/**
 * The home page's row of ready-made hampers, cheapest first, each openable
 * in place. Last in the row, the way to build your own.
 */
export function HamperRail({ photos }: { photos: Record<string, string | null> }) {
  const [open, setOpen] = useState<Hamper | null>(null);
  // A dozen different products from across the sizes, behind the offer.
  const shots = [...new Set(Object.values(photos).filter((s): s is string => Boolean(s)))].filter((_, i) => i % 3 === 0).slice(0, 12);

  return (
    <>
      <DragRail className="-mx-5 sm:-mx-8">
        <div className="flex w-max gap-5 px-5 pb-4 sm:px-8">
          {HAMPERS.map((h) => (
            <div key={h.slug} className="w-[72vw] shrink-0 sm:w-[300px]">
              <HamperCard hamper={h} onOpen={() => setOpen(h)} />
            </div>
          ))}
          <Link
            href="/hampers#t-500"
            data-cursor="Build"
            className="group relative aspect-[4/5] w-[72vw] shrink-0 overflow-hidden rounded-[28px] bg-aubergine text-paper sm:w-[300px]"
          >
            <BuildCollage shots={shots} />
            <span className="absolute inset-x-0 bottom-0 flex flex-col p-6">
              <span className="font-display text-[2.6rem] leading-[0.92]">
                Or build <em className="text-orchid">your own.</em>
              </span>
              <span className="mt-3 text-sm text-paper/70">Pick a budget from {rupees(TIERS[0].amount)}, then pick what goes in.</span>
              <span className="mt-5 inline-flex w-max rounded-full bg-orchid px-4 py-2 text-sm font-semibold text-aubergine transition-colors group-hover:bg-paper">
                Start building
              </span>
            </span>
          </Link>
        </div>
      </DragRail>
      {open && <HamperDetail hamper={open} photos={photos} onClose={() => setOpen(null)} />}
    </>
  );
}
