"use client";

import Link from "@/components/link";
import { useCallback, useRef } from "react";
import { useDialog } from "@/hooks/use-dialog";
import { ArrowRight, Trash2, X } from "lucide-react";
import { Icon3D } from "@/components/icon3d";
import { useRequestList } from "@/lib/request-list";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { QtyStepper } from "./qty-stepper";
import { FitImage } from "@/components/fit-image";

export function RequestDrawer() {
  const list = useRequestList();
  const { open, setOpen } = list;
  const value = list.items.reduce((n, i) => n + i.qty * i.priceMinor, 0);

  const ref = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useDialog(ref, open, close);

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-aubergine/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Your request list"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-500 ease-out-soft",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Your request list</h2>
            <p className="text-xs text-ink/60">
              {list.count
                ? `${list.count} product${list.count > 1 ? "s" : ""} · ${list.units.toLocaleString("en-IN")} units`
                : "Nothing here yet"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full hover:bg-white"
          >
            <X className="size-5" />
          </button>
        </div>

        {list.count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <Icon3D name="shopping-bags" size={96} className="size-20" />
            <p className="mt-5 text-xl font-semibold text-ink">Start a shortlist</p>
            <p className="mt-2 text-sm text-ink/60">
              Add products with rough quantities. It isn&apos;t an order. We&apos;ll get back to you with bulk pricing and timelines.
            </p>
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-full bg-royal px-5 py-3 text-sm font-semibold text-white hover:bg-aubergine"
            >
              Browse the catalogue
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {list.items.map((i) => (
                <li key={`${i.brand}:${i.sku}`} className="flex gap-3 rounded-2xl bg-canvas p-3 ring-1 ring-black/5">
                  <Link
                    href={`/products/${i.listing}`}
                    onClick={() => setOpen(false)}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-tile"
                  >
                    {i.image && <FitImage src={i.image} alt="" sizes="80px" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-ink/50">{i.brandName}</p>
                        <p className="truncate text-sm font-semibold text-ink">{i.title}</p>
                        {i.label !== i.title && <p className="truncate text-xs text-ink/60">{i.label}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => list.remove(i.brand, i.sku)}
                        aria-label={`Remove ${i.title}`}
                        className="grid size-8 shrink-0 place-items-center rounded-full text-ink/60 hover:bg-mist hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QtyStepper size="sm" value={i.qty} onChange={(n) => list.setQty(i.brand, i.sku, n)} />
                      <span className="text-xs text-ink/60">{formatINR(i.priceMinor)} each</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-black/5 bg-white px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink/60">Indicative value at retail</span>
                <span className="text-lg font-bold tabular-nums text-royal">{formatINR(value)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/60">
                Bulk orders are priced lower. We&apos;ll confirm once we&apos;ve seen your request.
              </p>
              <Link
                href="/request"
                onClick={() => setOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-royal px-5 py-3.5 font-semibold text-white transition hover:bg-aubergine"
              >
                Review &amp; send request <ArrowRight className="size-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
