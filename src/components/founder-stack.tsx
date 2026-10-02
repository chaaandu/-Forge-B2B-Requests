import Image from "next/image";
import { cn } from "@/lib/cn";
import { firstNames, foundersOf } from "@/lib/founders";

/** The makers' faces, overlapping, with their first names — "by Pragati, Annashri & Kavya". */
export function FounderStack({
  teamCode,
  size = 26,
  showNames = true,
  className,
  tone = "light",
}: {
  teamCode: string;
  size?: number;
  showNames?: boolean;
  className?: string;
  tone?: "light" | "dark";
}) {
  const people = foundersOf(teamCode);
  if (!people.length) return null;
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex -space-x-2">
        {people.map((p) => (
          <span
            key={p.photo}
            className={cn(
              "relative overflow-hidden rounded-full bg-orchid-soft ring-2",
              tone === "light" ? "ring-paper" : "ring-aubergine-2",
            )}
            style={{ width: size, height: size }}
          >
            <Image src={p.photo} alt="" fill sizes={`${size * 2}px`} className="object-cover object-top" />
          </span>
        ))}
      </span>
      {showNames && (
        <span className={cn("truncate text-xs", tone === "light" ? "text-ink/55" : "text-paper/60")}>by {firstNames(people)}</span>
      )}
    </span>
  );
}
