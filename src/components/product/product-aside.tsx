import Link from "@/components/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/lib/catalog-types";
import { firstNames, foundersOf } from "@/lib/founders";
import { Icon3D } from "@/components/icon3d";
import { TeamLineup } from "@/components/team-lineup";

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/** Under the add button: who made it and what an order means to them, then how buying in bulk works. */
export function ProductAside({ brand, sold }: { brand: Brand; sold: number }) {
  const people = foundersOf(brand.teamCode);
  return (
    <div className="mt-10 space-y-3">
      {people.length > 0 && (
        <Link href={`/brands/${brand.slug}`} data-cursor="Meet" className="group block overflow-hidden rounded-[28px] bg-orchid-soft">
          <div className="grid grid-cols-[1fr_1.1fr] items-end">
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet">Made by</p>
              <p className="font-display mt-2 text-2xl leading-tight text-ink">{firstNames(people)}</p>
              <p className="mt-2 text-sm leading-snug text-ink/65">
                Your order is {brand.name}&apos;s revenue{sold > 0 ? <>. They&apos;ve sold {inr(sold)} so far.</> : "."}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal">
                Meet the team <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
            <TeamLineup people={people} names={false} sizes="160px" className="pt-6 transition duration-700 group-hover:scale-105" />
          </div>
        </Link>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: "telephone-receiver", lead: "Bulk pricing by phone.", body: "We call within a working day with a quote." },
          { icon: "sparkles", lead: "Your logo, on request.", body: `We check with ${brand.name} what's possible.` },
        ].map((c) => (
          <div key={c.lead} className="flex items-start gap-3 rounded-[22px] bg-paper-2 p-4">
            <Icon3D name={c.icon} size={48} className="size-9 shrink-0" />
            <p className="text-sm leading-snug text-ink/60">
              <span className="font-semibold text-ink">{c.lead}</span> {c.body}
            </p>
          </div>
        ))}
      </div>
      {(brand.website || brand.instagram) && (
        <p className="flex gap-5 px-1 pt-2 text-sm font-semibold">
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-violet hover:underline"
            >
              {brand.name} website <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {brand.instagram && (
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-violet hover:underline"
            >
              Instagram <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
