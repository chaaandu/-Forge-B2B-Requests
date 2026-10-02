import type { Metadata } from "next";
import Link from "@/components/link";
import { getCatalog, getCollection } from "@/lib/catalog";
import { firstNames, foundersOf } from "@/lib/founders";
import { getImpact } from "@/lib/impact";
import { TeamLineup } from "@/components/team-lineup";
import { SplitReveal, Stagger } from "@/components/motion/reveal";

export const metadata: Metadata = { title: "The founders" };
export const revalidate = 600;

const TINTS = ["bg-orchid-soft", "bg-paper-2", "bg-mist-2", "bg-paper-3"];
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
          Every team here started a company this year in Forge, Mesa&apos;s venture-building programme. They source, make, price and sell
          everything themselves. A bulk order from you is real revenue for one of them.
        </p>
      </div>

      <Stagger className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b, i) => {
          const people = foundersOf(b.teamCode);
          const sold = impact.byTeam[b.teamCode]?.revenue ?? 0;
          return (
            <Link key={b.slug} href={`/brands/${b.slug}`} data-cursor="Meet" className="group block">
              <div
                className={`relative overflow-hidden rounded-[32px] ${TINTS[i % TINTS.length]} px-6 pt-10 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rounded-[48px]`}
              >
                <TeamLineup
                  people={people}
                  names={false}
                  sizes="220px"
                  className="transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
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
