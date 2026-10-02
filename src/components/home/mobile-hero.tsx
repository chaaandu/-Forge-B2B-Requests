"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Draggable, gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { useTransitionNav } from "@/components/motion/transition";
import { Roll } from "@/components/layout/header";
import { cn } from "@/lib/cn";

/**
 * The phone's hero, in the desktop hero's own language (founder stickers
 * around the line), with four ways of moving while Mesa picks one:
 * ?hero=stickers|orbit|pile|drift. The real heading is one sr-only h1; the
 * drawn line and the stickers are decoration, hidden from screen readers.
 */

export interface HeroPerson {
  name: string;
  photo: string;
  brand: string;
  brandSlug: string;
}
export type MobileHeroVariant = "stickers" | "orbit" | "pile" | "drift";

const LINE = "Every gift here is someone’s first company.";
const first = (p: HeroPerson) => p.name.split(" ")[0];

/** Run once the intro curtain (first visit only) has lifted. */
function whenReady(play: () => void) {
  if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
  else play();
}

/** Calls back with whether `el` is on screen; returns the unsubscribe. */
function watch(el: Element, onChange: (on: boolean) => void) {
  const io = new IntersectionObserver(([e]) => onChange(e.isIntersecting));
  io.observe(el);
  return () => io.disconnect();
}

/* ───────────────────────── shared pieces ───────────────────────── */

/** The hand-drawn underline, drawing itself in under the word above it. */
function Scribble({ delay = 0 }: { delay?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="absolute -bottom-[0.1em] left-0 h-[0.2em] w-full overflow-visible"
    >
      <path
        d="M2 6 C 18 1.5, 34 9.5, 50 5 S 82 2.5, 98 5.5"
        pathLength={1}
        fill="none"
        stroke="#e4a7f3"
        strokeWidth={3.4}
        strokeLinecap="round"
        className="[stroke-dasharray:1] [stroke-dashoffset:1] motion-safe:animate-[scribble_1.1s_cubic-bezier(0.65,0,0.35,1)_forwards] motion-reduce:[stroke-dashoffset:0]"
        style={{ animationDelay: `${delay}s` }}
      />
    </svg>
  );
}

/** The line, set the way the desktop hero sets it. */
function Headline({ className, small = false }: { className?: string; small?: boolean }) {
  return (
    <p
      aria-hidden
      data-headline
      className={cn(
        "font-display relative z-20 px-5 text-center leading-[0.9] text-ink",
        small ? "text-[clamp(2.4rem,11vw,3.6rem)]" : "text-[clamp(2.8rem,13.2vw,4.3rem)]",
        className,
      )}
    >
      <span data-hline className="block">
        Every gift here
      </span>
      <span data-hline className="block">
        is someone’s
      </span>
      <span data-hline className="block">
        <span className="relative inline-block italic text-royal">
          first company.
          <Scribble delay={0.85} />
        </span>
      </span>
    </p>
  );
}

/** A founder sticker: the portrait on an orchid disc in a paper ring, and a name tag. */
function Face({ p, tag = true }: { p: HeroPerson; tag?: boolean }) {
  return (
    <span className="relative block size-full">
      <span className="absolute inset-0 overflow-hidden rounded-full bg-orchid-soft shadow-[0_16px_30px_-14px_rgb(42_24_73/0.55)] ring-[3.5px] ring-paper">
        <Image src={p.photo} alt="" fill sizes="132px" draggable={false} className="pointer-events-none object-cover object-top" />
      </span>
      {tag && (
        <span
          data-tag
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-[3px] text-[9px] font-semibold leading-none text-paper shadow-md"
        >
          {first(p)} · {p.brand}
        </span>
      )}
    </span>
  );
}

