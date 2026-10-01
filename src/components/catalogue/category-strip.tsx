import Link from "@/components/link";
import { COLLECTIONS } from "@/lib/catalog-types";
import { cn } from "@/lib/cn";
import { Icon3D } from "@/components/icon3d";

/**
 * The Apple Store's top row: every shelf, as an object you'd find on it, with
 * its name underneath. Scrolls sideways on a phone, sits in one line on a desktop.
 */
export function CategoryStrip({ active, counts, priority }: { active?: string; counts?: Record<string, number>; priority?: boolean }) {
  return (
    <nav aria-label="Categories" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <ul className="flex min-w-max gap-2 lg:min-w-0 lg:justify-between">
        {COLLECTIONS.map((c) => (
          <li key={c.id}>
            <Link
              href={`/catalogue?collection=${c.id}`}
              aria-current={active === c.id ? "page" : undefined}
              className={cn(
                "group flex w-28 flex-col items-center rounded-2xl px-2 pb-3 pt-2 text-center transition sm:w-32",
                active === c.id ? "bg-tile" : "hover:bg-canvas",
              )}
            >
              <Icon3D
                name={c.icon}
                size={88}
                priority={priority}
                className="size-16 transition duration-500 ease-out-soft group-hover:-translate-y-1 group-hover:scale-105 sm:size-20"
              />
              <span className="mt-2 whitespace-nowrap text-[13px] font-semibold leading-tight text-ink" title={c.name}>
                {c.short}
              </span>
              {counts && <span className="mt-0.5 text-[11px] text-ink/45">{counts[c.id] ?? 0} products</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
