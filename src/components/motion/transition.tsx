"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { BASE_PATH, withBase } from "@/lib/base-path";
import { gsap, reducedMotion } from "./gsap";

type Go = (href: string) => void;
const Ctx = createContext<Go | null>(null);

/** Where a link is going, in a word or two — what the curtain says while it's down. */
function labelFor(href: string): string {
  const path = href.split("?")[0];
  if (path === "/") return "Home";
  if (path.startsWith("/catalogue")) return "The store";
  if (path === "/brands") return "The founders";
  if (path.startsWith("/brands/")) return "Meet the squad";
  if (path.startsWith("/products/")) return "Unboxing";
  if (path.startsWith("/request")) return "Your gift list";
  return "One sec";
}

const normalise = (u: URL) => `${u.pathname.replace(/\/$/, "") || "/"}${u.search}`;

/**
 * Page-to-page curtain: an aubergine panel sweeps up with the destination's
 * name, the route changes behind it, and the panel lifts once the new URL is
 * committed. Plain navigation for reduced motion.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const busy = useRef(false);

  const go = useCallback<Go>(
    (href) => {
      if (busy.current) return;
      const target = normalise(new URL(href === "/" ? BASE_PATH : withBase(href), window.location.href));
      if (target === normalise(new URL(window.location.href))) return;
      if (reducedMotion() || !panel.current) {
        router.push(href);
        return;
      }
      busy.current = true;
      text.current!.textContent = labelFor(href);
      const el = panel.current;

      const done = () => {
        busy.current = false;
        gsap.set(el, { display: "none" });
      };
      const lift = () =>
        gsap
          .timeline({ onComplete: done })
          .to(text.current, { yPercent: -120, opacity: 0, duration: 0.35, ease: "power3.in" })
          .to(el, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, 0.05);

      gsap
        .timeline()
        .set(el, { display: "grid", yPercent: 100 })
        .set(text.current, { yPercent: 120, opacity: 1 })
        .to(el, { yPercent: 0, duration: 0.55, ease: "expo.inOut" })
        .to(text.current, { yPercent: 0, duration: 0.5, ease: "expo.out" }, "-=0.2")
        .add(() => {
          router.push(href);
          const started = performance.now();
          // The App Router commits the URL when the new page is ready; lift then.
          const wait = () => {
            if (normalise(new URL(window.location.href)) === target || performance.now() - started > 6000) {
              requestAnimationFrame(() => requestAnimationFrame(lift));
            } else requestAnimationFrame(wait);
          };
          wait();
        });
    },
    [router],
  );

  return (
    <Ctx.Provider value={go}>
      {children}
      <div
        ref={panel}
        aria-hidden
        className="fixed inset-0 z-[80] hidden place-items-center bg-aubergine-2 text-paper"
        style={{ borderRadius: "0 0 0 0" }}
      >
        <div className="overflow-hidden px-8 py-4">
          <p ref={text} className="font-display text-[clamp(3rem,9vw,8rem)] italic leading-none text-orchid" />
        </div>
      </div>
    </Ctx.Provider>
  );
}

export const useTransitionNav = () => useContext(Ctx);