function Foot({ founders, brands }: { founders: number; brands: number }) {
  return (
    <div className="relative z-20 flex flex-col items-center gap-5 px-5 text-center">
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

export function MobileHero({
  variant,
  people,
  founders,
  brands,
}: {
  variant: MobileHeroVariant;
  people: HeroPerson[];
  founders: number;
  brands: number;
}) {
  return (
    <section className="relative isolate overflow-hidden md:hidden">
      <h1 className="sr-only">{LINE}</h1>
      <div className="flex min-h-[calc(100svh-4rem)] flex-col gap-6 pb-10 pt-2">
        <div className="relative flex min-h-[440px] flex-1 flex-col justify-center">
          {variant === "orbit" ? (
            <Orbit people={people} />
          ) : variant === "pile" ? (
            <Pile people={people} />
          ) : variant === "drift" ? (
            <Drift people={people} />
          ) : (
            <Stickers people={people} />
          )}
        </div>
        <Foot founders={founders} brands={brands} />
      </div>
    </section>
  );
}

/* ───────────────────────── 1. Stickers ───────────────────────── */

// Where each sticker sits: a band (0 above the line, 1 below), its centre as a
// share of the width and of the band's height, a size, a tilt and a depth.
const SPOTS = [
  { band: 0, x: 0.17, y: 0.6, s: 1, r: -8, d: 1.2 },
  { band: 0, x: 0.42, y: 0.22, s: 0.7, r: 7, d: 0.6 },
  { band: 0, x: 0.66, y: 0.64, s: 1.08, r: -4, d: 1.4 },
  { band: 0, x: 0.87, y: 0.26, s: 0.76, r: 10, d: 0.8 },
  { band: 1, x: 0.15, y: 0.36, s: 0.84, r: 8, d: 0.9 },
  { band: 1, x: 0.4, y: 0.66, s: 1.04, r: -6, d: 1.3 },
  { band: 1, x: 0.65, y: 0.3, s: 0.72, r: 12, d: 0.7 },
  { band: 1, x: 0.86, y: 0.64, s: 0.88, r: -9, d: 1.1 },
];

/**
 * The desktop hero, art-directed for a phone: founders stuck around the line
 * above and below it, each a different size and tilt, bobbing gently and
 * drifting apart at different speeds as you scroll. Tap one to meet them.
 */
function Stickers({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const shown = people.slice(0, SPOTS.length);

  useGSAP(
    () => {
      const el = root.current!;
      const line = el.querySelector<HTMLElement>("[data-headline]")!;
      const stickers = gsap.utils.toArray<HTMLElement>("[data-st]", el);

      const place = () => {
        const area = el.getBoundingClientRect();
        const t = line.getBoundingClientRect();
        const bands = [
          { top: 6, bottom: t.top - area.top - 12 },
          { top: t.bottom - area.top + 26, bottom: area.height - 4 },
        ];
        const W = area.width;
        // Shown before measuring, so each name tag has a width to measure.
        stickers.forEach((sticker) => (sticker.style.display = ""));
        stickers.forEach((sticker, i) => {
          const spot = SPOTS[i];
          const band = bands[spot.band];
          const h = band.bottom - band.top;
          const size = Math.max(46, Math.min(h * 0.74, W * 0.25)) * spot.s;
          // The name tag can be wider than the disc; keep the wider of the two on screen.
          const tagW = sticker.querySelector<HTMLElement>("[data-tag]")?.offsetWidth ?? 0;
          const half = Math.max(size, tagW) / 2 + 6;
          const cx = gsap.utils.clamp(half, W - half, spot.x * W);
          const cy = gsap.utils.clamp(band.top + size / 2, band.bottom - size / 2 - 10, band.top + spot.y * h);
          Object.assign(sticker.style, {
            display: "",
            left: `${cx - size / 2}px`,
            top: `${cy - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
          });
        });
      };
      place();
      let timer = 0;
      const onResize = () => {
        clearTimeout(timer);
        timer = window.setTimeout(place, 150);
      };
      window.addEventListener("resize", onResize);
      if (reducedMotion()) return () => window.removeEventListener("resize", onResize);

      const pops = stickers.map((s) => s.firstElementChild as HTMLElement);
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(el.querySelectorAll("[data-hline]"), { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.08 })
        .from(
          pops,
          {
            scale: 0,
            rotate: () => gsap.utils.random(-40, 40),
            opacity: 0,
            duration: 1.2,
            stagger: { each: 0.06, from: "random" },
            ease: "back.out(1.7)",
          },
          0.2,
        );
      whenReady(() => tl.play());

      // A slow bob, each out of step, only while on screen.
      const bobs = stickers.map((s) =>
        gsap.to(s.querySelector("[data-bob]"), {
          y: gsap.utils.random(-7, 7),
          rotate: gsap.utils.random(-3, 3),
          duration: gsap.utils.random(2.8, 4),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }),
      );
      const stop = watch(el, (on) => bobs.forEach((b) => (on ? b.resume() : b.pause())));
      // They drift apart at different speeds as the page scrolls.
      stickers.forEach((s, i) =>
        gsap.to(s, {
          yPercent: -70 * SPOTS[i].d,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        }),
      );
      return () => {
        window.removeEventListener("resize", onResize);
        stop();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="relative flex flex-1 flex-col justify-center">
      <Headline />
      {shown.map((p, i) => (
        <Link
          key={p.photo}
          data-st
          href={`/brands/${p.brandSlug}`}
          tabIndex={-1}
          className="absolute z-30 block"
          style={{ display: "none" }}
        >
          <span className="block size-full">
            <span data-bob className="block size-full">
              <span className="block size-full" style={{ transform: `rotate(${SPOTS[i].r}deg)` }}>
                <Face p={p} />
              </span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ───────────────────────── 2. Orbit ───────────────────────── */

/**
 * The founders circle the line on a tilted ring, nearer ones larger and in
 * front, farther ones small and behind. It turns slowly on its own; swipe
 * sideways to spin it. Tap a founder in front to meet them.
 */
function Orbit({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGEllipseElement>(null);
  const go = useTransitionNav();
  const shown = people.slice(0, 10);

  useGSAP(
    () => {
      const el = root.current!;
      const items = [...el.querySelectorAll<HTMLElement>("[data-orb]")];
      const tags = items.map((it) => it.querySelector<HTMLElement>("[data-tag]"));
      const n = items.length;
      const still = reducedMotion();
      const tilt = (-11 * Math.PI) / 180;
      // spread grows the ring from the middle on arrival; fade brings it in.
      const s = { spread: still ? 1 : 0.15, fade: still ? 1 : 0 };
      let cx = 0;
      let cy = 0;
      let rx = 0;
      let ry = 0;
      const measure = () => {
        const r = el.getBoundingClientRect();
        cx = r.width / 2;
        cy = r.height / 2;
        rx = r.width * 0.43;
        ry = Math.min(r.height * 0.37, r.width * 0.6);
        const e = ring.current;
        if (!e) return;
        e.setAttribute("cx", String(cx));
        e.setAttribute("cy", String(cy));
        e.setAttribute("rx", String(rx));
        e.setAttribute("ry", String(ry));
        e.setAttribute("transform", `rotate(${(tilt * 180) / Math.PI} ${cx} ${cy})`);
      };
      let angle = 90;
      let spin = 0;
      const render = () => {
        items.forEach((it, i) => {
          const th = ((angle + (i * 360) / n) * Math.PI) / 180;
          const ex = rx * s.spread * Math.cos(th);
          const ey = ry * s.spread * Math.sin(th);
          const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
          const y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
          const depth = Math.sin(th); // -1 far … 1 near
          const k = (depth + 1) / 2;
          it.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(0.56 + 0.44 * k).toFixed(3)})`;
          it.style.zIndex = String(depth > 0 ? 30 + Math.round(k * 9) : 1 + Math.round(k * 9));
          it.style.opacity = ((0.4 + 0.6 * k) * s.fade).toFixed(3);
          const tg = tags[i];
          if (tg) tg.style.opacity = String(gsap.utils.clamp(0, 1, (depth - 0.45) / 0.4));
        });
      };
      measure();
      render();

      const auto = still ? 0 : 7; // degrees a second: one turn in under a minute
      const tick = (_t: number, ms: number) => {
        angle += ((auto + spin) * ms) / 1000;
        spin *= 0.94;
        render();
      };
      let live = false;
      const stop = watch(el, (on) => {
        if (on && !live) gsap.ticker.add(tick);
        if (!on && live) gsap.ticker.remove(tick);
        live = on;
      });

      // Sideways swipes spin the ring; up and down still scroll the page.
      const proxy = document.createElement("div");
      let lastX = 0;
      let lastT = 0;
      let v = 0;
      const [drag] = Draggable.create(proxy, {
        trigger: el,
        type: "x",
        allowNativeTouchScrolling: true,
        minimumMovement: 5,
        onPress() {
          lastX = this.x;
          lastT = performance.now();
          spin = 0;
          v = 0;
        },
        onDrag() {
          const now = performance.now();
          const dx = this.x - lastX;
          angle -= dx * 0.42;
          v = (-dx * 0.42 * 1000) / Math.max(1, now - lastT);
          lastX = this.x;
          lastT = now;
          if (still) render();
        },
        onRelease() {
          spin = gsap.utils.clamp(-420, 420, v);
        },
        onClick(e: Event) {
          const hit = (e.target as Element | null)?.closest<HTMLElement>("[data-orb]");
          if (hit?.dataset.slug && Number(hit.style.zIndex) >= 30) go?.(`/brands/${hit.dataset.slug}`);
        },
      });

      let timer = 0;
      const onResize = () => {
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          measure();
          render();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      // Arrival: the line rises, the ring draws in, the founders fan out from the middle.
      if (!still) {
        const tl = gsap
          .timeline({ paused: true, defaults: { ease: "expo.out" } })
          .from(el.querySelectorAll("[data-hline]"), { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.08 })
          .from(ring.current, { opacity: 0, duration: 1.2 }, 0.15)
          .to(s, { spread: 1, fade: 1, duration: 1.6 }, 0.2);
        whenReady(() => tl.play());
      }

      return () => {
        stop();
        if (live) gsap.ticker.remove(tick);
        drag.kill();
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root, dependencies: [go] },
  );

  return (
    <div ref={root} aria-hidden className="relative flex flex-1 touch-pan-y flex-col justify-center">
      <svg className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible">
        <ellipse ref={ring} fill="none" stroke="rgb(27 20 33 / 0.16)" strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
      <Headline small />
      {shown.map((p) => (
        <div key={p.photo} data-orb data-slug={p.brandSlug} className="absolute left-0 top-0 size-[76px] opacity-0 will-change-transform">
          <Face p={p} />
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── 3. Pile ───────────────────────── */

interface Body {
  n: HTMLElement;
  r: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  held: boolean;
}

const RADII = [44, 36, 40, 32, 46, 38, 34, 42, 36, 40, 32, 38];

/**
 * The founders drop in and pile up under the line, knocking into each other
 * as they land. Pick one up and throw it; tap one to meet them.
 */
function Pile({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const go = useTransitionNav();
  const shown = people.slice(0, RADII.length);

  useGSAP(
    () => {
      const el = box.current!;
      const nodes = [...el.querySelectorAll<HTMLElement>("[data-ball]")];
      let W = el.clientWidth;
      let H = el.clientHeight;
      const bodies: Body[] = nodes.map((n, i) => {
        const r = RADII[i];
        return {
          n,
          r,
          x: r + ((i * 131) % Math.max(1, W - 2 * r)),
          y: -r - 60 - i * 55,
          vx: ((i % 5) - 2) * 40,
          vy: 0,
          a: ((i * 37) % 40) - 20,
          va: 0,
          held: false,
        };
      });
      const G = 2600;
      const BOUNCE = 0.32;
      const step = (dt: number) => {
        for (const b of bodies) {
          if (b.held) continue;
          b.vy += G * dt;
          b.vx *= 0.999;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          // Faces wobble as they roll but always come back upright.
          b.va += -b.a * 9 * dt;
          b.va *= 0.97;
          b.a = gsap.utils.clamp(-38, 38, b.a + b.va * dt);
          if (b.x < b.r) [b.x, b.vx] = [b.r, -b.vx * BOUNCE];
          if (b.x > W - b.r) [b.x, b.vx] = [W - b.r, -b.vx * BOUNCE];
          if (b.y > H - b.r) {
            b.y = H - b.r;
            b.vy = -b.vy * BOUNCE;
            b.vx *= 0.92;
            b.va = (b.vx / b.r) * 57.3;
          }
        }
        for (let i = 0; i < bodies.length; i++)
          for (let j = i + 1; j < bodies.length; j++) {
            const p = bodies[i];
            const q = bodies[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d = Math.hypot(dx, dy);
            const min = p.r + q.r;
            if (d >= min || d === 0) continue;
            const nx = dx / d;
            const ny = dy / d;
            const wp = p.held ? 0 : 1;
            const wq = q.held ? 0 : 1;
            const w = wp + wq || 1;
            const push = (min - d) / w;
            p.x -= nx * push * wp;
            p.y -= ny * push * wp;
            q.x += nx * push * wq;
            q.y += ny * push * wq;
            const rv = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
            if (rv < 0) {
              const imp = (-(1 + BOUNCE) * rv) / w;
              p.vx -= imp * nx * wp;
              p.vy -= imp * ny * wp;
              q.vx += imp * nx * wq;
              q.vy += imp * ny * wq;
              const slide = (q.vx - p.vx) * -ny + (q.vy - p.vy) * nx;
              p.va -= slide * 0.4 * wp;
              q.va += slide * 0.4 * wq;
            }
          }
      };
      const draw = () => {
        for (const b of bodies)
          b.n.style.transform = `translate3d(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px, 0) rotate(${b.a.toFixed(1)}deg)`;
      };

      let started = false;
      let running = false;
      let quiet = 0;
      const tick = (_t: number, ms: number) => {
        const dt = Math.min(ms, 32) / 1000 / 3;
        for (let k = 0; k < 3; k++) step(dt);
        draw();
        const moving = bodies.some((b) => b.held || Math.hypot(b.vx, b.vy) > 14);
        quiet = moving ? 0 : quiet + 1;
        if (quiet > 45) sleep();
      };
      function wake() {
        if (!started) return;
        quiet = 0;
        if (!running) gsap.ticker.add(tick);
        running = true;
      }
      function sleep() {
        if (running) gsap.ticker.remove(tick);
        running = false;
      }

      if (reducedMotion()) {
        // Let the pile settle out of sight, then show it at rest.
        for (let k = 0; k < 1200; k++) step(1 / 240);
        draw();
      } else {
        draw();
        whenReady(() => {
          gsap.from(root.current!.querySelectorAll("[data-hline]"), {
            yPercent: 70,
            opacity: 0,
            duration: 1.1,
            stagger: 0.08,
            ease: "expo.out",
          });
          gsap.delayedCall(0.35, () => {
            started = true;
            wake();
          });
        });
      }

      // Pick one up and throw it; a tap (barely any movement) opens their page.
      let held: Body | null = null;
      let ox = 0;
      let oy = 0;
      let lx = 0;
      let ly = 0;
      let lt = 0;
      let travel = 0;
      const local = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top] as const;
      };
      const down = (e: PointerEvent) => {
        const node = (e.target as Element).closest<HTMLElement>("[data-ball]");
        const b = bodies.find((x) => x.n === node);
        if (!node || !b) return;
        e.preventDefault();
        node.setPointerCapture(e.pointerId);
        const [x, y] = local(e);
        held = b;
        b.held = true;
        b.vx = 0;
        b.vy = 0;
        ox = b.x - x;
        oy = b.y - y;
        lx = x;
        ly = y;
        lt = performance.now();
        travel = 0;
        node.style.zIndex = "40";
        started = true;
        wake();
      };
      const move = (e: PointerEvent) => {
        if (!held) return;
        const [x, y] = local(e);
        const now = performance.now();
        const dt = Math.max(1, now - lt) / 1000;
        held.vx = (x - lx) / dt;
        held.vy = (y - ly) / dt;
        travel += Math.hypot(x - lx, y - ly);
        held.x = gsap.utils.clamp(held.r, W - held.r, x + ox);
        held.y = gsap.utils.clamp(-H, H - held.r, y + oy);
        lx = x;
        ly = y;
        lt = now;
      };
      const up = () => {
        if (!held) return;
        const b = held;
        held = null;
        b.held = false;
        b.vx = gsap.utils.clamp(-2400, 2400, b.vx);
        b.vy = gsap.utils.clamp(-2400, 2400, b.vy);
        b.n.style.zIndex = "";
        if (travel < 6 && b.n.dataset.slug) go?.(`/brands/${b.n.dataset.slug}`);
        wake();
      };
      el.addEventListener("pointerdown", down);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);

      const stop = watch(el, (on) => (on ? wake() : sleep()));
      const onResize = () => {
        W = el.clientWidth;
        H = el.clientHeight;
        wake();
      };
      window.addEventListener("resize", onResize);
      return () => {
        sleep();
        stop();
        el.removeEventListener("pointerdown", down);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: root, dependencies: [go] },
  );

  return (
    <div ref={root} aria-hidden className="relative flex flex-1 flex-col pt-6">
      <Headline />
      <div ref={box} className="relative z-30 mt-4 min-h-[300px] flex-1 touch-pan-y">
        {shown.map((p, i) => (
          <div
            key={p.photo}
            data-ball
            data-slug={p.brandSlug}
            className="absolute left-0 top-0 cursor-grab touch-none will-change-transform active:cursor-grabbing"
            style={{ width: RADII[i] * 2, height: RADII[i] * 2, transform: "translate3d(0, -200vh, 0)" }}
          >
            <Face p={p} tag={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── 4. Drift ───────────────────────── */

/**
 * Rows of founders glide past above and below the line, each row its own
 * speed and direction, like the faces in the footer. Tap one to meet them.
 */
function Drift({ people }: { people: HeroPerson[] }) {
  const root = useRef<HTMLDivElement>(null);
  const turn = (k: number) => [...people.slice(k), ...people.slice(0, k)];

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .from(q("[data-row]"), { opacity: 0, x: (i: number) => (i % 2 ? 80 : -80), duration: 1.4, stagger: 0.08 })
        .from(q("[data-hline]"), { yPercent: 70, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.15);
      whenReady(() => tl.play());
    },
    { scope: root },
  );

  const row = (k: number, size: number, seconds: number, reverse: boolean) => (
    <div data-row className="overflow-hidden py-3">
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[0, 1].map((copy) =>
          turn(k).map((p, i) => (
            <Link
              key={`${copy}-${p.photo}`}
              href={`/brands/${p.brandSlug}`}
              tabIndex={-1}
              className="mx-2.5 block shrink-0"
              style={{ width: size, height: size, transform: `rotate(${(i % 2 ? 1 : -1) * (3 + (i % 3))}deg)` }}
            >
              <Face p={p} />
            </Link>
          )),
        )}
      </div>
    </div>
  );

  return (
    <div ref={root} aria-hidden className="relative flex flex-1 flex-col justify-center gap-1">
      {row(0, 62, 70, false)}
      {row(3, 78, 84, true)}
      <Headline className="my-5" />
      {row(6, 74, 78, false)}
      {row(9, 60, 66, true)}
    </div>
  );
}
