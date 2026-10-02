import Image from "next/image";
import Link from "@/components/link";
import { getCatalog } from "@/lib/catalog";
import { allFounders } from "@/lib/founders";
import { SplitReveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { Roll } from "./header";
import { KineticWord } from "./kinetic-word";
import { BackToTop } from "./back-to-top";

const PAGES = [
  { href: "/catalogue", label: "Store" },
  { href: "/brands", label: "Founders" },
  { href: "/request", label: "Gift list" },
];

const MESA = [
  { href: "https://fb.mesaschool.co.in/live", label: "Live leaderboard" },
  { href: "https://mesaschool.co", label: "mesaschool.co" },
];

/**
 * Four beats and nothing else: the ask, the people, where to go next, and
 * the sign-off. The faces run past at the pace you scroll; the sign-off
 * leans toward your pointer.
 */
export async function Footer() {
  const catalog = await getCatalog();
  const codes = new Set(catalog.brands.map((b) => b.teamCode));
  const faces = allFounders().filter((f) => codes.has(f.teamCode));

  return (
    <footer className="relative mt-32 overflow-hidden rounded-t-[40px] bg-aubergine-2 text-paper sm:rounded-t-[64px]">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 size-[620px] rounded-full bg-violet/25 blur-[140px]" />

      <div className="relative mx-auto flex max-w-[1500px] flex-col gap-10 px-5 pt-24 sm:px-8 sm:pt-32 lg:flex-row lg:items-end lg:justify-between">
        <SplitReveal className="font-display max-w-5xl text-[clamp(3.2rem,9vw,9rem)] leading-[0.9]">
          Gift like it <em className="text-orchid">matters.</em>
        </SplitReveal>
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4 lg:pb-5">
          <Magnetic>
            <Link
              href="/catalogue"
              data-cursor="Go"
              className="group inline-flex whitespace-nowrap rounded-full bg-orchid px-5 py-3.5 text-[15px] font-semibold text-aubergine transition-colors hover:bg-paper sm:px-8 sm:py-5 sm:text-base"
            >
              <Roll>Start gifting</Roll>
            </Link>
          </Magnetic>
          <Link
            href="/brands"
            className="group inline-flex whitespace-nowrap rounded-full border border-paper/25 px-5 py-3.5 text-[15px] font-semibold transition hover:border-paper sm:px-8 sm:py-5 sm:text-base"
          >
            <Roll>Meet the founders</Roll>
          </Link>
        </div>
      </div>

      <VelocityMarquee speed={28} className="relative mt-20 overflow-hidden border-y border-paper/10 py-5">
        {faces.map((f) => (
          <span key={f.photo} className="relative mx-1.5 size-14 shrink-0 overflow-hidden rounded-full bg-paper/10" title={f.name}>
            <Image src={f.photo} alt="" fill sizes="56px" className="object-cover object-top" />
          </span>
        ))}
      </VelocityMarquee>

      <nav
        aria-label="Footer"
        className="relative mx-auto flex max-w-[1500px] items-end justify-between gap-8 px-5 pb-4 pt-14 sm:px-8 sm:pt-20"
      >
        <ul>
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="group font-display inline-flex text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] transition-colors hover:text-orchid"
              >
                <Roll>{p.label}</Roll>
              </Link>
            </li>
          ))}
        </ul>
        <ul className="space-y-2.5 pb-2 text-right text-sm font-semibold text-paper/60">
          {MESA.map((m) => (
            <li key={m.href}>
              <a href={m.href} target="_blank" rel="noreferrer" className="whitespace-nowrap transition-colors hover:text-orchid">
                {m.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative px-2 pb-4 pt-6">
        <KineticWord text="made by founders" className="text-center text-[13.4vw] leading-[1.05] text-paper/90" />
      </div>

      <div className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 pb-[calc(1.5rem+var(--dock,0px))] pt-6 text-xs text-paper/45 sm:px-8 sm:pb-6">
          <p>© {new Date().getFullYear()} Mesa School of Business</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
