"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRequestList } from "@/lib/request-list";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/cn";
import { getLenis } from "@/components/motion/smooth-scroll";
import { GiftListFlow } from "./gift-list-flow";

/**
 * Where the gift list opens. On a phone it's a sheet that rises from the
 * bottom bar and goes back down the same way (drag the top of it down, or tap
 * outside); on anything wider it's a panel from the right. Every opening
 * starts fresh at the list.
 */
export function GiftListSheet() {
  const { open, setOpen } = useRequestList();
  const ref = useRef<HTMLElement>(null);
  const shade = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), [setOpen]);
  useDialog(ref, open, close);

  // A new flow per opening, mounted in the same render that opens the sheet,
  // so it's there for the focus trap. Nothing renders before the first open.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((s) => s + 1);
  }

  // The page behind holds still.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, [open]);

  // Drag-to-dismiss on phones: the handle and the header follow the finger
  // down; let go far enough (or flick) and it closes, otherwise it springs back.
  const drag = useRef<{ from: number; last: number; at: number; v: number; dy: number } | null>(null);
  const grab = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse" || !window.matchMedia("(max-width: 639px)").matches) return;
    const target = e.target as HTMLElement;
    if (!target.closest("[data-sheet-grab]") || target.closest("button, a, input")) return;
    drag.current = { from: e.clientY, last: e.clientY, at: e.timeStamp, v: 0, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.transition = "none";
    if (shade.current) shade.current.style.transition = "none";
  };
  const follow = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    d.dy = Math.max(0, e.clientY - d.from);
    d.v = (e.clientY - d.last) / Math.max(1, e.timeStamp - d.at);
    d.last = e.clientY;
    d.at = e.timeStamp;
    e.currentTarget.style.translate = `0 ${d.dy}px`;
    if (shade.current) shade.current.style.opacity = String(1 - d.dy / e.currentTarget.offsetHeight);
  };
  const release = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const el = e.currentTarget;
    el.style.transition = "";
    el.style.translate = "";
    if (shade.current) {
      shade.current.style.transition = "";
      shade.current.style.opacity = "";
    }
    if (d.dy > el.offsetHeight * 0.22 || (d.v > 0.45 && d.dy > 24)) close();
  };

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} inert={!open}>
      <div
        ref={shade}
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
        onPointerDown={grab}
        onPointerMove={follow}
        onPointerUp={release}
        onPointerCancel={release}
        className={cn(
          "absolute inset-x-0 bottom-0 flex h-[min(88dvh,820px)] flex-col overflow-hidden rounded-t-[28px] bg-paper shadow-[0_-20px_60px_-20px_rgb(29_16_51/0.45)]",
          "transition-[translate] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          "sm:inset-y-2 sm:left-auto sm:right-2 sm:h-auto sm:w-[calc(100%-1rem)] sm:max-w-md sm:rounded-[32px] sm:shadow-2xl sm:duration-700 sm:ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-[calc(100%+2rem)] sm:translate-x-[110%] sm:translate-y-0",
        )}
      >
        <div data-sheet-grab aria-hidden className="flex shrink-0 touch-none justify-center pt-2.5 sm:hidden">
          <span className="h-1.5 w-11 rounded-full bg-ink/15" />
        </div>
        {session > 0 && <GiftListFlow key={session} variant="sheet" onClose={close} />}
      </aside>
    </div>
  );
}
