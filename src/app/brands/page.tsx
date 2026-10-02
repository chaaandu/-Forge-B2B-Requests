import type { Metadata } from "next";
import Link from "@/components/link";
import { getCatalog, getCollection } from "@/lib/catalog";
import { firstNames, foundersOf } from "@/lib/founders";
import { getImpact } from "@/lib/impact";
import { TeamLineup } from "@/components/team-lineup";
import { SplitReveal, Stagger } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "The founders" };
export const revalidate = 600;

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

export default async function BrandsPage() {
  const catalog = await getCatalog();
  const impact = await getImpact(catalog.brands.map((b) => b.teamCode));
  const brands = [...catalog.brands].sort((a, b) => a.name.localeCompare(b.name));
  const founders = brands.reduce((n, b) => n + foundersOf(b.teamCode).length, 0);

  return (
    <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
      <div className="grid gap-8 pb-16 pt-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <SplitReveal as="h1" immediate className="font-display text-[clamp(3.5rem,9vw,9rem)] leading-[0.86] text-ink">
          {founders} founders. <em className="text-royal">{brands.length} first companies.</em>
        </SplitReveal>
        <p className="max-w-md text-lg leading-snug text-ink/65 lg:justify-self-end">
          Each squad started a company this year in Forge, Mesa&apos;s venture-building year. They source it, make it, price it and sell it.
          Your order is real revenue.
        </p>
      </div>

      <Stagger className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const people = foundersOf(b.teamCode);
          const sold = impact.byTeam[b.teamCode]?.revenue ?? 0;
          return (
            <Link key={b.slug} href={`/brands/${b.slug}`} data-cursor="Meet" className="group block">
              {/* One person width for every card (a share of the card's own width), so every
                  head is the same size whether the squad is two or four. */}
              <div className="@container relative overflow-hidden rounded-[32px] bg-orchid-soft transition-colors duration-500 group-hover:bg-orchid">
                <div className="flex aspect-[1.9] items-end justify-center pt-[6%]">
                  <TeamLineup people={people} hop sizes="200px" className="[--person:31cqw]" />
                </div>
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-3xl leading-none text-ink">{b.name}</h2>
                  <p className="mt-2 text-sm text-ink/60">by {firstNames(people) || "the team"}</p>
                </div>
                {sold > 0 && (
                  <p className="shrink-0 text-right">
                    <span className="font-display block text-xl text-royal">{inr(sold)}</span>
                    <span className="text-[11px] uppercase tracking-[0.15em] text-ink/45">sold so far</span>
                  </p>
                )}
              </div>
              <p className="mt-1 text-sm text-ink/45">
                {b.tagline} · {getCollection(b.collection)?.name}
              </p>
            </Link>
          );
        })}
      </Stagger>
    </div>
  );
}
