import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import type { ListItem } from "@/lib/request-list";
import { decodeList } from "@/lib/share";
import { GiftListFlow } from "@/components/request/gift-list-flow";

export const metadata: Metadata = { title: "Your gift list" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function RequestPage({ searchParams }: { searchParams: Search }) {
  const [sp, catalog] = await Promise.all([searchParams, getCatalog()]);

  // A shared list arrives as ids and quantities only; names and prices are
  // looked up here, so a doctored link can't put a made-up price on screen.
  const shared: ListItem[] =
    typeof sp.list === "string"
      ? decodeList(sp.list).flatMap((line) => {
          const hit = catalog.findVariant(line.brand, line.sku);
          if (!hit) return [];
          return [
            {
              brand: hit.brand.slug,
              sku: hit.variant.sku,
              qty: line.qty,
              listing: hit.listing.slug,
              title: hit.listing.title,
              brandName: hit.brand.name,
              label: hit.variant.label,
              priceMinor: hit.variant.priceMinor,
              image: hit.variant.image ?? hit.listing.images[0] ?? null,
            },
          ];
        })
      : [];

  return (
    // The same flow as the sheet, given the page: a list someone shared lands here.
    <div className="mx-auto max-w-xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <GiftListFlow variant="page" shared={shared} />
    </div>
  );
}
