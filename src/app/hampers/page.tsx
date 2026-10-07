import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { allFounders } from "@/lib/founders";
import { HAMPERS } from "@/lib/hampers";
import { pickPhotos } from "@/lib/hamper-photos";
import { SplitReveal } from "@/components/motion/reveal";
import { HampersBrowser } from "@/components/hampers/hampers-browser";

export const metadata: Metadata = {
  title: "Hampers",
  description:
    "Ready-made corporate gift hampers from ₹500 to ₹5,000, packed with products made by Forge student founders. Or build your own.",
};
// Must be a literal for Next to read it; matches REFRESH_SECONDS in lib/catalog.
export const revalidate = 600;

export default async function HampersPage() {
  const catalog = await getCatalog();
  // The whole cohort, counted the way the home page and the store count it.
  const codes = new Set(catalog.brands.map((b) => b.teamCode));
  const founders = allFounders().filter((f) => codes.has(f.teamCode)).length;

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-10 sm:px-8">
      <div className="pb-10 pt-12">
        <SplitReveal as="h1" immediate className="font-display text-[clamp(3.4rem,9vw,8rem)] leading-[0.88] text-ink">
          Hampers, <em className="text-royal">handled.</em>
        </SplitReveal>
        <p className="font-display-straight mt-4 max-w-2xl text-[clamp(1.3rem,2.2vw,1.9rem)] leading-snug text-ink/60">
          {HAMPERS.length}&nbsp;ready-made hampers,
          <br />
          packed with things made by {founders}&nbsp;founders.
        </p>
      </div>
      <HampersBrowser photos={pickPhotos(catalog)} />
    </div>
  );
}
