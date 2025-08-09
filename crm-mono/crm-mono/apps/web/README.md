
# CRM Frontend Scaffold (Next.js + Prisma + Tailwind)

This is a minimal UI scaffold that connects to the same Postgres schema (Prisma) you seeded.
It renders a simple **Dashboard** and a **Kanban Board** view from your database.

## What you get
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma Client wired to your DB
- Server components that query Boards/Columns
- API health check

## Setup
```bash
pnpm install
cp .env.example .env     # set DATABASE_URL to your Supabase/Postgres
pnpm prisma generate
pnpm dev
```

If you haven't seeded data yet, seed using the **starter repo** I sent earlier. Or copy your CSVs and run the provided seed script.

## Deploy (Vercel)
- Push this repo to GitHub (private)
- Import project in Vercel
- Add Environment Variables:
  - DATABASE_URL=[your supabase/postgres url]
  - GST_NZ_PERCENT=15
  - GST_AU_PERCENT=10
  - PRICE_TIER_RRP=1
- Deploy
