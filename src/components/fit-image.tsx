import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * A photo shown whole inside any frame — never cropped.
 *
 * Teams upload 9:16 phone shots, 16:9 banners and squares alike, so `cover`
 * cuts products in half and `contain` alone leaves hard bars. This does what
 * Apple Music and Photos do: the photo, contained, over a blurred, enlarged
 * copy of itself that fills the rest. Both layers request the same URL at the
 * same size, so the browser downloads it once.
 *
 * Fills its nearest positioned ancestor (like `next/image` with `fill`).
 */
export function FitImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Applied to the contained photo — e.g. hover transitions. */
  className?: string;
}) {
  return (
    <>
      <Image src={src} alt="" aria-hidden fill sizes={sizes} priority={priority} className="scale-150 object-cover blur-2xl saturate-125" />
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-contain", className)} />
    </>
  );
}
