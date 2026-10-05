"use client";

import Image from "next/image";
import { Fragment, useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { withBase } from "@/lib/base-path";

/**
 * The argument, read at the pace you scroll: each word fills from faint to
 * full ink as it passes.
 *
 * Above it, four photographs of the cohort actually selling — a flea
 * market, a stall under a tent, a table of their own packets. They are
 * pinned up the way the rest of the site pins things: rounded, tilted a
 * degree or two, lifted a little. The words make the claim; the pictures
 * are the evidence, so they come first.
 */

const STALLS = [
  { src: "/stalls/stall-1.webp", tilt: -2.2, lift: "sm:mt-8" },
  { src: "/stalls/stall-2.webp", tilt: 1.6, lift: "" },
  { src: "/stalls/stall-3.webp", tilt: -1.3, lift: "sm:mt-12" },
  { src: "/stalls/stall-4.webp", tilt: 2.4, lift: "sm:mt-3" },
  { src: "/stalls/stall-5.webp", tilt: -1.8, lift: "sm:mt-10" },
  { src: "/stalls/stall-6.webp", tilt: 1.2, lift: "sm:mt-1" },
];

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  // Problem, people, payoff: a faceless gift, the student who made this one,
  // and what one order gives each side.
  const text = [
    "Most corporate gifts are made by nobody in particular.",
    "Opened on a Friday, forgotten by Monday.",
    "Everything here was made by a student who bet their savings, their weekends and their mom’s patience on a first company.",
    "Your team gets a gift with a story.",
    "A founder gets",
    // Kept together, so the last line is never one word.
    "proof it works.",
  ];

  useGSAP(
    () => {
      if (!ref.current || reducedMotion()) return;
      gsap.fromTo(
        ref.current.querySelectorAll("[data-w]"),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: ref.current, start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        },
      );
    },
    { scope: ref },
  );

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-8 md:py-36">
      <Stalls />
      <div
        ref={ref}
        className="font-display-straight mt-14 max-w-[46ch] text-pretty text-[clamp(1.3rem,3vw,3rem)] leading-[1.14] text-ink sm:mt-20"
      >
        {text.map((line, i) => (
          <Fragment key={i}>
            {line.split(" ").map((w, j) => (
              <span key={j} data-w className="inline">
                {w}{" "}
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  );
}

/** The evidence: four stalls, pinned up. */
function Stalls() {
  const row = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!row.current || reducedMotion()) return;
      gsap.from(row.current.querySelectorAll("[data-stall]"), {
        y: 44,
        opacity: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: row.current, start: "top 85%" },
      });
    },
    { scope: row },
  );

  return (
    <div ref={row}>
      <p className="mb-5 text-sm text-ink/45">Selling it themselves, all year.</p>
      {/* A contact sheet of a year of markets: three across on a tablet, all
          six on a laptop, and on a phone they run off the edge and you swipe. */}
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6">
        {STALLS.map((s) => (
          <div
            key={s.src}
            data-stall
            className={`relative aspect-[3/4] w-[62vw] shrink-0 overflow-hidden rounded-[22px] bg-paper-2 shadow-[0_18px_40px_-24px_rgb(42_24_73/0.45)] sm:w-auto sm:rounded-[28px] ${s.lift}`}
            style={{ transform: `rotate(${s.tilt}deg)` }}
          >
            <Image
              src={withBase(s.src)}
              alt=""
              fill
              sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 62vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
