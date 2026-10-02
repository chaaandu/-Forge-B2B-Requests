"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, reducedMotion, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { Doodle } from "@/components/doodle";
import { DoodleArtwork } from "@/components/doodles";
import { FacePile } from "@/components/face-pile";

export interface JourneyData {
  list: { title: string; brand: string; image: string; qty: number; priceMinor: number }[];
  /** Portraits of the founders behind the example list. */
  backing: string[];
  /** Portraits from across the cohort, for the scenes that are about everyone. */
  cohort: string[];
  cohortCount: number;
  /** Where the example order's money lands: each team on the list, with its founders. */
  payout: { brand: string; photos: string[]; amount: number }[];
}

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

const CHAPTERS = [
  { label: "List", title: "Make a list.", body: "Hampers, snacks, candles, tees. Add rough quantities. No login, no card, no drama." },
  {
    label: "Call",
    title: "We call you. Within a working\u00a0day.",
    body: "A real human from Mesa, with bulk prices, samples and dates. Not a bot. Pinky promise.",
  },
  {
    label: "Pack",
    title: "Packed by founders. Logo optional.",
    body: "The people who made it pack it. Want your brand on it? Sleeves, cards, ribbons. Just ask.",
  },
  {
    label: "Impact",
    title: "It becomes their revenue.",
    body: "Real money for the founders on your list. For a company this young, one bulk order can be its best week yet.",
  },
  {
    label: "Unwrap",
    title: "Your team unwraps a story.",
    body: "Not a SKU from a warehouse. Something a founder was proud to make, and your team will actually talk about.",
  },
];

// ── The path: four mirrored waves of identical length, so the five stations
//    sit at exactly 0, 25, 50, 75 and 100% of the way along it. ──
const XS = [60, 280, 500, 720, 940];
const Y = 70;
const PATH = XS.slice(0, -1)
  .map((x, i) => {
    const nx = XS[i + 1];
    const dy = i % 2 ? 46 : -46;
    return `${i === 0 ? `M${x} ${Y} ` : ""}C${x + 75} ${Y + dy} ${nx - 75} ${Y + dy} ${nx} ${Y}`;
  })
  .join(" ");

/* ─────────────────────────────── scenes ─────────────────────────────── */

function SceneList({ d }: { d: JourneyData }) {
  return (
    <div className="mx-auto w-full max-w-[460px] rounded-[30px] bg-paper p-5 shadow-[0_40px_80px_-30px_rgb(42_24_73/0.45)] sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-3xl text-ink">Gift list</p>
        <span className="text-xs text-ink/45">Your team, Diwali</span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {d.list.map((item) => (
          <li key={item.title} data-row className="flex items-center gap-3 rounded-2xl bg-paper-2/70 p-2 pr-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-paper-3">
              <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
              <span className="block text-xs text-ink/50">{item.brand}</span>
            </span>
            <span data-qty className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-xs font-bold tabular-nums text-paper">
              ×{item.qty}
            </span>
            <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden>
              <circle cx="12" cy="12" r="11" fill="#f3d9fa" />
              <path
                data-tick
                d="M7 12.5 L10.5 16 L17 8.5"
                fill="none"
                stroke="#452a74"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </li>
        ))}
      </ul>
      <div data-backing className="mt-4 flex items-center gap-3 border-t border-ink/10 pt-4">
        <FacePile photos={d.backing} size={30} />
        <span className="whitespace-nowrap text-sm font-semibold text-ink">Backing {d.backing.length} founders</span>
      </div>
    </div>
  );
}

const STAMP_R = 46;
const STAMP_LEN = 2 * Math.PI * STAMP_R;

