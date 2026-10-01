import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/link";
import { FitImage } from "@/components/fit-image";
import { getCatalog, getCollection } from "@/lib/catalog";

export const metadata: Metadata = { title: "Brands" };
export const revalidate = 600;

export default async function BrandsPage() {
  const catalog = await getCatalog();
  const brands = [...catalog.brands].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="pb-12 pt-12">
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          {brands.length} brands, built from scratch.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/55">
          Each one was started by a team in Forge, Mesa&apos;s venture-building programme. They source, make, price and sell everything
          themselves. A bulk order from you is real revenue for a real business.
        </p>
      </div>

      <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const items = catalog.listingsOf(b.slug);
          const cover = b.logo ?? items.find((l) => l.images[0])?.images[0];
          return (
            <Link key={b.slug} href={`/brands/${b.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-tile">
                {b.logo ? (
                  <Image src={b.logo} alt="" fill sizes="(min-width: 1024px) 400px, 50vw" className="object-contain p-12" />
                ) : (
                  cover && (
                    <div className="absolute inset-0 transition duration-700 group-hover:scale-[1.03]">
                      <FitImage src={cover} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />
                    </div>
                  )
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{b.name}</h2>
                <span className="shrink-0 text-xs text-ink/45">{items.length} products</span>
              </div>
              <p className="text-sm text-ink/55">
                {b.tagline} · {getCollection(b.collection)?.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
