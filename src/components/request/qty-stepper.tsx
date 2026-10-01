"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { MAX_QTY } from "@/lib/request-schema";
import { cn } from "@/lib/cn";

/** Bulk-sized quantity: steps of 5 once past 10, and a typed number always wins. */
export function QtyStepper({ value, onChange, size = "md" }: { value: number; onChange: (n: number) => void; size?: "sm" | "md" }) {
  const [draft, setDraft] = useState<string | null>(null);
  const step = value >= 10 ? 5 : 1;
  const commit = (n: number) => onChange(Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1)));

  return (
    <div className={cn("inline-flex items-center rounded-full border border-black/10 bg-white", size === "sm" ? "h-9" : "h-11")}>
      <button
        type="button"
        aria-label="Fewer"
        onClick={() => commit(value - step)}
        disabled={value <= 1}
        className={cn(
          "grid place-items-center rounded-full text-royal transition hover:bg-mist disabled:opacity-30",
          size === "sm" ? "size-9" : "size-11",
        )}
      >
        <Minus className="size-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantity"
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== null) commit(Number(draft));
          setDraft(null);
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className={cn("bg-transparent text-center font-bold tabular-nums text-ink outline-none", size === "sm" ? "w-12 text-sm" : "w-16")}
      />
      <button
        type="button"
        aria-label="More"
        onClick={() => commit(value + step)}
        className={cn("grid place-items-center rounded-full text-royal transition hover:bg-mist", size === "sm" ? "size-9" : "size-11")}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
