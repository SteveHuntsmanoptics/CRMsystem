
# CRM MVP Starter (Supabase + Prisma)

Bootstraps your CRM data model + seed scripts. Use this alongside the Next.js frontend scaffold.

## Setup
```bash
pnpm install
cp .env.example .env
# set DATABASE_URL
pnpm prisma migrate deploy
pnpm prisma db push
pnpm ts-node prisma/seed.ts
```
