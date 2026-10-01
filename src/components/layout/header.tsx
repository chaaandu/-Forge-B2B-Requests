"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipboardList, Menu, X } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { cn } from "@/lib/cn";
import { Lockup } from "./lockup";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/brands", label: "Brands" },
  { href: "/#how-it-works", label: "How it works" },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

export function Header() {
  const list = useRequestList();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (!list.pulse) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- replay a CSS animation on each add
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [list.pulse]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Mesa Forge for Business — home" onClick={() => setMenu(false)}>
          <Lockup />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(pathname, n.href) ? "page" : undefined}
              className={cn("text-[13px] font-medium transition", isActive(pathname, n.href) ? "text-royal" : "text-ink/60 hover:text-ink")}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => list.setOpen(true)}
            className="flex items-center gap-2 rounded-full bg-royal py-2 pl-3.5 pr-2.5 text-[13px] font-semibold text-white transition hover:bg-aubergine"
          >
            <ClipboardList className="size-4" />
            <span className="hidden sm:inline">Request list</span>
            <span
              className={cn(
                "grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                list.count ? "bg-orchid text-aubergine" : "bg-white/15 text-white/80",
                bump && "animate-bump",
              )}
            >
              {list.ready ? list.count : "·"}
            </span>
          </button>
          <button
            type="button"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu((m) => !m)}
            className="grid size-10 place-items-center rounded-full text-ink md:hidden"
          >
            {menu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {menu && (
        <nav className="border-t border-black/5 px-4 pb-4 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              className={cn(
                "block border-b border-black/5 py-3.5 text-lg font-semibold last:border-0",
                isActive(pathname, n.href) ? "text-royal" : "text-ink",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
