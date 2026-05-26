# Development Guide

## Commands

```bash
pnpm install           # Install dependencies
pnpm dev               # Start Next.js dev server
pnpm build             # Production build
pnpm typecheck         # TypeScript type checking
pnpm lint              # ESLint (zero warnings allowed)
pnpm test              # Run all tests (vitest)
pnpm test:watch        # Watch mode
pnpm prisma:generate   # Regenerate Prisma client after schema changes
pnpm prisma:migrate    # Create and apply migrations
```

## Environment

Copy `.env.example` to `.env.local` for local development.

```bash
DATABASE_URL="mysql://user:password@localhost:3306/fund_next"
JWT_ACCESS_SECRET="replace-with-local-access-secret"
JWT_REFRESH_SECRET="replace-with-local-refresh-secret"
MARKET_DATA_PROVIDER="mock"
MARKET_DATA_API_KEY=""
MARKET_DATA_BASE_URL=""
```

## Implemented Modules

| Module | Status | Description |
|--------|--------|-------------|
| Auth | Done | Register, login, logout, JWT httpOnly cookies, middleware |
| Assets | Done | CRUD, type/market filters, soft delete, ownership check |
| Dashboard | Done | Total assets, allocation charts, recent transactions, goal progress |
| Transactions | Done | CRUD with pagination, asset quantity/avgCost auto-update |
| Goals | Done | Active goal with progress calculation, monthly suggestion |
| Fund Exposure | Done | One-layer penetration, duplicate holding aggregation |
| Watchlist | Done | Add/remove with market data search |
| Settings | Done | Profile update, password change, logout |
| Reports | Done | Summary cards, allocation pie charts |
| Admin | Done | System status, DB health, stats |
| AI Analysis | Done | Rule-based asset analysis summary |

## External Market Data

Market and fund data calls go through `src/services/market-data`. Use the mock provider for local development. Add real providers by implementing the `MarketDataProvider` interface and selecting via `MARKET_DATA_PROVIDER` env var.

## Architecture

See `CLAUDE.md` for layer descriptions and key patterns.
