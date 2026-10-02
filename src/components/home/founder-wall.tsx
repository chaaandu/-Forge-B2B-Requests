"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { SplitReveal } from "@/components/motion/reveal";

export interface WallFace {
  name: string;
  photo: string;
  brand: string;
  brandSlug: string;
}

const TINTS = ["bg-orchid-soft", "bg-paper-2", "bg-mist-2", "bg-paper-3"];

/**
 * Every founder in the cohort, on one wall. Faces sit in black and white
 * until you reach for one — then that person comes into colour with their
 * name and company, and everyone else steps back.
 */
export function FounderWall({ faces }: { faces: WallFace[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!ref.current || reducedMotion()) return;
      // The inner wrapper, never the link: the link has a CSS opacity
      // transition for the hover-dim, and GSAP reading a property mid-transition
      // captures the wrong end value (the faces "animated" to invisible).
      gsap.from(ref.current.querySelectorAll("[data-face-in]"), {
        scale: 0.2,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: { each: 0.012, from: "random" },
        scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
      });
    },
    { scope: ref },
  );

  // One tint per team, so teammates read as a group on the wall.
  const tints = faces.reduce<number[]>(
    (out, f, i) => [...out, i === 0 ? 0 : f.brand === faces[i - 1].brand ? out[i - 1] : (out[i - 1] + 1) % TINTS.length],
    [],
  );

  return (
    <section id="founders" className="mx-auto max-w-[1500px] scroll-mt-16 px-5 py-24 sm:px-8">
      <div className="mb-14 grid items-end gap-6 md:grid-cols-[1.3fr_1fr]">
        <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
          Meet the <em className="text-royal">{faces.length}.</em>
        </SplitReveal>
        <p className="max-w-md text-lg leading-snug text-ink/65 md:justify-self-end">
          Every face here is a founder in Forge, Mesa&apos;s venture-building year. Reach for one to meet them; click to see what they make.
        </p>
      </div>

      <div ref={ref} className="group/wall grid grid-cols-6 gap-1.5 sm:grid-cols-9 sm:gap-2 lg:grid-cols-13">
        {faces.map((f, i) => {
          const tint = tints[i];
          return (
            <Link
              key={f.photo}
              href={`/brands/${f.brandSlug}`}
              data-face
              data-cursor="Meet"
              aria-label={`${f.name}, ${f.brand}`}
              className="group/face relative aspect-square transition-opacity duration-500 group-hover/wall:opacity-40 hover:!opacity-100"
            >
              <span data-face-in className="absolute inset-0 block">
                <span
                  className={`absolute inset-0 overflow-hidden rounded-full ${TINTS[tint]} transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/face:scale-[1.18] group-hover/face:z-10`}
                >
                  <Image
                    src={f.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 110px, (min-width: 640px) 11vw, 16vw"
                    className="object-cover object-top grayscale transition duration-500 group-hover/face:grayscale-0"
                  />
                </span>
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-center text-[11px] font-semibold text-paper opacity-0 shadow-xl transition duration-300 group-hover/face:opacity-100">
                  {f.name}
                  <span className="block text-[10px] font-normal text-orchid">{f.brand}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
