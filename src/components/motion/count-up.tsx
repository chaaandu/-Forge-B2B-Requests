"use client";

import { useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "./gsap";

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** A number that counts up, Indian-grouped (₹25,98,804), when it scrolls into view. */
export function CountUp({ value, prefix = "", className }: { value: number; prefix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const n = { v: 0 };
      gsap.to(n, {
        v: value,
        duration: 2.4,
        ease: "expo.out",
        onUpdate: () => (el.textContent = prefix + inr.format(n.v)),
        scrollTrigger: { trigger: el, start: "top 92%" },
      });
    },
    { scope: ref, dependencies: [value] },
  );
  return (
    <span ref={ref} className={className}>
      {prefix + inr.format(value)}
    </span>
  );
}
