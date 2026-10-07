"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import { cn } from "@/lib/cn";
import { reducedMotion } from "@/components/motion/gsap";
import { getLenis } from "@/components/motion/smooth-scroll";

/**
 * The hampers' dialog, built like the quick-add sheet: from the bottom on a
 * phone, a centred card on desktop, and it leaves the way it came before
 * telling its parent. Children get `close`, so adding can close it too.
 */
export function HamperSheet({
  label,
  onClose,
  wide,
  children,
}: {
  label: string;
  onClose: () => void;
  /** The builder needs the room; a hamper, photo over details, reads better narrow. */
  wide?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  const close = useCallback(() => {
    if (reducedMotion()) return onClose();
    setLeaving(true);
    setTimeout(onClose, 320);
  }, [onClose]);
  useDialog(ref, true, close);

  // The page behind holds still.
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        onClick={close}
        className={cn(
          "absolute inset-0 bg-aubergine/45 backdrop-blur-sm transition-opacity duration-300",
          leaving ? "opacity-0" : "motion-safe:animate-fade-in",
        )}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-paper shadow-2xl sm:rounded-3xl",
          wide ? "max-w-4xl" : "max-w-2xl",
          "transition-[translate,opacity,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          leaving ? "max-sm:translate-y-full sm:scale-95 sm:opacity-0" : "motion-safe:animate-sheet-up motion-safe:sm:animate-rise",
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid size-10 place-items-center rounded-full bg-white/90 shadow hover:bg-white"
        >
          <X className="size-5" />
        </button>
        {children(close)}
      </div>
    </div>
  );
}
