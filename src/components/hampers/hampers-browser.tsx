"use client";

import { useCallback, useEffect, useState } from "react";
import { HAMPERS, rupees, TIERS, tierOf, hamperBySlug } from "@/lib/hampers";
import { getLenis } from "@/components/motion/smooth-scroll";
import { reducedMotion, ScrollTrigger } from "@/components/motion/gsap";
import { SplitReveal, Stagger } from "@/components/motion/reveal";
import { BuildCard, HamperCard } from "./hamper-card";
import { HamperDetail } from "./hamper-detail";
import { HamperBuilder } from "./hamper-builder";
import { HamperStrip } from "./hamper-strip";

type Open = { kind: "hamper"; slug: string } | { kind: "build"; amount: number } | null;

/** `#hamper-7` opens hamper 7, `#build-1500` the ₹1,500 builder: links from the home page and the gift list land on them. */
const fromHash = (hash: string): Open => {
  const h = hash.replace(/^#/, "");
  if (hamperBySlug(h)) return { kind: "hamper", slug: h };
  const m = /^build-(\d+)$/.exec(h);
  if (m && tierOf(Number(m[1]))) return { kind: "build", amount: Number(m[1]) };
  return null;
};

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -88 });
  else el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
};

/**
 * Every shelf in turn (who it's for, at one budget): its three ready-made
 * hampers and, fourth, build your own from the same picks. The shop windows
 * up top filter to one shelf, in place, like the store's.
 */
export function HampersBrowser({ photos }: { photos: Record<string, string | null> }) {
  const [open, setOpen] = useState<Open>(null);
  const [shelf, setShelf] = useState<number | null>(null);

  // A shared `?for=1500` lands on that shelf. Read here, not on the server, so the page stays static.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("for"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the address
    if (tierOf(n)) setShelf(n);
  }, []);

  const choose = (amount: number | null) => {
    setShelf(amount);
    history.replaceState(null, "", window.location.pathname + (amount ? `?for=${amount}` : ""));
  };

  // The page got shorter or longer: everything scroll-driven below measures again.
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 60);
    return () => clearTimeout(t);
  }, [shelf]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const sync = () => {
      const hash = window.location.hash.replace(/^#/, "");
      const next = fromHash(hash);
      if (next) {
        setOpen(next);
        // A link to a hamper on another shelf shows every shelf, so it's there behind the dialog.
        setShelf((s) => (s && s !== (next.kind === "build" ? next.amount : hamperBySlug(next.slug)!.amount) ? null : s));
      }
      const target = next ? (next.kind === "hamper" ? next.slug : `build-${next.amount}`) : /^t-\d+$/.test(hash) ? hash : null;
      // After the page has settled at the top, where a new page starts.
      if (target) t = setTimeout(() => scrollToId(target), 200);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const show = (next: Open) => {
    setOpen(next);
    if (next) history.replaceState(null, "", next.kind === "hamper" ? `#${next.slug}` : `#build-${next.amount}`);
  };
  const close = useCallback(() => {
    setOpen(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  const hamper = open?.kind === "hamper" ? hamperBySlug(open.slug) : undefined;
  const tier = open?.kind === "build" ? tierOf(open.amount) : undefined;

  return (
    <>
      <HamperStrip active={shelf} onSelect={choose} />

      <div className="mt-10 space-y-24 sm:space-y-28">
        {TIERS.filter((t) => !shelf || t.amount === shelf).map((t) => (
          <section
            key={t.amount}
            id={`t-${t.amount}`}
            aria-label={`${t.label} hampers, ${rupees(t.amount)}`}
            className="scroll-mt-24 border-t border-ink/10 pt-10"
          >
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <SplitReveal className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9] text-ink">
                {t.title}, <em className="text-royal">{rupees(t.amount)}.</em>
              </SplitReveal>
              <p className="max-w-xs text-ink/60">{t.blurb}</p>
            </div>
            <Stagger className="grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-5 lg:grid-cols-4">
              {t.hampers.map((h) => (
                <HamperCard
                  key={h.slug}
                  hamper={h}
                  priority={h.no === HAMPERS[0].no}
                  onOpen={() => show({ kind: "hamper", slug: h.slug })}
                />
              ))}
              <BuildCard tier={t} photos={photos} onOpen={() => show({ kind: "build", amount: t.amount })} />
            </Stagger>
          </section>
        ))}
      </div>

      {hamper && <HamperDetail key={hamper.slug} hamper={hamper} photos={photos} onClose={close} />}
      {tier && <HamperBuilder key={tier.amount} tier={tier} photos={photos} onClose={close} />}
    </>
  );
}
