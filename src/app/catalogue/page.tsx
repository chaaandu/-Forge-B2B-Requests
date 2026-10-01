import type { Metadata } from "next";
import { getCatalog, getCollection } from "@/lib/catalog";
import { filtersFrom } from "@/lib/filters";
import { getOccasion } from "@/lib/occasions";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { CategoryStrip } from "@/components/catalogue/category-strip";

export const metadata: Metadata = { title: "Catalogue" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function CataloguePage({ searchParams }: { searchParams: Search }) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
  const initial = filtersFrom(sp);
  const collection = getCollection(initial.collection);
  const occasion = getOccasion(initial.occasion);
  const [title, tail] = collection
    ? [collection.name, collection.blurb]
    : occasion
      ? [occasion.title, occasion.blurb]
      : ["Catalogue", `${catalog.totals.listings} products from ${catalog.totals.brands} founder brands`];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="pb-8 pt-12">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {title}. <span className="text-ink/45">{tail.replace(/\.$/, "")}.</span>
        </h1>
        <p className="mt-3 text-sm text-ink/50">Prices are retail, per unit. Bulk pricing comes with our reply.</p>
      </div>
      {!collection && !occasion && (
        <div className="mb-8">
          <CategoryStrip />
        </div>
      )}
      <CatalogueBrowser key={JSON.stringify(initial)} listings={catalog.listings} brands={catalog.brands} initial={initial} />
    </div>
  );
}
