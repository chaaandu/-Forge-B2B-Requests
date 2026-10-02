import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Overlapping round portraits, at most `max` of them, then a "+N" chip for
 * the rest, so a row of faces always fits on one line.
 */
export function FacePile({
  photos,
  max = 5,
  size = 32,
  total,
  className,
  ring = "ring-paper",
}: {
  photos: string[];
  max?: number;
  size?: number;
  /** How many people the row stands for, when that's more than the photos passed. */
  total?: number;
  className?: string;
  ring?: string;
}) {
  const shown = photos.slice(0, max);
  const extra = (total ?? photos.length) - shown.length;
  return (
    <span className={cn("flex shrink-0", className)} style={{ marginLeft: size * 0.1 }}>
      {shown.map((src) => (
        <span
          key={src}
          className={cn("relative shrink-0 overflow-hidden rounded-full bg-orchid-soft ring-2", ring)}
          style={{ width: size, height: size, marginLeft: -size * 0.28 }}
        >
          <Image src={src} alt="" fill sizes={`${size * 2}px`} className="object-cover object-top" />
        </span>
      ))}
      {extra > 0 && (
        <span
          className={cn("relative grid shrink-0 place-items-center rounded-full bg-ink font-bold tabular-nums text-paper ring-2", ring)}
          style={{ width: size, height: size, marginLeft: -size * 0.28, fontSize: Math.max(10, size * 0.34) }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
