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
}: {
  people: Founder[];
  className?: string;
  names?: boolean;
  sizes?: string;
  /** Teammates hop, one after another, when the nearest `.group` is hovered. */
  hop?: boolean;
}) {
  return (
    <div className={cn("flex items-end justify-center [--person:120px]", className)}>
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
            <figcaption className="absolute -bottom-10 z-10 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper shadow-lg">
              {p.name.split(" ")[0]}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
