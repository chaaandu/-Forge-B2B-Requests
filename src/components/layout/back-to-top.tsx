"use client";

import { ArrowUp } from "lucide-react";
import { getLenis } from "@/components/motion/smooth-scroll";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 2 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="group inline-flex items-center gap-2 text-xs font-semibold text-paper/60 hover:text-paper"
    >
      Back to top
      <span className="grid size-8 place-items-center rounded-full border border-paper/20 transition group-hover:-translate-y-1 group-hover:border-paper">
        <ArrowUp className="size-3.5" />
      </span>
    </button>
  );
}
