"use client";

import Image from "next/image";
import Link from "@/components/link";
import { useEffect, useRef, useState, type Ref } from "react";
import { ArrowLeft, ArrowRight, Check, Link2, Loader2, Trash2, X } from "lucide-react";
import { useRequestList, type ListItem } from "@/lib/request-list";
import { requestSchema } from "@/lib/request-schema";
import { encodeList } from "@/lib/share";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/cn";
import { foundersOf } from "@/lib/founders";
import { TEAM_OF } from "@/lib/brand-teams";
import { withBase } from "@/lib/base-path";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Doodle } from "@/components/doodle";
import { FacePile } from "@/components/face-pile";
import { FitImage } from "@/components/fit-image";
import { Roll } from "@/components/layout/header";
import { QtyStepper } from "./qty-stepper";

/**
 * The whole gift-list journey in one place, as steps that slide: your list,
 * then who's gifting, then sent. The sheet (header pill, phone bar) and the
 * /request page both render this, so the list is never shown twice and
 * nobody is bounced to another page to finish.
 */

type Step = "list" | "details" | "sent";

interface Fields {
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}
type Errors = Partial<Record<keyof Fields | "items" | "form", string>>;
interface Sent {
  ref: string;
  email: string;
  teams: string[];
}

const DRAFT_KEY = "mesa-b2b:contact:v3";
const EMPTY: Fields = { name: "", company: "", email: "", phone: "", website: "" };