function SceneCall() {
  return (
    <div className="relative mx-auto grid w-full max-w-[520px] grid-cols-[0.75fr_1.25fr] items-center gap-5">
      <div data-phone className="text-aubergine">
        <Doodle name="phone" hover="none" draw={false} className="w-full -rotate-6" />
      </div>
      <div className="flex flex-col gap-3">
        <p
          data-bubble
          className="w-fit max-w-full rounded-3xl rounded-bl-md bg-paper px-5 py-3.5 text-[15px] font-medium leading-snug text-ink shadow-xl"
        >
          Hi! Need 150 hampers by the 20th. Doable?
        </p>
        <p
          data-bubble
          className="ml-auto w-fit max-w-full rounded-3xl rounded-br-md bg-royal px-5 py-3.5 text-[15px] font-medium leading-snug text-paper shadow-xl"
        >
          Totally. Bulk price and samples, coming right up.
        </p>
        <div data-stamp className="relative grid size-24 shrink-0 place-items-center self-end sm:size-28">
          <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow" aria-hidden>
            <defs>
              <path
                id="stamp-ring"
                d={`M60 60 m-${STAMP_R} 0 a${STAMP_R} ${STAMP_R} 0 1 1 ${STAMP_R * 2} 0 a${STAMP_R} ${STAMP_R} 0 1 1 -${STAMP_R * 2} 0`}
              />
            </defs>
            <circle cx="60" cy="60" r="58" fill="#e4a7f3" />
            <text fill="#2a1849" fontSize="10.5" fontWeight="700">
              {/* Exactly one lap: textLength spreads the words over the whole ring, so it never runs into itself. */}
              <textPath href="#stamp-ring" textLength={STAMP_LEN} lengthAdjust="spacing">
                WITHIN ONE WORKING DAY ✦ WITHIN ONE WORKING DAY ✦
              </textPath>
            </text>
          </svg>
          <span className="font-display relative text-[1.7rem] text-aubergine sm:text-3xl">24h</span>
        </div>
      </div>
    </div>
  );
}

function ScenePack({ d }: { d: JourneyData }) {
  return (
    <div className="relative mx-auto flex w-full max-w-[480px] flex-col items-center">
      <div className="relative w-[64%] text-aubergine">
        <div data-box>
          <Doodle name="gift" hover="none" draw={false} className="w-full" />
        </div>
        <span
          data-sticker
          className="font-display absolute left-[18%] top-[56%] -rotate-[8deg] rounded-xl border-2 border-dashed border-aubergine bg-paper px-3 py-1.5 text-lg leading-none text-aubergine shadow-lg sm:text-xl"
        >
          your logo
        </span>
      </div>
      <div data-packers className="mt-6 flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 shadow-xl">
        <FacePile photos={d.cohort} max={3} size={30} total={d.cohortCount} />
        <span className="whitespace-nowrap text-sm font-semibold text-ink">Packed by its makers</span>
      </div>
    </div>
  );
}

