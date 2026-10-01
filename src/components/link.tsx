import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * `next/link` without prefetching, used for every internal link here.
 *
 * The site is served at fb.mesaschool.co.in/b2b through the leaderboard
 * project's rewrites, and Next 16's segment prefetches (the requests carrying
 * `Next-Router-Segment-Prefetch`) come back 404 through that hop — measured,
 * and `/admin` on the same domain does the same. Ordinary navigation
 * requests pass through fine, so links navigate when clicked instead of
 * fetching ahead; on the catalogue that is also dozens fewer requests every
 * time the grid scrolls into view.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
