/**
 * Read a URL-like setting. Pasting several `KEY=value` lines into a hosting
 * dashboard can leave the next line inside this value (`https://a\nNEXT=…`),
 * which silently breaks every link built from it — so take the first token and
 * say loudly that the setting needs fixing.
 */
export function urlEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const value = raw.trim().split(/\s+/)[0];
  if (value !== raw.trim()) console.error(`[env] ${name} has extra lines in it — using "${value}". Fix it in the hosting settings.`);
  return value || undefined;
}
