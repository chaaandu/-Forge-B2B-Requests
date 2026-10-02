"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Draggable, gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { useTransitionNav } from "@/components/motion/transition";
import { Roll } from "@/components/layout/header";
import { cn } from "@/lib/cn";

/**
 * The phone's hero, in three candidate designs (?hero=cover|deck|type) while
 * Mesa picks one. Desktop keeps its sticker hero. The real heading is one
 * sr-only h1; each design draws the line its own way, hidden from readers.
 */

export interface HeroPerson {
  name: string;
  photo: string;
  brand: string;
  brandSlug: string;
  tagline: string;
}
export type MobileHeroVariant = "cover" | "deck" | "type";

const LINE = "Every gift here is someone’s first company.";

/** Run once the intro curtain (first visit) has lifted. */
function whenReady(play: () => void) {
  if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
  else play();
}

/** A hand-drawn underline that draws itself in, sized to the word it sits under. */
function Scribble({ draw = true, delay = 0 }: { draw?: boolean; delay?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.08em] left-0 h-[0.18em] w-full overflow-visible"
    >
      <path
        d="M2 6 C 18 1.5, 34 9.5, 50 5 S 82 2.5, 98 5.5"
        pathLength={1}
        fill="none"
        stroke="#e4a7f3"
        strokeWidth={3.2}
        strokeLinecap="round"
        className={
          draw
            ? "[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[scribble_1.1s_cubic-bezier(0.65,0,0.35,1)_forwards] motion-reduce:[stroke-dashoffset:0]"
            : ""
        }
        style={draw ? { animationDelay: `${delay}s` } : undefined}
      />
    </svg>
  );
}

export function MobileHero({
  variant,
  people,
  products,
  founders,
  brands,
}: {
  variant: MobileHeroVariant;
  people: HeroPerson[];
  products: string[];
  founders: number;
  brands: number;
}) {
  return (
    <section className="relative isolate overflow-hidden md:hidden">
      <h1 className="sr-only">{LINE}</h1>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col gap-8 px-5 pb-10 pt-4">
        {/* Each design sits centred in the room above the button. */}
        <div className="flex flex-1 flex-col justify-center">
          {variant === "deck" ? (
            <Deck people={people} />
          ) : variant === "type" ? (
            <FaceType people={people} products={products} />
          ) : (
            <Cover people={people} />
          )}
        </div>
        <Foot founders={founders} brands={brands} />
      </div>
    </section>
  );
}

function Foot({ founders, brands }: { founders: number; brands: number }) {
  return (
    <div data-mfoot className="flex flex-col items-center gap-5 text-center">
      <p className="text-lg leading-snug text-ink/70">
        {founders}&nbsp;student founders. {brands}&nbsp;brands.
      </p>
      <Link
        href="/catalogue"
        className="group inline-flex rounded-full bg-aubergine px-8 py-4 text-base font-semibold text-paper transition-colors active:bg-violet"
      >
        <Roll>Start gifting</Roll>
      </Link>
      <a href="#founders" className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70">
        Meet the founders
        <span className="grid size-9 place-items-center rounded-full border border-ink/20">
          <ArrowDown className="size-4" />
        </span>
      </a>
    </div>
  );
}

/* ───────────────────────── 1. Cover star ───────────────────────── */

/**
 * A magazine cover: one founder, big, with the line wrapped around them.
 * The top of the line sits behind their head, "first company." in front of
 * them as they fade into the page. A new founder every five seconds, or
 * step through with the arrows.
 */
