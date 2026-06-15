# NewVora — Autonomous Dropshipping Platform

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Prisma · SQLite (dev) → Postgres (prod) · Razorpay.

> First read **[PLAYBOOK.md](./PLAYBOOK.md)** — that's the strategy. This README is just setup.

---

## Quick start (local)

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# edit .env — set ADMIN_EMAIL, ADMIN_PASSWORD, AUTH_SECRET (random 32 chars)
# Razorpay keys are optional locally; COD will still work.

# 3. Database
npx prisma db push
npm run db:seed

# 4. Run
npm run dev
# Storefront → http://localhost:3000
# Admin     → http://localhost:3000/admin/login
```

The seed creates an admin user and 4 starter products with reviews.

## What's in the box

| Path | What it does |
|---|---|
| `/` | Storefront home — viral product grid |
| `/product/[slug]` | Psychology-optimised PDP (timer, scarcity, social proof, FAQ, founder note) |
| `/cart`, `/checkout` | Razorpay UPI checkout + COD fallback |
| `/order/[id]`, `/track` | Order success + tracking |
| `/admin` | Owner dashboard |
| `/admin/products`, `/admin/products/[id]` | Full product CRUD |
| `/admin/trending` | Winning-product feed (one-click import to draft) |
| `/admin/suppliers` | IndiaMART supplier finder |
| `/admin/orders` | Orders + bulk view |
| `/admin/reviews` | Reviews CRUD |
| `/admin/content` | Hook generator + 30s YouTube Short script |

## Engines

- **Trend Engine** — `src/lib/trending/`
  - Connectors: AliExpress, Amazon India, Google Trends India, Meesho, YouTube
  - Scoring: see `score.ts` (PLAYBOOK §4)
  - Run manually: `npm run trending:run`
  - Run from admin UI: `/admin/trending` → "Run scan now"
  - Run from cron: `vercel.json` already configured (4 AM IST daily)

- **Supplier Finder** — `src/lib/suppliers/`
  - IndiaMART via Apify actor (set `APIFY_TOKEN` for live data)
  - Falls back to demo suppliers in dev
  - Run for unmatched products: `npm run suppliers:run`

- **Hook & script generator** — `src/lib/content/hooks.ts`
  - Templated hooks (no LLM dependency)
  - Used by the admin Content Studio

## Deploying (₹0 stack)

1. **Database** — create a free Postgres on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. **Hosting** — push this repo to GitHub, import in [Vercel](https://vercel.com), set env vars from `.env.example`.
3. **Domain** — point `newvora.in` → Vercel.
4. **Razorpay** — switch to live keys, add webhook URL: `https://newvora.in/api/razorpay/webhook`, subscribe to `payment.captured`, `payment.failed`.
5. **Update `vercel.json`** — replace `__REPLACE_WITH_AUTH_SECRET__` with your `AUTH_SECRET` so the daily trending cron works.

Switch Prisma provider to `postgresql` in `prisma/schema.prisma` before deploying.

## What's intentionally minimal (so you can grow it)

- Connectors return curated demo data when no API token is set. Wire up Apify / SerpAPI / YouTube Data API for live trends.
- Hooks are templated. Plug in an LLM later for richer scripts.
- Abandoned-cart messaging is scaffolded (`Lead` + `cartJson`) but the WhatsApp/email send job is not wired — drop in Resend + WhatsApp Cloud API.
- Image upload uses pasted URLs. Add a Cloudinary unsigned widget when you want drag-and-drop.

These are deliberate stubs — small, replaceable surfaces. The architecture is right; we add fidelity as data justifies it.