export function GiftListFlow({
  variant,
  onClose,
  shared = [],
}: {
  variant: "sheet" | "page";
  /** Sheet only: close the sheet. */
  onClose?: () => void;
  /** A list someone shared by link (/request?list=…). */
  shared?: ListItem[];
}) {
  const sheet = variant === "sheet";
  const list = useRequestList();
  const [step, setStep] = useState<Step>("list");
  const [back, setBack] = useState(false);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [copied, setCopied] = useState(false);
  const [sharedHandled, setSharedHandled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const firstField = useRef<HTMLInputElement>(null);

  // A shared link: with nothing of their own on the list, just take it;
  // otherwise ask, rather than silently throwing their list away.
  const offerShared = shared.length > 0 && !sharedHandled && list.ready;
  useEffect(() => {
    if (offerShared && list.count === 0) {
      list.replace(shared);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot adoption of a shared list
      setSharedHandled(true);
    }
  }, [offerShared, list, shared]);

  // Contact details are remembered for the tab, so closing the sheet or
  // stepping back to the list costs nothing.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore a saved draft once
      if (raw) setFields({ ...EMPTY, ...JSON.parse(raw), website: "" });
    } catch {
      /* ignore a bad draft */
    }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (restored) sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...fields, website: "" }));
  }, [fields, restored]);

  // Each step starts at its top, and focus moves with it: into the first
  // field with a keyboard, onto the heading on a phone (no surprise keyboard).
  const moved = useRef(false);
  useEffect(() => {
    if (!moved.current) return;
    if (sheet) body.current?.scrollTo({ top: 0 });
    else if (root.current && root.current.getBoundingClientRect().top < 0) {
      const y = root.current.getBoundingClientRect().top + window.scrollY - 96;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
    }
    if (step === "details" && window.matchMedia("(pointer: fine)").matches) firstField.current?.focus({ preventScroll: true });
    else heading.current?.focus({ preventScroll: true });
  }, [step, sheet]);

  const go = (next: Step) => {
    moved.current = true;
    setBack(next === "list");
    setStep(next);
  };

  const set = (k: keyof Fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const teams = [...new Set(list.items.map((i) => TEAM_OF[i.brand]).filter(Boolean))];
  const backing = teams.flatMap((t) => foundersOf(t));
  const value = list.items.reduce((n, i) => n + i.qty * i.priceMinor, 0);
  const summary = `${list.count} ${list.count === 1 ? "product" : "products"} · ${list.units.toLocaleString("en-IN")} units`;

  const share = async () => {
    const url = `${window.location.origin}${withBase("/request")}?list=${encodeList(list.items)}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Our Mesa Forge gift list", url });
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
    if (sending) return;
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
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      // Whose products were on the list, captured before the list is cleared.
      setSent({ ref: data.ref, email: fields.email, teams });
      list.clear();
      go("sent");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const empty = list.ready && list.count === 0 && step !== "sent";
  const H = sheet ? "h2" : "h1";
  const cta =
    "group flex w-full items-center justify-center gap-2 rounded-full bg-aubergine px-5 py-4 font-semibold text-paper transition-colors hover:bg-violet disabled:opacity-60";

  return (
    <div ref={root} className={cn("flex flex-col", sheet && "min-h-0 flex-1")}>
      {/* ── header: where you are, and the way back ── */}
      <div
        data-sheet-grab
        className={cn(
          "flex items-start gap-2",
          sheet ? "touch-none px-6 pb-4 pt-3 sm:touch-auto sm:pt-6" : "pb-6",
          // An empty page centres its title over the empty state below it.
          !sheet && empty && "text-center",
        )}
      >
        {step === "details" && (
          <button
            type="button"
            onClick={() => go("list")}
            aria-label="Back to your list"
            className={cn("-ml-2 grid size-10 shrink-0 place-items-center rounded-full hover:bg-ink/5", !sheet && "mt-2 sm:mt-4")}
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {step !== "sent" && (
            <H
              ref={heading}
              tabIndex={-1}
              className={cn(
                "font-display text-ink outline-none",
                sheet ? "text-[2rem] leading-none" : "text-[clamp(3rem,9vw,5.5rem)] leading-[0.9]",
              )}
            >
              {step === "list" ? (
                sheet ? (
                  "Your gift list"
                ) : (
                  <>
                    Your gift <em className="text-royal">list.</em>
                  </>
                )
              ) : sheet ? (
                "Who's gifting?"
              ) : (
                <>
                  Who&apos;s <em className="text-royal">gifting?</em>
                </>
              )}
            </H>
          )}
          {step !== "sent" && !empty && list.ready && (
            <p className={cn("text-ink/55", sheet ? "mt-1.5 text-sm" : "mt-3 text-lg")}>
              {step === "list" ? summary : "Four details. We call within a day."}
            </p>
          )}
        </div>
        {sheet && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-ink/5 hover:bg-ink/10"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Two steps, shown as two bars, so the second screen is never a surprise. */}
      {step !== "sent" && !empty && list.ready && (
        <div className={cn("flex gap-1.5", sheet && "px-6")} aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-royal" />
          <span className={cn("h-1 flex-1 rounded-full transition-colors duration-500", step === "details" ? "bg-royal" : "bg-ink/10")} />
        </div>
      )}

      {/* ── the step itself ── */}
      <div
        ref={body}
        data-lenis-prevent={sheet ? "" : undefined}
        className={cn(sheet && "min-h-0 flex-1 overflow-y-auto overscroll-contain")}
      >
        <div
          key={step}
          className={cn("relative", sheet ? "px-6 py-5" : "py-6", back ? "motion-safe:animate-step-back" : "motion-safe:animate-step-in")}
        >
          {offerShared && list.count > 0 && step === "list" && (
            <div className="mb-4 rounded-2xl bg-orchid-soft p-4 text-sm">
              <p className="font-semibold text-aubergine">Someone shared {shared.length} products with you.</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    list.replace(shared);
                    setSharedHandled(true);
                  }}
                  className="text-royal hover:underline"
                >
                  Use their list
                </button>
                <button
                  type="button"
                  onClick={() => {
                    for (const s of shared) list.add(s);
                    setSharedHandled(true);
                  }}
                  className="text-royal hover:underline"
                >
                  Add to mine
                </button>
                <button type="button" onClick={() => setSharedHandled(true)} className="text-ink/50 hover:underline">
                  Ignore
                </button>
              </div>
            </div>
          )}

          {step === "sent" && sent ? (
            <SentNote sent={sent} sheet={sheet} onDone={onClose} headingRef={heading} />
          ) : !list.ready ? (
            <div className="h-40 animate-pulse rounded-2xl bg-paper-2" />
          ) : empty ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Doodle name="bag" className="size-24 text-aubergine" />
              <p className="font-display mt-6 text-3xl text-ink">Your list is feeling light.</p>
              <p className="mt-2 max-w-xs text-sm text-ink/60">
                Add a few things and we&apos;ll handle the rest. It&apos;s a list, not an order.
              </p>
              <Link
                href="/catalogue"
                onClick={onClose}
                className="group mt-7 rounded-full bg-aubergine px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-violet"
              >
                <Roll>Start shopping</Roll>
              </Link>
            </div>
          ) : step === "list" ? (
            <>
              {backing.length > 0 && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-orchid-soft px-4 py-3">
                  <FacePile photos={backing.map((p) => p.photo)} size={30} ring="ring-orchid-soft" />
                  <span className="whitespace-nowrap text-sm font-semibold text-aubergine">
                    <span className="max-[380px]:hidden">You&apos;re backing </span>
                    <span className="min-[381px]:hidden">Backing </span>
                    {backing.length} founders
                  </span>
                </div>
              )}
              <ul className="space-y-3">
                {list.items.map((i) => {
                  const makers = foundersOf(TEAM_OF[i.brand] ?? "");
                  return (
                    <li key={`${i.brand}:${i.sku}`} className="flex gap-3 rounded-[22px] bg-paper-2/70 p-3">
                      <Link
                        href={`/products/${i.listing}`}
                        onClick={onClose}
                        className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-paper-3"
                      >
                        {i.image && <FitImage src={i.image} alt="" sizes="80px" />}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">{i.title}</p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink/55">
                              {makers.length > 0 && <FacePile photos={makers.map((m) => m.photo)} max={3} size={16} ring="ring-paper-2" />}
                              <span className="truncate">
                                {i.brandName}
                                {i.label !== i.title ? ` · ${i.label}` : ""}
                              </span>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => list.remove(i.brand, i.sku)}
                            aria-label={`Remove ${i.title}`}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <QtyStepper size="sm" value={i.qty} onChange={(n) => list.setQty(i.brand, i.sku, n)} />
                          <span className="text-xs text-ink/50">{formatINR(i.priceMinor)} each</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={share}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet hover:underline"
              >
                {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                {copied ? "Link copied" : "Share this list with your team"}
              </button>
            </>
          ) : (
            <form id={`gift-list-details-${variant}`} onSubmit={submit} noValidate className="space-y-4">
              {/* What's being sent, at a glance, with a way back to change it. */}
              <div className="flex items-center gap-3 rounded-2xl bg-orchid-soft py-3 pl-4 pr-3">
                {backing.length > 0 && <FacePile photos={backing.map((p) => p.photo)} max={3} size={28} ring="ring-orchid-soft" />}
                <p className="min-w-0 flex-1 text-sm leading-tight">
                  <span className="block font-semibold text-aubergine">{summary}</span>
                  <span className="block text-aubergine/65">{formatINR(value)} retail value</span>
                </p>
                <button
                  type="button"
                  onClick={() => go("list")}
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-royal hover:bg-paper/60"
                >
                  Edit
                </button>
              </div>
              <Field label="Name" error={errors.name}>
                <input
                  ref={firstField}
                  value={fields.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  enterKeyHint="next"
                  className={input(errors.name)}
                />
              </Field>
              <Field label="Company" error={errors.company}>
                <input
                  value={fields.company}
                  onChange={(e) => set("company", e.target.value)}
                  autoComplete="organization"
                  enterKeyHint="next"
                  className={input(errors.company)}
                />
              </Field>
              <Field label="Work email" error={errors.email}>
                <input
                  type="email"
                  value={fields.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  enterKeyHint="next"
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
                  enterKeyHint="send"
                  placeholder="+91"
                  className={input(errors.phone)}
                />
              </Field>
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
              {(errors.form || errors.items) && (
                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
                  {errors.form ?? errors.items}
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* ── one clear next step, always in reach ── */}
      {step !== "sent" && !empty && list.ready && (
        <div
          className={cn(
            "border-t border-ink/10 bg-paper",
            sheet
              ? "px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4"
              : "sticky bottom-0 z-10 -mx-5 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:static sm:mx-0 sm:px-0 sm:pt-6",
          )}
        >
          {step === "list" ? (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink/60">Retail value</span>
                <span className="font-display text-3xl tabular-nums text-ink">{formatINR(value)}</span>
              </div>
              <p className="mt-0.5 text-xs text-ink/50">Bulk pricing lands lower. Exact quote on the call.</p>
              <button type="button" onClick={() => go("details")} className={cn(cta, "mt-4")}>
                <Roll>Continue</Roll>
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </button>
            </>
          ) : (
            <>
              <button type="submit" form={`gift-list-details-${variant}`} disabled={sending} className={cta}>
                {sending && <Loader2 className="size-5 animate-spin" />}
                {sending ? "Sending…" : <Roll>Send my list</Roll>}
              </button>
              <p className="mt-2.5 text-center text-xs text-ink/50">No account. No payment. We only use this to call you back.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** The payoff: not "order received" but the people it reached, face by face. */
function SentNote({
  sent,
  sheet,
  onDone,
  headingRef,
}: {
  sent: Sent;
  sheet: boolean;
  onDone?: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const people = sent.teams.flatMap((t) => foundersOf(t));
  const burst = useRef<HTMLDivElement>(null);
  const H = sheet ? "h2" : "h1";
  useGSAP(
    () => {
      if (!burst.current || reducedMotion()) return;
      const colours = ["#e4a7f3", "#7c4dcc", "#f0a43a", "#452a74", "#f3d9fa"];
      const bits = Array.from({ length: sheet ? 60 : 90 }, (_, i) => {
        const b = document.createElement("span");
        Object.assign(b.style, {
          position: "absolute",
          left: "50%",
          top: "30%",
          width: `${i % 3 ? 8 : 12}px`,
          height: `${i % 3 ? 14 : 12}px`,
          borderRadius: i % 3 ? "2px" : "999px",
          background: colours[i % colours.length],
        });
        burst.current!.appendChild(b);
        return b;
      });
      gsap.to(bits, {
        duration: 2.4,
        physics2D: { velocity: () => gsap.utils.random(320, sheet ? 640 : 820), angle: () => gsap.utils.random(200, 340), gravity: 900 },
        rotation: () => gsap.utils.random(-720, 720),
        opacity: 0,
        ease: "none",
        onComplete: () => bits.forEach((b) => b.remove()),
      });
    },
    { scope: burst },
  );
  return (
    <div className="relative py-4 text-center">
      <div ref={burst} aria-hidden className="pointer-events-none absolute inset-x-0 -top-10 h-[140%] overflow-visible" />
      {people.length > 0 && (
        <div className={cn("mx-auto flex flex-wrap justify-center gap-1.5", sheet ? "max-w-sm" : "max-w-lg")}>
          {people.map((p, i) => (
            <span
              key={p.photo}
              title={p.name}
              className="relative size-14 animate-rise overflow-hidden rounded-full bg-orchid-soft ring-4 ring-paper"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Image src={p.photo} alt={p.name} fill sizes="56px" className="object-cover object-top" />
            </span>
          ))}
        </div>
      )}
      <H
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "font-display mt-7 text-ink outline-none",
          sheet ? "text-[2.6rem] leading-[0.95]" : "text-[clamp(3rem,8vw,5.5rem)] leading-[0.9]",
        )}
      >
        {people.length > 0 ? (
          <>
            You just backed <em className="text-royal">{people.length} founders.</em>
          </>
        ) : (
          <>List sent. Nice.</>
        )}
      </H>
      <p className={cn("mx-auto mt-4 max-w-sm text-ink/65", !sheet && "text-lg")}>
        Someone from Mesa will reach <span className="font-semibold text-ink">{sent.email}</span> within a day. Keep your phone close.
      </p>
      <p className="mt-5 text-sm text-ink/45">
        Reference <span className="font-mono font-semibold tracking-wide text-ink">{sent.ref}</span>
      </p>
      {sheet ? (
        <button
          type="button"
          onClick={onDone}
          className="group mt-8 inline-flex rounded-full bg-aubergine px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-violet"
        >
          <Roll>Keep browsing</Roll>
        </button>
      ) : (
        <Link
          href="/catalogue"
          className="group mt-8 inline-flex rounded-full bg-aubergine px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-violet"
        >
          <Roll>Keep browsing</Roll>
        </Link>
      )}
    </div>
  );
}

const input = (error?: string) =>
  cn(
    "h-12 w-full rounded-xl border bg-white px-4 text-[16px] outline-none transition placeholder:text-ink/30 focus:ring-4",
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
