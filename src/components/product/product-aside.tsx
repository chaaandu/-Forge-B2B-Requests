import Link from "@/components/link";
import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/lib/catalog-types";
import { firstNames, foundersOf } from "@/lib/founders";
import { Doodle } from "@/components/doodle";
import { TeamLineup } from "@/components/team-lineup";

const inr = (n: number) => `₹${new Intl.NumberFormat("en-IN").format(Math.round(n))}`;

/**
 * Under the add button: who made it and what an order means to them, then
 * how buying in bulk works. The maker card stacks (words, then the squad) on
 * phones and tablets, and sits side by side only on a wide screen.
 */
export function ProductAside({ brand, sold }: { brand: Brand; sold: number }) {
  const people = foundersOf(brand.teamCode);
  return (
    <div className="mt-10 space-y-3">
      {people.length > 0 && (
        <Link href={`/brands/${brand.slug}`} data-cursor="Meet" className="group block overflow-hidden rounded-[28px] bg-orchid-soft">
          <div className="flex flex-col xl:grid xl:grid-cols-[1fr_1.1fr] xl:items-end">
            <div className="p-6 pb-2 xl:pb-6">
              <p className="font-display text-[1.7rem] leading-tight text-ink">Made by {firstNames(people)}</p>
              <p className="mt-2 text-sm leading-snug text-ink/65">
                Your order is {brand.name}’s revenue{sold > 0 ? <>. They’ve sold {inr(sold)} so far.</> : "."}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-royal">
                Meet the squad <ArrowUpRight className="size-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
            </div>
            <div className="@container px-4 pt-2 xl:px-0">
              <TeamLineup
                people={people}
                sizes="200px"
                className="origin-bottom transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [--person:min(150px,30cqw)] group-hover:scale-[1.04]"
              />
            </div>
          </div>
        </Link>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: "phone" as const, lead: "Bulk pricing by phone.", body: "We call within a working day with a quote." },
          { icon: "sparkle" as const, lead: "Your logo, on request.", body: `We check with ${brand.name} what’s possible.` },
        ].map((c) => (
          <div key={c.lead} className="group flex items-start gap-3 rounded-[22px] bg-paper-2 p-4">
            <Doodle name={c.icon} hover="group" className="size-10 shrink-0 text-aubergine" />
            <p className="text-pretty text-sm leading-snug text-ink/60">
              <span className="block font-semibold text-ink">{c.lead}</span>
              {c.body}
            </p>
          </div>
        ))}
      </div>
      {(brand.website || brand.instagram) && (
        <p className="flex flex-wrap gap-x-5 gap-y-1 px-1 pt-2 text-sm font-semibold">
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 whitespace-nowrap text-violet hover:underline"
            >
              {brand.name} website <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {brand.instagram && (
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 whitespace-nowrap text-violet hover:underline"
            >
              Instagram <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
