"use client";

/**
 * The buyer's request list — the B2B equivalent of a cart, minus checkout.
 *
 * Kept in localStorage so a buyer can browse over several visits, and
 * encodable into a URL (`/request?list=…`) so an HR lead can send the
 * shortlist to a manager without either of them having an account.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_QTY } from "./request-schema";
import { canonicalBrand } from "./brand-teams";

export interface ListItem {
  brand: string;
  sku: string;
  qty: number;
  /** Display snapshot taken when the item was added, so the list renders without the catalogue. */
  listing: string;
  title: string;
  brandName: string;
  label: string;
  priceMinor: number;
  image: string | null;
}

const KEY = "mesa-b2b:request-list:v1";

const keyOf = (i: { brand: string; sku: string }) => `${i.brand}:${i.sku}`;
const clampQty = (n: number) => Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1));

interface RequestListValue {
  items: ListItem[];
  ready: boolean;
  count: number;
  units: number;
  has: (brand: string, sku: string) => boolean;
  qtyOf: (brand: string, sku: string) => number;
  add: (item: ListItem) => void;
  setQty: (brand: string, sku: string, qty: number) => void;
  remove: (brand: string, sku: string) => void;
  clear: () => void;
  replace: (items: ListItem[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Bumps whenever something is added, so the header badge can pulse. */
  pulse: number;
}

const Ctx = createContext<RequestListValue | null>(null);

export function RequestListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ListItem[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load once on the client; before that the list is empty and `ready` false,
  // so nothing flashes "your list is empty" at someone who has a list.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // A list saved before a brand was renamed still points at its old slug.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      if (raw) setItems((JSON.parse(raw) as ListItem[]).map((i) => ({ ...i, brand: canonicalBrand(i.brand) })));
    } catch {
      /* a corrupt entry is simply ignored */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  // Keep two open tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) setItems(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback<RequestListValue["add"]>((item) => {
    setItems((cur) => {
      const k = keyOf(item);
      const existing = cur.find((i) => keyOf(i) === k);
      if (existing) return cur.map((i) => (keyOf(i) === k ? { ...i, qty: clampQty(item.qty) } : i));
      return [...cur, { ...item, qty: clampQty(item.qty) }];
    });
    setPulse((p) => p + 1);
  }, []);

  const setQty = useCallback((brand: string, sku: string, qty: number) => {
    setItems((cur) => cur.map((i) => (keyOf(i) === keyOf({ brand, sku }) ? { ...i, qty: clampQty(qty) } : i)));
  }, []);

  const remove = useCallback((brand: string, sku: string) => {
    setItems((cur) => cur.filter((i) => keyOf(i) !== keyOf({ brand, sku })));
  }, []);

  const value = useMemo<RequestListValue>(() => {
    const map = new Map(items.map((i) => [keyOf(i), i]));
    return {
      items,
      ready: loaded,
      count: items.length,
      units: items.reduce((n, i) => n + i.qty, 0),
      has: (brand, sku) => map.has(keyOf({ brand, sku })),
      qtyOf: (brand, sku) => map.get(keyOf({ brand, sku }))?.qty ?? 0,
      add,
      setQty,
      remove,
      clear: () => setItems([]),
      replace: (next) => setItems(next.map((i) => ({ ...i, qty: clampQty(i.qty) }))),
      open,
      setOpen,
      pulse,
    };
  }, [items, loaded, add, setQty, remove, open, pulse]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRequestList(): RequestListValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRequestList must be used inside <RequestListProvider>");
  return v;
}
