"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, reducedMotion, ScrollTrigger } from "./gsap";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Weighted, inertial scrolling (Lenis) driving GSAP's ScrollTrigger from one
 * clock, so pinned and scrubbed sections move with the page instead of a
 * frame behind it. Off for reduced motion and for touch, where the native
 * scroll is already the right feel.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // A new page starts at the top, and its triggers measure the new layout.
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
