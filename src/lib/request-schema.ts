import { z } from "zod";

export const MAX_QTY = 100_000;

export const requestItemSchema = z.object({
  brand: z.string().min(1).max(80),
  sku: z.string().min(1).max(80),
  qty: z.number().int().min(1).max(MAX_QTY),
});

/**
 * Deliberately four questions. Everything else — occasion, dates, budget,
 * branding — is asked on the call, where it's a conversation, not a form.
 */
export const requestSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(120),
  company: z.string().trim().min(2, "Which company is this for?").max(160),
  email: z.email("That email looks a bit off").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{8,17}$/, "We need a number to call"),
  items: z.array(requestItemSchema).min(1, "Add at least one thing to your list").max(200),
  /** Honeypot — a real person never sees or fills it. Checked by the route, not here. */
  website: z.string().max(500).optional().default(""),
});

export type RequestPayload = z.output<typeof requestSchema>;

/** Free-mail domains: fine to use, but they don't tell us the company. */
export const PERSONAL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "rediffmail.com",
  "live.com",
  "proton.me",
];
