import Image from "next/image";
import Link from "@/components/link";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { allFounders } from "@/lib/founders";
import { getImpact } from "@/lib/impact";
import { SplitReveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { Roll } from "./header";
import { KineticWord } from "./kinetic-word";
import { BackToTop } from "./back-to-top";
import { Lockup } from "./lockup";

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

export async function Footer() {
  const catalog = await getCatalog();
  const impact = await getImpact(catalog.brands.map((b) => b.teamCode));
  const codes = new Set(catalog.brands.map((b) => b.teamCode));
  const faces = allFounders().filter((f) => codes.has(f.teamCode));
  const topBrands = [...catalog.brands]
    .sort((a, b) => (impact.byTeam[b.teamCode]?.revenue ?? 0) - (impact.byTeam[a.teamCode]?.revenue ?? 0))
    .slice(0, 6);

  return (
    <footer className="relative mt-32 overflow-hidden rounded-t-[40px] bg-aubergine-2 text-paper sm:rounded-t-[64px]">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-0 size-[620px] rounded-full bg-violet/25 blur-[140px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 pt-24 sm:px-8 sm:pt-32">
        <SplitReveal className="font-display max-w-5xl text-[clamp(3.2rem,9vw,9rem)] leading-[0.9]">
          Gift like it <em className="text-orchid">matters.</em>
        </SplitReveal>
        <div className="mt-10 flex items-center gap-2.5 sm:gap-4">
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

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-2 gap-x-6 gap-y-12 px-5 py-16 text-sm sm:px-8 sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Lockup tone="dark" />
          <p className="mt-6 max-w-sm leading-relaxed text-paper/60">
            {faces.length} founders, {catalog.totals.brands} first companies, all started in Forge, the venture-building year at Mesa School
            of Business. Every order is real revenue.
          </p>
          {impact.revenue > 0 && (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
              <div>
                <dd className="font-display text-3xl text-orchid">{inr(impact.revenue)}</dd>
                <dt className="mt-1 text-sm text-paper/50">earned so far</dt>
              </div>
              <div>
                <dd className="font-display text-3xl text-paper">{impact.units.toLocaleString("en-IN")}</dd>
                <dt className="mt-1 text-sm text-paper/50">products sold</dt>
              </div>
            </dl>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-paper">Shop</h3>
          <ul className="mt-4 space-y-2.5 text-paper/60">
            {COLLECTIONS.map((c) => (
              <li key={c.id}>
                <Link href={`/catalogue?collection=${c.id}`} className="hover:text-orchid">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-paper">Top sellers</h3>
          <ul className="mt-4 space-y-2.5 text-paper/60">
            {topBrands.map((b) => (
              <li key={b.slug}>
                <Link href={`/brands/${b.slug}`} className="hover:text-orchid">
                  {b.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/brands" className="font-semibold text-paper hover:text-orchid">
                All {catalog.totals.brands} founders
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-paper">Mesa</h3>
          <ul className="mt-4 space-y-2.5 text-paper/60">
            <li>
              <a href="https://fb.mesaschool.co.in/live" target="_blank" rel="noreferrer" className="hover:text-orchid">
                Live leaderboard ↗
              </a>
            </li>
            <li>
              <a href="https://mesaschool.co" target="_blank" rel="noreferrer" className="hover:text-orchid">
                mesaschool.co ↗
              </a>
            </li>
            <li>
              <Link href="/request" className="hover:text-orchid">
                Your gift list
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative px-2 pb-6">
        <KineticWord text="made by founders" className="text-center text-[13.4vw] leading-[1.05] text-paper/90" />
      </div>

      <div className="relative border-t border-paper/10">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-6 text-xs text-paper/45 sm:px-8">
          <p>© {new Date().getFullYear()} Mesa School of Business</p>
          <p>Retail prices shown. Bulk pricing on the call.</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
