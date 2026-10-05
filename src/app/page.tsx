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

  const hampers = catalog
    .listingsIn("hampers")
    .filter((l) => l.images.length)
    .sort((a, b) => Number(/hamper|gift box/i.test(b.title)) - Number(/hamper|gift box/i.test(a.title)));

  // The wall the camera pulls back to. Choco & Co opens it: their photos
  // are the cleanest in the catalogue, which is what matters when one of
  // them is filling the screen. Juzzle and Haulties sit this one out, and
  // ChipMonk takes their place.
  const SKIP = new Set(["juzzle", "haulties"]);
  const FAVOUR = ["choco-and-co", "chipmonk"];
  const withPhoto = (slug: string) => catalog.listingsOf(slug).filter((l) => l.images[0]);
  const chocos = withPhoto("choco-and-co");
  const opener = chocos.find((l) => /hamper/i.test(l.title)) ?? chocos[0];
  const byBrand = new Map<string, typeof catalog.listings>();
  for (const l of catalog.listings) {
    if (!l.images[0] || SKIP.has(l.brand)) continue;
    byBrand.set(l.brand, [...(byBrand.get(l.brand) ?? []), l]);
  }
  // Favourites first, then one from each shop in turn, so no two squares
  // next to each other come from the same place.
  const queues = [...FAVOUR.filter((f) => byBrand.has(f)), ...[...byBrand.keys()].filter((b) => !FAVOUR.includes(b))].map((b) =>
    byBrand.get(b)!,
  );
  const shots: typeof catalog.listings = [];
  for (let round = 0; shots.length < 60; round++) {
    let added = false;
    for (const q of queues) {
      if (q[round]) {
        shots.push(q[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  const faceList = wall.map((f) => f.photo);
  const tiles: { src: string; kind: "product" | "face" }[] = Array.from({ length: 45 }, (_, i) =>
    i % 3 === 2 && faceList.length
      ? { src: faceList[Math.floor(i / 3) % faceList.length], kind: "face" as const }
      : { src: shots[i % shots.length].images[0], kind: "product" as const },
  );
  // Dead centre of a nine by five wall is tile 22, and that is the gift the
  // camera opens on.
  if (opener) tiles[22] = { src: opener.images[0], kind: "product" };

  // The journey's example: a real list of real hampers (150 gifts in all),
  // real faces from across the cohort, and what the order pays each team.
  // One hamper from each of four teams, so the list visibly backs four companies.
  const oneEach = hampers.filter((l, i) => hampers.findIndex((h) => h.brand === l.brand) === i);
  const listItems = [...oneEach, ...hampers.filter((l) => !oneEach.includes(l))]
    .slice(0, 4)
    .map((l, i) => ({ listing: l, brand: catalog.brand(l.brand)!, qty: [80, 40, 20, 10][i] ?? 10 }));
  const listBrands = [...new Set(listItems.map((l) => l.brand))];
  const journey = {
    list: listItems.map(({ listing, brand, qty }) => ({
      title: listing.title,
      brand: brand.name,
      image: listing.images[0],
      qty,
      priceMinor: listing.priceFromMinor,
    })),
    backing: listBrands.flatMap((b) => foundersOf(b.teamCode).map((f) => f.photo)),
    payout: listBrands.map((b) => ({
      brand: b.name,
      photos: foundersOf(b.teamCode).map((f) => f.photo),
      amount: listItems.filter((l) => l.brand === b).reduce((n, l) => n + (l.qty * l.listing.priceFromMinor) / 100, 0),
    })),
    cohort: byRevenue.slice(0, 10).flatMap((b) =>
      foundersOf(b.teamCode)
        .slice(0, 1)
        .map((f) => f.photo),
    ),
    cohortCount: wall.length,
  };

  // Each shelf's photo: a proper hamper for hampers, otherwise a product from
  // the team selling the most on that shelf.
  const rows = COLLECTIONS.map((c) => {
    const items = catalog.listingsIn(c.id).filter((l) => l.images[0]);
    const face =
      c.id === "hampers"
        ? hampers[0]
        : [...items].sort((a, b) => sold(catalog.brand(b.brand)!.teamCode) - sold(catalog.brand(a.brand)!.teamCode))[0];
    return {
      id: c.id,
      name: c.name,
      blurb: c.blurb,
      icon: c.icon,
      count: catalog.listingsIn(c.id).length,
      image: face?.images[0] ?? null,
    };
  });

  // Newest first, but every team gets a reel in before any team gets a
  // second, so the row shows as many squads as it can.
  const reelsByTeam = new Map<string, typeof reels>();
  for (const r of reels.filter((r) => brandByCode.has(r.teamCode)))
    reelsByTeam.set(r.teamCode, [...(reelsByTeam.get(r.teamCode) ?? []), r]);
  const mixed = [...reelsByTeam.values()].flatMap((list, team) => list.map((r, round) => ({ r, round, team })));
  const reelCards = mixed
    .sort((a, b) => a.round - b.round || a.team - b.team)
    .slice(0, 14)
    .map(({ r }) => ({
      video: r.video,
      poster: r.poster,
      brand: brandByCode.get(r.teamCode)!.name,
      brandSlug: brandByCode.get(r.teamCode)!.slug,
    }));

  return (
    <>
      <Hero tiles={tiles} founders={wall.length} brands={catalog.totals.brands} listings={catalog.totals.listings} />

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

      <Manifesto />

      <FounderWall faces={wall} />

      <Journey data={journey} />

      <section className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SplitReveal className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9] text-ink">
            Hampers, <em className="text-royal">sorted.</em>
          </SplitReveal>
          <div className="max-w-sm">
            <p className="text-lg leading-snug text-ink/65">Pick a box, we’ll do the rest.</p>
            <Link
              href="/catalogue?collection=hampers"
              className="group mt-3 inline-flex whitespace-nowrap text-sm font-semibold text-violet"
            >
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
          <p className="max-w-xs text-ink/60">Retail price per gift. Bulk pricing lands lower.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PRICE_BANDS.map((b) => (
            <Link
              key={b.id}
              href={`/catalogue?price=${b.id}`}
              data-cursor="Shop"
              className="group relative flex aspect-[1.5] flex-col justify-between overflow-hidden rounded-[28px] bg-paper-2 p-5 transition-colors duration-500 hover:bg-ink hover:text-paper sm:p-7"
            >
              <span className="text-sm text-ink/50 transition-colors group-hover:text-orchid">
                {catalog.listings.filter((l) => inBand(l.priceFromMinor, b.id)).length} gifts
              </span>
              <span className="font-display whitespace-nowrap text-[clamp(1.25rem,5.2vw,3rem)] leading-none lg:text-[clamp(1.7rem,3vw,3rem)]">
                {b.short}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Reels reels={reelCards} />
    </>
  );
}
