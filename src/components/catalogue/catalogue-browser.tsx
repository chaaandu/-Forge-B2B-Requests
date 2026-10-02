"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { COLLECTIONS, type Brand, type CollectionId, type Listing } from "@/lib/catalog-types";
import { getOccasion } from "@/lib/occasions";
import { NO_FILTERS, type Filters } from "@/lib/filters";
import { PRICE_BANDS, inBand } from "@/lib/price-bands";
import { cn } from "@/lib/cn";
import { ProductCard } from "@/components/product/product-card";
import { QuickAdd } from "@/components/product/quick-add";
import { CategoryStrip } from "./category-strip";

const SORTS = [
  { id: "", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name" },
] as const;

const PAGE = 24;

export function CatalogueBrowser({
  listings,
  brands,
  initial,
  scope = "all",
}: {
  listings: Listing[];
  brands: Brand[];
  initial: Filters;
  /** "brand" hides the collection and brand filters — one brand's range doesn't need them. */
  scope?: "all" | "brand";
}) {
  const [f, setF] = useState<Filters>(initial);
  const [shown, setShown] = useState(PAGE);
  const [quick, setQuick] = useState<Listing | null>(null);
  const [panel, setPanel] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const brandBySlug = useMemo(() => new Map(brands.map((b) => [b.slug, b])), [brands]);

  // Everything a buyer might type, lower-cased once.
  const haystacks = useMemo(
    () =>
      new Map(
        listings.map((l) => {
          const b = brandBySlug.get(l.brand)!;
          const coll = COLLECTIONS.find((c) => c.id === l.collection)!;
          return [
            l.slug,
            [l.title, b.name, b.tagline, l.description, coll.name, ...l.variants.flatMap((v) => [v.label, v.sku])].join(" ").toLowerCase(),
          ];
        }),
      ),
    [listings, brandBySlug],
  );

  // Everything but the shelf: brand, budget and search. The category strip
  // counts against this, so each window says what you'd get by choosing it.
  const matching = useMemo(() => {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    return listings.filter(
      (l) =>
        (!f.brand || l.brand === f.brand) && inBand(l.priceFromMinor, f.price) && terms.every((t) => haystacks.get(l.slug)!.includes(t)),
    );
  }, [listings, f.brand, f.price, f.q, haystacks]);

  const counts = useMemo(() => {
    const occasion = getOccasion(f.occasion);
    const out: Record<string, number> = { all: 0 };
    for (const l of matching) {
      out[l.collection] = (out[l.collection] ?? 0) + 1;
      if (!occasion || occasion.collections.includes(l.collection)) out.all++;
    }
    return out;
  }, [matching, f.occasion]);

  const results = useMemo(() => {
    const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
    const occasion = !f.collection ? getOccasion(f.occasion) : undefined;
    const inCollection = (id: CollectionId) => (f.collection ? f.collection === id : !occasion || occasion.collections.includes(id));
    const out = matching.filter((l) => inCollection(l.collection));
    if (f.sort === "price-asc") out.sort((a, b) => a.priceFromMinor - b.priceFromMinor);
    else if (f.sort === "price-desc") out.sort((a, b) => b.priceFromMinor - a.priceFromMinor);
    else if (f.sort === "name") out.sort((a, b) => a.title.localeCompare(b.title));
    else if (!f.brand && !terms.length) out.sort(interleaveByBrand(out));
    return out;
  }, [matching, f.collection, f.occasion, f.sort, f.brand, f.q]);

  // Mirror filters into the URL so a filtered view can be linked and survives
  // a refresh. history.replaceState, not router.replace: no server round-trip,
  // so typing in search stays instant.
  useEffect(() => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(f)) if (v) params.set(k, v);
    const qs = params.toString();
    const t = setTimeout(() => window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname), 250);
    return () => clearTimeout(t);
  }, [f]);

  // "/" jumps to search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Grow the grid as the buyer nears its end.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => entries[0].isIntersecting && setShown((n) => n + PAGE), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [results.length]);

  const set = (patch: Partial<Filters>) => {
    setF((cur) => ({ ...cur, ...patch }));
    setShown(PAGE);
  };
  const narrowed = Boolean(f.q || f.brand || f.price || (scope === "all" && (f.collection || f.occasion)));
  const brandOptions = useMemo(() => [...brands].sort((a, b) => a.name.localeCompare(b.name)), [brands]);
  const occasion = getOccasion(f.occasion);
  const activeCount = [scope === "all" ? f.brand : "", f.price, f.sort].filter(Boolean).length;
  const countLabel = `${results.length} ${results.length === 1 ? "product" : "products"}`;
  // Where the bar has room to lay the selects out: the store has three of
  // them, so a tablet gets the phone's single Filters button instead.
  const room =
    scope === "all"
      ? { search: "lg:max-w-xs", toggle: "lg:hidden", selects: "hidden lg:flex", count: "hidden lg:inline", narrow: "lg:hidden" }
      : { search: "sm:max-w-xs", toggle: "sm:hidden", selects: "hidden sm:flex", count: "hidden sm:inline", narrow: "sm:hidden" };
  const selects = (
    <>
      {scope === "all" && (
        <Select value={f.brand} onChange={(v) => set({ brand: v })} label="Brand">
          <option value="">All brands</option>
          {brandOptions.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.name}
            </option>
          ))}
        </Select>
      )}
      <Select value={f.price} onChange={(v) => set({ price: v })} label="Budget per unit">
        <option value="">Any budget</option>
        {PRICE_BANDS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </Select>
      <Select value={f.sort} onChange={(v) => set({ sort: v })} label="Sort" quiet>
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </Select>
    </>
  );

  return (
    <>
      {scope === "all" && (
        <div className="mb-6">
          <CategoryStrip
            active={f.collection}
            counts={counts}
            only={occasion?.collections}
            occasion={occasion?.id}
            onSelect={(id) => set({ collection: id })}
          />
        </div>
      )}
      <div className="sticky top-16 z-30 -mx-5 border-b border-ink/10 bg-paper/85 px-5 py-3 backdrop-blur-xl backdrop-saturate-150 sm:-mx-8 sm:px-8">
        <div className="flex items-center gap-2">
          <label className={cn("relative min-w-0 flex-1", room.search)}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
            <input
              ref={searchRef}
              type="search"
              value={f.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search candles, makhana, totes…"
              aria-label="Search the catalogue"
              className="h-9 w-full rounded-full bg-tile pl-10 pr-10 text-sm outline-none transition placeholder:text-ink/40 focus:bg-white focus:ring-2 focus:ring-violet/40"
            />
            {f.q && (
              <button
                type="button"
                onClick={() => set({ q: "" })}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-ink/50 hover:bg-black/5"
              >
                <X className="size-3.5" />
              </button>
            )}
          </label>
          {/* Phones (and tablets, in the store): one button holds the rest, so the bar stays slim. */}
          <button
            type="button"
            onClick={() => setPanel((v) => !v)}
            aria-expanded={panel}
            aria-controls="catalogue-filters"
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition",
              room.toggle,
              panel || activeCount ? "bg-ink text-paper" : "bg-tile text-ink/70",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-orchid text-[11px] font-bold text-aubergine">
                {activeCount}
              </span>
            )}
          </button>
          <div className={cn("items-center gap-2", room.selects)}>{selects}</div>
          <span className={cn("ml-auto shrink-0 text-xs tabular-nums text-ink/50", room.count)}>{countLabel}</span>
        </div>
        {panel && (
          <div
            id="catalogue-filters"
            className={cn("mt-3 grid grid-cols-2 gap-2 [&>label:last-child]:col-span-2 [&_select]:w-full", room.narrow)}
          >
            {selects}
          </div>
        )}
      </div>
      <p className={cn("mt-5 text-xs tabular-nums text-ink/50", room.narrow)}>{countLabel}</p>

      {results.length === 0 ? (
        <div className="mx-auto max-w-md py-28 text-center">
          <p className="text-3xl text-ink">No matches.</p>
          <p className="mt-2 text-sm text-ink/60">Try another word, or clear the filters.</p>
          <button
            type="button"
            onClick={() => set({ ...NO_FILTERS, sort: f.sort })}
            className="mt-6 text-sm font-semibold text-violet hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
          {results.slice(0, shown).map((l, i) => (
            <div key={l.slug} className="animate-rise" style={{ animationDelay: `${(i % PAGE) * 20}ms` }}>
              <ProductCard listing={l} brand={brandBySlug.get(l.brand)!} onQuickAdd={() => setQuick(l)} priority={i < 4} />
            </div>
          ))}
        </div>
      )}
      {shown < results.length && <div ref={sentinel} className="h-10" />}
      {narrowed && results.length > 0 && shown >= results.length && (
        <p className="mt-16 text-center text-sm text-ink/50">
          That’s the lot.{" "}
          <button type="button" onClick={() => set({ ...NO_FILTERS, sort: f.sort })} className="font-semibold text-violet hover:underline">
            Show all products
          </button>
        </p>
      )}

      {quick && <QuickAdd listing={quick} brand={brandBySlug.get(quick.brand)!} onClose={() => setQuick(null)} />}
    </>
  );
}

/**
 * The default order: round-robin across brands, so the first screen shows
 * eight makers instead of eight kurtas from the brand with the biggest range.
 */
function interleaveByBrand(listings: Listing[]) {
  const rank = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const l of listings) {
    const n = seen.get(l.brand) ?? 0;
    seen.set(l.brand, n + 1);
    rank.set(l.slug, n);
  }
  return (a: Listing, b: Listing) => rank.get(a.slug)! - rank.get(b.slug)! || Number(b.featured) - Number(a.featured);
}

function Select({
  value,
  onChange,
  label,
  quiet,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  quiet?: boolean;
  children: React.ReactNode;
}) {
  const active = Boolean(value) && !quiet;
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 cursor-pointer appearance-none rounded-full pl-4 pr-9 text-[13px] font-medium outline-none transition focus:ring-2 focus:ring-violet/40",
          active ? "bg-royal text-white" : "bg-tile text-ink/70 hover:text-ink",
        )}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className={cn("pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2", active ? "text-white" : "text-ink/50")}
      >
        <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    </label>
  );
}
