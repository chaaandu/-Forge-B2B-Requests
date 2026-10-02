"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { finePointer, gsap, reducedMotion } from "./gsap";

/**
 * A soft orchid disc that trails the pointer and swells into a label over
 * anything marked `data-cursor="View"`. Mouse only; the system cursor stays,
 * so nothing ever depends on it.
 *
 * The element is always in the DOM (hidden until the first mouse move), so
 * the tweens set up below have something to hold on to.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = dot.current;
    if (!el || reducedMotion() || !finePointer()) return;
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    let first = true;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (first) {
        // Start where the pointer is, not sliding in from the corner.
        gsap.set(el, { x: e.clientX, y: e.clientY });
        first = false;
        setLive(true);
      }
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    const leave = () => setLive(false);
    const enter = () => !first && setLive(true);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <div ref={dot} aria-hidden className={cn("pointer-events-none fixed left-0 top-0 z-[70]", !live && "invisible")}>
      <div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-orchid text-[11px] font-bold uppercase tracking-[0.18em] text-aubergine transition-[width,height,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: label ? 96 : 12, height: label ? 96 : 12, opacity: label ? 0.95 : 0.7 }}
      >
        <span className={label ? "opacity-100 transition-opacity delay-150" : "opacity-0"}>{label}</span>
      </div>
    </div>
  );
}
