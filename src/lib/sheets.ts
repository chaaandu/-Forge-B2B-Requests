import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * One request as it lands in the Google Sheet: a row on `Requests`, plus a
 * row per product on `Items` carrying the brand's team code, so each Forge
 * team can filter for what's been asked of them.
 */
export interface SheetRequest {
  ref: string;
  receivedAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  /** The email's domain when it's a work address (`acme.in`), else empty — a check on `company`. */
  emailDomain: string;
  totalUnits: number;
  indicativeValue: number;
  items: {
    teamCode: string;
    brand: string;
    sku: string;
    product: string;
    variant: string;
    qty: number;
    unitPrice: number;
    lineValue: number;
    url: string;
  }[];
}

export class DeliveryError extends Error {}

/**
 * Hand a request to the Apps Script web app bound to the sheet. With no
 * webhook configured (local development) it is appended to
 * `.data/requests.jsonl` instead, so the whole flow can be tried offline.
 */
export async function deliver(request: SheetRequest): Promise<void> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") throw new DeliveryError("SHEETS_WEBHOOK_URL is not set");
    const dir = resolve(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(resolve(dir, "requests.jsonl"), JSON.stringify(request) + "\n");
    console.info(`[request] ${request.ref} from ${request.company} saved to .data/requests.jsonl (no SHEETS_WEBHOOK_URL set)`);
    return;
  }

  // Apps Script answers a POST with a 302 to script.googleusercontent.com;
  // fetch follows it as a GET, which is where the JSON reply lives.
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: process.env.SHEETS_WEBHOOK_SECRET ?? "", request }),
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  const text = await res.text();
  let body: { ok?: boolean; error?: string } = {};
  try {
    body = JSON.parse(text);
  } catch {
    throw new DeliveryError(`Sheet webhook returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || !body.ok) throw new DeliveryError(`Sheet webhook refused the request: ${body.error ?? res.status}`);
}
