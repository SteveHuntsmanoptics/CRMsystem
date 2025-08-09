
# CRM Monorepo

This monorepo contains:
- `apps/starter` — Prisma schema + seed scripts (imports CSVs in `apps/starter/data`)
- `apps/web` — Next.js UI scaffold (dashboard + Kanban)

## Prereqs
- Node 18+ and `pnpm` (recommended)
- A Postgres DB (Supabase recommended; we’ll use Auckland region for NZ)

## Quick start

### 1) Install deps (workspace)
```bash
pnpm install
```

### 2) Configure database URL
Create env files for both apps:
```bash
cp apps/starter/.env.example apps/starter/.env
cp apps/web/.env.example apps/web/.env
# Set DATABASE_URL in both .env files to your Supabase/Postgres connection string
```

### 3) Apply schema + seed data
```bash
cd apps/starter
pnpm prisma migrate deploy
pnpm prisma db push
pnpm ts-node prisma/seed.ts
cd ../..
```

### 4) Run the frontend
```bash
cd apps/web
pnpm prisma generate
pnpm dev
```

Open http://localhost:3000 and you should see the dashboard and Kanban columns.

## Deploying to Vercel (monorepo)
You’ll create **two projects** in Vercel (optional—you can also deploy just `apps/web`):

- **Project 1:** `crm-web` → Root Directory: `apps/web`
  - Env Vars: `DATABASE_URL`, `GST_NZ_PERCENT=15`, `GST_AU_PERCENT=10`, `PRICE_TIER_RRP=1`

- **(Optional) Project 2:** `crm-starter` (only if you want a server task to run seeds via CI; usually run locally)
  - Root Directory: `apps/starter`

> For security, put your Unleashed credentials in Vercel **Environment Variables** later when we add the Unleashed adapter UI.
