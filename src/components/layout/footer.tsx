import Link from "@/components/link";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { Lockup } from "./lockup";

export async function Footer() {
  const { totals } = await getCatalog();
  return (
    <footer className="relative mt-32 overflow-hidden bg-aubergine-2 text-paper">
      <div className="mx-auto max-w-[1500px] px-5 pt-20 sm:px-8">
        <p className="font-display max-w-5xl text-[clamp(3rem,9vw,9rem)] leading-[0.9]">
          Gift like it <em className="text-orchid">matters.</em>
        </p>
        <div className="mt-16 grid gap-12 border-t border-paper/10 py-12 text-sm text-paper/60 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Lockup tone="dark" />
            <p className="mt-5 max-w-sm leading-relaxed">
              {totals.brands} brands, started and run by students in Forge, the venture-building year at Mesa School of Business. Every
              order is real revenue for a real first company.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-paper">What they make</h3>
            <ul className="mt-3 space-y-2">
              {COLLECTIONS.map((c) => (
                <li key={c.id}>
                  <Link href={`/catalogue?collection=${c.id}`} className="hover:text-orchid">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-paper">Forge</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/brands" className="hover:text-orchid">
                  Meet the founders
                </Link>
              </li>
              <li>
                <Link href="/#how" className="hover:text-orchid">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-orchid">
                  Your gift list
                </Link>
              </li>
              <li>
                <a href="https://mesaschool.co" target="_blank" rel="noreferrer" className="hover:text-orchid">
                  mesaschool.co ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p
        aria-hidden
        className="font-display pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center text-[12.5vw] leading-none text-paper/[0.06]"
      >
        made by founders
      </p>
      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-[1500px] px-5 py-5 text-xs text-paper/40 sm:px-8">
          © {new Date().getFullYear()} Mesa School of Business · Prices shown are retail; bulk pricing is quoted per request.
        </p>
      </div>
    </footer>
  );
}