/** The moment it lands: one "new order" ping per team on the list, like the ones on their phones. */
function SceneImpact({ d }: { d: JourneyData }) {
  const total = d.payout.reduce((n, p) => n + p.amount, 0);
  return (
    <div className="@container mx-auto w-full max-w-[460px] rounded-[30px] bg-ink p-4 text-paper shadow-[0_40px_80px_-30px_rgb(42_24_73/0.6)]">
      <p className="px-1 pb-2.5 text-xs font-semibold text-paper/50">Meanwhile, on their phones</p>
      <ul className="space-y-1.5">
        {d.payout.map((p) => (
          <li key={p.brand} data-ping className="flex items-center gap-3 rounded-[18px] bg-paper/95 p-2.5 pr-3 text-ink shadow-lg">
            <FacePile photos={p.photos} max={3} total={Math.min(p.photos.length, 3)} size={30} ring="ring-paper" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold">{p.brand}</span>
                <span className="shrink-0 text-[11px] text-ink/40">now</span>
              </span>
              <span className="block truncate text-xs text-ink/55">
                <span data-amount className="inline-block font-bold tabular-nums text-royal">
                  +{inr(p.amount)}
                </span>{" "}
                · bulk order
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p
        data-total
        className="mt-2.5 flex flex-col gap-1 rounded-[18px] bg-orchid px-4 py-3 text-aubergine @[360px]:flex-row @[360px]:items-center @[360px]:justify-between"
      >
        <span className="text-sm font-semibold">Straight to founders</span>
        <span className="font-display text-2xl leading-none tabular-nums">{inr(total)}</span>
      </p>
    </div>
  );
}

function SceneUnwrap({ d }: { d: JourneyData }) {
  const bits = Array.from({ length: 26 }, (_, i) => i);
  const colours = ["#e4a7f3", "#7c4dcc", "#f3b14e", "#452a74", "#f3ede3"];
  return (
    <div className="relative mx-auto flex w-full max-w-[480px] flex-col items-center">
      {bits.map((i) => (
        <span
          key={i}
          data-confetti
          aria-hidden
          className="absolute left-1/2 top-[38%] block opacity-0"
          style={{ width: i % 3 ? 9 : 13, height: i % 3 ? 15 : 13, borderRadius: i % 3 ? 3 : 999, background: colours[i % colours.length] }}
        />
      ))}
      <div data-gift className="relative w-[52%] text-aubergine">
        <Doodle name="gift" hover="none" draw={false} className="w-full" />
      </div>
      <div data-tag className="mt-6 flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 shadow-xl">
        <FacePile photos={d.cohort} max={3} size={30} total={d.cohortCount} />
        <span className="whitespace-nowrap text-sm font-semibold text-ink">Made by founders at Mesa</span>
      </div>
    </div>
  );
}

/* ─────────────────── scene animations (shared by both layouts) ─────────────────── */

function sceneTimeline(n: number, root: Element): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  if (n === 0) {
    tl.from(q("[data-row]"), { x: 40, opacity: 0, stagger: 0.12, duration: 0.4 })
      .fromTo(q("[data-tick]"), { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.12, duration: 0.3 }, 0.25)
      .from(q("[data-qty]"), { scale: 0, stagger: 0.12, duration: 0.3, ease: "back.out(3)" }, 0.2)
      .from(q("[data-backing]"), { y: 20, opacity: 0, duration: 0.35 }, 0.7);
  } else if (n === 1) {
    tl.from(q("[data-phone]"), { y: 50, opacity: 0, rotate: -20, duration: 0.4 })
      .to(q("[data-phone] > svg"), { rotate: 4, duration: 0.06, yoyo: true, repeat: 7, ease: "none" }, 0.35)
      .from(
        q("[data-bubble]"),
        { scale: 0.6, opacity: 0, y: 20, transformOrigin: "left bottom", stagger: 0.25, duration: 0.35, ease: "back.out(2)" },
        0.45,
      )
      .from(q("[data-stamp]"), { scale: 2.2, opacity: 0, rotate: -40, duration: 0.35, ease: "back.out(1.6)" }, 0.95);
  } else if (n === 2) {
    tl.from(q("[data-box]"), { y: 60, opacity: 0, rotate: 8, duration: 0.45, ease: "back.out(1.6)" })
      .from(q("[data-sticker]"), { scale: 2.4, opacity: 0, rotate: -40, y: -60, duration: 0.4, ease: "back.out(1.4)" }, 0.45)
      .to(q("[data-box]"), { y: 6, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.inOut" }, 0.8)
      .from(q("[data-packers]"), { y: 30, opacity: 0, duration: 0.35 }, 0.85);
  } else if (n === 3) {
    // Each ping drops in from the top like a notification, then its amount lands.
    tl.from(q("[data-ping]"), { y: -36, scale: 0.92, opacity: 0, stagger: 0.18, duration: 0.4, ease: "back.out(1.8)" })
      .from(q("[data-amount]"), { scale: 0.4, opacity: 0, stagger: 0.18, duration: 0.3, ease: "back.out(3)" }, 0.2)
      .from(q("[data-total]"), { y: 24, opacity: 0, duration: 0.35 }, 0.85);
  } else {
    const bits = q("[data-confetti]") as HTMLElement[];
    tl.from(q("[data-gift]"), { scale: 0.6, opacity: 0, duration: 0.35, ease: "back.out(2)" })
      .to(q("[data-gift]"), { rotate: 6, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, 0.35)
      .to(q("[data-gift]"), { y: -36, scale: 1.1, duration: 0.25, ease: "power2.out" }, 0.65)
      .to(q("[data-gift]"), { y: 0, scale: 1, duration: 0.35, ease: "bounce.out" }, 0.9)
      .fromTo(
        bits,
        { x: 0, y: 0, opacity: 0, rotate: 0 },
        {
          x: () => gsap.utils.random(-240, 240),
          y: () => gsap.utils.random(-220, 110),
          rotate: () => gsap.utils.random(-540, 540),
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        0.7,
      )
      .to(bits, { opacity: 0, duration: 0.3 }, 1.25)
      .from(q("[data-tag]"), { y: 40, opacity: 0, duration: 0.35, ease: "back.out(2)" }, 1.0);
  }
  return tl;
}

/* ─────────────────────────────── section ─────────────────────────────── */

export function Journey({ data }: { data: JourneyData }) {
  const root = useRef<HTMLElement>(null);
  const scenes = [
    <SceneList key="l" d={data} />,
    <SceneCall key="c" />,
    <ScenePack key="p" d={data} />,
    <SceneImpact key="i" d={data} />,
    <SceneUnwrap key="u" d={data} />,
  ];

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();

      // Desktop: one pinned stage, scrubbed by scroll.
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = el.querySelector<HTMLElement>("[data-desk]")!;
        const q = gsap.utils.selector(stage);
        const chaps = q("[data-chapter]");
        const scs = q("[data-scene]");
        const dots = q("[data-dot]");
        const path = stage.querySelector<SVGPathElement>("[data-drawn]")!;
        const rider = stage.querySelector("[data-rider]")!;
        const reel = stage.querySelector("[data-reel]")!;
        const ride = (start: number, end: number) => ({
          path: "[data-track]",
          align: "[data-track]",
          alignOrigin: [0.5, 0.5] as [number, number],
          start,
          end,
        });

        gsap.set(chaps.slice(1), { opacity: 0, yPercent: 40 });
        // Scenes travel and fade (no clipping wipe), so each card keeps its
        // whole shadow the entire way, and only transform and opacity move.
        gsap.set(scs.slice(1), { autoAlpha: 0, y: 90, scale: 0.94 });
        // Stations ahead wait at 60%, shrunk about their own centre so they
        // sit exactly on the line.
        gsap.set(dots.slice(1), { scale: 0.6, transformOrigin: "50% 50%" });
        gsap.set(path, { drawSVG: "0%" });
        gsap.set(rider, { motionPath: ride(0, 0) });

        // The first scene is already on screen before the pin starts, so it
        // plays as the section arrives instead of waiting for the scrub.
        const first = sceneTimeline(0, scs[0]).pause();
        ScrollTrigger.create({ trigger: el, start: "top 55%", onEnter: () => void first.play() });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            pin: stage,
            start: "top top",
            end: () => `+=${window.innerHeight * 7}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        for (let i = 0; i < 5; i++) {
          const at = i * 2;
          if (i > 0) tl.add(sceneTimeline(i, scs[i]), at - 0.6);
          if (i === 4) break;
          const t = at + 1.1;
          tl.to(chaps[i], { opacity: 0, yPercent: -40, duration: 0.45, ease: "power2.in" }, t)
            .to(chaps[i + 1], { opacity: 1, yPercent: 0, duration: 0.55, ease: "power3.out" }, t + 0.45)
            .to(scs[i], { autoAlpha: 0, y: -70, scale: 0.96, duration: 0.5, ease: "power2.in" }, t)
            .to(scs[i + 1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" }, t + 0.42)
            .to(reel, { yPercent: -((i + 1) * 20), duration: 0.6, ease: "power3.inOut" }, t + 0.1)
            .to(path, { drawSVG: `${(i + 1) * 25}%`, duration: 0.9, ease: "power1.inOut" }, t)
            .to(rider, { motionPath: ride(i * 0.25, (i + 1) * 0.25), duration: 0.9, ease: "power1.inOut" }, t)
            .to(dots[i + 1], { scale: 1, fill: "#452a74", duration: 0.25, ease: "back.out(3)" }, t + 0.75);
        }
      });

      // Phones, tablets and reduced motion: stacked chapters, each scene plays
      // once as it arrives, and the gift rides down a line drawn by the scroll.
      mm.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
        const stack = el.querySelector<HTMLElement>("[data-stack]")!;
        if (reducedMotion()) return;
        gsap.utils.toArray<HTMLElement>("[data-mscene]", stack).forEach((s, i) => {
          const tl = sceneTimeline(i, s).pause();
          ScrollTrigger.create({ trigger: s, start: "top 75%", onEnter: () => void tl.play() });
        });
        gsap.fromTo(
          stack.querySelector("[data-line]"),
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: stack, start: "top 60%", end: "bottom 60%", scrub: true } },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="how" className="relative scroll-mt-16 bg-paper-2">
      {/* ── desktop stage ── */}
      <div data-desk className="relative hidden h-[100svh] overflow-hidden min-[900px]:block">
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-[1500px] items-start justify-between px-8 pt-24">
          <h2 className="font-display max-w-[20ch] text-[clamp(1.8rem,2.6vw,2.6rem)] leading-tight text-ink/85">
            From your list to their first company.
          </h2>
          <p className="font-display flex items-baseline text-[clamp(1.6rem,2.4vw,2.4rem)] text-ink/40" aria-hidden>
            <span className="inline-block h-[1.1em] overflow-hidden leading-[1.1em] text-royal">
              <span data-reel className="block">
                {CHAPTERS.map((_, i) => (
                  <span key={i} className="block h-[1.1em]">
                    0{i + 1}
                  </span>
                ))}
              </span>
            </span>
            <span className="ml-1">/05</span>
          </p>
        </div>

        <div className="absolute inset-x-0 top-[24%] mx-auto grid h-[52%] max-w-[1500px] grid-cols-[0.9fr_1.1fr] items-center gap-10 px-8">
          <div className="relative h-full">
            {CHAPTERS.map((c) => (
              <div key={c.title} data-chapter className="absolute inset-0 flex flex-col justify-center">
                <h3 className="font-display max-w-[12ch] text-[clamp(2.6rem,4.6vw,5rem)] leading-[0.92] text-ink">{c.title}</h3>
                <p className="mt-6 max-w-md text-lg leading-snug text-ink/65">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="relative h-full">
            {scenes.map((s, i) => (
              <div key={i} data-scene className="absolute inset-0 flex items-center justify-center">
                {s}
              </div>
            ))}
          </div>
        </div>

        <svg
          viewBox="0 0 1000 150"
          className="absolute inset-x-0 bottom-[1%] mx-auto w-full max-w-[1400px] overflow-visible px-8"
          aria-hidden
        >
          <path data-track d={PATH} fill="none" stroke="rgb(27 20 33 / 0.15)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
          <path data-drawn d={PATH} fill="none" stroke="#7c4dcc" strokeWidth="3" strokeLinecap="round" />
          {XS.map((x, i) => (
            <g key={x}>
              <circle data-dot cx={x} cy={Y} r="9" fill={i === 0 ? "#452a74" : "#f3ede3"} stroke="#452a74" strokeWidth="2.5" />
              <text x={x} y={Y + 44} textAnchor="middle" fill="rgb(27 20 33 / 0.55)" fontSize="15" fontWeight="600">
                {CHAPTERS[i].label}
              </text>
            </g>
          ))}
          {/* The gift rides above the line, so it never sits on a label. */}
          <g data-rider>
            <g transform="translate(-30 -78)" color="#2a1849">
              <svg width="60" height="60" viewBox="0 0 96 96" overflow="visible">
                <DoodleArtwork name="gift" />
              </svg>
            </g>
          </g>
        </svg>
      </div>

      {/* ── phones and tablets ── */}
      <div data-stack className="relative overflow-x-clip px-5 pb-24 pt-20 sm:px-8 min-[900px]:hidden">
        <h2 className="font-display text-[2.6rem] leading-[0.95] text-ink sm:text-6xl">From your list to their first company.</h2>
        <div className="relative mt-12">
          <span aria-hidden className="absolute bottom-0 left-[15px] top-0 w-0.5 bg-ink/10" />
          <span data-line aria-hidden className="absolute bottom-0 left-[15px] top-0 w-0.5 origin-top bg-violet" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8">
            <div className="sticky top-[45vh] -ml-2 w-12 text-aubergine">
              <svg viewBox="0 0 96 96" className="w-full overflow-visible">
                <DoodleArtwork name="gift" />
              </svg>
            </div>
          </div>
          <ol className="space-y-20 pl-12 sm:pl-16">
            {CHAPTERS.map((c, i) => (
              <li key={c.title}>
                <p className="font-display text-5xl text-orchid">0{i + 1}</p>
                <h3 className="font-display mt-1 text-[2.4rem] leading-[0.95] text-ink">{c.title}</h3>
                <p className="mt-3 max-w-md text-base leading-snug text-ink/65">{c.body}</p>
                <div data-mscene className="mt-8">
                  {scenes[i]}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
