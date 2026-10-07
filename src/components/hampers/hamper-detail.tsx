"use client";

import { hamperListItem, resolveHamper, rupees, tierOf, type Hamper } from "@/lib/hampers";
import { foundersOf } from "@/lib/founders";
import { FitImage } from "@/components/fit-image";
import { FacePile } from "@/components/face-pile";
import { HamperSheet } from "./hamper-sheet";
import { HamperAdd } from "./hamper-add";
import { facesOf } from "./hamper-card";

/**
 * One ready-made hamper: the photo across the top, then its size, who
 * made it and everything inside (each with its own product photo), with how
 * many and add always in reach at the bottom.
 */
export function HamperDetail({ hamper, photos, onClose }: { hamper: Hamper; photos: Record<string, string | null>; onClose: () => void }) {
  const faces = facesOf(hamper.teamCodes);
  const item = hamperListItem(resolveHamper(hamper.slug)!);
  const count = hamper.items.reduce((n, i) => n + i.qty, 0);

  return (
    <HamperSheet label={hamper.name} onClose={onClose}>
      {(close) => (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="overflow-y-auto overscroll-contain">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-tile sm:aspect-[16/9]">
              <FitImage src={hamper.image} alt={hamper.name} sizes="(min-width: 672px) 672px, 100vw" />
            </div>

            <div className="px-6 pb-6 pt-6 sm:px-8 sm:pt-7">
              <p className="text-sm font-semibold text-violet">
                {tierOf(hamper.amount)?.label} hamper · {rupees(hamper.amount)}
              </p>
              <h2 className="font-display mt-1 text-[clamp(2.2rem,6vw,3.2rem)] leading-[0.95] text-ink">{hamper.name}</h2>
              <p className="mt-4 flex items-center gap-2 text-sm text-ink/60">
                <FacePile photos={faces} max={5} size={26} />
                <span>
                  Made by {faces.length} founders across {hamper.teamCodes.length} companies
                </span>
              </p>

              <h3 className="mt-7 text-sm font-semibold text-ink">
                What’s inside <span className="font-normal text-ink/50">· {count} items</span>
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {hamper.items.map((l) => {
                  const src = photos[`${hamper.amount}:${l.id}`];
                  return (
                    <li key={l.id} className="flex items-center gap-3 rounded-2xl bg-paper-2/70 p-2 pr-3">
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-paper-3">
                        {src && <FitImage src={src} alt="" sizes="56px" />}
                      </span>
                      <span className="min-w-0 flex-1 text-sm leading-tight text-ink">
                        <span className="block truncate font-semibold">
                          {l.what}
                          {l.qty > 1 && <span className="tabular-nums text-ink/55"> ×{l.qty}</span>}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-ink/55">
                          <FacePile photos={foundersOf(l.teamCode).map((f) => f.photo)} max={3} size={16} ring="ring-paper-2" />
                          <span className="truncate">{l.brandName}</span>
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-ink/45">
                The photo shows the styling. Flavours and designs can change with what’s in stock, and we’ll confirm everything on the call.
              </p>
            </div>
          </div>

          {/* Always in reach: the price, how many, and add. */}
          <div className="border-t border-ink/10 bg-paper px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-8">
            <HamperAdd
              item={item}
              images={[hamper.image]}
              aside={
                <p className="leading-tight">
                  <span className="block text-2xl font-semibold tracking-tight text-ink">{rupees(hamper.amount)}</span>
                  <span className="block text-xs text-ink/50">per hamper</span>
                </p>
              }
              onAdded={() => setTimeout(close, 700)}
            />
          </div>
        </div>
      )}
    </HamperSheet>
  );
}
