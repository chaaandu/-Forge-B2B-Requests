import type { NextConfig } from "next";

// The POS's public storage bucket. Written here as well as read from
// POS_MEDIA_BASE_URL, because this allow-list is fixed when the site is built,
// and a setting the build can't see would turn every photo into a 400.
const MEDIA_HOSTS = ["bumrsxkpzrbjfdhquemp.supabase.co"];
const fromEnv = process.env.POS_MEDIA_BASE_URL?.trim().split(/\s+/)[0];
if (fromEnv) MEDIA_HOSTS.push(new URL(fromEnv).hostname);

const nextConfig: NextConfig = {
  images: {
    // Product photos: straight from the POS's public storage bucket when
    // POS_MEDIA_BASE_URL is set, otherwise through the POS API (`/files/...`).
    remotePatterns: [
      { protocol: "https", hostname: "mesa-pos-api-tqiiw3ddga-el.a.run.app", pathname: "/files/**" },
      ...[...new Set(MEDIA_HOSTS)].map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/storage/v1/object/public/**" })),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
