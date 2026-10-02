"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { cn } from "@/lib/cn";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Lockup } from "./lockup";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/catalogue", label: "Store" },
  { href: "/brands", label: "Founders" },
];

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/** A label that rolls up to a copy of itself on hover (see `.roll` in globals.css). */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}

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
    const t = setTimeout(() => setBump(false), 600);
    return () => clearTimeout(t);
  }, [list.pulse]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // The full-screen menu holds the page still while it's open.
  useEffect(() => {
    const lenis = getLenis();
    if (menu) lenis?.stop();
    else lenis?.start();
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background,box-shadow] duration-500",
          scrolled && !menu ? "bg-paper/80 shadow-[0_1px_0_rgb(27_20_33/0.08)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Forge for Business, home" onClick={() => setMenu(false)} className="relative z-50">
            <Lockup tone={menu ? "dark" : "light"} />
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-ink/[0.05] p-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(pathname, n.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                  isActive(pathname, n.href) ? "bg-ink text-paper" : "text-ink/65 hover:text-ink",
                )}
              >
                <Roll>{n.label}</Roll>
              </Link>
            ))}
          </nav>

          <div className="relative z-50 flex items-center gap-1.5">
            <button
              id="gift-list-button"
              type="button"
              onClick={() => list.setOpen(true)}
              data-cursor="Open"
              className={cn(
                "group flex items-center gap-2 whitespace-nowrap rounded-full py-2 pl-3.5 pr-2 text-[13px] font-semibold transition-colors duration-300 sm:gap-2.5 sm:pl-4",
                menu ? "bg-paper text-ink" : "bg-aubergine text-paper hover:bg-violet",
                bump && "animate-bump",
              )}
            >
              <ShoppingBag className="size-4 sm:hidden" strokeWidth={2.2} />
              <span className="hidden whitespace-nowrap sm:inline">
                <Roll>Gift list</Roll>
              </span>
              <span
                className={cn(
                  "grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  list.count ? "bg-orchid text-aubergine" : menu ? "bg-ink/10" : "bg-paper/15 text-paper/80",
                )}
              >
                {list.ready ? list.count : "·"}
              </span>
            </button>
            <button
              type="button"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className={cn("relative grid size-10 place-items-center rounded-full md:hidden", menu ? "text-paper" : "text-ink")}
            >
              <span
                className={cn("absolute h-0.5 w-5 rounded bg-current transition duration-500", menu ? "rotate-45" : "-translate-y-1")}
              />
              <span
                className={cn("absolute h-0.5 w-5 rounded bg-current transition duration-500", menu ? "-rotate-45" : "translate-y-1")}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Phones: the menu is the whole screen, in the display face. */}
      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col justify-between bg-aubergine-2 px-5 pb-10 pt-28 text-paper transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden",
          menu ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        aria-hidden={!menu}
      >
        <nav className="flex flex-col">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMenu(false)}
              className="font-display block border-b border-paper/10 py-3 text-[17vw] leading-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: menu ? "none" : "translateY(40px)",
                opacity: menu ? 1 : 0,
                transitionDelay: menu ? `${150 + i * 70}ms` : "0ms",
              }}
            >
              {n.label}
              {isActive(pathname, n.href) && <span className="ml-3 text-orchid">✺</span>}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-paper/50">Gifts made by 117 student founders at Mesa School of Business.</p>
      </div>
    </>
  );
}
