"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useCallback, useRef } from "react";
import { ArrowRight, Trash2, X } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { foundersOf } from "@/lib/founders";
import { TEAM_OF } from "@/lib/brand-teams";
import { useDialog } from "@/hooks/use-dialog";
import { Doodle } from "@/components/doodle";
import { FacePile } from "@/components/face-pile";
import { FitImage } from "@/components/fit-image";
import { Roll } from "@/components/layout/header";
import { QtyStepper } from "./qty-stepper";

export function RequestDrawer() {
  const list = useRequestList();
  const { open, setOpen } = list;
  const ref = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useDialog(ref, open, close);
  const value = list.items.reduce((n, i) => n + i.qty * i.priceMinor, 0);
  const teams = [...new Set(list.items.map((i) => TEAM_OF[i.brand]).filter(Boolean))];
  const backing = teams.flatMap((t) => foundersOf(t));

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-aubergine-2/50 backdrop-blur-sm transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Your gift list"
        className={cn(
          "absolute inset-y-2 right-2 flex w-[calc(100%-1rem)] max-w-md flex-col overflow-hidden rounded-[32px] bg-paper shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-[110%]",
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div>
            <p className="font-display text-4xl leading-none text-ink">Your gift list</p>
            <p className="mt-2 text-sm text-ink/55">
              {list.count
                ? `${list.count} product${list.count > 1 ? "s" : ""} · ${list.units.toLocaleString("en-IN")} units`
                : "Nothing in here yet"}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full bg-ink/5 hover:bg-ink/10"
          >
            <X className="size-5" />
          </button>
        </div>

        {backing.length > 0 && (
          <div className="mx-6 flex items-center gap-3 rounded-2xl bg-orchid-soft px-4 py-3">
            <FacePile photos={backing.map((p) => p.photo)} size={30} ring="ring-orchid-soft" />
            <span className="whitespace-nowrap text-sm font-semibold text-aubergine">
              <span className="hidden sm:inline">You&apos;re backing</span>
              <span className="sm:hidden">Backing</span> {backing.length} founders
            </span>
          </div>
        )}

        {list.count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <Doodle name="bag" className="size-24 text-aubergine" />
            <p className="font-display mt-6 text-3xl text-ink">Your list is feeling light.</p>
            <p className="mt-2 text-sm text-ink/60">Add a few things and we&apos;ll handle the rest. It&apos;s a list, not an order.</p>
            <Link
              href="/catalogue"
              onClick={close}
              className="group mt-7 rounded-full bg-aubergine px-6 py-3.5 text-sm font-semibold text-paper hover:bg-violet"
            >
              <Roll>Start shopping</Roll>
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-6 py-4" data-lenis-prevent>
              {list.items.map((i) => {
                const makers = foundersOf(TEAM_OF[i.brand] ?? "");
                return (
                  <li key={`${i.brand}:${i.sku}`} className="flex gap-3 rounded-[22px] bg-paper-2/70 p-3">
                    <Link
                      href={`/products/${i.listing}`}
                      onClick={close}
                      className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper-3"
                    >
                      {i.image && <FitImage src={i.image} alt="" sizes="80px" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{i.title}</p>
                          <p className="flex items-center gap-1.5 text-xs text-ink/55">
                            <span className="flex -space-x-1.5">
                              {makers.slice(0, 3).map((p) => (
                                <span
                                  key={p.photo}
                                  className="relative size-4 overflow-hidden rounded-full bg-orchid-soft ring-1 ring-paper"
                                >
                                  <Image src={p.photo} alt="" fill sizes="32px" className="object-cover object-top" />
                                </span>
                              ))}
                            </span>
                            {i.brandName}
                            {i.label !== i.title ? ` · ${i.label}` : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => list.remove(i.brand, i.sku)}
                          aria-label={`Remove ${i.title}`}
                          className="grid size-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <QtyStepper size="sm" value={i.qty} onChange={(n) => list.setQty(i.brand, i.sku, n)} />
                        <span className="text-xs text-ink/50">{formatINR(i.priceMinor)} each</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-ink/10 bg-paper px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink/60">Retail value</span>
                <span className="font-display text-3xl tabular-nums text-ink">{formatINR(value)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">Bulk pricing lands lower. Exact quote on the call.</p>
              <Link
                href="/request"
                onClick={close}
                className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-aubergine px-5 py-4 font-semibold text-paper transition-colors hover:bg-violet"
              >
                <Roll>Review & send</Roll> <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
