"use client";

import { useRef } from "react";
import { finePointer, gsap, reducedMotion, ScrollTrigger, useGSAP } from "@/components/motion/gsap";

/**
 * Fraunces is a variable font; this spends that. Each letter's weight and
 * softness follow the pointer: heavy and sharp close by, light and soft far
 * away. On touch screens a slow wave runs through the word instead.
 */
export function KineticWord({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reducedMotion()) return;
      const letters = gsap.utils.toArray<HTMLElement>("span", el);
      if (!finePointer()) {
        // A slow wave, and only while the word is on screen.
        const wave = gsap.to(letters, {
          "--w": 900,
          "--s": 0,
          duration: 0.8,
          ease: "sine.inOut",
          stagger: { each: 0.08, yoyo: true, repeat: -1 },
          paused: true,
        });
        const st = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => void (self.isActive ? wave.play() : wave.pause()),
        });
        return () => {
          st.kill();
          wave.kill();
        };
      }
      let frame = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          for (const l of letters) {
            const r = l.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
            const t = gsap.utils.clamp(0, 1, 1 - d / 420);
            gsap.to(l, { "--w": 220 + t * 680, "--s": 100 - t * 100, duration: 0.5, ease: "power3.out", overwrite: "auto" });
          }
        });
      };
      window.addEventListener("pointermove", move);
      return () => {
        window.removeEventListener("pointermove", move);
        cancelAnimationFrame(frame);
      };
    },
    { scope: ref },
  );

  return (
    <p ref={ref} aria-label={text} className={`kinetic font-display select-none whitespace-nowrap ${className ?? ""}`}>
      {[...text].map((ch, i) => (
        <span key={i} aria-hidden style={{ ["--w" as string]: 300 }}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </p>
  );
}
