import type { Metadata } from "next";
import Link from "@/components/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCatalog, getCollection } from "@/lib/catalog";
import { ProductView } from "@/components/product/product-view";
import { ProductAside } from "@/components/product/product-aside";
import { Roll } from "@/components/layout/header";
import { FounderStack } from "@/components/founder-stack";
import { getImpact } from "@/lib/impact";
import { ListingRail } from "@/components/home/listing-rail";

// Must be a literal for Next to read it; matches REFRESH_SECONDS in lib/catalog.
// Products a team adds after a deploy are rendered on first visit.
export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getCatalog()).listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const catalog = await getCatalog();
  const l = catalog.listing((await params).slug);
  if (!l) return {};
  const b = catalog.brand(l.brand)!;
  return {
    title: `${l.title} by ${b.name}`,
    description: l.description ?? `${l.title} by ${b.name}. ${b.tagline}.`,
    openGraph: { images: l.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const catalog = await getCatalog();
  const listing = catalog.listing((await params).slug);
  if (!listing) notFound();
  const brand = catalog.brand(listing.brand)!;
  const collection = getCollection(listing.collection)!;
  const impact = await getImpact([brand.teamCode]);
  const more = catalog
    .listingsOf(brand.slug)
    .filter((l) => l.slug !== listing.slug)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-6 sm:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-ink/50">
        <Link href="/catalogue" className="hover:text-ink">
          Store
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/catalogue?collection=${collection.id}`} className="hover:text-ink">
          {collection.name}
        </Link>
        <ChevronRight className="size-3" />
        <Link href={`/brands/${brand.slug}`} className="hover:text-ink">
          {brand.name}
        </Link>
      </nav>

      <div className="mt-6">
        <ProductView
          listing={listing}
          brand={brand}
          after={<ProductAside brand={brand} sold={impact.byTeam[brand.teamCode]?.revenue ?? 0} />}
        >
          <div>
            <Link href={`/brands/${brand.slug}`} data-cursor="Meet" className="inline-flex">
              <FounderStack teamCode={brand.teamCode} size={34} className="[&>span:last-child]:text-sm [&>span:last-child]:text-ink/70" />
            </Link>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.92] text-ink">{listing.title}</h1>
            <p className="mt-3 text-sm font-semibold text-ink/50">
              {brand.name} · {collection.name}
            </p>
            {listing.description && <p className="mt-4 leading-relaxed text-ink/60">{listing.description}</p>}
          </div>
        </ProductView>
      </div>

      {more.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="font-display min-w-0 text-[clamp(2.4rem,5vw,4.5rem)] leading-[0.9] text-ink">More from {brand.name}.</h2>
            <Link href={`/brands/${brand.slug}`} className="group shrink-0 whitespace-nowrap text-sm font-semibold text-violet">
              <Roll>See all</Roll>
            </Link>
          </div>
          <ListingRail listings={more} brands={[brand]} />
        </section>
      )}
    </div>
  );
}
