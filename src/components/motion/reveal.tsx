"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, reducedMotion, SplitText, useGSAP } from "./gsap";
import { cn } from "@/lib/cn";

/**
 * Lines rise out of their own masks as they come into view — the reveal
 * every editorial site uses, done once and reused. `immediate` plays on load
 * (for heroes) instead of on scroll.
 */
export function SplitReveal({
  as: Tag = "h2",
  children,
  className,
  immediate,
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  immediate?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line", autoSplit: true });
      gsap.set(el, { visibility: "visible" });
      return gsap.from(split.lines, {
        // Past the padded mask (see .line-mask), so the line starts fully hidden.
        yPercent: 150,
        rotate: 2,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.09,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={cn("[visibility:hidden] motion-reduce:[visibility:visible]", className)}>
      {children}
    </Tag>
  );
}

/** Children drift up and in as they enter, one after another. */
export function Stagger({ children, className, selector = ":scope > *" }: { children: ReactNode; className?: string; selector?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current || reducedMotion()) return;
      const items = ref.current.querySelectorAll(selector);
      gsap.from(items, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "expo.out",
        stagger: 0.07,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
