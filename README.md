# Mesa Forge for Business

A B2B catalogue of everything the Forge founder brands sell. Company buyers (HR,
admin, procurement) browse it, shortlist products with rough quantities, and
send a request with just their **name, company, work email and phone**. There are no accounts
and no checkout. Each request lands in a Google Sheet, and the Mesa team calls back.

```
POS Postgres ──(read-only, every 10 min)──► Next.js site ──POST /api/request──► Apps Script ──► Google Sheet
      │                                         ▲                                              (Requests + Items)
      └──(npm run catalog:sync)──► data/catalog.json  (fallback if the POS is unreachable)
```

## Run it locally

```bash
npm install
cp .env.example .env.local      # fill POS_DATABASE_URL to be able to re-sync
npm run dev                     # http://localhost:3000
```

With `SHEETS_WEBHOOK_URL` empty, submitted requests go to `.data/requests.jsonl`,
so you can test the whole flow without touching the sheet.

## When teams update their products

**Nothing to do.** The site reads the POS directly (inside a `READ ONLY`
transaction) and refreshes every **10 minutes**. When a team adds a product,
changes a price or photo, sets up sizes/flavours, uploads their logo, or archives
something, buyers see it within 10 minutes, with no sync and no redeploy.

- Only **ACTIVE** products show up. DRAFT and ARCHIVED products stay hidden.
- Sizes/flavours set up as variant options in the POS become one product with choices.
- A product **renamed** in the POS gets a new URL, and the old link will 404.
  Requests aren't affected, because they're matched on brand + SKU code, which the POS never changes.
- A **new team** only appears once its code is added to `data/brands.json`.
- `GET /api/catalog-status` shows when the catalogue was last read and how many products it has.

`npm run catalog:sync` refreshes `data/catalog.json`, the snapshot the site falls
back on if the POS database can't be reached. Run it now and then and commit it.

**`POS_DATABASE_URL` uses a read-only login, `mesa_b2b_reader`** (created 2026-10-01). It can
`SELECT` the five catalogue tables and nothing else. On `Team` it sees only `id`, `code`, `logoUrl`
and `isActive`, never student names. Every session it opens is read-only, with a 20-second statement
limit. It has `BYPASSRLS` because Supabase switches row-level security on for those tables; the
grants above are what fence it in. On the Supabase pooler, the username is
`mesa_b2b_reader.<project-ref>`. This is what was run:

```sql
create role mesa_b2b_reader login password '<secret>' bypassrls noinherit connection limit 10;
alter role mesa_b2b_reader set default_transaction_read_only = on;
alter role mesa_b2b_reader set statement_timeout = '20s';
grant usage on schema public to mesa_b2b_reader;
grant select ("id", "code", "logoUrl", "isActive") on public."Team" to mesa_b2b_reader;
grant select on public."Product", public."ProductImage", public."ProductVariantGroup", public."ProductVariantOption" to mesa_b2b_reader;
```

If the POS adds a column this site needs from `Team`, grant it here too. To revoke access entirely:
`drop role mesa_b2b_reader;`

What gets shown is controlled by two hand-edited files:

| File | What it controls |
| --- | --- |
| `data/brands.json` | Maps team code → brand name, tagline, default collection, website and Instagram. A team missing from here is left off the site. |
| `data/curation.json` | **`hide`**: brand + title pattern, each with a reason. This keeps things that aren't workplace-appropriate off a corporate catalogue (alcohol/tobacco branding, drug references, profanity), plus test and internal-discount items. **`collectionRules`**: files products under a different shelf than their brand's default (cookies from a cocoa brand go to Sweet Treats; anything called a hamper, combo or pack goes to Gift Hampers). **`featured`**: pins products to the home page. |

The build also tidies what the POS gives it, because the POS is shaped for a till rather than a shop:

- **One product, many options.** If a brand entered the same product several times (at different sizes, or in different designs), the copies are merged into one product with choices. For example, Krackle's *Almond Blueberry* plus its *75g*, *100g* and *Jar* entries become one product with four sizes. LUMI's nine tank-top entries become one product with nine designs and four sizes. Designs with their own photos show as photo swatches.
- **Option names fixed.** A size option that a team labelled "Weight" (XS/S/M/L) is shown as "Size".
- **Titles cleaned up.** Text typed in caps lock becomes title case, a brand name repeated at the start of a title is dropped, and invisible characters are removed.

