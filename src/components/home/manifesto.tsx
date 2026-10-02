"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";

/**
 * The argument, read at the pace you scroll: each word fills from faint to
 * full ink as it passes, and real faces and real products sit inside the
 * sentence, so the claim is shown, not just made.
 */
type Piece = string | { img: string; alt: string; round?: boolean };

export function Manifesto({ faces, products }: { faces: string[]; products: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const text: Piece[] = [
    "Most corporate gifts are bought in bulk, opened on a Friday and forgotten by Monday.",
    "Nobody you'll ever meet made them.",
    "Everything here was made by a student",
    { img: faces[0], alt: "", round: true },
    "who bet their savings, their weekends and their mom's patience on a first company.",
    { img: products[0], alt: "" },
    "So when your team unwraps one, that order is",
    { img: faces[1], alt: "", round: true },
    "their proof that it works.",
  ];

  useGSAP(
    () => {
      if (!ref.current || reducedMotion()) return;
      const words = ref.current.querySelectorAll("[data-w]");
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        },
      );
      gsap.from(ref.current.querySelectorAll("[data-inline]"), {
        scale: 0,
        rotate: -25,
        ease: "back.out(2)",
        stagger: 0.1,
        scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 50%", scrub: 0.6 },
      });
    },
    { scope: ref },
  );

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-32 sm:px-8 md:py-44">
      <div ref={ref} className="font-display-straight text-[clamp(2rem,4.6vw,4.6rem)] leading-[1.08] text-ink">
        {text.map((piece, i) =>
          typeof piece === "string" ? (
            <Fragment key={i}>
              {piece.split(" ").map((w, j) => (
                <span key={j} data-w className="inline">
                  {w}{" "}
                </span>
              ))}
            </Fragment>
          ) : (
            piece.img && (
              <span
                key={i}
                data-inline
                className={`relative mx-1 inline-block h-[0.82em] translate-y-[0.1em] overflow-hidden align-baseline ${piece.round ? "aspect-square rounded-full bg-orchid-soft" : "aspect-[1.6] rounded-full bg-paper-2"}`}
              >
                <Image
                  src={piece.img}
                  alt={piece.alt}
                  fill
                  sizes="140px"
                  className={piece.round ? "object-cover object-top" : "object-cover"}
                />
              </span>
            )
          ),
        )}
      </div>
    </section>
  );
}
