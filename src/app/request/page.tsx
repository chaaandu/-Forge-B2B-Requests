import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import type { ListItem } from "@/lib/request-list";
import { decodeList } from "@/lib/share";
import { RequestForm } from "@/components/request/request-form";

export const metadata: Metadata = { title: "Send your request" };

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
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
      <RequestForm shared={shared} />
    </div>
  );
}
