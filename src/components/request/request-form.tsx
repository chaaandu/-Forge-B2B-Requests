"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useEffect, useState } from "react";
import { Check, ChevronRight, Link2, Loader2, Trash2 } from "lucide-react";
import { useRequestList, type ListItem } from "@/lib/request-list";
import { requestSchema } from "@/lib/request-schema";
import { encodeList } from "@/lib/share";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { QtyStepper } from "./qty-stepper";
import { foundersOf } from "@/lib/founders";
import { Icon3D } from "@/components/icon3d";
import { FitImage } from "@/components/fit-image";
import { withBase } from "@/lib/base-path";

interface Fields {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}

type Errors = Partial<Record<keyof Fields | "items" | "form", string>>;

const DRAFT_KEY = "mesa-b2b:contact:v3";

export function RequestForm({ shared, teamCodes }: { shared: ListItem[]; teamCodes: Record<string, string> }) {
  const list = useRequestList();
  const [fields, setFields] = useState<Fields>({ name: "", company: "", email: "", phone: "", website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ ref: string; email: string; teams: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedHandled, setSharedHandled] = useState(false);

  // Someone opened a shared link. With nothing of their own on the list, just
  // take it; otherwise ask, rather than silently throwing their list away.
  const offerShared = shared.length > 0 && !sharedHandled && list.ready;
  useEffect(() => {
    if (offerShared && list.count === 0) {
      list.replace(shared);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot adoption of a shared list
      setSharedHandled(true);
    }
  }, [offerShared, list, shared]);

  // Remember contact details for this tab, in case they step back to the catalogue.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore a saved draft once
      if (raw) setFields({ ...JSON.parse(raw), website: "" });
    } catch {
      /* ignore a bad draft */
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...fields, website: "" }));
  }, [fields]);

  const set = (k: keyof Fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const value = list.items.reduce((n, i) => n + i.qty * i.priceMinor, 0);

  const share = async () => {
    const url = `${window.location.origin}${withBase("/request")}?list=${encodeList(list.items)}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Our Mesa Forge shortlist", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* the share sheet was dismissed */
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...fields, items: list.items.map((i) => ({ brand: i.brand, sku: i.sku, qty: i.qty })) };
    const parsed = requestSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "form") as keyof Errors;
        next[k] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setSending(true);
    setErrors({});
    try {
      const res = await fetch(withBase("/api/request"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      // Whose products were on the list, captured before the list is cleared.
      const teams = [...new Set(list.items.map((i) => teamCodes[i.brand]).filter(Boolean))];
      setDone({ ref: body.ref, email: fields.email, teams });
      list.clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  if (done) return <Success refId={done.ref} email={done.email} teams={done.teams} />;

  return (
    <>
      <h1 className="font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.88] text-ink">
        Your gift <em className="text-royal">list.</em>
      </h1>
      <p className="mt-3 max-w-xl text-lg text-ink/55">
        Check your list, tell us how to reach you, and we&apos;ll call within a working day.
      </p>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start lg:gap-16">
        {/* ── the list ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between gap-3 border-b border-black/5 pb-4">
            <h2 className="text-lg font-semibold text-ink">
              {list.ready && list.count ? `${list.count} product${list.count > 1 ? "s" : ""}` : "Your list"}
            </h2>
            {list.count > 0 && (
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:underline"
              >
                {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                {copied ? "Link copied" : "Share list"}
              </button>
            )}
          </div>

          {offerShared && list.count > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-tile p-4 text-sm">
              <p className="font-medium text-ink">Someone shared {shared.length} products with you.</p>
              <div className="flex gap-3 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    list.replace(shared);
                    setSharedHandled(true);
                  }}
                  className="text-violet hover:underline"
                >
                  Use their list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    for (const s of shared) list.add(s);
                    setSharedHandled(true);
                  }}
                  className="text-violet hover:underline"
                >
                  Add to mine
                </button>
                <button type="button" onClick={() => setSharedHandled(true)} className="text-ink/50 hover:underline">
                  Ignore
                </button>
              </div>
            </div>
          )}

          {!list.ready ? (
            <div className="mt-6 h-40 animate-pulse rounded-2xl bg-tile" />
          ) : list.count === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Icon3D name="shopping-bags" size={96} className="size-20" />
              <p className="mt-4 text-ink/55">Your list is empty.</p>
              <Link
                href="/catalogue"
                className="mt-4 inline-flex rounded-full bg-royal px-6 py-3 text-sm font-semibold text-white hover:bg-aubergine"
              >
                Browse the catalogue
              </Link>
              {errors.items && <p className="mt-4 text-sm font-medium text-red-700">{errors.items}</p>}
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {list.items.map((i) => (
                  <li key={`${i.brand}:${i.sku}`} className="flex gap-4 py-5">
                    <Link
                      href={`/products/${i.listing}`}
                      className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-tile sm:size-24"
                    >
                      {i.image && <FitImage src={i.image} alt="" sizes="96px" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <p className="text-xs text-ink/50">{i.brandName}</p>
                        <p className="font-semibold text-ink">{i.title}</p>
                        <p className="text-sm text-ink/50">
                          {i.label !== i.title ? `${i.label} · ` : ""}
                          {formatINR(i.priceMinor)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <QtyStepper size="sm" value={i.qty} onChange={(n) => list.setQty(i.brand, i.sku, n)} />
                        <button
                          type="button"
                          onClick={() => list.remove(i.brand, i.sku)}
                          aria-label={`Remove ${i.title}`}
                          className="grid size-9 place-items-center rounded-full text-ink/40 hover:bg-black/5 hover:text-red-700"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline justify-between border-t border-black/5 pt-5">
                <span className="text-sm text-ink/55">{list.units.toLocaleString("en-IN")} units · at retail</span>
                <span className="text-xl font-semibold tabular-nums text-ink">{formatINR(value)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-ink/45">Bulk orders are priced lower. Your quote comes with our call.</p>
            </>
          )}
        </section>

        {/* ── contact ──────────────────────────────────────────────────── */}
        <section className="rounded-3xl bg-canvas p-6 ring-1 ring-black/5 sm:p-8 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-ink">How do we reach you?</h2>
          <div className="mt-6 space-y-4">
            <Field label="Name" error={errors.name}>
              <input value={fields.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className={input(errors.name)} />
            </Field>
            <Field label="Company" error={errors.company}>
              <input
                value={fields.company}
                onChange={(e) => set("company", e.target.value)}
                autoComplete="organization"
                className={input(errors.company)}
              />
            </Field>
            <Field label="Work email" error={errors.email}>
              <input
                type="email"
                value={fields.email}
                onChange={(e) => set("email", e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className={input(errors.email)}
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                type="tel"
                value={fields.phone}
                onChange={(e) => set("phone", e.target.value)}
                autoComplete="tel"
                placeholder="+91"
                className={input(errors.phone)}
              />
            </Field>
          </div>

          {/* honeypot: hidden from people, irresistible to bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={fields.website}
            onChange={(e) => set("website", e.target.value)}
            className="absolute -left-[9999px] size-px opacity-0"
            aria-hidden
          />

          {(errors.form || (errors.items && list.count > 0)) && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{errors.form ?? errors.items}</p>
          )}

          <button
            type="submit"
            disabled={sending || !list.ready || list.count === 0}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-royal px-6 py-3.5 font-semibold text-white transition hover:bg-aubergine disabled:opacity-40"
          >
            {sending && <Loader2 className="size-5 animate-spin" />}
            {sending ? "Sending…" : "Send request"}
          </button>
          <p className="mt-3 text-center text-xs text-ink/45">No account, no payment. We only use this to reply.</p>
        </section>
      </form>
    </>
  );
}

/**
 * The payoff: not "order received" but the people it reached — every founder
 * whose product was on the list, face by face.
 */
function Success({ refId, email, teams }: { refId: string; email: string; teams: string[] }) {
  const people = teams.flatMap((t) => foundersOf(t));
  return (
    <div className="mx-auto max-w-4xl animate-rise py-10 text-center">
      {people.length > 0 && (
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {people.map((p, i) => (
            <span
              key={p.photo}
              className="relative size-16 overflow-hidden rounded-full bg-orchid-soft ring-4 ring-paper sm:size-20"
              style={{ animation: `rise .9s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
              title={p.name}
            >
              <Image src={p.photo} alt={p.name} fill sizes="80px" className="object-cover object-top" />
            </span>
          ))}
        </div>
      )}
      <h1 className="font-display mt-10 text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] text-ink">
        {people.length > 0 ? (
          <>
            You just backed <em className="scribble text-royal">{people.length} founders.</em>
          </>
        ) : (
          <>Thank you.</>
        )}
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-ink/65">
        Someone from the Mesa team will be in touch at <span className="font-semibold text-ink">{email}</span> within one working day.
      </p>
      <p className="mt-6 text-sm text-ink/45">
        Reference <span className="font-mono font-semibold tracking-wide text-ink">{refId}</span>
      </p>
      <Link href="/catalogue" className="group mt-8 inline-flex items-center gap-0.5 font-semibold text-violet">
        Keep browsing <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

const input = (error?: string) =>
  cn(
    "h-12 w-full rounded-xl border bg-white px-4 text-[15px] outline-none transition placeholder:text-ink/30 focus:ring-4",
    error ? "border-red-400 focus:ring-red-100" : "border-black/10 focus:border-violet focus:ring-violet/10",
  );

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink/70">
        {label}
        <span className="mt-1.5 block">{children}</span>
      </label>
      {error && <p className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
