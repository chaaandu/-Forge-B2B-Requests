import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { NO_FILTERS } from "@/lib/filters";
import { firstNames, foundersOf } from "@/lib/founders";
import { getImpact } from "@/lib/impact";
import { getReels } from "@/lib/reels";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { TeamLineup } from "@/components/team-lineup";
import { CountUp } from "@/components/motion/count-up";
import { SplitReveal, Stagger } from "@/components/motion/reveal";
import { Reels } from "@/components/home/reels";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getCatalog()).brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = (await getCatalog()).brand((await params).slug);
  if (!b) return {};
  const people = foundersOf(b.teamCode);
  return { title: b.name, description: `${b.name}: ${b.tagline}. Started by ${firstNames(people)} in Forge at Mesa School of Business.` };
}

export default async function BrandPage({ params }: { params: Params }) {
  const catalog = await getCatalog();
  const brand = catalog.brand((await params).slug);
  if (!brand) notFound();
  const items = catalog.listingsOf(brand.slug);
  const people = foundersOf(brand.teamCode);
  const [impact, reels] = await Promise.all([getImpact([brand.teamCode]), getReels()]);
  const sold = impact.byTeam[brand.teamCode];
  const theirReels = reels
    .filter((r) => r.teamCode === brand.teamCode)
    .map((r) => ({ video: r.video, poster: r.poster, brand: brand.name, brandSlug: brand.slug }));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-[1500px] gap-10 px-5 pb-10 pt-6 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-end">
          <div className="pb-6 lg:pb-20">
            <Link href="/brands" className="inline-flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-ink">
              <ChevronLeft className="size-3.5" /> All founders
            </Link>
            <SplitReveal as="h1" immediate className="font-display mt-4 text-[clamp(3.5rem,9vw,9rem)] leading-[0.86] text-ink">
              {brand.name}
            </SplitReveal>
            <p className="font-display-straight mt-6 max-w-xl text-[clamp(1.4rem,2.2vw,2rem)] leading-snug text-ink/75">
              {people.length ? (
                <>
                  <span className="block">
                    Started by <span className="text-ink">{firstNames(people)}</span>.
                  </span>
                  <span className="block">{brand.tagline.replace(/\.$/, "")}.</span>
                </>
              ) : (
                brand.tagline
              )}
            </p>
            {/* Their numbers as one strip, not three posters: they read at a glance
                and leave the squad above the fold on a phone. */}
            <dl className="mt-8 flex max-w-xl divide-x divide-ink/10 rounded-[24px] bg-paper-2/80 py-4 sm:mt-10 sm:py-5">
              {sold && sold.revenue > 0 && (
                <div className="flex min-w-0 flex-[1.35] flex-col px-4 first:pl-5 sm:px-6 sm:first:pl-7">
                  <dt className="order-2 mt-1.5 text-xs leading-snug text-ink/55 sm:text-sm">sold so far</dt>
                  <dd className="font-display order-1 text-[clamp(1.4rem,6vw,2.6rem)] leading-none text-royal">
                    <CountUp value={sold.revenue} prefix="₹" />
                  </dd>
                </div>
              )}
              {sold && sold.units > 0 && (
                <div className="flex min-w-0 flex-1 flex-col px-4 first:pl-5 sm:px-6 sm:first:pl-7">
                  <dt className="order-2 mt-1.5 text-xs leading-snug text-ink/55 sm:text-sm">products out in the world</dt>
                  <dd className="font-display order-1 text-[clamp(1.4rem,6vw,2.6rem)] leading-none text-ink">
                    <CountUp value={sold.units} />
                  </dd>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col px-4 first:pl-5 sm:px-6 sm:first:pl-7">
                <dt className="order-2 mt-1.5 text-xs leading-snug text-ink/55 sm:text-sm">ready to gift</dt>
                <dd className="font-display order-1 text-[clamp(1.4rem,6vw,2.6rem)] leading-none text-ink">{items.length}</dd>
              </div>
            </dl>
            {(brand.website || brand.instagram) && (
              <p className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-4 py-2 hover:border-ink"
                  >
                    Website <ArrowUpRight className="size-3.5" />
                  </a>
                )}
                {brand.instagram && (
                  <a
                    href={brand.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-ink/15 px-4 py-2 hover:border-ink"
                  >
                    Instagram <ArrowUpRight className="size-3.5" />
                  </a>
                )}
              </p>
            )}
          </div>
          {people.length > 0 && (
            <Stagger selector="figure" className="@container relative sm:pb-12">
              <div aria-hidden className="absolute inset-x-[6%] bottom-8 top-[16%] rounded-t-full bg-orchid-soft sm:bottom-12" />
              <TeamLineup people={people} names sizes="(min-width: 1024px) 320px, 40vw" fit="250px" className="relative pt-6" />
            </Stagger>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pt-16 sm:px-8">
        <SplitReveal className="font-display mb-8 text-[clamp(2.6rem,6vw,6rem)] leading-[0.9] text-ink">
          What they <em className="text-royal">make.</em>
        </SplitReveal>
        <CatalogueBrowser scope="brand" listings={items} brands={[brand]} initial={NO_FILTERS} />
      </section>
      {theirReels.length > 0 && <Reels reels={theirReels} />}
    </>
  );
}
