"use client";

import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { HAMPER_BRAND, rupees, type Hamper, type HamperTier } from "@/lib/hampers";
import { foundersOf } from "@/lib/founders";
import { cn } from "@/lib/cn";
import { FitImage } from "@/components/fit-image";
import { FacePile } from "@/components/face-pile";

const SIZES = "(min-width: 1280px) 340px, (min-width: 1024px) 24vw, 50vw";

/** Every founder behind a set of teams, once each. */
export const facesOf = (teamCodes: string[]) => [...new Set(teamCodes)].flatMap((t) => foundersOf(t)).map((f) => f.photo);

/**
 * A ready-made hamper, laid out like a product card: the photo, the faces of
 * everyone whose product is inside, its name, the brands in it, the budget.
 * The photo and the + both open the hamper.
 */
export function HamperCard({ hamper, onOpen, priority }: { hamper: Hamper; onOpen: () => void; priority?: boolean }) {
  const list = useRequestList();
  const inList = list.ready && list.has(HAMPER_BRAND, hamper.slug);
  const faces = facesOf(hamper.teamCodes);
  const brands = [...new Set(hamper.items.map((i) => i.brandName))];

  return (
    <article id={hamper.slug} className="group flex scroll-mt-28 flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={onOpen}
          data-cursor="View"
          aria-label={`${hamper.name}, what’s inside`}
          className="relative block aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-paper-2"
        >
          <div className="absolute inset-0 transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
            <FitImage src={hamper.image} alt={hamper.name} sizes={SIZES} priority={priority} />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-semibold tabular-nums text-ink shadow-sm backdrop-blur">
            Comes with {hamper.items.reduce((n, i) => n + i.qty, 0)} items
          </span>
        </button>
        <button
          type="button"
          onClick={onOpen}
          aria-label={inList ? `${hamper.name} is on your list. Change quantity` : `Add ${hamper.name} to your gift list`}
          className={cn(
            "absolute bottom-3 right-3 grid size-11 place-items-center rounded-full shadow-lg shadow-black/10 transition duration-300 active:scale-90",
            inList ? "bg-aubergine text-orchid" : "bg-paper text-ink hover:rotate-90 hover:bg-orchid",
          )}
        >
          {inList ? <Check className="size-4" strokeWidth={2.5} /> : <Plus className="size-5" strokeWidth={2.2} />}
        </button>
      </div>

      <div className="mt-4 min-w-0 space-y-1 px-1">
        <span className="flex items-center gap-2">
          <FacePile photos={faces} max={3} size={24} />
          <span className="truncate text-xs text-ink/55">{faces.length} founders</span>
        </span>
        <button type="button" onClick={onOpen} className="block pt-0.5 text-left">
          <h3 className="font-display-straight line-clamp-2 text-[1.15rem] leading-[1.12] text-ink sm:text-[1.35rem]">{hamper.name}</h3>
        </button>
        <p className="text-[13px] font-semibold text-violet sm:text-sm">{hamper.for}</p>
        <p className="line-clamp-1 text-xs text-ink/55">{brands.join(" · ")}</p>
        <p className="text-sm tabular-nums text-ink">
          <span className="font-semibold">{rupees(hamper.amount)}</span> <span className="text-ink/55">per hamper</span>
        </p>
      </div>
    </article>
  );
}

/**
 * The fourth card in every budget: build your own from that budget's picks.
 * Its tile is a contact sheet of what you can choose from, under the offer.
 */
export function BuildCard({ tier, photos, onOpen }: { tier: HamperTier; photos: Record<string, string | null>; onOpen: () => void }) {
  const shots = tier.picks.map((p) => photos[`${tier.amount}:${p.id}`]).filter((s): s is string => Boolean(s));
  const faces = facesOf(tier.picks.map((p) => p.teamCode));

  return (
    <article id={`build-${tier.amount}`} className="group flex scroll-mt-28 flex-col">
      <button
        type="button"
        onClick={onOpen}
        data-cursor="Build"
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-aubergine text-left text-paper"
      >
        <div
          aria-hidden
          className="absolute inset-[-6%] grid rotate-[-6deg] grid-cols-3 gap-2 opacity-45 transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-hover:opacity-60"
        >
          {Array.from({ length: 12 }, (_, i) => shots[i % Math.max(1, shots.length)]).map((src, i) =>
            src ? (
              <span key={i} className="relative aspect-square overflow-hidden rounded-xl bg-aubergine-2">
                <Image src={src} alt="" fill sizes="120px" className="object-cover" />
              </span>
            ) : null,
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-aubergine via-aubergine/70 to-aubergine/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[0.92]">
            Build <em className="text-orchid">your own.</em>
          </p>
          <p className="mt-2 text-sm text-paper/70">Pick 3 or more products</p>
        </div>
        <span className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-orchid text-aubergine shadow-lg shadow-black/20 transition duration-300 group-hover:rotate-90">
          <Plus className="size-5" strokeWidth={2.2} />
        </span>
      </button>

      <div className="mt-4 min-w-0 space-y-1 px-1">
        <span className="flex items-center gap-2">
          <FacePile photos={faces} max={3} size={24} />
          <span className="truncate text-xs text-ink/55">{faces.length} founders</span>
        </span>
        <button type="button" onClick={onOpen} className="block pt-0.5 text-left">
          <h3 className="font-display-straight line-clamp-2 text-[1.15rem] leading-[1.12] text-ink sm:text-[1.35rem]">
            Your own {rupees(tier.amount)} hamper
          </h3>
        </button>
        <p className="text-[13px] font-semibold text-violet sm:text-sm">You pick, we pack</p>
        <p className="line-clamp-1 text-xs text-ink/55">Only what fits the budget. No maths.</p>
        <p className="text-sm tabular-nums text-ink">
          <span className="font-semibold">{rupees(tier.amount)}</span> <span className="text-ink/55">per hamper</span>
        </p>
      </div>
    </article>
  );
}
