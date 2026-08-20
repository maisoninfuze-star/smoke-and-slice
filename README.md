# Mr Smoke Et Slice — online ordering

Bilingual (FR/EN) ordering site for the halal fire-grill on Sherbrooke West in NDG,
Montréal. Menu browsing, accounts, cart, Québec-accurate tax math, Uber Direct
delivery, Stripe or cash payment, live order tracking, and a kitchen dashboard.

## Run it

```bash
npm install
npm run db:reset   # creates SQLite db, pushes schema, seeds menu + admin
npm run dev        # http://localhost:3000
```

Admin sign-in: `admin@mrsmokeetslice.ca` / `smoke2026` — **change this before launch.**

## What's where

| Path | What it does |
|---|---|
| `prisma/menu-data.ts` | **The menu.** Transcribed from the printed card: 12 categories, 94 items, 260 options. Prices in cents. Edit, then `npm run db:reset`. |
| `prisma/schema.prisma` | Data model. SQLite in dev; switch `provider` to `postgresql` for prod, no model changes. |
| `brand/brand-kit.json` | Colours, type, voice, photo direction — all derived from the real storefront sign. |
| `brand/reference/` | The source Google photos the brand kit was read from. |
| `src/lib/uber.ts` | Uber Direct: OAuth, quotes, dispatch, cancel, webhook HMAC verification. |
| `src/lib/money.ts` | GST 5% + QST 9.975%, both on the same base (they stopped compounding in 2013). |
| `src/lib/auth.ts` | scrypt password hashing, DB-backed sessions in an httpOnly cookie. |
| `scripts/generate-creatives.ts` | Generates all site photography + the hero video via fal.ai. |
| `scripts/creative-brief.ts` | The art direction. Edit prompts here, not in the generator. |
| `scripts/audit-menu.ts` | Prints the seeded menu back as dollar prices, to diff against the printed card. |

## Security model

Prices are **never** trusted from the browser. `POST /api/orders` re-reads every
item and option from the database, re-checks each option group's min/max rules,
recomputes the subtotal, fetches its own delivery quote, and recalculates tax.
A client that forges a price or an option id gets a 409, not a discount.

Verified:

```
forged option id          → 409 INVALID_OPTION
missing required option   → 409 OPTION_RULE_VIOLATION
admin API without session → 403 UNAUTHORIZED
wrong password            → 401 INVALID_CREDENTIALS (same as unknown email)
Uber down / unconfigured  → 503 with a clear message, order still takeable
```

## Uber Direct

Set in `.env.local`:

```
UBER_CUSTOMER_ID=...
UBER_CLIENT_ID=...
UBER_CLIENT_SECRET=...
UBER_ENV=sandbox
UBER_WEBHOOK_SECRET=...
```

Without them the site still works — delivery falls back to a flat $5.99 and the
dispatch button reports `UBER_NOT_CONFIGURED` instead of failing silently.

Flow: customer enters an address → `/api/delivery/quote` prices it live (debounced)
→ order is created holding the quote id → kitchen hits **Envoyer un livreur Uber**
→ `/api/admin/orders/[id]` dispatches → Uber posts status to
`/api/webhooks/uber` (HMAC-SHA256 verified) → the tracking page shows courier
name, ETA, and a live map link.

Point the Uber webhook subscription at `https://yourdomain.ca/api/webhooks/uber`.

## Payments

Cash/debit-on-arrival works out of the box. For cards, set `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_ENABLED=true`. If Stripe fails
mid-checkout the order is still saved as payable on arrival rather than lost.

## Creatives (fal.ai)

```bash
set -a && source .env.local && set +a
npm run creatives            # only what's missing
npm run creatives -- --force # redo everything
npm run creatives -- wings.jpg
```

Needs `FAL_KEY` in `.env.local`. Images use `flux-pro/v1.1-ultra` with `raw: true`
— that flag disables the aesthetic post-pass and is the main reason the output
reads as photography rather than AI. The hero video is seeded from the generated
hero still so the poster frame matches the first frame exactly.

`public/media/storefront.jpg` is the **real** Google photo of the shop, not
generated. Keep it that way.

## Menu

Transcribed from the restaurant's printed card (scanned 2026-08-19, 6 pages):

| Section | Items | Notes |
|---|---|---|
| Hamburger | 10 | +$3.99 fries & drink combo |
| Sous-marin | 5 | +$3.99 combo |
| Poulet Parmesan | 7 | extra meat $2.99 / veggie $1.99 |
| Calzone | 6 | same extras |
| Ailes de poulet | 3 | BBQ / Buffalo / sweet & sour |
| Club Sandwich | 3 | fries + drink included |
| Pizzas | 28 | five sizes P/M/G/TG/XXL, plus Moitié-moitié |
| Poutine | 5 | two sizes |
| Wraps | 5 | +$3.99 combo |
| Salades | 3 | |
| Côtés | 8 | |
| Breuvages | 11 | Gatorade has flavour choice |

Pizza and poutine size ladders are written as the card's own dollar prices and
the surcharges are derived, so `prisma/menu-data.ts` diffs directly against the
printed menu. Verify any edit with:

```bash
npm run audit:menu
```

## Photography

83 of 94 items are photographed. Three sources, in order of preference:

| Prefix | Source |
|---|---|
| `shop-*` | The restaurant's own phone photos, segmented and recomposited (`scripts/retouch-photos.ts` + `scripts/compose-photos.py`). Food pixels untouched. |
| `real-*` | Straight from their Google listing. |
| `dish-*`, `auto-*` | Generated with fal (`scripts/generate-menu-photos.ts`, `scripts/generate-remaining.ts`). |

`auto-*` prompts are composed from each item's own ingredient list in
`menu-data.ts`, so a photo can't drift from what the kitchen actually serves:

```bash
npx tsx scripts/generate-remaining.ts --list      # what's still missing
npx tsx scripts/generate-remaining.ts --limit 12  # one batch
```

Items that already carry an image are never regenerated, so the restaurant's own
photography is safe to re-run against.

**Drinks are deliberately unphotographed.** Eleven cans generated as eleven
near-identical blank aluminium cylinders — worse than no image, and a bare can
is wrong for the water and the Gatorade.

**Note on the model:** FLUX largely ignores `negative_prompt`. Anything that must
not appear has to be crowded out by describing what *is* there in the positive
prompt. See the comments in `scripts/menu-brief.ts`.

## Before launch

- [ ] Change the admin password
- [ ] Set a strong `AUTH_SECRET`
- [ ] Switch Prisma to Postgres and set `DATABASE_URL`
- [ ] Add real Uber Direct production credentials, set `UBER_ENV=production`
- [ ] Register the Uber webhook and set `UBER_WEBHOOK_SECRET`
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain
