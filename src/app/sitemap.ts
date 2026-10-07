import type { MetadataRoute } from "next";
import { urlEnv } from "@/lib/env";
import { BASE_PATH } from "@/lib/base-path";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";

export const revalidate = 600;

const site = () => (urlEnv("SITE_URL") ?? `http://localhost:3000${BASE_PATH}`).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const base = site();
  const updated = new Date(catalog.generatedAt);
  return [
    { url: `${base}/`, lastModified: updated, priority: 1 },
    { url: `${base}/hampers`, lastModified: updated, priority: 0.9 },
    { url: `${base}/catalogue`, lastModified: updated, priority: 0.9 },
    { url: `${base}/brands`, lastModified: updated, priority: 0.7 },
    ...COLLECTIONS.map((c) => ({ url: `${base}/catalogue?collection=${c.id}`, lastModified: updated, priority: 0.8 })),
    ...catalog.brands.map((b) => ({ url: `${base}/brands/${b.slug}`, lastModified: updated, priority: 0.6 })),
    ...catalog.listings.map((l) => ({ url: `${base}/products/${l.slug}`, lastModified: updated, priority: 0.5 })),
  ];
}
