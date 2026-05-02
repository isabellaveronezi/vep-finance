# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**FinControl** — personal finance web app (single-user MVP). Tracks transactions, credit cards, recurring bills, budgets, savings goals, debts, and alerts.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 (Docker local, Neon in prod) |
| Auth | NextAuth.js v5 (Auth.js) — Credentials provider only |
| Charts | Recharts |
| Validation | Zod + React Hook Form |
| Package manager | pnpm |

## Commands

All `pnpm`/`npx` commands must run inside the Docker container:

```bash
# Start the environment (postgres + app + adminer)
docker compose up -d

# Dev server (already started by docker compose)
docker exec fincontrol_app pnpm dev

# Build
docker exec fincontrol_app pnpm build

# Lint
docker exec fincontrol_app pnpm lint

# Prisma — generate client after schema changes
docker exec fincontrol_app npx prisma generate

# Prisma — create and apply migration
docker exec fincontrol_app npx prisma migrate dev --name <name>

# Prisma — apply migrations in production
docker exec fincontrol_app npx prisma migrate deploy

# Prisma — seed
docker exec fincontrol_app npx prisma db seed

# Adminer (DB GUI) — http://localhost:8080
```

App runs on http://localhost:3000.

## Architecture

### Route Groups

- `app/(auth)/` — unauthenticated routes (login). Uses its own layout without sidebar.
- `app/(app)/` — authenticated routes. Layout includes sidebar + header, protected by NextAuth middleware.
- `app/api/auth/[...nextauth]/` — NextAuth handler.

### Data Flow

Pages are **Server Components** that fetch directly via `db` and pass data to Client Components. Mutations use **Server Actions** (`'use server'`) co-located in `actions.ts` files next to each route. After mutations, call `revalidatePath()` for all affected routes.

```
app/(app)/transacoes/page.tsx      ← Server Component, fetches data
app/(app)/transacoes/actions.ts    ← Server Actions (create/update/delete)
components/transacoes/             ← Client Components (forms, lists)
```

### Auth Pattern

Every Server Action must authenticate the caller:

```typescript
async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Não autenticado')
  return session.user.id
}
```

Always scope DB queries with `userId` to prevent cross-user data access.

### Prisma 7 Config

Prisma 7 uses `prisma.config.ts` (not `schema.prisma`) for the database URL:

```typescript
// prisma.config.ts
export default defineConfig({
  datasource: { url: process.env["DATABASE_URL"] },
})
```

The generated client lives at `app/generated/prisma` (not `@prisma/client`). Import from:

```typescript
import { PrismaClient } from '@/app/generated/prisma/client'
```

Always use the singleton from `lib/db.ts` — never instantiate `PrismaClient` directly.

The client uses the `@prisma/adapter-pg` driver (PrismaPg adapter with a connection string), not the default query engine.

### Validation

Zod schemas are in `lib/validations/`. Always validate with `schema.safeParse(data)` in Server Actions before touching the DB.

## Key Business Rules

- `mesAno` format is `"YYYY-MM"` (e.g. `"2026-04"`) — used as budget/dashboard period key.
- Monthly balance = sum of ENTRADA transactions with status PAGO − sum of SAIDA.
- `DividaTerceiro` = money others owe **you**. Payments received create a `Transacao` with `tipo: ENTRADA` + `dividaId`.
- `DividaPropria` = money **you** owe others. Payments made create a `Transacao` with `tipo: SAIDA` + `dividaPropiaId`.
- `saldoRestante` for debts is always computed in the application (`valorTotal − valorRecebido`), never stored.
- Budgets are per-category per-month: `@@unique([userId, categoriaId, mesAno])`. A budget with `categoriaId = null` is the global monthly limit.
- Credit card installments: each installment is a separate `Transacao` row with `numeroParcela` / `totalParcelas` set.
- Categories are fully dynamic user data — never create separate tables for expense groupers.

## Design System

Visual tokens, color palette, and component previews live in `desing-vep/`. Reference `desing-vep/colors_and_type.css` for brand colors and typography before adding new UI.

## Utilities (`lib/utils.ts`)

- `cn()` — Tailwind class merging (clsx + tailwind-merge)
- `formatCurrency(value)` — formats to BRL (R$)
- `formatDate(date)` — formats to pt-BR locale
- `getMesAno(date?)` — returns `"YYYY-MM"` string
