import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Founder } from "@/lib/founders";

/**
 * A team standing together: the cut-out portraits side by side, overlapping
 * a little, the middle one in front — how a team poses for a photo.
 */
export function TeamLineup({
  people,
  className,
  names = true,
  sizes = "320px",
}: {
  people: Founder[];
  className?: string;
  names?: boolean;
  sizes?: string;
}) {
  const mid = Math.floor((people.length - 1) / 2);
  return (
    <div className={cn("flex items-end justify-center", className)}>
      {people.map((p, i) => (
        <figure
          key={p.photo}
          className="relative -mx-[4%] flex w-full max-w-[44%] flex-col items-center"
          style={{ zIndex: 10 - Math.abs(i - mid) }}
        >
          <span className="relative block aspect-[450/440] w-full">
            <Image
              src={p.photo}
              alt={p.name}
              fill
              sizes={sizes}
              className="object-contain object-bottom drop-shadow-[0_20px_30px_rgb(42_24_73/0.25)]"
            />
          </span>
          {names && (
            <figcaption className="relative z-10 mt-2 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper shadow-lg">
              {p.name}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
