/** Per-unit budget bands, in paise. Shared by the catalogue filter and the home page. */
export const PRICE_BANDS = [
  { id: "u250", label: "Under ₹250", short: "Under ₹250", min: 0, max: 25_000 },
  { id: "250-500", label: "₹250 – ₹500", short: "₹250–500", min: 25_000, max: 50_000 },
  { id: "500-1000", label: "₹500 – ₹1,000", short: "₹500–1,000", min: 50_000, max: 100_000 },
  { id: "1000+", label: "₹1,000 and up", short: "₹1,000+", min: 100_000, max: Infinity },
] as const;

export const inBand = (priceMinor: number, bandId: string) => {
  const band = PRICE_BANDS.find((b) => b.id === bandId);
  return !band || (priceMinor >= band.min && priceMinor < band.max);
};
