"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "./gsap";

/**
 * A soft orchid disc that trails the pointer and swells into a label over
 * anything marked `data-cursor="View"`. Mouse only; the system cursor stays,
 * so nothing ever depends on it.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    if (reducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- enable once we know there is a mouse
    setOn(true);
    const el = dot.current!;
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => {
      setMoved(true);
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  if (!on) return null;
  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70] -translate-x-1/2 -translate-y-1/2">
      <div
        className="grid place-items-center rounded-full bg-orchid text-[11px] font-bold uppercase tracking-[0.18em] text-aubergine transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          width: label ? 96 : 12,
          height: label ? 96 : 12,
          opacity: !moved ? 0 : label ? 0.95 : 0.8,
          mixBlendMode: label ? "normal" : "multiply",
        }}
      >
        <span className={label ? "opacity-100 transition-opacity delay-150" : "opacity-0"}>{label}</span>
      </div>
    </div>
  );
}
