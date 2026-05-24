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

## MVP Boundaries

The current skeleton prepares the application for MVP development. It does not implement registration, login, asset CRUD, dashboard calculations, or provider-backed market data yet.

## External Market Data

Market and fund data calls must go through `src/services/market-data`. Use the mock provider for local development. Add real stock, fund, or crypto providers by implementing the `MarketDataProvider` interface and selecting the provider with `MARKET_DATA_PROVIDER`.

## Recommended Feature Order

Implement authentication first, then asset CRUD, then dashboard summary. These features unlock the core MVP loop.