function Cover({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = people.length;
  const p = people[i];

  // The next founder after 5s, only while the cover is on screen and the tab
  // is in front. Every change (yours or the timer's) restarts the clock.
  useEffect(() => {
    if (n < 2 || reducedMotion()) return;
    let seen = true;
    const io = new IntersectionObserver(([e]) => void (seen = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const t = setTimeout(() => seen && !document.hidden && setI((v) => (v + 1) % n), 5000);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [i, n]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(q("[data-cline]"), { yPercent: 60, opacity: 0, duration: 1.1, stagger: 0.08 })
        .from(q("[data-ccircle]"), { scale: 0.4, opacity: 0, duration: 1.3 }, 0.1)
        // The wrapper, not the photos: their own fades belong to the cross-fade.
        .from(q("[data-cpeople]"), { yPercent: 14, opacity: 0, duration: 1.3 }, 0.25)
        .from(q("[data-ctag]"), { y: 16, opacity: 0, duration: 0.8 }, 0.7);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="relative">
      {/* Layered in one stacking order: circle, then these words, then the
          founder (whose head overlaps them), then "first company." on top. */}
      <p className="font-display relative z-10 text-center text-[clamp(2.6rem,13vw,4rem)] leading-[0.92] text-ink">
        <span data-cline className="block">
          Every gift here
        </span>
        <span data-cline className="block">
          is someone’s
        </span>
      </p>
      {/* The stage rises into the line above, so the head overlaps the words. */}
      <div data-cstage className="relative -mt-[2.2rem] h-[min(86vw,360px)]">
        <div data-ccircle className="absolute left-1/2 top-[8%] z-0 aspect-square w-[80%] -translate-x-1/2 rounded-full bg-orchid-soft" />
        <div data-cpeople className="absolute inset-0 z-20">
          {people.map((q, k) => (
            <Image
              key={q.photo}
              src={q.photo}
              alt=""
              width={450}
              height={440}
              sizes="(min-width: 480px) 380px, 88vw"
              priority={k === 0}
              className={cn(
                "absolute bottom-0 left-1/2 w-[88%] max-w-[380px] -translate-x-1/2 transition-opacity duration-700 ease-out [mask-image:linear-gradient(to_bottom,black_58%,transparent_96%)]",
                k === i ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
        </div>
        <p className="font-display absolute inset-x-0 bottom-[2%] z-30 text-center text-[clamp(2.6rem,13vw,4rem)] italic leading-none text-royal">
          <span data-cline className="relative inline-block">
            first company.
            <Scribble delay={0.9} />
          </span>
        </p>
      </div>
      <div data-ctag className="relative z-20 mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setI((v) => (v - 1 + n) % n)}
          className="grid size-9 place-items-center rounded-full bg-ink/[0.06] text-ink active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </button>
        <Link
          href={`/brands/${p.brandSlug}`}
          tabIndex={-1}
          className="min-w-0 truncate rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper"
        >
          {p.name.split(" ")[0]} · {p.brand}
        </Link>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setI((v) => (v + 1) % n)}
          className="grid size-9 place-items-center rounded-full bg-ink/[0.06] text-ink active:scale-95"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── 2. Founders deck ───────────────────────── */

const TINTS = ["bg-orchid-soft", "bg-[#e7dcf7]", "bg-paper-2", "bg-[#f6e3c9]"];
const SPOTS = [
  { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 },
  { x: -10, y: 14, rotation: -5, scale: 0.95, opacity: 1 },
  { x: 12, y: 26, rotation: 5, scale: 0.9, opacity: 1 },
  { x: 0, y: 34, rotation: 0, scale: 0.86, opacity: 0 },
];

/**
 * A deck of founders. Flick the top card away to meet the next; tap it to
 * open their page. Nothing moves until you touch it.
 */
function Deck({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState(() => people.map((_, k) => k));
  const [swiped, setSwiped] = useState(false);
  const go = useTransitionNav();
  const spot = (depth: number) => SPOTS[Math.min(depth, SPOTS.length - 1)];

  // Deal the cards in once.
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root.current);
      cards.forEach((c) => gsap.set(c, spot(order.indexOf(Number(c.dataset.card)))));
      if (reducedMotion()) return;
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(cards.slice(0, 3).reverse(), { y: 260, rotation: () => gsap.utils.random(-18, 18), opacity: 0, duration: 1.2, stagger: 0.09 })
        .from("[data-dline]", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.45);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  // Settle every card into its place in the pile after each flick (the
  // first placing belongs to the deal above).
  const dealt = useRef(false);
  useEffect(() => {
    if (!dealt.current) return void (dealt.current = true);
    gsap.utils.toArray<HTMLElement>("[data-card]", root.current).forEach((c) => {
      const depth = order.indexOf(Number(c.dataset.card));
      c.style.zIndex = String(people.length - depth);
      gsap.to(c, { ...spot(depth), duration: 0.6, ease: "expo.out", overwrite: "auto" });
    });
  }, [order, people.length]);

  // The top card follows the finger; let go past the threshold and it flies.
  useEffect(() => {
    const top = root.current?.querySelector<HTMLElement>(`[data-card="${order[0]}"]`);
    if (!top) return;
    const [d] = Draggable.create(top, {
      type: "x",
      minimumMovement: 6,
      onDrag() {
        gsap.set(top, { rotation: this.x / 14 });
      },
      onRelease() {
        const fling = Math.abs(this.x) > 80;
        if (!fling) return void gsap.to(top, { x: 0, rotation: 0, duration: 0.5, ease: "back.out(2)" });
        const dir = Math.sign(this.x) || 1;
        setSwiped(true);
        gsap.to(top, {
          x: dir * window.innerWidth,
          rotation: dir * 24,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(top, { ...spot(SPOTS.length - 1), x: 0 });
            setOrder((o) => [...o.slice(1), o[0]]);
          },
        });
      },
      onClick() {
        const slug = top.dataset.slug;
        if (slug) go?.(`/brands/${slug}`);
      },
    });
    return () => void d.kill();
  }, [order, go]);

  return (
    <div ref={root} className="relative" aria-hidden>
      <div className="relative mx-auto h-[min(96vw,400px)] w-[min(74vw,300px)]">
        {people.map((q, k) => (
          <div
            key={q.photo}
            data-card={k}
            data-slug={q.brandSlug}
            className={cn(
              "absolute inset-0 touch-pan-y overflow-hidden rounded-[30px] shadow-[0_24px_50px_-24px_rgb(42_24_73/0.5)]",
              TINTS[k % TINTS.length],
            )}
          >
            <Image
              src={q.photo}
              alt=""
              width={450}
              height={440}
              sizes="(min-width: 480px) 340px, 82vw"
              priority={k < 3}
              draggable={false}
              className="pointer-events-none absolute bottom-[22%] left-1/2 w-[104%] max-w-none -translate-x-1/2"
            />
            <div className="absolute inset-x-3 bottom-3 rounded-[22px] bg-paper/95 px-4 py-3 text-left">
              <p className="font-display text-[1.65rem] leading-none text-ink">{q.name.split(" ")[0]}</p>
              <p className="mt-1.5 truncate text-[13px] text-ink/60">
                <span className="font-semibold text-royal">{q.brand}</span> · {q.tagline}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className={cn("mt-5 text-center text-xs font-semibold text-ink/45 transition-opacity duration-500", swiped && "opacity-0")}>
        ← Swipe to meet them →
      </p>
      <p className="font-display mt-4 text-center text-[clamp(2.2rem,10.6vw,3.4rem)] leading-[0.95] text-ink">
        <span data-dline className="block">
          Every gift here
        </span>
        <span data-dline className="block">
          is someone’s
        </span>
        <span data-dline className="block">
          <span className="relative inline-block italic text-royal">
            first company.
            <Scribble delay={1} />
          </span>
        </span>
      </p>
    </div>
  );
}

/* ───────────────────────── 3. Type with faces ───────────────────────── */

/**
 * The line itself is the hero, set big enough to fill the phone, with the
 * people and the things they make sitting right inside it. The photos in
 * the pills change every few seconds.
 */
function FaceType({ people, products }: { people: HeroPerson[]; products: string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reducedMotion()) return;
    let seen = true;
    const io = new IntersectionObserver(([e]) => void (seen = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const id = setInterval(() => seen && !document.hidden && setT((v) => v + 1), 3200);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(q("[data-tline]"), { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.09 })
        .from(q("[data-pill]"), { scale: 0, rotate: -30, duration: 0.9, stagger: 0.12, ease: "back.out(2)" }, 0.45);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  const faces = people.map((p) => p.photo);
  const half = Math.ceil(faces.length / 2);
  return (
    <div ref={root} aria-hidden>
      <p className="font-display text-center text-[clamp(2.8rem,14.2vw,4.4rem)] leading-[1.02] text-ink">
        <span data-tline className="block">
          Every <Pill images={faces.slice(0, half)} index={t} /> gift
        </span>
        <span data-tline className="block">
          here is <Pill images={products} index={t + 1} wide />
        </span>
        <span data-tline className="block">
          someone’s
        </span>
        <span data-tline className="block italic text-royal">
          first <Pill images={faces.slice(half)} index={t + 2} />
        </span>
        <span data-tline className="block italic text-royal">
          <span className="relative inline-block">
            company.
            <Scribble delay={1.1} />
          </span>
        </span>
      </p>
    </div>
  );
}

/** A photo set into a line of type; its pictures cross-fade as `index` moves on. */
function Pill({ images, index, wide = false }: { images: string[]; index: number; wide?: boolean }) {
  const on = images.length ? index % images.length : 0;
  return (
    <span
      data-pill
      className={cn(
        "relative mx-[0.06em] inline-block h-[0.78em] translate-y-[0.06em] overflow-hidden rounded-full bg-orchid-soft align-baseline",
        wide ? "w-[1.6em]" : "w-[0.78em]",
      )}
    >
      {images.map((src, k) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes={wide ? "120px" : "64px"}
          className={cn(
            "transition-[opacity,scale] duration-700 ease-out",
            wide ? "object-cover" : "object-cover object-top",
            k === on ? "scale-100 opacity-100" : "scale-110 opacity-0",
          )}
        />
      ))}
    </span>
  );
}
