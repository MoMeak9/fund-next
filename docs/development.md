# Development Guide

## Purpose

This repository is a Next.js fullstack MVP skeleton for a personal asset allocation tracking product.

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm prisma:generate
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

## Current MVP Status

The core MVP modules are implemented and covered by focused service/API tests:

- Authentication: registration, login, profile lookup, profile updates, and password updates.
- Assets: asset CRUD with cost amount and market value calculations.
- Transactions: transaction list/create/update/delete flows, including asset quantity and cost rollups.
- Dashboard and reports summary: portfolio totals, allocation breakdowns, recent transactions, and active goal progress.
- Goals: active goal creation, progress calculation, update, and soft deletion.
- Exposure: fund holding exposure aggregation for look-through analysis.
- Watchlist: add, list, and soft delete watched symbols.
- Market data: provider interface with mock local provider selected by `MARKET_DATA_PROVIDER`.

Settings, reports, admin status, and rule-based AI analysis screens are implemented. Prefer adding service or API tests before changing behavior, and keep provider-backed integrations behind service interfaces so local development can continue with mocks.

## External Market Data

Market and fund data calls must go through `src/services/market-data`. Use the mock provider for local development. Add real stock, fund, or crypto providers by implementing the `MarketDataProvider` interface and selecting the provider with `MARKET_DATA_PROVIDER`.

## Recommended Feature Order

Keep the core loop stable first: run focused tests for authentication, assets, transactions, goals, exposure, dashboard/report summaries, admin status, AI analysis, and watchlist before expanding UI surfaces. New modules should follow the existing pattern of colocated schemas, service functions, route handlers, feature hooks, and focused unit tests.
