"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { Icon3D } from "@/components/icon3d";
import { TeamLineup } from "@/components/team-lineup";
import type { Founder } from "@/lib/founders";
import { withBase } from "@/lib/base-path";

export interface JourneyData {
  list: { title: string; brand: string; image: string; qty: number }[];
  backing: string[];
  backingCount: number;
  team: Founder[];
  teamBrand: string;
  board: { brand: string; revenue: number }[];
  /** Index in `board` of the venture the example order lands on. */
  boosted: number;
  order: number;
}

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;
const lakh = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n >= 1000000 ? 1 : 2).replace(/\.?0+$/, "")}L` : inr(n));

const CHAPTERS = (d: JourneyData) => [
  { label: "List", title: "Make a list.", body: "Hampers, snacks, candles, tees. Add rough quantities. No login, no card, no drama." },
  {
    label: "Call",
    title: "We call you. Within a day.",
    body: "A real human from Mesa, with bulk prices, samples and dates. Not a bot. Pinky promise.",
  },
  {
    label: "Pack",
    title: "Founders pack it.",
    body: `${d.team.map((t) => t.name.split(" ")[0]).join(", ")} pack every box like it's going to their toughest investor. Honestly, it is.`,
  },
  {
    label: "Leaderboard",
    title: "It hits the leaderboard.",
    body: "Your order is their revenue, and all 117 founders can see it. Bragging rights: unlocked.",
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
      <div className="flex items-baseline justify-between">
        <p className="font-display text-3xl text-ink">Gift list</p>
        <span className="text-xs font-semibold text-ink/45">Your team · Diwali</span>
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
            <span data-qty className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold tabular-nums text-paper">
              ×{item.qty}
            </span>
            <svg viewBox="0 0 24 24" className="size-6 shrink-0">
              <circle cx="12" cy="12" r="11" className="fill-orchid-soft" />
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
        <span className="flex -space-x-2">
          {d.backing.map((src) => (
            <span key={src} className="relative size-8 overflow-hidden rounded-full bg-orchid-soft ring-2 ring-paper">
              <Image src={src} alt="" fill sizes="64px" className="object-cover object-top" />
            </span>
          ))}
        </span>
        <span className="text-sm font-semibold text-ink">You&apos;re backing {d.backingCount} founders</span>
      </div>
    </div>
  );
}

function SceneCall() {
  return (
    <div className="relative mx-auto aspect-[1.15] w-full max-w-[520px]">
      <div data-phone className="absolute left-[2%] top-[18%] w-[44%]">
        <Icon3D name="telephone-receiver" size={256} className="h-auto w-full -rotate-12" />
      </div>
      <p
        data-bubble
        className="absolute right-[2%] top-[8%] max-w-[62%] rounded-3xl rounded-bl-md bg-paper px-5 py-3.5 text-[15px] font-medium leading-snug text-ink shadow-xl"
      >
        Hi! Need 150 hampers by the 20th. Doable?
      </p>
      <p
        data-bubble
        className="absolute right-[8%] top-[40%] max-w-[62%] rounded-3xl rounded-br-md bg-royal px-5 py-3.5 text-[15px] font-medium leading-snug text-paper shadow-xl"
      >
        Totally. Bulk price and samples, coming right up.
      </p>
      <div data-stamp className="absolute bottom-[2%] right-[24%] grid size-32 place-items-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-spin-slow">
          <defs>
            <path id="stamp-circle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0" />
          </defs>
          <circle cx="60" cy="60" r="58" className="fill-orchid" />
          <text className="fill-aubergine text-[11.5px] font-bold uppercase tracking-[0.2em]">
            <textPath href="#stamp-circle">Within 1 working day · Within 1 working day ·</textPath>
          </text>
        </svg>
        <span className="font-display relative text-3xl text-aubergine">24h</span>
      </div>
    </div>
  );
}

