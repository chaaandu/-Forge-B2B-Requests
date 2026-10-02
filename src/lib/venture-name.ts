/**
 * How a venture's name is written on this site: every word starts with a
 * capital ("House Of Pravaah"), shouted words are calmed down ("HAULTIES" →
 * "Haulties"), short initialisms stay as they are ("AKS"), deliberate inner
 * capitals stay too ("ChipMonk", "WeKrave"), and an ampersand gets its spaces
 * ("Munch&co" → "Munch & Co").
 */
export function ventureName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(\S)&(\S)/g, "$1 & $2")
    .replace(/[.]+$/, "")
    .split(" ")
    .map((w) => {
      if (/^[A-Z]{4,}$/.test(w)) return w[0] + w.slice(1).toLowerCase();
      if (/^[a-z]/.test(w)) return w[0].toUpperCase() + w.slice(1);
      return w;
    })
    .join(" ");
}
