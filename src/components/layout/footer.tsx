import Link from "@/components/link";
import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/catalog-types";
import { Lockup } from "./lockup";

export async function Footer() {
  const { totals } = await getCatalog();
  return (
    <footer className="mt-28 border-t border-black/5 bg-canvas text-ink/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 text-sm sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Lockup />
          <p className="mt-5 max-w-sm leading-relaxed">
            {totals.brands} brands, each started and run by founders in Mesa School of Business&apos;s Forge programme. Every bulk order
            goes to a real student business.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Shop</h3>
          <ul className="mt-3 space-y-2">
            {COLLECTIONS.map((c) => (
              <li key={c.id}>
                <Link href={`/catalogue?collection=${c.id}`} className="hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-ink">Mesa Forge</h3>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/brands" className="hover:text-ink">
                Our brands
              </Link>
            </li>
            <li>
              <Link href="/#how-it-works" className="hover:text-ink">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/request" className="hover:text-ink">
                Your request
              </Link>
            </li>
            <li>
              <a href="https://mesaschool.co" target="_blank" rel="noreferrer" className="hover:text-ink">
                mesaschool.co ↗
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink/45 sm:px-6">
          © {new Date().getFullYear()} Mesa School of Business. Prices shown are retail; bulk pricing is quoted per request.
        </p>
      </div>
    </footer>
  );
}
