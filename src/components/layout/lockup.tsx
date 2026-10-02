import Image from "next/image";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/base-path";

/**
 * Mesa × Forge. The official Mesa artwork is placed untouched (the brand book
 * forbids recolouring or redrawing it); "Forge" is set live beside it, since
 * the programme has no artwork of its own.
 *
 * `compact` (the phone header) keeps only Mesa's "m" tile, the same mark as
 * mesaschool.co's favicon, so "Forge" has the room.
 */
export function Lockup({ tone = "light", compact = false, className }: { tone?: "light" | "dark"; compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      {compact && (
        <Image
          src={withBase("/brand/mesa_logomark_tile.png")}
          alt="Mesa School of Business"
          width={410}
          height={435}
          priority
          className="h-9 w-auto sm:hidden"
        />
      )}
      <Image
        src={tone === "light" ? withBase("/brand/mesa_logo_on_light.png") : withBase("/brand/mesa_logo_on_dark.png")}
        alt="Mesa School of Business"
        width={1245}
        height={435}
        priority
        className={cn("h-9 w-auto sm:h-10", compact && "hidden sm:block")}
      />
      <span aria-hidden className={cn("h-7 w-px", tone === "light" ? "bg-royal/25" : "bg-white/25")} />
      <span className={cn("font-display text-[24px] italic leading-none", tone === "light" ? "text-royal" : "text-white")}>Forge</span>
    </span>
  );
}
