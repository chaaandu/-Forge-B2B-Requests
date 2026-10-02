"use client";

import { withBase } from "@/lib/base-path";
import { gsap, reducedMotion } from "./gsap";

/**
 * The quick-commerce "it went in" moment: a thumbnail of what was added arcs
 * from the button that added it into the header's gift-list pill.
 */
export function flyToList(from: Element | null, image: string | null) {
  const target = document.getElementById("gift-list-button");
  if (!from || !target || reducedMotion()) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = 64;
  const dot = document.createElement("div");
  Object.assign(dot.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "999px",
    zIndex: "85",
    pointerEvents: "none",
    background: "#e4a7f3",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 12px 30px -8px rgb(42 24 73 / .5), 0 0 0 4px #f3ede3",
  });
  if (image) dot.style.backgroundImage = `url("${withBase(`/_next/image?url=${encodeURIComponent(image)}&w=128&q=75`)}")`;
  document.body.appendChild(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  gsap
    .timeline({ onComplete: () => dot.remove() })
    .from(dot, { scale: 0, duration: 0.25, ease: "back.out(3)" })
    .to(dot, {
      motionPath: {
        path: [
          { x: 0, y: 0 },
          { x: dx * 0.45, y: Math.min(dy, 0) - 180 },
          { x: dx, y: dy },
        ],
        curviness: 1.25,
      },
      scale: 0.3,
      rotate: 220,
      duration: 0.85,
      ease: "power2.inOut",
    })
    .to(dot, { opacity: 0, duration: 0.15 }, "-=0.1");
}
