# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start Next.js dev server
pnpm build            # Production build
pnpm lint             # ESLint (zero warnings allowed)
pnpm typecheck        # TypeScript type checking
pnpm test             # Run all tests (vitest)
pnpm test:watch       # Watch mode
pnpm prisma:generate  # Regenerate Prisma client after schema changes
pnpm prisma:migrate   # Create and apply migrations
```

Run a single test file: `pnpm vitest run tests/unit/finance/calculations.test.ts`

## Architecture

Multi-asset personal finance tracker (stocks, funds, crypto, cash) built with Next.js 15 App Router + Prisma + MySQL.

### Layers

- **API routes** (`src/app/api/`) — Next.js route handlers. Use `ok()` / `fail()` from `@/lib/api/response` for consistent `{ code, message, data }` envelope.
- **Services** (`src/services/`) — Business logic decoupled from HTTP. Market data uses a provider pattern (`MarketDataProvider` interface) with mock/open-api implementations selected via `MARKET_DATA_PROVIDER` env var.
- **Lib** (`src/lib/`) — Shared utilities: Prisma singleton (`db/prisma`), finance calculations (`finance/calculations`), env validation via Zod (`env/server`).
- **Types** (`src/types/domain.ts`) — Shared domain enums: `AssetType`, `Market`, `Currency`, `TransactionType`, `ApiErrorCode`.

### Key patterns

- **Env validation**: All server env vars are validated at runtime via Zod schema in `src/lib/env/server.ts`. Add new vars there.
- **Prisma schema**: Uses `@@map` for snake_case table/column names while keeping camelCase in TypeScript. BigInt IDs, soft-delete via `deletedAt`.
- **UI**: shadcn/ui components (installed via `components.json`), Tailwind CSS, lucide-react icons.
- **State**: Zustand for client state, TanStack React Query for server state.
- **Charts**: ECharts for data visualization.
- **Auth**: JWT-based (access + refresh tokens), bcrypt password hashing.

### Route groups

- `(auth)` — Login/register pages (no sidebar)
- `(dashboard)` — Authenticated pages with sidebar layout

## Environment

Required env vars (see `src/lib/env/server.ts`):
- `DATABASE_URL` — MySQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — min 16 chars each
- `MARKET_DATA_PROVIDER` — `"mock"` (default) or `"open-api"`
