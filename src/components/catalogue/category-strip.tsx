import Link from "@/components/link";
import { COLLECTIONS } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";
import { Doodle } from "@/components/doodle";

/**
 * Every shelf as a little arched shop window with its drawing inside. The
 * window tints and the drawing redraws itself on hover. Scrolls sideways on a
 * phone, sits in one row on a desktop.
 */
export function CategoryStrip({ active, counts }: { active?: string; counts?: Record<string, number> }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8">
      <ul className="flex min-w-max gap-3 lg:min-w-0 lg:justify-between lg:gap-4">
        {COLLECTIONS.map((c) => (
          <li key={c.id} className="lg:flex-1">
            <Link
              href={`/catalogue?collection=${c.id}`}
              aria-current={active === c.id ? "page" : undefined}
              className="group flex w-28 flex-col items-center text-center lg:w-auto"
            >
              <span
                className={cn(
                  "grid aspect-[5/6] w-full place-items-center rounded-t-full rounded-b-[22px] text-aubergine transition-colors duration-500",
                  active === c.id ? "bg-orchid-soft ring-2 ring-royal" : "bg-paper-2 group-hover:bg-orchid-soft",
                )}
              >
                <Doodle name={c.icon} hover="group" className="mt-[18%] w-[62%]" />
              </span>
              <span className="mt-3 text-[13px] font-semibold leading-tight text-ink">{c.short}</span>
              {counts && <span className="mt-0.5 text-[11px] text-ink/45">{counts[c.id] ?? 0} gifts</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
