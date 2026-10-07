import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { PERSONAL_DOMAINS, requestSchema } from "@/lib/request-schema";
import { deliver, type SheetRequest } from "@/lib/sheets";
import { BASE_PATH } from "@/lib/base-path";
import { urlEnv } from "@/lib/env";
import { describeLine, HAMPER_BRAND_NAME, isHamper, resolveHamper } from "@/lib/hampers";

// A small per-instance limiter. It won't stop a determined flood across
// serverless instances, but it does stop a stuck button or a naive bot.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 6;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

/** `MF-260929-K7QD`: date first so the sheet sorts by it, then 4 unambiguous characters. */
function newRef(now: Date): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const tail = [...randomBytes(4)].map((b) => alphabet[b % alphabet.length]).join("");
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  return `MF-${ist.toISOString().slice(2, 10).replace(/-/g, "")}-${tail}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "That’s a lot of requests in a short time. Please try again in a few minutes." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form and try again." }, { status: 400 });
  }
  const r = parsed.data;
  const now = new Date();
  const ref = newRef(now);

  // A bot filled the hidden field: thank it and drop the request on the floor.
  if (r.website) return NextResponse.json({ ref });

  const catalog = await getCatalog();
  // Links in the sheet use the public address (fb.mesaschool.co.in/b2b), not
  // whichever host the request was forwarded to.
  const site = urlEnv("SITE_URL") ?? `${req.nextUrl.origin}${BASE_PATH}`;
  // Names and prices come from the catalogue, never from the browser. A SKU
  // archived since it was added is still passed on, flagged, so the ask isn't lost.
  const items: SheetRequest["items"] = r.items.map((i) => {
    // A hamper is several teams' products in one box: every team's code, so
    // each finds it when they filter the sheet, and the contents as the variant.
    if (isHamper(i.brand)) {
      const h = resolveHamper(i.sku);
      return {
        teamCode: h ? h.teamCodes.join(", ") : "?",
        brand: HAMPER_BRAND_NAME,
        sku: i.sku,
        product: h ? (h.custom ? h.title : `${h.title} (${h.label})`) : "(no longer listed)",
        variant: h ? h.lines.map(describeLine).join(", ") : "",
        qty: i.qty,
        unitPrice: h?.amount ?? 0,
        lineValue: (h?.amount ?? 0) * i.qty,
        url: h ? `${site}${h.href}` : "",
      };
    }
    const hit = catalog.findVariant(i.brand, i.sku);
    if (!hit) {
      return {
        teamCode: "?",
        brand: i.brand,
        sku: i.sku,
        product: "(no longer listed)",
        variant: "",
        qty: i.qty,
        unitPrice: 0,
        lineValue: 0,
        url: "",
      };
    }
    const unit = hit.variant.priceMinor / 100;
    return {
      teamCode: hit.brand.teamCode,
      brand: hit.brand.name,
      sku: hit.variant.sku,
      product: hit.listing.title,
      variant: hit.variant.label === hit.listing.title ? "" : hit.variant.label,
      qty: i.qty,
      unitPrice: unit,
      lineValue: Math.round(unit * i.qty * 100) / 100,
      url: `${site}/products/${hit.listing.slug}`,
    };
  });

  const email = r.email.toLowerCase();
  const domain = email.split("@")[1] ?? "";
  const record: SheetRequest = {
    ref,
    receivedAt: now.toISOString(),
    name: r.name,
    email,
    phone: r.phone,
    company: r.company,
    emailDomain: PERSONAL_DOMAINS.includes(domain) ? "" : domain,
    totalUnits: items.reduce((n, i) => n + i.qty, 0),
    indicativeValue: Math.round(items.reduce((n, i) => n + i.lineValue, 0)),
    items,
  };

  try {
    await deliver(record);
  } catch (err) {
    console.error(`[request] ${ref} could not be delivered`, err, JSON.stringify(record));
    return NextResponse.json({ error: "We couldn’t send that just now. Please try again in a minute." }, { status: 502 });
  }

  return NextResponse.json({ ref });
}
