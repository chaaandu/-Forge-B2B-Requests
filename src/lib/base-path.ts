/**
 * The site lives at fb.mesaschool.co.in/b2b: the leaderboard owns that domain
 * and forwards `/b2b/*` here (see README → "Address"). Next prefixes links and
 * routes with this on its own; anything it can't see — a local `<Image src>`,
 * a `fetch`, a URL built for the clipboard — goes through `withBase`.
 */
export const BASE_PATH = "/b2b";

export const withBase = (path: string) => `${BASE_PATH}${path}`;
