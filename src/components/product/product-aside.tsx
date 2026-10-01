import { ArrowUpRight } from "lucide-react";
import type { Brand } from "@/lib/catalog-types";
import { Icon3D } from "@/components/icon3d";

/** The reassurances under the add button: how pricing works, branding, who made it. */
export function ProductAside({ brand }: { brand: Brand }) {
  const notes = [
    { icon: "telephone-receiver", lead: "Bulk pricing by phone.", body: "We call within a working day with a quote for your quantity." },
    { icon: "sparkles", lead: "Your logo, on request.", body: `We check with ${brand.name} what's possible for packaging.` },
    { icon: "glowing-star", lead: "Made by founders.", body: `${brand.name} is a student venture from Mesa's Forge programme.` },
  ];
  return (
    <div className="mt-8 grid gap-3">
      {notes.map((c) => (
        <div key={c.lead} className="flex items-start gap-4 rounded-2xl bg-canvas p-4 ring-1 ring-black/5">
          <Icon3D name={c.icon} size={48} className="size-10 shrink-0" />
          <p className="text-sm leading-snug text-ink/60">
            <span className="font-semibold text-ink">{c.lead}</span> {c.body}
          </p>
        </div>
      ))}
      {(brand.website || brand.instagram) && (
        <p className="flex gap-5 px-1 text-sm font-semibold">
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-violet hover:underline"
            >
              {brand.name} website <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {brand.instagram && (
            <a
              href={brand.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-0.5 text-violet hover:underline"
            >
              Instagram <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </p>
      )}
    </div>
  );
}
