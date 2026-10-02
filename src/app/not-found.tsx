import Link from "@/components/link";
import { Doodle } from "@/components/doodle";
import { Roll } from "@/components/layout/header";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center sm:py-36">
      <Doodle name="bag" className="size-28 text-aubergine" />
      <h1 className="font-display mt-8 text-[clamp(3rem,9vw,5.5rem)] leading-[0.9] text-ink">Nothing on this shelf.</h1>
      <p className="mt-5 text-lg text-ink/60">
        The link may be old, or the product may have sold out of the store. Plenty more where it came from.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogue"
          className="group rounded-full bg-aubergine px-7 py-4 font-semibold text-paper transition-colors hover:bg-violet"
        >
          <Roll>Back to the store</Roll>
        </Link>
        <Link href="/" className="group rounded-full border border-ink/20 px-7 py-4 font-semibold text-ink transition hover:border-ink">
          <Roll>Home</Roll>
        </Link>
      </div>
    </div>
  );
}
