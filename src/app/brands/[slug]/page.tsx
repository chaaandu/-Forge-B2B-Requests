import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronLeft } from "lucide-react";
import { getCatalog, getCollection } from "@/lib/catalog";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { NO_FILTERS } from "@/lib/filters";

export const revalidate = 600;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getCatalog()).brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = (await getCatalog()).brand((await params).slug);
  return b ? { title: b.name, description: `${b.name}: ${b.tagline}. A Mesa Forge founder brand.` } : {};
}

export default async function BrandPage({ params }: { params: Params }) {
  const catalog = await getCatalog();
  const brand = catalog.brand((await params).slug);
  if (!brand) notFound();
  const items = catalog.listingsOf(brand.slug);
  const skus = items.reduce((n, l) => n + l.variants.length, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <Link href="/brands" className="mt-6 inline-flex items-center gap-0.5 text-xs text-ink/50 hover:text-ink">
        <ChevronLeft className="size-3.5" /> All brands
      </Link>
      <div className="flex flex-col gap-4 pb-10 pt-6 sm:flex-row sm:items-center sm:gap-6">
        {brand.logo && (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
            <Image src={brand.logo} alt={`${brand.name} logo`} fill sizes="80px" className="object-contain p-2" />
          </div>
        )}
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-ink sm:text-6xl">{brand.name}</h1>
          <p className="mt-2 text-lg text-ink/55">
            {brand.tagline} · {getCollection(brand.collection)?.name}
          </p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span className="text-ink/45">
              {items.length} products · {skus} SKUs
            </span>
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold text-violet hover:underline"
              >
                Website <ArrowUpRight className="size-3.5" />
              </a>
            )}
            {brand.instagram && (
              <a
                href={brand.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 font-semibold text-violet hover:underline"
              >
                Instagram <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </p>
        </div>
      </div>
      <CatalogueBrowser scope="brand" listings={items} brands={[brand]} initial={NO_FILTERS} />
    </div>
  );
}
