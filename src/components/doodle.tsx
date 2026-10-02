"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { DoodleArtwork, type DoodleName } from "./doodles";
import { gsap, reducedMotion, useGSAP } from "./motion/gsap";

/**
 * A drawing from the site's set (doodles.tsx), alive: the ink draws itself
 * in the first time it scrolls into view and the colour lands a beat later,
 * like a second print pass. Hovering it, or the nearest `.group` with
 * `hover="group"`, redraws the ink and knocks the colour layer off register.
 *
 * Ink is `currentColor`; set a text colour to flip it on a dark ground.
 */
export function Doodle({
  name,
  className,
  hover = "self",
  delay = 0,
  draw = true,
  label,
}: {
  name: DoodleName;
  className?: string;
  /** What hovering redraws it: itself, its nearest `.group`, or nothing. */
  hover?: "self" | "group" | "none";
  delay?: number;
  /** Draw itself in on first view. Off where something else animates its entrance. */
  draw?: boolean;
  /** Most drawings are decoration; give one a label when it carries meaning. */
  label?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      if (!svg) return;
      svg.classList.remove("js-reveal");
      if (reducedMotion()) return;
      const ink = svg.querySelectorAll<SVGGeometryElement>("[data-dink] > *");
      const fill = svg.querySelector("[data-dfill]");
      const dots = svg.querySelectorAll("[data-ddots] > *");

      if (draw)
        gsap
          .timeline({ delay, scrollTrigger: { trigger: svg, start: "top 92%" } })
          .fromTo(ink, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, stagger: 0.07, ease: "power2.inOut" })
          .from(fill, { opacity: 0, scale: 0.7, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(2)" }, 0.35)
          .from(dots, { scale: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.04, ease: "back.out(3)" }, 0.55);

      if (hover === "none") return;
      const target = hover === "group" ? (svg.closest(".group") ?? svg) : svg;
      let busy = false;
      const play = () => {
        if (busy) return;
        busy = true;
        gsap
          .timeline({ onComplete: () => void (busy = false) })
          .fromTo(ink, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, stagger: 0.04, ease: "power2.out" })
          .to(fill, { x: -3, y: 4, duration: 0.18, ease: "power2.out" }, 0)
          .to(fill, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" }, 0.18)
          .fromTo(svg, { rotate: 0 }, { rotate: -6, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0);
      };
      target.addEventListener("pointerenter", play);
      return () => target.removeEventListener("pointerenter", play);
    },
    { scope: ref },
  );

  return (
    <svg
      ref={ref}
      viewBox="0 0 96 96"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("js-reveal overflow-visible", className)}
    >
      <DoodleArtwork name={name} />
    </svg>
  );
}
