"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Draggable, finePointer, reducedMotion, useGSAP } from "./gsap";

/**
 * A horizontal rail you can throw with a mouse (drag with momentum) and
 * swipe natively on touch. Clicks still reach the links inside; a drag
 * doesn't count as one.
 */
export function DragRail({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !finePointer() || reducedMotion()) return;
      const [d] = Draggable.create(el, {
        type: "scrollLeft",
        inertia: true,
        allowContextMenu: true,
        dragClickables: true,
        minimumMovement: 6,
        cursor: "grab",
        activeCursor: "grabbing",
        onDragStart() {
          el.dataset.dragging = "1";
        },
        onDragEnd() {
          // Let the click that ends a drag die before links listen again.
          setTimeout(() => delete el.dataset.dragging, 0);
        },
      });
      const swallow = (e: MouseEvent) => {
        if (el.dataset.dragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      el.addEventListener("click", swallow, true);
      return () => {
        el.removeEventListener("click", swallow, true);
        d.kill();
      };
    },
    { scope: ref },
  );
  return (
    <div ref={ref} data-cursor="Drag" className={cn("no-scrollbar overflow-x-auto overscroll-x-contain", className)}>
      {children}
    </div>
  );
}
