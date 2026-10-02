import type { Metadata } from "next";
import { getCatalog, getCollection } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { filtersFrom } from "@/lib/filters";
import { getOccasion } from "@/lib/occasions";
import { allFounders } from "@/lib/founders";
import { CatalogueBrowser } from "@/components/catalogue/catalogue-browser";
import { CategoryStrip } from "@/components/catalogue/category-strip";

export const metadata: Metadata = { title: "Catalogue" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function CataloguePage({ searchParams }: { searchParams: Search }) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);
  const initial = filtersFrom(sp);
  const collection = getCollection(initial.collection);
  const occasion = getOccasion(initial.occasion);
  const codes = new Set(catalog.brands.map((b) => b.teamCode));
  const foundersCount = allFounders().filter((f) => codes.has(f.teamCode)).length;
  const [title, tail] = collection
    ? [collection.name, collection.blurb]
    : occasion
      ? [occasion.title, occasion.blurb]
      : ["The store", `${catalog.totals.listings} things, made by ${foundersCount} student founders`];

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-10 sm:px-8">
      <div className="pb-8 pt-12">
        <h1 className="font-display text-[clamp(3.4rem,9vw,8rem)] leading-[0.88] text-ink">{title}.</h1>
        <p className="font-display-straight mt-4 max-w-2xl text-[clamp(1.3rem,2.2vw,1.9rem)] leading-snug text-ink/60">
          {tail.replace(/\.$/, "")}.
        </p>
        <p className="mt-3 text-sm text-ink/45">Retail prices, per gift. Bulk pricing lands lower, on the call.</p>
      </div>
      {!collection && !occasion && (
        <div className="mb-8">
          <CategoryStrip counts={Object.fromEntries(COLLECTIONS.map((c) => [c.id, catalog.listingsIn(c.id).length]))} />
        </div>
      )}
      <CatalogueBrowser key={JSON.stringify(initial)} listings={catalog.listings} brands={catalog.brands} initial={initial} />
    </div>
  );
}
