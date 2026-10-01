import type { MetadataRoute } from "next";
import { urlEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = (urlEnv("SITE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/request"] }, sitemap: `${base}/sitemap.xml` };
}
