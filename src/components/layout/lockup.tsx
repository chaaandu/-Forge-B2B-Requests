import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Mesa × Forge. The official Mesa lockup is placed untouched (the brand book
 * forbids recolouring or redrawing it); "Forge" is set live beside it, since
 * the programme has no artwork of its own.
 */
export function Lockup({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <Image
        src={tone === "light" ? "/brand/mesa_logo_on_light.png" : "/brand/mesa_logo_on_dark.png"}
        alt="Mesa School of Business"
        width={1245}
        height={435}
        priority
        className="h-9 w-auto sm:h-10"
      />
      <span aria-hidden className={cn("h-7 w-px", tone === "light" ? "bg-royal/25" : "bg-white/25")} />
      <span className="flex flex-col leading-none">
        <span className={cn("text-lg font-extrabold tracking-tight", tone === "light" ? "text-royal" : "text-white")}>Forge</span>
        <span className={cn("mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em]", tone === "light" ? "text-amethyst" : "text-orchid")}>
          for Business
        </span>
      </span>
    </span>
  );
}
