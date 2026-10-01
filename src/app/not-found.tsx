import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-32 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet">404</p>
      <h1 className="mt-3 text-5xl font-semibold text-royal">That shelf is empty.</h1>
      <p className="mt-4 text-ink-soft">The product may have sold out of the catalogue, or the link is wrong.</p>
      <Link href="/catalogue" className="mt-8 inline-block rounded-full bg-violet px-6 py-3 font-semibold text-white hover:bg-violet-deep">
        Back to the catalogue
      </Link>
    </div>
  );
}
