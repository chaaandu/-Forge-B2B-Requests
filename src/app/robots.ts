import type { MetadataRoute } from "next";
import { urlEnv } from "@/lib/env";
import { BASE_PATH, withBase } from "@/lib/base-path";

export default function robots(): MetadataRoute.Robots {
  const base = (urlEnv("SITE_URL") ?? `http://localhost:3000${BASE_PATH}`).replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: [withBase("/api/"), withBase("/request")] }, sitemap: `${base}/sitemap.xml` };
}
