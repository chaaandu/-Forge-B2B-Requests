"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { useRequestList } from "@/lib/request-list";
import { cn } from "@/lib/cn";
import { foundersOf } from "@/lib/founders";
import { teamsOf } from "@/lib/hampers";
import { getLenis } from "@/components/motion/smooth-scroll";
import { LANDED } from "@/components/motion/fly";
import { FacePile } from "@/components/face-pile";
import { Lockup } from "./lockup";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/hampers", label: "Hampers" },
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

  // The pill (or the phone's bottom bar) gives a little bump as each added
  // product lands in it. fly.ts says when.
  const bumpTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const land = () => {
      setBump(false);
      requestAnimationFrame(() => setBump(true));
      clearTimeout(bumpTimer.current);
      bumpTimer.current = setTimeout(() => setBump(false), 600);
    };
    window.addEventListener(LANDED, land);
    return () => {
      window.removeEventListener(LANDED, land);
      clearTimeout(bumpTimer.current);
    };
  }, []);

  // A hero can be dark and run under this bar; while it is, and before the
  // bar has taken its own background, the type has to come up light.
  const [overDark, setOverDark] = useState(false);
  useEffect(() => {
    const sync = () => setOverDark(document.documentElement.classList.contains("hero-dark"));
    sync();
    window.addEventListener("hero:dark", sync);
    return () => window.removeEventListener("hero:dark", sync);
  }, []);

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

  const dark = overDark && !scrolled && !menu;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background,box-shadow] duration-500",
          scrolled && !menu ? "bg-paper/85 shadow-[0_1px_0_rgb(27_20_33/0.08)] backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" aria-label="Forge for Business, home" onClick={() => setMenu(false)} className="relative z-50">
            <Lockup compact tone={menu || dark ? "dark" : "light"} />
          </Link>

          <nav className={cn("hidden items-center gap-1 rounded-full p-1 md:flex", dark ? "bg-paper/10" : "bg-ink/[0.05]")}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive(pathname, n.href) ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors",
                  isActive(pathname, n.href)
                    ? dark
                      ? "bg-paper text-ink"
                      : "bg-ink text-paper"
                    : dark
                      ? "text-paper/70 hover:text-paper"
                      : "text-ink/65 hover:text-ink",
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
                // Phones have the bottom bar instead.
                "group hidden items-center gap-2.5 whitespace-nowrap rounded-full py-2 pl-4 pr-2 text-[13px] font-semibold transition-colors duration-300 sm:flex",
                menu || dark ? "bg-paper text-ink hover:bg-orchid" : "bg-aubergine text-paper hover:bg-violet",
                bump && "animate-bump",
              )}
            >
              <span className="whitespace-nowrap">
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
            {/* Says what it does: "Menu", then "Close" on a light pill over the dark menu. */}
            <button
              type="button"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-full pl-4 pr-3.5 text-[13px] font-semibold transition-colors duration-500 md:hidden",
                menu ? "bg-paper text-aubergine" : dark ? "bg-paper/15 text-paper" : "bg-ink/[0.06] text-ink",
              )}
            >
              {menu ? "Close" : "Menu"}
              <span aria-hidden className="relative grid size-4 place-items-center">
                <span
                  className={cn(
                    "absolute h-[1.5px] w-4 rounded bg-current transition duration-500",
                    menu ? "rotate-45" : "-translate-y-[3px]",
                  )}
                />
                <span
                  className={cn(
                    "absolute h-[1.5px] w-4 rounded bg-current transition duration-500",
                    menu ? "-rotate-45" : "translate-y-[3px]",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Phones: the menu is the whole screen, in the display face. */}
      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col bg-aubergine-2 px-5 pb-10 pt-28 text-paper transition-[clip-path] duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden",
          menu ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        inert={!menu}
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
      </div>

      <Dock hidden={menu || list.open || pathname.startsWith("/request")} bump={bump} />
    </>
  );
}

/**
 * Phones: the gift list lives in a bar at the bottom, quick-commerce style.
 * It rises into view with the first product, added photos fly into it, and
 * tapping it opens the list as a sheet from the same spot. The anchor div
 * never moves, so fly.ts can aim at where the bar comes to rest.
 */
function Dock({ hidden, bump }: { hidden: boolean; bump: boolean }) {
  const list = useRequestList();
  const show = list.ready && list.count > 0 && !hidden;
  const faces = [...new Set(list.items.flatMap(teamsOf))].flatMap((t) => foundersOf(t));

  // Keeps the end of the page clear of the bar (the footer reads --dock).
  useEffect(() => {
    document.documentElement.style.setProperty("--dock", list.ready && list.count > 0 ? "5.5rem" : "0px");
  }, [list.ready, list.count]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
      <div id="gift-list-dock" className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => list.setOpen(true)}
          tabIndex={show ? undefined : -1}
          aria-hidden={show ? undefined : true}
          aria-label={`View gift list, ${list.count} ${list.count === 1 ? "gift" : "gifts"}`}
          className={cn(
            "flex w-full items-center gap-3 rounded-full bg-aubergine py-2 pl-2 pr-3 text-paper shadow-[0_16px_40px_-10px_rgb(29_16_51/0.65)] transition-[translate,opacity,scale] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] motion-reduce:transition-none",
            show ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-[calc(100%+1.5rem)] opacity-0",
          )}
        >
          <span
            data-fly-target
            className={cn(
              "relative grid size-11 shrink-0 place-items-center rounded-full bg-orchid text-aubergine",
              bump && "animate-bump",
            )}
          >
            <ShoppingBag className="size-5" strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-paper px-1 text-[11px] font-bold tabular-nums text-aubergine ring-2 ring-aubergine">
              {list.count}
            </span>
          </span>
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block text-[15px] font-semibold">View gift list</span>
            <span className="block truncate text-xs text-paper/60">
              {list.units.toLocaleString("en-IN")} units{faces.length > 0 ? ` · ${faces.length} founders` : ""}
            </span>
          </span>
          {faces.length > 0 && (
            <FacePile photos={faces.map((f) => f.photo)} max={3} size={28} ring="ring-aubergine" className="max-[359px]:hidden" />
          )}
          <ChevronRight className="size-5 shrink-0 text-paper/50" />
        </button>
      </div>
    </div>
  );
}
