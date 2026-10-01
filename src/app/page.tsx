import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { OCCASIONS } from "@/lib/occasions";
import { PRICE_BANDS, inBand } from "@/lib/price-bands";
import { CategoryStrip } from "@/components/catalogue/category-strip";
import { ListingRail } from "@/components/home/listing-rail";
import { Icon3D } from "@/components/icon3d";

// Must be a literal for Next to read it; matches REFRESH_SECONDS in lib/catalog.
export const revalidate = 600;

/**
 * Laid out the way the Apple Store is: say what this is in one line, put every
 * shelf directly under it, then a few rails of things worth looking at, then
 * the reasons to buy here. No carousel of random products above the fold.
 */
export default async function Home() {
  const catalog = await getCatalog();
  const counts = Object.fromEntries(COLLECTIONS.map((c) => [c.id, catalog.listingsIn(c.id).length]));
  // Boxes actually called hampers lead; multipacks and combos follow.
  const hampers = catalog
    .listingsIn("hampers")
    .filter((l) => l.images.length)
    .sort((a, b) => Number(/hamper|gift box/i.test(b.title)) - Number(/hamper|gift box/i.test(a.title)));
  const featured = catalog.listings.filter((l) => l.featured);

  return (
    <>
      {/* ── headline + every shelf ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="max-w-2xl animate-rise text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Forge for Business. <span className="text-ink/45">Gifts for your whole team, made by founders.</span>
          </h1>
          <div className="shrink-0 animate-rise space-y-3 text-sm [animation-delay:80ms] lg:pb-2 lg:text-right">
            <Link href="/#how-it-works" className="group flex items-center gap-3 lg:justify-end">
              <Icon3D name="telephone-receiver" size={40} className="size-9" />
              <span>
                <span className="block font-semibold text-ink">Ordering for 50 or 5,000?</span>
                <span className="inline-flex items-center text-violet">
                  See how it works <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </div>
        </div>
        <div className="mt-12 animate-rise [animation-delay:140ms]">
          <CategoryStrip counts={counts} priority />
        </div>
      </section>

      {/* ── hampers ──────────────────────────────────────────────────────── */}
      {hampers.length > 0 && (
        <Section
          title="Gift hampers."
          tail="Ready-made boxes, the quickest way to gift a whole team."
          action={<More href="/catalogue?collection=hampers">See all {hampers.length}</More>}
        >
          <ListingRail listings={hampers.slice(0, 16)} brands={catalog.brands} />
        </Section>
      )}

      {/* ── by budget ────────────────────────────────────────────────────── */}
      <Section title="Shop by budget." tail="Retail price per unit. Bulk orders are quoted below this.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PRICE_BANDS.map((b) => {
            const n = catalog.listings.filter((l) => inBand(l.priceFromMinor, b.id)).length;
            return (
              <Link
                key={b.id}
                href={`/catalogue?price=${b.id}`}
                className="group flex flex-col justify-between rounded-3xl bg-canvas p-6 ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-royal/10 sm:p-8"
              >
                <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{b.short}</p>
                <p className="mt-10 flex items-center justify-between text-sm text-ink/50">
                  {n} products <ChevronRight className="size-4 text-violet transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ── how it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-24 sm:px-6">
        <div className="rings-dark overflow-hidden rounded-[2rem] px-6 py-14 text-white sm:px-14 sm:py-16">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            How it works. <span className="text-white/55">No account, no checkout, no card.</span>
          </h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: "clipboard",
                title: "Shortlist",
                body: "Add products with rough quantities. Share the list with your team if you need a sign-off.",
              },
              { icon: "envelope-with-arrow", title: "Send it", body: "Your name, company, email and phone. That's the whole form." },
              {
                icon: "telephone-receiver",
                title: "We call you",
                body: "Within a working day, with bulk pricing, samples and delivery timelines.",
              },
            ].map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur sm:p-7">
                <Icon3D name={s.icon} size={64} className="size-14" />
                <p className="mt-6 text-sm font-semibold text-orchid">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/65">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/catalogue"
            className="mt-10 inline-flex rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold text-royal transition hover:bg-orchid"
          >
            Start your list
          </Link>
        </div>
      </section>

      {/* ── one from every maker ─────────────────────────────────────────── */}
      <Section
        title="One from every maker."
        tail={`${catalog.totals.brands} brands, each started by students at Mesa.`}
        action={<More href="/brands">All brands</More>}
      >
        <ListingRail listings={featured} brands={catalog.brands} />
      </Section>

      {/* ── occasions ────────────────────────────────────────────────────── */}
      <Section title="For every occasion." tail="Not just Diwali.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              href={`/catalogue?occasion=${o.id}`}
              className="group flex items-center gap-5 rounded-3xl bg-canvas p-5 ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-royal/10 sm:p-6"
            >
              <Icon3D name={o.icon} size={72} className="size-14 shrink-0 transition duration-500 group-hover:scale-110 sm:size-16" />
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{o.title}</span>
                <span className="mt-0.5 block text-sm text-ink/55">{o.blurb}</span>
              </span>
              <ChevronRight className="ml-auto size-4 shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-violet" />
            </Link>
          ))}
        </div>
      </Section>

      {/* ── why here ─────────────────────────────────────────────────────── */}
      <Section title="The Forge difference." tail="More reasons to order with us.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: "package",
              lead: `${catalog.totals.brands} brands, one conversation.`,
              body: "Mix snacks, candles and tees from different makers. You deal with us, not with each of them.",
            },
            {
              icon: "sparkles",
              lead: "Your logo, on request.",
              body: "Branded sleeves, stickers or cards. We check with each maker what's possible for your order.",
            },
            {
              icon: "glowing-star",
              lead: "Every rupee backs a founder.",
              body: "Each brand is a real venture started in Mesa's Forge programme. Your order is their revenue.",
            },
          ].map((c) => (
            <div key={c.lead} className="rounded-3xl bg-canvas p-7 ring-1 ring-black/5">
              <Icon3D name={c.icon} size={64} className="size-14" />
              <p className="mt-6 text-lg leading-snug text-ink/60">
                <span className="font-semibold text-ink">{c.lead}</span> {c.body}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Section({ title, tail, action, children }: { title: string; tail?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title} {tail && <span className="text-ink/45">{tail}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex shrink-0 items-center text-sm font-semibold text-violet">
      {children} <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
