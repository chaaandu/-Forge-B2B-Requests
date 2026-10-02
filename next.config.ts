import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base-path";
import { RENAMES } from "./src/lib/brand-teams";

// The POS's public storage bucket. Written here as well as read from
// POS_MEDIA_BASE_URL, because this allow-list is fixed when the site is built,
// and a setting the build can't see would turn every photo into a 400.
const MEDIA_HOSTS = ["bumrsxkpzrbjfdhquemp.supabase.co"];
const fromEnv = process.env.POS_MEDIA_BASE_URL?.trim().split(/\s+/)[0];
if (fromEnv) MEDIA_HOSTS.push(new URL(fromEnv).hostname);

const nextConfig: NextConfig = {
  // Served at fb.mesaschool.co.in/b2b through the leaderboard project's rewrites.
  basePath: BASE_PATH,
  // This project's own *.vercel.app root has nothing at `/` any more.
  async redirects() {
    return [
      { source: "/", destination: BASE_PATH, basePath: false, permanent: false },
      // Renamed brands: old founder pages and product pages keep working.
      ...RENAMES.flatMap(({ from, to }) => [
        { source: `/brands/${from}`, destination: `/brands/${to}`, permanent: true },
        { source: `/products/${from}-:rest`, destination: `/products/${to}-:rest`, permanent: true },
      ]),
    ];
  },
  images: {
    // Product photos: straight from the POS's public storage bucket when
    // POS_MEDIA_BASE_URL is set, otherwise through the POS API (`/files/...`).
    remotePatterns: [
      { protocol: "https", hostname: "mesa-pos-api-tqiiw3ddga-el.a.run.app", pathname: "/files/**" },
      ...[...new Set(MEDIA_HOSTS)].map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/storage/v1/object/public/**" })),
    ],
    // Local escape hatch only: on a NAT64 network (some hotspots), DNS hands
    // back 64:ff9b:: addresses for Supabase, which the optimizer refuses as
    // private. Set ALLOW_LOCAL_IP=1 in .env.local on such a network. Never in
    // production, where it would switch off the SSRF guard.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" && process.env.ALLOW_LOCAL_IP === "1",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
