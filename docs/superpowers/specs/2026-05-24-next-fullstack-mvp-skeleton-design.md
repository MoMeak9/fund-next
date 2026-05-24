# Next Fullstack MVP Skeleton Design

Date: 2026-05-24

## Context

The repository currently contains product and technical documents for a personal asset allocation tracking product. The PRD describes a broad long-term vision, while the MVP spec narrows the first build to a web-based product where users manually record assets, review allocation, inspect basic fund exposure, record transactions, and track a long-term principal goal.

The MVP spec is the source of truth for this initialization. It recommends a modular monolith, MySQL 8.x, Next.js, React, TypeScript, TailwindCSS, shadcn/ui, ECharts, React Query, and Zustand. The larger technical architecture document describes future microservices and heavier infrastructure, but those are not part of the initial project skeleton.

## Goal

Initialize the repository as a Next.js fullstack MVP development skeleton. The skeleton should be more than an empty app, but it should not implement the first business feature yet.

The expected outcome is a runnable, typed, maintainable foundation that can directly support future implementation of authentication, asset management, dashboard, fund exposure, transaction review, goal planning, watchlist, and report modules.

## Non-Goals

- Do not implement a complete registration, login, asset creation, or dashboard workflow in this initialization.
- Do not connect to brokerage, fund platform, exchange, wallet, or paid market data APIs.
- Do not implement AI investment advice.
- Do not split the codebase into independent backend services.
- Do not build mobile app experiences beyond basic responsive web layout support.

## Selected Approach

Use a Next.js fullstack monolith:

- Next.js App Router for pages and API routes.
- TypeScript across application, API, services, and tests.
- TailwindCSS for styling.
- shadcn/ui-compatible component setup.
- Prisma with MySQL 8.x as the database layer.
- Zod for request and environment validation.
- TanStack Query prepared for client-side server state.
- Zustand prepared for limited UI and auth state.
- ECharts prepared for dashboard and exposure visualizations.
- Vitest for unit tests, focused first on pure calculation logic.

This approach matches the user's selected option: MVP development skeleton. It keeps the project lightweight enough for fast iteration while establishing stable contracts for later feature work.

## Project Structure

The root repository should become the Next.js application. Business code should be organized by feature so each MVP module has a clear boundary.

Planned top-level structure:

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    layout/
    charts/
  features/
    auth/
    assets/
    dashboard/
    exposure/
    transactions/
    goals/
    watchlist/
    reports/
  lib/
    api/
    auth/
    db/
    env/
    finance/
    validation/
  services/
    market-data/
  store/
  types/
tests/
  unit/
  api/
  e2e/
prisma/
```

`src/features` owns domain-specific UI, types, schemas, and helpers. `src/lib` owns cross-cutting infrastructure. `src/services/market-data` owns all external market and fund data provider integrations.

## Pages

The skeleton should include route-level placeholders for the MVP pages:

- `/login`
- `/register`
- `/dashboard`
- `/assets`
- `/assets/new`
- `/exposure`
- `/transactions`
- `/goals`
- `/watchlist`
- `/reports`
- `/settings`
- `/ai`

The first screen after login should be the dashboard. Reports, settings, and AI pages may remain placeholders. The AI placeholder must make clear that any future analysis is not investment advice.

## API Design

API routes should use the MVP spec response shape:

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

Error responses should use the documented code set: 400, 401, 403, 404, 409, and 500.

The skeleton should include typed response helpers and placeholder route handlers for:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/assets`
- `POST /api/assets`
- `PUT /api/assets/[id]`
- `DELETE /api/assets/[id]`
- `GET /api/dashboard`
- `GET /api/exposure/funds`
- `GET /api/exposure/funds/[fundAssetId]`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/goals/active`
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/[id]`
- `GET /api/watchlists`
- `POST /api/watchlists`