function ScenePack({ d }: { d: JourneyData }) {
  return (
    <div className="relative mx-auto flex aspect-[1.15] w-full max-w-[540px] items-end justify-center">
      <div data-squad className="absolute inset-x-[6%] bottom-[10%] top-[16%] overflow-hidden rounded-t-[999px] bg-orchid-soft">
        <TeamLineup people={d.team} sizes="200px" className="absolute inset-x-0 bottom-0 [--person:clamp(84px,10.5vw,150px)]" />
      </div>
      <div data-box className="absolute -bottom-[3%] left-1/2 w-[27%] -translate-x-1/2">
        <Icon3D name="wrapped-gift" size={256} className="h-auto w-full rotate-6" />
      </div>
      <p data-chip className="absolute left-[4%] top-[6%] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper shadow-xl">
        Packed by {d.team.map((t) => t.name.split(" ")[0]).join(", ")} ✺
      </p>
    </div>
  );
}

/** The leaderboard order once the example order is added: row indexes, best first. */
const rankAfter = (d: JourneyData) =>
  d.board
    .map((b, i) => ({ i, v: b.revenue + (i === d.boosted ? d.order : 0) }))
    .sort((a, b) => b.v - a.v)
    .map((r) => r.i);

function SceneBoard({ d }: { d: JourneyData }) {
  const max = Math.max(...d.board.map((b, i) => b.revenue + (i === d.boosted ? d.order : 0)));
  const after = rankAfter(d);
  const climbed = d.boosted - after.indexOf(d.boosted);
  return (
    <div className="mx-auto w-full max-w-[520px] rounded-[30px] bg-ink p-5 text-paper shadow-[0_40px_80px_-30px_rgb(42_24_73/0.6)] sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="font-display text-3xl">Forge leaderboard</p>
        <span className="text-xs font-semibold text-paper/45">Revenue so far</span>
      </div>
      <div className="relative mt-5" style={{ height: d.board.length * 56 }}>
        {d.board.map((row, i) => (
          <div
            key={row.brand}
            data-board-row={i}
            className="absolute inset-x-0 flex h-12 items-center gap-2 rounded-2xl px-2 sm:gap-3 sm:px-3"
            style={{ top: i * 56, background: i === d.boosted ? "rgb(228 167 243 / 0.12)" : "transparent" }}
          >
            <span className="relative w-5 text-sm font-bold tabular-nums text-paper/40">
              <span data-rank-before>{i + 1}</span>
              <span data-rank-after className="absolute inset-0 text-orchid opacity-0">
                {after.indexOf(i) + 1}
              </span>
            </span>
            <span className="w-[5.5rem] truncate text-[13px] font-semibold sm:w-28 sm:text-sm">{row.brand}</span>
            <span className="relative flex h-3 flex-1 overflow-hidden rounded-full bg-paper/10">
              <span data-bar className="h-full origin-left rounded-full bg-paper" style={{ width: `${(row.revenue / max) * 100}%` }} />
              {i === d.boosted && (
                <span data-plus className="h-full origin-left bg-orchid" style={{ width: `${(d.order / max) * 100}%` }} />
              )}
            </span>
            <span className="relative w-14 text-right text-xs font-bold tabular-nums text-paper/70 sm:w-16">
              <span data-value-before>{lakh(row.revenue)}</span>
              {i === d.boosted && (
                <span data-value-after className="absolute inset-0 text-orchid opacity-0">
                  {lakh(row.revenue + d.order)}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
      <p data-verdict className="mt-3 rounded-2xl bg-orchid px-4 py-3 text-sm font-bold text-aubergine">
        + your {lakh(d.order)} order.{" "}
        {after.indexOf(d.boosted) === 0
          ? "Straight to #1."
          : climbed > 0
            ? `Up ${climbed} place${climbed > 1 ? "s" : ""}.`
            : "Even further ahead."}
      </p>
    </div>
  );
}

function SceneUnwrap({ d }: { d: JourneyData }) {
  const bits = Array.from({ length: 26 }, (_, i) => i);
  const colours = ["var(--color-orchid)", "var(--color-violet)", "var(--color-marigold)", "var(--color-royal)", "var(--color-paper)"];
  return (
    <div className="relative mx-auto grid aspect-[1.15] w-full max-w-[520px] place-items-center">
      {bits.map((i) => (
        <span
          key={i}
          data-confetti
          className="absolute left-1/2 top-[45%] block"
          style={{
            width: i % 3 ? 10 : 14,
            height: i % 3 ? 16 : 14,
            borderRadius: i % 3 ? 3 : 999,
            background: colours[i % colours.length],
          }}
        />
      ))}
      <div data-gift className="relative w-[44%]">
        <Icon3D name="wrapped-gift" size={256} className="h-auto w-full" />
      </div>
      <div data-tag className="absolute bottom-[4%] flex items-center gap-3 rounded-full bg-paper py-2 pl-2 pr-5 shadow-xl">
        <span className="flex -space-x-2">
          {d.team.map((p) => (
            <span key={p.photo} className="relative size-9 overflow-hidden rounded-full bg-orchid-soft ring-2 ring-paper">
              <Image src={p.photo} alt="" fill sizes="72px" className="object-cover object-top" />
            </span>
          ))}
        </span>
        <span className="text-sm font-semibold text-ink">
          Made by {d.team.map((t) => t.name.split(" ")[0]).join(", ")} <span className="text-ink/45">· {d.teamBrand}</span>
        </span>
      </div>
    </div>
  );
}

/* ─────────────────── scene animations (shared by both layouts) ─────────────────── */

function sceneTimeline(n: number, root: Element, d: JourneyData): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  if (n === 0) {
    tl.from(q("[data-row]"), { x: 40, opacity: 0, stagger: 0.12, duration: 0.4 })
      .fromTo(q("[data-tick]"), { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.12, duration: 0.3 }, 0.25)
      .from(q("[data-qty]"), { scale: 0, stagger: 0.12, duration: 0.3, ease: "back.out(3)" }, 0.2)
      .from(q("[data-backing]"), { y: 20, opacity: 0, duration: 0.35 }, 0.7);
  } else if (n === 1) {
    tl.from(q("[data-phone]"), { y: 60, opacity: 0, rotate: -30, duration: 0.4 })
      .to(q("[data-phone]"), { rotate: 8, duration: 0.06, yoyo: true, repeat: 7, ease: "none" }, 0.35)
      .from(
        q("[data-bubble]"),
        { scale: 0.6, opacity: 0, y: 20, transformOrigin: "left bottom", stagger: 0.25, duration: 0.35, ease: "back.out(2)" },
        0.45,
      )
      .from(q("[data-stamp]"), { scale: 2.2, opacity: 0, rotate: -40, duration: 0.35, ease: "back.out(1.6)" }, 0.95);
  } else if (n === 2) {
    tl.from(q("[data-squad]"), { yPercent: 40, opacity: 0, duration: 0.5 })
      .from(q("[data-squad] figure"), { y: 30, stagger: 0.08, duration: 0.4, ease: "back.out(2)" }, 0.1)
      .from(q("[data-box]"), { y: 120, rotate: 30, opacity: 0, duration: 0.5, ease: "back.out(1.6)" }, 0.35)
      .from(q("[data-chip]"), { scale: 0.5, opacity: 0, duration: 0.3, ease: "back.out(2.5)" }, 0.7);
  } else if (n === 3) {
    const rows = q("[data-board-row]") as HTMLElement[];
    const after = rankAfter(d);
    tl.from(q("[data-bar]"), { scaleX: 0, stagger: 0.06, duration: 0.45, ease: "power3.out" })
      .from(q("[data-plus]"), { scaleX: 0, duration: 0.35, ease: "power3.out" }, 0.55)
      .to(rows, { y: (i: number) => (after.indexOf(i) - i) * 56, duration: 0.45, ease: "power3.inOut" }, 0.95)
      // Both rank numbers are in the markup and cross-fade, so scrubbing back undoes it.
      .to(q("[data-rank-before]"), { opacity: 0, duration: 0.15 }, 1.15)
      .to(q("[data-rank-after]"), { opacity: 1, duration: 0.15 }, 1.2)
      .to(
        q("[data-board-row] [data-value-before]").filter((_, i) => i === d.boosted),
        { opacity: 0, duration: 0.15 },
        0.6,
      )
      .to(q("[data-value-after]"), { opacity: 1, duration: 0.15 }, 0.65)
      .from(q("[data-verdict]"), { y: 20, opacity: 0, duration: 0.3 }, 1.1);
  } else {
    const bits = q("[data-confetti]") as HTMLElement[];
    tl.from(q("[data-gift]"), { scale: 0.6, opacity: 0, duration: 0.35, ease: "back.out(2)" })
      .to(q("[data-gift]"), { rotate: 6, duration: 0.05, yoyo: true, repeat: 5, ease: "none" }, 0.35)
      .to(q("[data-gift]"), { y: -40, scale: 1.12, duration: 0.25, ease: "power2.out" }, 0.65)
      .to(q("[data-gift]"), { y: 0, scale: 1, duration: 0.35, ease: "bounce.out" }, 0.9)
      .fromTo(
        bits,
        { x: 0, y: 0, opacity: 0, rotate: 0 },
        {
          x: () => gsap.utils.random(-260, 260),
          y: () => gsap.utils.random(-240, 120),
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
  const chapters = CHAPTERS(data);
  const scenes = [
    <SceneList key="l" d={data} />,
    <SceneCall key="c" />,
    <ScenePack key="p" d={data} />,
    <SceneBoard key="b" d={data} />,
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
        const gift = stage.querySelector("[data-rider]")!;
        const reel = stage.querySelector("[data-reel]")!;

        gsap.set(chaps.slice(1), { opacity: 0, yPercent: 40 });
        gsap.set(scs.slice(1), { clipPath: "inset(100% 0% 0% 0% round 32px)", y: 60 });
        gsap.set(path, { drawSVG: "0%" });
        gsap.set(gift, { motionPath: { path: "[data-track]", align: "[data-track]", alignOrigin: [0.5, 0.5], start: 0, end: 0 } });

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
        // The first scene is already on screen before the pin starts, so it
        // plays as the section arrives instead of waiting for the scrub.
        const first = sceneTimeline(0, scs[0], data).pause();
        ScrollTriggerOnce(el, () => first.play(), "top 55%");
        for (let i = 0; i < 5; i++) {
          const at = i * 2;
          if (i > 0) tl.add(sceneTimeline(i, scs[i], data), at - 0.6);
          if (i === 4) break;
          const t = at + 1.1;
          tl.to(chaps[i], { opacity: 0, yPercent: -40, duration: 0.45, ease: "power2.in" }, t)
            .to(chaps[i + 1], { opacity: 1, yPercent: 0, duration: 0.55, ease: "power3.out" }, t + 0.45)
            .to(scs[i], { clipPath: "inset(0% 0% 100% 0% round 32px)", y: -60, duration: 0.55, ease: "power3.inOut" }, t)
            .to(scs[i + 1], { clipPath: "inset(0% 0% 0% 0% round 32px)", y: 0, duration: 0.6, ease: "power3.inOut" }, t + 0.2)
            .to(reel, { yPercent: -((i + 1) * 20), duration: 0.6, ease: "power3.inOut" }, t + 0.1)
            .to(path, { drawSVG: `${(i + 1) * 25}%`, duration: 0.9, ease: "power1.inOut" }, t)
            .to(
              gift,
              {
                motionPath: { path: "[data-track]", align: "[data-track]", alignOrigin: [0.5, 0.5], start: i * 0.25, end: (i + 1) * 0.25 },
                duration: 0.9,
                ease: "power1.inOut",
              },
              t,
            )
            .fromTo(
              dots[i + 1],
              { scale: 0.6 },
              { scale: 1, fill: "#452a74", transformOrigin: "50% 50%", duration: 0.25, ease: "back.out(3)" },
              t + 0.75,
            );
        }
      });

      // Phones and reduced motion: stacked chapters, each scene plays once as it arrives,
      // and the gift rides down a line drawn by the scroll.
      mm.add("(max-width: 899px), (prefers-reduced-motion: reduce)", () => {
        const stack = el.querySelector<HTMLElement>("[data-stack]")!;
        if (reducedMotion()) return;
        gsap.utils.toArray<HTMLElement>("[data-mscene]", stack).forEach((s, i) => {
          const tl = sceneTimeline(i, s, data).pause();
          gsap.set(s, { opacity: 1 });
          ScrollTriggerOnce(s, () => tl.play());
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
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">How it works</p>
            <p className="font-display mt-2 max-w-[18ch] text-[clamp(1.6rem,2.4vw,2.4rem)] leading-tight text-ink/80">
              From your list to their leaderboard.
            </p>
          </div>
          <p className="font-display flex items-baseline text-[clamp(1.6rem,2.4vw,2.4rem)] text-ink/40">
            <span className="inline-block h-[1.1em] overflow-hidden leading-[1.1em] text-royal">
              <span data-reel className="block">
                {chapters.map((_, i) => (
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
            {chapters.map((c) => (
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

        <svg viewBox="0 0 1000 140" className="absolute inset-x-0 bottom-[2%] mx-auto w-full max-w-[1400px] overflow-visible px-8">
          <path data-track d={PATH} fill="none" stroke="rgb(27 20 33 / 0.15)" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
          <path data-drawn d={PATH} fill="none" stroke="#7c4dcc" strokeWidth="3" strokeLinecap="round" />
          {XS.map((x, i) => (
            <g key={x}>
              <circle data-dot cx={x} cy={Y} r="9" fill={i === 0 ? "#452a74" : "#f3ede3"} stroke="#452a74" strokeWidth="2.5" />
              <text x={x} y={Y + 42} textAnchor="middle" className="fill-ink/55 text-[13px] font-semibold uppercase tracking-[0.15em]">
                {chapters[i].label}
              </text>
            </g>
          ))}
          <g data-rider>
            <image href={withBase("/icons3d/wrapped-gift.png")} x="-30" y="-36" width="60" height="60" />
          </g>
        </svg>
      </div>

      {/* ── phones ── */}
      <div data-stack className="relative overflow-x-clip px-5 pb-24 pt-20 min-[900px]:hidden">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet">How it works</p>
        <p className="font-display mt-2 text-4xl leading-tight text-ink">From your list to their leaderboard.</p>
        <div className="relative mt-12">
          <span aria-hidden className="absolute bottom-0 left-[15px] top-0 w-0.5 bg-ink/10" />
          <span data-line aria-hidden className="absolute bottom-0 left-[15px] top-0 w-0.5 origin-top bg-violet" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8">
            <div className="sticky top-[45vh]">
              <Image src={withBase("/icons3d/wrapped-gift.png")} alt="" width={64} height={64} className="-ml-1 size-10 drop-shadow-lg" />
            </div>
          </div>
          <ol className="space-y-20 pl-12">
            {chapters.map((c, i) => (
              <li key={c.title}>
                <p className="font-display text-5xl text-orchid">0{i + 1}</p>
                <h3 className="font-display mt-1 text-[2.4rem] leading-[0.95] text-ink">{c.title}</h3>
                <p className="mt-3 text-base leading-snug text-ink/65">{c.body}</p>
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

function ScrollTriggerOnce(trigger: Element, onEnter: () => void, start = "top 75%") {
  gsap.timeline({ scrollTrigger: { trigger, start, once: true, onEnter } });
}
