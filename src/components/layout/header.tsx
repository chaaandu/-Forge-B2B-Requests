"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { cn } from "@/lib/cn";
import { Lockup } from "./lockup";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "The catalogue" },
  { href: "/brands", label: "The founders" },
  { href: "/#how", label: "How it works" },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

export function Header() {
  const list = useRequestList();
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [bump, setBump] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!list.pulse) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- replay a CSS animation on each add
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [list.pulse]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background,box-shadow] duration-500",
        scrolled || menu ? "bg-paper/85 shadow-[0_1px_0_rgb(27_20_33/0.08)] backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Forge for Business — home" onClick={() => setMenu(false)}>
          <Lockup />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-ink/[0.04] p-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(pathname, n.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-semibold transition",
                isActive(pathname, n.href) ? "bg-ink text-paper" : "text-ink/65 hover:text-ink",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => list.setOpen(true)}
            data-cursor="Open"
            className="group flex items-center gap-2.5 rounded-full bg-aubergine py-2 pl-4 pr-2 text-[13px] font-semibold text-paper transition hover:bg-violet"
          >
            <span className="hidden sm:inline">Gift list</span>
            <span className="sm:hidden">List</span>
            <span
              className={cn(
                "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                list.count ? "bg-orchid text-aubergine" : "bg-paper/15 text-paper/80",
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
        <nav className="px-5 pb-6 pt-2 md:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              className="font-display block border-b border-ink/10 py-4 text-4xl text-ink last:border-0"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
