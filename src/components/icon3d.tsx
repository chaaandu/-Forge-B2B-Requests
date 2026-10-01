import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * A Fluent 3D emoji from public/icons3d — Microsoft's open-source set (MIT,
 * licence alongside the files). 256px masters, so they stay sharp up to ~128px.
 */
export function Icon3D({ name, size = 64, className, priority }: { name: string; size?: number; className?: string; priority?: boolean }) {
  return (
    <Image
      src={`/icons3d/${name}.png`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority={priority}
      className={cn("select-none drop-shadow-[0_8px_12px_rgb(42_24_73/0.12)]", className)}
      draggable={false}
    />
  );
}
