import Link from "@/components/link";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { allFounders, foundersOf } from "@/lib/founders";
import { getImpact } from "@/lib/impact";
import { getReels } from "@/lib/reels";
import { Hero } from "@/components/home/hero";
import { Manifesto } from "@/components/home/manifesto";
import { FounderWall } from "@/components/home/founder-wall";
import { Journey } from "@/components/home/journey";
import { ImpactCalculator } from "@/components/home/impact-calculator";
import { CategoryIndex } from "@/components/home/category-index";
import { Reels } from "@/components/home/reels";
import { ListingRail } from "@/components/home/listing-rail";
import { SplitReveal } from "@/components/motion/reveal";
import { VelocityMarquee } from "@/components/motion/velocity-marquee";
import { Roll } from "@/components/layout/header";
import { PRICE_BANDS, inBand } from "@/lib/price-bands";

// Must be a literal for Next to read it; matches REFRESH_SECONDS in lib/catalog.
export const revalidate = 600;

/**
 * Not a shop with a cause attached: a cause you can buy from. The page
 * argues first (who made these, why it matters, what your budget does) and
 * sells second, and every product it shows carries the faces of its makers.
 */
export default async function Home() {
  const catalog = await getCatalog();
  const brandByCode = new Map(catalog.brands.map((b) => [b.teamCode, b]));
  const [impact, reels] = await Promise.all([getImpact(catalog.brands.map((b) => b.teamCode)), getReels()]);
  const sold = (code: string) => impact.byTeam[code]?.revenue ?? 0;

  // Ventures by what they've sold, so the faces up front are the ones with the most to show.
  const byRevenue = [...catalog.brands].sort((a, b) => sold(b.teamCode) - sold(a.teamCode));

  const wall = allFounders()
    .filter((f) => brandByCode.has(f.teamCode))
    .map((f) => {
      const b = brandByCode.get(f.teamCode)!;
      return { name: f.name, photo: f.photo, brand: b.name, brandSlug: b.slug, teamCode: f.teamCode, sold: sold(f.teamCode) };
    });

  const heroFaces = byRevenue
    .flatMap((b) =>
      foundersOf(b.teamCode)
        .slice(0, 1)
        .map((f) => ({ name: f.name, photo: f.photo, brand: b.name, brandSlug: b.slug })),
    )
    .slice(0, 8);

  const hampers = catalog
    .listingsIn("hampers")
    .filter((l) => l.images.length)
    .sort((a, b) => Number(/hamper|gift box/i.test(b.title)) - Number(/hamper|gift box/i.test(a.title)));

  // The journey's example: a real list of real hampers, a real squad, the real top five.
  const star = byRevenue.find((b) => foundersOf(b.teamCode).length === 3) ?? byRevenue[0];
  const listItems = hampers.slice(0, 4);
  const listTeams = [...new Set(listItems.map((l) => catalog.brand(l.brand)!.teamCode))];
  const board = byRevenue.slice(0, 5).map((b) => ({ brand: b.name, revenue: sold(b.teamCode) }));
  const journey = {
    list: listItems.map((l, i) => ({
      title: l.title,
      brand: catalog.brand(l.brand)!.name,
      image: l.images[0],
      qty: [150, 150, 60, 25][i] ?? 50,
    })),
    backing: listTeams.flatMap((t) => foundersOf(t).map((f) => f.photo)).slice(0, 7),
    backingCount: listTeams.reduce((n, t) => n + foundersOf(t).length, 0),
    team: foundersOf(star.teamCode),
    teamBrand: star.name,
    board,
    boosted: board.length - 1,
    order: 150000,
  };

  const rows = COLLECTIONS.map((c) => {
    const items = catalog.listingsIn(c.id);
    return {
      id: c.id,
      name: c.name,
      blurb: c.blurb,
      icon: c.icon,
      count: items.length,
      image: items.find((l) => l.images[0])?.images[0] ?? null,
    };
  });

  const reelCards = reels
    .filter((r) => brandByCode.has(r.teamCode))
    .slice(0, 14)
    .map((r) => ({
      video: r.video,
      poster: r.poster,
      brand: brandByCode.get(r.teamCode)!.name,
      brandSlug: brandByCode.get(r.teamCode)!.slug,
    }));

  return (
    <>
      <Hero faces={heroFaces} founders={wall.length} brands={catalog.totals.brands} earned={impact.revenue} />

      <VelocityMarquee speed={60} className="overflow-hidden border-y border-ink/10 py-6">
        {catalog.brands.map((b) => (
          <Link
            key={b.slug}
            href={`/brands/${b.slug}`}
            className="font-display flex shrink-0 items-center gap-10 pr-10 text-4xl italic text-ink/70 hover:text-royal"
          >
            {b.name}
            <span aria-hidden className="not-italic text-orchid">
              ✺
            </span>
          </Link>
        ))}
      </VelocityMarquee>

      <Manifesto
        faces={[wall[4]?.photo, wall[40]?.photo].filter(Boolean) as string[]}
        products={hampers.slice(0, 1).map((l) => l.images[0])}
      />

      <FounderWall faces={wall} />

      <Journey data={journey} />

      <section className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9] text-ink">
            Hampers, <em className="text-royal">sorted.</em>
          </SplitReveal>
          <div className="max-w-sm">
            <p className="text-lg leading-snug text-ink/65">Ready-made boxes. Zero effort, full credit.</p>
            <Link href="/catalogue?collection=hampers" className="group mt-3 inline-flex text-sm font-semibold text-violet">
              <Roll>{`See all ${hampers.length}`}</Roll>
            </Link>
          </div>
        </div>
        <ListingRail listings={hampers.slice(0, 14)} brands={catalog.brands} />
      </section>

      <div className="mt-28">
        <ImpactCalculator cohortLast7={impact.last7} cohortTotal={impact.revenue} founders={wall.length} />
      </div>

      <CategoryIndex rows={rows} />

      <section className="mx-auto max-w-[1500px] px-5 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SplitReveal className="font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.9] text-ink">
            Shop by <em className="text-royal">budget.</em>
          </SplitReveal>
          <p className="max-w-xs text-ink/60">Retail price per gift. Bulk orders land lower.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PRICE_BANDS.map((b) => (
            <Link
              key={b.id}
              href={`/catalogue?price=${b.id}`}
              data-cursor="Shop"
              className="group relative flex aspect-[1.5] flex-col justify-between overflow-hidden rounded-[28px] bg-paper-2 p-5 transition-colors duration-500 hover:bg-ink hover:text-paper sm:p-7"
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink/45 transition-colors group-hover:text-orchid">
                {catalog.listings.filter((l) => inBand(l.priceFromMinor, b.id)).length} gifts
              </span>
              <span className="font-display text-[clamp(1.7rem,3vw,3rem)] leading-none">{b.short}</span>
            </Link>
          ))}
        </div>
      </section>

      <Reels reels={reelCards} />
    </>
  );
}