Initialization should not add partial production authentication behavior. Auth libraries and validation helpers may be prepared, but token issuance, middleware enforcement, and resource ownership checks should be implemented in the first business feature plan.

## Data Model

Use Prisma with MySQL 8.x. The initial schema should represent the MVP document's core tables:

- `users`
- `user_assets`
- `transactions`
- `goals`
- `fund_holdings`
- `asset_prices`
- `watchlists`
- `asset_daily_snapshots`

Prisma models can use idiomatic names such as `UserAsset` while mapping to snake_case table names with `@@map`. Decimal fields should use Prisma Decimal-compatible database types with enough precision for money, prices, and quantities. User-owned data must include `user_id` relationships. Soft deletion should use `deleted_at` where the MVP spec includes it.

The schema should prepare indexes and unique constraints from the MVP spec, especially user email uniqueness, asset lookup indexes, fund holding lookup indexes, price time indexes, watchlist uniqueness, and one snapshot per user per date.

## External Market Data Services

Open API requests for market data must be modeled as a dedicated service layer rather than embedded inside pages or API routes.

Create `src/services/market-data` with:

- `MarketDataProvider`, the common provider interface.
- `getQuote(symbol, market)`, for a single asset quote.
- `getQuotes(symbols)`, for batch quote retrieval.
- `getFundHoldings(fundSymbol)`, for public or provider-backed fund holdings.
- `searchAssets(keyword)`, for stock, fund, and crypto lookup.
- `MockMarketDataProvider`, for local development without API keys.
- `OpenApiMarketDataProvider`, a placeholder adapter for real provider integration.

Environment variables should support provider selection and credentials:

- `MARKET_DATA_PROVIDER`
- `MARKET_DATA_API_KEY`
- `MARKET_DATA_BASE_URL`

Provider errors should be normalized into a small internal error type, such as `MarketDataError`. The caller should be able to show empty states or fallback data without knowing provider-specific error formats.

## Finance Calculation Library

Create a pure calculation library under `src/lib/finance`. It should be independent from React, Next.js, and Prisma. Initial functions should cover:

- market value calculation
- cost amount calculation
- profit and profit rate calculation
- goal completion calculation
- monthly required contribution calculation
- one-layer fund exposure amount calculation
- duplicate underlying holding aggregation

These functions are the first testing priority because they carry product correctness risk.

## State Management

Server data should primarily flow through API routes and TanStack Query. Zustand should be reserved for small client-only concerns, such as sidebar state, UI filters, and temporary auth UI state. Persistent financial records should stay in the database.

## Error Handling

API routes should use shared response helpers so success and error envelopes stay consistent.

Validation errors should return code 400. Missing or invalid auth should return 401. Resource ownership failures should return 403 once authentication is implemented. Missing records should return 404. Duplicate email or watchlist conflicts should return 409. Unexpected failures should return 500 without leaking secrets, tokens, or detailed asset data.

Market data provider failures should be wrapped and mapped to safe product states, such as "no quote available" or "no fund holding data available."

## Testing

Testing should start with focused unit tests:

- asset market value
- cost amount
- profit and profit rate
- goal progress
- monthly required contribution
- fund exposure amount
- duplicate holding aggregation

API tests can be scaffolded but do not need to cover real workflows until the corresponding business features are implemented. E2E tests can be configured or documented for the future core path: register, login, add asset, view dashboard, view exposure, add transaction, create goal, view goal progress.

## Acceptance Criteria

- The repository has a runnable Next.js TypeScript application skeleton.
- The project includes TailwindCSS and a shadcn/ui-compatible structure.
- Prisma is configured for MySQL and includes MVP schema models.
- API response helpers and placeholder MVP API routes exist.
- Route-level page placeholders exist for MVP pages.
- External market data service interfaces and mock/open API provider placeholders exist.
- Finance calculation helpers and initial unit tests exist.
- Environment variable examples document database and market data provider settings.
- No business workflow is partially implemented as a hidden side effect of initialization.
