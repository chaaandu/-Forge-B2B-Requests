"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { Icon3D } from "@/components/icon3d";

export interface JourneyData {
  products: string[];
  team: { name: string; photo: string }[];
  teamBrand: string;
  teamEarned: number;
}

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/**
 * Five chapters, read sideways: the section pins and the story slides past as
 * you scroll down. Phones and reduced-motion get the same five chapters
 * stacked, because a pinned sideways scroll on a phone fights the thumb.
 */
export function Journey({ data }: { data: JourneyData }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const t = track.current!;
        const distance = () => t.scrollWidth - window.innerWidth;
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, pin: true, scrub: 1, end: () => `+=${distance()}`, invalidateOnRefresh: true },
        });
        // Each chapter's art drifts against the scroll, for depth.
        gsap.utils.toArray<HTMLElement>("[data-art]").forEach((el) =>
          gsap.fromTo(
            el,
            { xPercent: 18 },
            {
              xPercent: -18,
              ease: "none",
              scrollTrigger: { trigger: el, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
            },
          ),
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const chapters = [
    {
      n: "01",
      title: "You shortlist.",
      body: "Pick hampers, snacks, candles or tees with rough quantities. Share the list with whoever signs off. No account, no card.",
      art: (
        <div className="relative h-full w-full">
          {data.products.slice(0, 3).map((src, i) => (
            <div
              key={src}
              className="absolute aspect-[4/5] w-[46%] overflow-hidden rounded-[28px] bg-paper-2 shadow-2xl"
              style={{ left: `${8 + i * 22}%`, top: `${12 + (i % 2) * 14}%`, transform: `rotate(${[-7, 4, -2][i]}deg)` }}
            >
              <Image src={src} alt="" fill sizes="300px" className="object-cover" />
            </div>
          ))}
        </div>
      ),
    },
    {
      n: "02",
      title: "We call you within a day.",
      body: "A person from Mesa, not a bot — with bulk pricing, samples and timelines for exactly what you picked.",
      art: (
        <div className="grid h-full place-items-center">
          <Icon3D name="telephone-receiver" size={256} className="size-[min(28vw,320px)] -rotate-12" />
        </div>
      ),
    },
    {
      n: "03",
      title: `${data.team.map((t) => t.name.split(" ")[0]).join(", ")} get to work.`,
      body: `The founders of ${data.teamBrand} — and every team on your list — make it, pack it and send it. You deal with us; they do what they do best.`,
      art: (
        <div className="flex h-full items-end justify-center">
          {data.team.map((p, i) => (
            <div key={p.photo} className="relative -mx-6 aspect-[450/440] w-[38%]" style={{ zIndex: i === 1 ? 2 : 1 }}>
              <Image src={p.photo} alt={p.name} fill sizes="320px" className="object-contain object-bottom drop-shadow-2xl" />
            </div>
          ))}
        </div>
      ),
    },
    {
      n: "04",
      title: "It lands on their books.",
      body: "Your order is their revenue — the kind that shows on the Forge leaderboard the whole cohort watches. For a first company, one corporate order is proof.",
      art: (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="font-display text-[clamp(3rem,7vw,7rem)] leading-none text-royal">{inr(data.teamEarned)}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-ink/50">{data.teamBrand}, sold so far</p>
        </div>
      ),
    },
    {
      n: "05",
      title: "Your team unwraps something someone was proud to make.",
      body: "Not a SKU from a warehouse. A thing with a founder behind it — and a story your people will actually repeat.",
      art: (
        <div className="grid h-full place-items-center">
          <Icon3D name="wrapped-gift" size={256} className="size-[min(28vw,320px)] rotate-6" />
        </div>
      ),
    },
  ];

  return (
    <section ref={root} id="how" className="relative scroll-mt-16 overflow-hidden bg-paper-2">
      <div className="mx-auto max-w-[1500px] px-5 pt-24 sm:px-8 min-[900px]:absolute min-[900px]:inset-x-0 min-[900px]:top-0 min-[900px]:z-10 min-[900px]:pt-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">How a gift becomes a company</p>
      </div>
      <div
        ref={track}
        className="flex flex-col gap-20 px-5 py-16 sm:px-8 min-[900px]:h-[100svh] min-[900px]:w-max min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-0 min-[900px]:px-0 min-[900px]:py-0"
      >
        {chapters.map((c) => (
          <article
            key={c.n}
            className="grid gap-8 min-[900px]:h-[78svh] min-[900px]:w-[88vw] min-[900px]:grid-cols-[0.9fr_1.1fr] min-[900px]:items-center min-[900px]:px-[6vw] lg:w-[78vw]"
          >
            <div>
              <p className="font-display text-[clamp(5rem,12vw,12rem)] leading-none text-orchid">{c.n}</p>
              <h3 className="font-display mt-2 max-w-[13ch] text-[clamp(2.2rem,4.4vw,4.4rem)] leading-[0.95] text-ink">{c.title}</h3>
              <p className="mt-6 max-w-md text-lg leading-snug text-ink/65">{c.body}</p>
            </div>
            <div data-art className="relative h-[52svh] min-[900px]:h-full">
              {c.art}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