`npm run catalog:sync` prints exactly what was hidden and merged, and why.

**Photos** come straight from the POS's public Supabase bucket (`POS_MEDIA_BASE_URL`), not
through the POS API. The API limits each network to 600 requests a minute, and the tills share
that allowance, so buyers browsing photos must never use it up. Photos are resized by `next/image`
and shown whole, never cropped: `src/components/fit-image.tsx` places each photo inside its frame
over a blurred copy of itself, so 9:16 phone shots and 16:9 banners both sit cleanly in square tiles.

## Connect the Google Sheet

1. Create a Google Sheet, e.g. "Forge B2B requests".
2. **Extensions → Apps Script**, and paste in `apps-script/Code.gs`.
3. **Project Settings → Script properties** → add `WEBHOOK_SECRET` with a long random value
   (`openssl rand -hex 24`).
4. **Deploy → New deployment → Web app**. Execute as: *Me*. Who has access: *Anyone*.
   Copy the `/exec` URL.
5. In `.env.local` (and later in the hosting env), set `SHEETS_WEBHOOK_URL` to that URL
   and `SHEETS_WEBHOOK_SECRET` to the same secret.
6. Send a test request. The **Requests** and **Items** tabs are created on the first request.

- **Requests** has one row per enquiry: company, name, email, phone, the email's domain (to check
  against the company), products, units and indicative value. It also has a **Status** dropdown
  (New → Contacted → Quote sent → Won/Lost), and **Owner** and **Follow-up notes** columns for the team.
- **Items** has one row per product with the brand's **team code**. Filter it by team to see
  what's been asked of each Forge team.
- To get notified: in the sheet, **Tools → Notification settings → Edit notifications →
  "Any changes are made" → Email right away**.

If you edit `Code.gs`, re-deploy it (**Manage deployments → Edit → New version**), or the
old code keeps running.

## Commands

| | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build (all product and brand pages are prerendered) |
| `npm run check` | Typecheck + lint |
| `npm run format` | Prettier |
| `npm run catalog:sync` | Refresh the fallback snapshot from the POS |

## Brand and voice

**The pitch comes first.** The site argues before it sells: every gift here is someone's
first company. Founders' faces and names are everywhere a product is (portraits are the
cohort's own cut-outs, copied from the leaderboard into `public/founders/`, with
`data/founders.json` holding names and the leaderboard's line-up order). Live revenue and
reels come from the BYOB master's published feeds (`src/lib/impact.ts`, `src/lib/reels.ts`).

**Look.** Warm paper and aubergine ink, inside the Mesa Forge palette: Royal Purple for
type, Orchid for marks, Vivid Violet only where you act. Fraunces (with its SOFT and WONK
axes) is the voice; Manrope (Mesa's typeface) is the interface. The Mesa lockup in
`public/brand/` is the official artwork, unmodified; phones show only the "m" tile.

**Drawings.** Every icon is from one hand-drawn set in `src/components/doodles.tsx`: ink
outlines over an off-register colour shape, on one 96-unit grid with one stroke weight.
`<Doodle>` (`src/components/doodle.tsx`) draws them in on first view and redraws on hover.
To add one, add an entry to `DOODLES`; to change a category's drawing, change its `icon`
in `src/lib/catalog-types.ts`.

**Motion.** GSAP (ScrollTrigger, SplitText, Draggable, MotionPath, DrawSVG) with Lenis for
smooth scrolling. Everything stands down for `prefers-reduced-motion`, touch screens keep
native scrolling, and anything hidden until animated shows itself after 2.5s if scripts
never run (`.js-reveal` in `globals.css`).

**Copy.** Quick-commerce voice: short, warm, a bit cheeky. No em dashes anywhere,
including product titles from the POS, which the catalogue build rewrites
("Aroma Oil · Cinnamon"). No small all-caps labels above headings.

## Brand names

Names come from the BYOB master (Team Links / the leaderboard feed), written with every
word capitalised (`src/lib/venture-name.ts`). When a team renames its brand, change `name`
and `slug` in `data/brands.json` and keep the old slug in `aliases`: old links redirect,
and gift lists saved or shared under the old name keep working. Renamed so far: BizFits →
Pehchaan, NUTflix → Savore, WeKrave Healthy → WeKrave.
