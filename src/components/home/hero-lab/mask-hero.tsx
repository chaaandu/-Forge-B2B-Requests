"use client";

import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Roll } from "@/components/layout/header";
import { buildCollage } from "./collage";

/**
 * Idea 1 — "The words are made of them."
 *
 * The line is cut out of the paper, and the whole cohort drifts past behind
 * it: you read the sentence and you are looking straight at the people it
 * is about. Nothing else moves. The letters do the work.
 *
 * It is one picture panning behind one element, so it costs a single
 * composited layer no matter how many faces are in it.
 */
export function MaskHero({ photos, founders, brands }: { photos: string[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const [band, setBand] = useState<string | null>(null);

  // Draw the cohort once, hand the letters the picture.
  useEffect(() => {
    let url: string | null = null;
    let live = true;
    buildCollage(photos, { width: 1860, height: 930, columns: 6, rows: 3, ground: "#241544" }).then((canvas) => {
      if (!canvas || !live) return;
      canvas.toBlob((blob) => {
        if (!blob || !live) return;
        url = URL.createObjectURL(blob);
        setBand(url);
      });
    });
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [photos]);

  useGSAP(
    () => {
      const el = root.current!;
      if (reducedMotion()) return;
      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(el.querySelectorAll("[data-line]"), { yPercent: 108, duration: 1.4, stagger: 0.1 })
          .from(el.querySelectorAll("[data-foot] > *"), { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.5);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();
    },
    { scope: root },
  );

  // The cohort walks slowly past behind the letters, for ever.
  useGSAP(
    () => {
      const el = root.current!;
      const type = el.querySelector<HTMLElement>("[data-type]")!;
      if (!band || reducedMotion()) return;
      const drift = gsap.to(type, { backgroundPositionX: "-930px", duration: 32, ease: "none", repeat: -1 });

      // The letters hold a little parallax, so the surface feels like glass.
      const shift = { y: 0 };
      const onMove = (e: PointerEvent) =>
        gsap.to(shift, {
          y: (e.clientY / window.innerHeight - 0.5) * -60,
          duration: 1.4,
          ease: "power3",
          overwrite: true,
          onUpdate: () => void (type.style.backgroundPositionY = `calc(50% + ${shift.y}px)`),
        });
      window.addEventListener("pointermove", onMove);
      return () => {
        drift.kill();
        window.removeEventListener("pointermove", onMove);
      };
    },
    { scope: root, dependencies: [band] },
  );

  return (
    <section ref={root} className="relative isolate hidden min-h-[calc(100svh-4rem)] overflow-hidden md:block">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1500px] flex-col justify-between px-8 pb-10 pt-4">
        <div className="flex flex-1 items-center">
          <h1
            data-type
            className="font-display w-full text-center text-[clamp(3.6rem,10.6vw,11.4rem)] font-bold leading-[0.88] tracking-[-0.015em] text-ink"
            style={
              band
                ? {
                    backgroundImage: `url(${band})`,
                    backgroundSize: "930px auto",
                    backgroundPosition: "0px center",
                    backgroundRepeat: "repeat",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }
                : undefined
            }
          >
            <span className="block overflow-hidden">
              <span data-line className="block">
                Every gift here
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block">
                is someone’s
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block">
                first company.
              </span>
            </span>
          </h1>
        </div>

        <div data-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-ink/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands. Every face in those letters.
          </p>
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group inline-flex items-center gap-3 justify-self-center rounded-full bg-aubergine px-8 py-5 text-base font-semibold text-paper transition-colors hover:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <a
            href="#founders"
            onClick={(e) => {
              const lenis = getLenis();
              if (!lenis) return;
              e.preventDefault();
              lenis.scrollTo("#founders", { offset: -40, duration: 1.6 });
            }}
            className="group inline-flex items-center gap-2 justify-self-center text-sm font-semibold text-ink/70 hover:text-ink md:justify-self-end"
          >
            <Roll>Meet the founders</Roll>
            <span className="grid size-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              <ArrowDown className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
