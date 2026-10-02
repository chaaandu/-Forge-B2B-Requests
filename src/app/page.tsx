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

// Must be a literal for Next to read it; matches REFRESH_SECONDS in lib/catalog.
export const revalidate = 600;

/**
 * Not a shop with a cause attached — a cause you can buy from. The page
 * argues first (who made these, why it matters, what your budget does) and
 * sells second, and every product it shows carries the faces of its makers.
 */
export default async function Home() {
  const catalog = await getCatalog();
  const brandByCode = new Map(catalog.brands.map((b) => [b.teamCode, b]));
  const [impact, reels] = await Promise.all([getImpact(catalog.brands.map((b) => b.teamCode)), getReels()]);

  // Ventures by what they've sold, so the faces up front are the ones with the most to show.
  const byRevenue = [...catalog.brands].sort(
    (a, b) => (impact.byTeam[b.teamCode]?.revenue ?? 0) - (impact.byTeam[a.teamCode]?.revenue ?? 0),
  );

  const wall = allFounders()
    .filter((f) => brandByCode.has(f.teamCode))
    .map((f) => {
      const b = brandByCode.get(f.teamCode)!;
      return { name: f.name, photo: f.photo, brand: b.name, brandSlug: b.slug };
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

  const star = byRevenue.find((b) => foundersOf(b.teamCode).length >= 2) ?? byRevenue[0];
  const journey = {
    products: hampers.slice(0, 3).map((l) => l.images[0]),
    team: foundersOf(star.teamCode)
      .slice(0, 3)
      .map((f) => ({ name: f.name, photo: f.photo })),
    teamBrand: star.name,
    teamEarned: impact.byTeam[star.teamCode]?.revenue ?? 0,
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
      <Hero faces={heroFaces} founders={wall.length} brands={catalog.totals.brands} earned={impact.revenue} units={impact.units} />

      {/* brand marquee */}
      <div className="overflow-hidden border-y border-ink/10 py-6">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...catalog.brands, ...catalog.brands].map((b, i) => (
            <Link
              key={i}
              href={`/brands/${b.slug}`}
              className="font-display flex items-center gap-12 text-4xl italic text-ink/70 hover:text-royal"
            >
              {b.name}
              <span aria-hidden className="text-orchid">
                ✺
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Manifesto
        faces={[wall[4]?.photo, wall[40]?.photo].filter(Boolean) as string[]}
        products={hampers.slice(0, 1).map((l) => l.images[0])}
      />

      <FounderWall faces={wall} />

      <Journey data={journey} />

      <section className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] text-ink">
            Gift <em className="text-royal">hampers.</em>
          </SplitReveal>
          <p className="max-w-sm text-lg leading-snug text-ink/65">
            Ready-made boxes, the quickest way to gift a whole team.{" "}
            <Link href="/catalogue?collection=hampers" className="font-semibold text-violet underline-offset-4 hover:underline">
              All {hampers.length} →
            </Link>
          </p>
        </div>
        <ListingRail listings={hampers.slice(0, 14)} brands={catalog.brands} />
      </section>

      <ImpactCalculator cohortLast7={impact.last7} cohortTotal={impact.revenue} />

      <CategoryIndex rows={rows} />

      <Reels reels={reelCards} />
    </>
  );
}
