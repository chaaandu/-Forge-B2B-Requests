"use client";

import { useRef, type ReactNode } from "react";
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from "./gsap";

/**
 * A marquee that answers the scroll: it drifts on its own, speeds up with
 * how fast the page is moving, and turns round when you scroll back up. It
 * never leans: faces and names stay upright. The children are rendered
 * twice so the loop never shows a seam.
 */
export function VelocityMarquee({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || reducedMotion()) return;
      let x = 0;
      let dir = 1;
      let boost = 0;
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          dir = self.direction;
          boost = gsap.utils.clamp(0, 14, Math.abs(self.getVelocity()) / 300);
        },
      });
      const tick = (_t: number, dt: number) => {
        const half = el.scrollWidth / 2;
        x -= ((speed * (1 + boost)) / 1000) * dt * dir;
        boost *= 0.94;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        gsap.set(el, { x });
      };
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    },
    { scope: track },
  );

  return (
    <div className={className}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
