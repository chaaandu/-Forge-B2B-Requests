import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Founder } from "@/lib/founders";

/**
 * A team standing together, the way the leaderboard draws them: every
 * portrait is already scaled off its own face, so a fixed person width gives
 * every head the same size whether the team is two or four. Shoulders
 * overlap by 40% of that width; heads never do. Who stands in front is the
 * leaderboard's own call (`z`).
 *
 * The size is one CSS length, `--person`, so a card can set it once (often
 * in container units) and every squad in that card size matches.
 */
export function TeamLineup({
  people,
  className,
  names = false,
  sizes = "240px",
  hop = false,
  fit,
}: {
  people: Founder[];
  className?: string;
  names?: boolean;
  sizes?: string;
  /** Teammates hop, one after another, when the nearest `.group` is hovered. */
  hop?: boolean;
  /**
   * Size the squad to its column instead: each person as wide as fits the
   * nearest `@container`, up to this width. For a team's own page, where
   * nothing sits beside it to match.
   */
  fit?: string;
}) {
  return (
    <div
      className={cn("[--person:120px]", className)}
      // n people overlapping by 40% take (1 + 0.6(n - 1)) person-widths.
      style={fit ? ({ "--person": `min(${fit}, calc(100cqw / ${1 + 0.6 * (people.length - 1)}))` } as React.CSSProperties) : undefined}
    >
      <div className="flex items-end justify-center">
        {people.map((p, i) => (
          <figure
            key={p.photo}
            className="relative flex flex-none flex-col items-center"
            style={{
              zIndex: p.z,
              width: "var(--person)",
              marginLeft: i === 0 ? 0 : "calc(var(--person) * -0.4)",
            }}
          >
            <span
              className={cn(
                "relative block",
                hop && "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-[6%]",
              )}
              style={{ width: "var(--person)", height: "calc(var(--person) * 1.375)", transitionDelay: hop ? `${i * 70}ms` : undefined }}
            >
              <Image
                src={p.photo}
                alt={p.name}
                width={450}
                height={440}
                sizes={sizes}
                className="absolute bottom-0 left-1/2 h-auto max-w-none -translate-x-1/2"
                style={{ width: "121.62%" }}
              />
            </span>
            {names && (
              <figcaption className="absolute -bottom-10 z-10 hidden whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper shadow-lg sm:block">
                {p.name.split(" ")[0]}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {/* On a phone the shoulders sit too close for a tag each: one line of names instead. */}
      {names && (
        <p className="mt-3 text-center text-sm font-semibold text-ink/70 sm:hidden">
          {people.map((p) => p.name.split(" ")[0]).join("  ·  ")}
        </p>
      )}
    </div>
  );
}
