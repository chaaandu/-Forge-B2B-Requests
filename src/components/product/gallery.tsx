"use client";

import { cn } from "@/lib/cn";
import { FitImage } from "@/components/fit-image";

/** Controlled: the parent decides which photo is showing, so picking a design can turn to its photo. */
export function Gallery({
  images,
  title,
  active,
  onSelect,
}: {
  images: string[];
  title: string;
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:max-h-[640px] sm:flex-col sm:overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl bg-tile transition sm:size-20",
                i === active ? "ring-2 ring-royal" : "opacity-60 hover:opacity-100",
              )}
            >
              <FitImage src={src} alt="" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square w-full min-w-0 flex-1 overflow-hidden rounded-[32px] bg-paper-2">
        {images.map((src, i) => (
          <div key={src} className={cn("absolute inset-0 transition duration-500", i === active ? "opacity-100" : "opacity-0")}>
            <FitImage src={src} alt={i === 0 ? title : ""} priority={i === 0} sizes="(min-width: 1024px) 640px, 100vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
