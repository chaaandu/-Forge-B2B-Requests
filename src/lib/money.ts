const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const inrPaise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** Integer paise → `₹1,299`, or `₹79.50` when there are paise to show. */
export function formatINR(minor: number): string {
  return minor % 100 === 0 ? inr.format(minor / 100) : inrPaise.format(minor / 100);
}

export function priceRange(fromMinor: number, toMinor: number): string {
  return fromMinor === toMinor ? formatINR(fromMinor) : `${formatINR(fromMinor)} – ${formatINR(toMinor)}`;
}
