import { NextResponse } from "next/server";
import { getCatalog, health, REFRESH_SECONDS } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** When the catalogue was last read from the POS, and how much is on it. For uptime checks and "is my edit live yet?". */
export async function GET() {
  const c = await getCatalog();
  const ageSeconds = Math.round((Date.now() - Date.parse(c.generatedAt)) / 1000);
  return NextResponse.json({
    source: health.source,
    ...(health.reason ? { reason: health.reason } : {}),
    generatedAt: c.generatedAt,
    ageSeconds,
    refreshSeconds: REFRESH_SECONDS,
    ...c.totals,
  });
}
