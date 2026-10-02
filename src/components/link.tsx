"use client";

import NextLink from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useTransitionNav } from "@/components/motion/transition";

/**
 * Every internal link: `next/link` without prefetching, through the page
 * curtain.
 *
 * No prefetch because the site is served at fb.mesaschool.co.in/b2b through
 * the leaderboard's rewrites, and Next 16's segment prefetches 404 through
 * that hop (measured; /admin on the same domain does the same).
 *
 * Through the curtain unless the visitor asked for something else: a
 * modifier or middle click, a new tab, or a same-page anchor.
 */
export default function Link({ href, onClick, target, ...props }: ComponentProps<typeof NextLink>) {
  const go = useTransitionNav();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !go || typeof href !== "string") return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || target === "_blank" || href.includes("#")) return;
    e.preventDefault();
    go(href);
  };
  return <NextLink prefetch={false} href={href} target={target} onClick={handle} {...props} />;
}
