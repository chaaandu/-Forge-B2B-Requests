import type { NextConfig } from "next";

// First token only: a multi-line paste in the hosting dashboard must not break the allow-list.
const mediaRaw = process.env.POS_MEDIA_BASE_URL?.trim().split(/\s+/)[0];
const media = mediaRaw ? new URL(mediaRaw) : null;

const nextConfig: NextConfig = {
  images: {
    // Product photos: straight from the POS's public storage bucket when
    // POS_MEDIA_BASE_URL is set, otherwise through the POS API (`/files/...`).
    remotePatterns: [
      { protocol: "https", hostname: "mesa-pos-api-tqiiw3ddga-el.a.run.app", pathname: "/files/**" },
      ...(media ? [{ protocol: "https" as const, hostname: media.hostname, pathname: `${media.pathname.replace(/\/$/, "")}/**` }] : []),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
