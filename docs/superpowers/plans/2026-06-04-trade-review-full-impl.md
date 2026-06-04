# Trade Review System — Full Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. After ANY `prisma/schema.prisma` change, run `pnpm prisma:migrate` then **immediately** `pnpm prisma:generate` BEFORE `pnpm typecheck`/`pnpm build` — a stale client is what broke the build previously.

**Goal:** Build the full Trade Review system from the current ~28% baseline (single `TradeReview` model + 7 enums + 5 endpoints + a flat 7-field form) to complete spec coverage: 6 models, 11 enums, ~21 endpoints, full service layer, React Query hooks, and 9 pages with ECharts visualizations. Delivered in 4 dependency-ordered phases (A = finish Phase 1 MVP; B/C/D = spec Phases 2–4), each ending green on `pnpm typecheck` + `pnpm test` + `pnpm lint` + `pnpm build`.

**Spec:** `docs/superpowers/specs/2026-05-31-trade-review-system-design.md`

---

## Baseline (verified against code)

- **Present:** `TradeReview` model (30+ fields, **missing** `planId`, `dailyRiskTotal`), 7 enums (`MarketEnvironment`, `StrategyType`, `ExecutionQuality`, `PreTradeEmotion`, `PostTradeEmotion`, `TradeGrade`, `ErrorType`), service (`listReviews`/`getReview`/`getReviewByTransaction`/`createReview`/`updateReview`/`getReviewStats` + `calculateTotalScore`/`deriveGrade`), 5 endpoints (GET/POST `/api/trade-reviews`, GET/PUT `/api/trade-reviews/[id]`, GET `/api/trade-reviews/stats`), hooks (`useTradeReviews`/`useTradeReview`/`useReviewStats`/`useCreateReview`/`useUpdateReview`), `ReviewStatsCards`, `ReviewTable`, `TradeReviewForm` (flat 7-field), pages `/review`, `/review/new`, `/review/[id]`.
- **Missing:** models `TradePlan`, `DailyReview`, `StrategyStats`, `ErrorTracking`, `ReviewAction`; enums `PlanStatus`, `StrategyStatus`, `ReviewSourceType`, `ActionStatus`; `DELETE /api/trade-reviews/[id]`; the full `IndicatorDashboard`; the 3-step form; R-multiple auto-calc; error auto-aggregation; ~16 endpoints; 6 pages.

## Architecture notes (reuse existing patterns)

- **Schema conventions** (house style, NOT the spec's bare types): every id `BigInt @id @default(autoincrement()) @db.UnsignedBigInt`; every FK `BigInt @map("...") @db.UnsignedBigInt`; timestamps `@db.DateTime(0)`; date-only fields `@db.Date`; Decimal precisions per §2; soft-delete (`deletedAt`) only where the spec defines it (TradePlan).
- **Services**: extend `src/services/trade-review/index.ts` + sibling `schema.ts` (Zod). Throw `ReviewError(code, message)` for 404/409 (already in file).
- **API**: routes under `src/app/api/*` use `getCurrentUserId(request)` (bigint|null), `ok(data)`/`fail(code,msg)` envelope, Zod `safeParse` → `fail(400, parsed.error.errors[0].message)`. Put `/api/review-stats/*` in its own folder so it never collides with `[id]` segments.
- **Frontend**: thin client `page.tsx` under `src/app/(dashboard)/review/*`; real UI in `src/features/review/components/*` via TanStack Query hooks in `hooks.ts` (`apiFetch<T>` + `useToast`); camelCase types in `types.ts`. Charts copy the ECharts-core pattern from `src/features/dashboard/PieChart.tsx`.
- **totalScore** stays app-computed + persisted (baseline choice) unless the user opts into a DB `GENERATED` column — see Open Questions.
- **Tests** follow `tests/unit/services/*.test.ts` (vitest + `vi.mock('@/lib/db/prisma')`). Pure helpers get direct unit tests; routes/components are verified via `pnpm typecheck` + `pnpm build` (no route/component harness exists).

---

## Phase A — Complete the Phase 1 MVP (full single-trade review)

**Objective:** Bring the existing TradeReview path to full spec field coverage: add `planId` + `dailyRiskTotal` columns, expand the Zod schema and service to persist every field, replace the flat 7-field form with a 3-step wizard (context / execution+risk / scoring+attribution) including the five score sliders with computed `totalScore` and auto-derived grade, add a read-only `TradeScoreCard`, and land the pure `calculateRMultiple`/`deriveGrade` helpers with unit tests.

### Task A1: Add `planId` + `dailyRiskTotal` columns, migrate, regenerate
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_add_review_plan_fields/migration.sql` (via `prisma migrate dev`)

- [ ] In `model TradeReview` add two nullable scalars in house style: `planId BigInt? @map("plan_id") @db.UnsignedBigInt` (no relation yet — `TradePlan` lands in Phase B) and `dailyRiskTotal Decimal? @map("daily_risk_total") @db.Decimal(20, 4)`.
- [ ] Do NOT add a `plan` relation or `@@index` on `planId` yet (keeps this migration FK-free / non-destructive).
- [ ] `pnpm prisma:migrate` (nullable adds = safe on existing rows, no backfill).
- [ ] **Immediately** `pnpm prisma:generate`.
- **Verify:** `pnpm prisma:generate && pnpm typecheck` → exit 0; client exposes `tradeReview.planId` and `dailyRiskTotal`.

### Task A2: Extend Zod schema + service to persist all review fields
- Modify: `src/services/trade-review/schema.ts`, `src/services/trade-review/index.ts`
- Depends on: A1

- [ ] `schema.ts`: add to `createReviewSchema` → `planId: z.string().optional()`, `dailyRiskTotal: z.number().optional()`, `screenshots: z.array(z.string()).optional()`. Keep `updateReviewSchema = createReviewSchema.omit({transactionId:true}).partial()`.
- [ ] `createReview()`: persist `planId` (`BigInt(input.planId)` | null), `dailyRiskTotal` (`new Decimal(...)` | null), `screenshots` (`?? null`).
- [ ] `updateReview()`: add matching `if (input.X !== undefined)` branches for the three.
- [ ] `serializeReview()`: emit `planId` (String|null), `dailyRiskTotal` (Number|null), `screenshots` passthrough.
- [ ] Add exported pure helper `calculateRMultiple(entryPrice, stopLoss, exitPrice): number | null` → null when `entryPrice===stopLoss`, else `(exitPrice-entryPrice)/(entryPrice-stopLoss)` (long-side per §4.2). Do NOT wire into `createReview` yet (needs `plan.stopLoss`, Phase B). Export `deriveGrade` and `calculateTotalScore` for tests.
- **Verify:** `pnpm typecheck && pnpm lint` → exit 0, zero warnings.

### Task A3: Extend frontend `TradeReview` type for new fields
- Modify: `src/features/review/types.ts`
- Depends on: A2

- [ ] Add `planId: string | null`, `dailyRiskTotal: number | null`, `screenshots: string[] | null` to the `TradeReview` type.
- [ ] Confirm existing label maps cover all enum values (PlanStatus label map belongs to Phase B).
- [ ] No hook changes (`useCreateReview`/`useUpdateReview` already pass `Record<string,unknown>` bodies).
- **Verify:** `pnpm typecheck` → exit 0.

### Task A4: Rebuild `TradeReviewForm` as a 3-step wizard
- Modify: `src/features/review/components/TradeReviewForm.tsx`
- Create: `src/features/review/components/review-form/Step1Context.tsx`, `Step2Execution.tsx`, `Step3Scoring.tsx`
- Depends on: A3

- [ ] Convert flat form → 3-step wizard holding one form-values object in local state, Back/Next + final Submit; preserve create-vs-edit detection (`review` prop = edit).
- [ ] **Step 1 (context):** `planId` placeholder select (disabled/hidden until Phase B), `marketEnvironment` select, `keyLevels`/`newsEvents`/`sectorContext` textareas.
- [ ] **Step 2 (execution+risk):** `followedPlan` radio (是/否), `entryQuality`/`exitQuality` radios (good/acceptable/poor), `chasedPrice`/`movedStopLoss`/`addedPosition` checkboxes, `mae`/`mfe`/`riskPerTrade`/`accountRiskPct`/`dailyRiskTotal` number inputs, `rMultiple` manual number input.
- [ ] **Step 3 (scoring+attribution):** five shadcn `Slider` — `scoreOpportunity` 0–25, `scorePlanning` 0–25, `scoreRiskControl` 0–20, `scoreDiscipline` 0–20, `scorePsychology` 0–10; read-only `totalScore` = sum + read-only `tradeGrade` derived client-side (A≥80, B≥60, else C) to mirror the service; `errorType`/`preTradeEmotion`/`postTradeEmotion` selects; `profitSource`/`lossReason`/`hindsightAction`/`nextAction` textareas; `isRepeatable`/`exposesPattern`/`includeInSample`(default true) toggles; `notes` textarea; `screenshots` URL list input.
- [ ] Reuse shadcn/ui `Select`/`RadioGroup`/`Checkbox`/`Slider`/`Textarea`/`Switch`/`Button`; submit via `useCreateReview`/`useUpdateReview`; keep create-only `transactionId` select (existing `apiFetch` transaction-list load).
- **Verify:** `pnpm typecheck && pnpm lint && pnpm build` → build completes, no prerender errors.

### Task A5: `TradeScoreCard` read-only summary + wire into detail page
- Create: `src/features/review/components/TradeScoreCard.tsx`
- Modify: `src/app/(dashboard)/review/[id]/page.tsx`
- Depends on: A4

- [ ] `TradeScoreCard` props `{ review }`: `tradeGrade` badge, `totalScore`/100, five-dimension breakdown bar (each score vs its max), `rMultiple`, `errorType` label via existing maps. Use shadcn `Card` + `Badge` + divs (no chart lib).
- [ ] On `[id]` page show `TradeScoreCard` above the edit form (or as a toggle) so detail is read-only-first per spec; keep edit form available.
- **Verify:** `pnpm build` → `/review/[id]` compiles and renders.

### Task A6: Unit tests for service field coverage + pure helpers
- Create: `tests/unit/services/trade-review.test.ts`
- Depends on: A2

- [ ] Mock `@/lib/db/prisma` (`tradeReview.findFirst/create/update`, `transaction.findFirst`) following `goals.test.ts`.
- [ ] `createReview`: persists `planId`/`dailyRiskTotal`/`screenshots`; computes `totalScore`; derives grade (80/60 boundaries); throws `ReviewError(404)` (missing tx) and `ReviewError(409)` (duplicate).
- [ ] `updateReview`: partial sets only provided fields; recomputes `totalScore`+grade on score change; leaves grade when `tradeGrade` explicitly provided.
- [ ] Pure helpers direct: `calculateRMultiple` (long formula, null when entry===stop), `deriveGrade`, `calculateTotalScore` (null when all scores null).
- **Verify:** `pnpm vitest run tests/unit/services/trade-review.test.ts` → pass; then `pnpm test` green overall.

---

## Phase B — Trade Plans + Daily Reviews + Indicator Dashboard (spec Phase 2)

**Objective:** Introduce `TradePlan` (with `PlanStatus` + soft-delete) and `DailyReview` models, wire the `TradeReview.plan` relation, deliver their CRUD services/APIs/hooks/UI, add the full 8-field `IndicatorDashboard`, and enable plan-based R-multiple auto-calc.

### Task B1: Add `PlanStatus` enum, `TradePlan` + `DailyReview` models, wire relations, migrate, regenerate
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_add_trade_plans_daily_reviews/migration.sql`
- Depends on: A1

- [ ] `enum PlanStatus { draft active executed cancelled expired }`.
- [ ] `model TradePlan @@map("trade_plans")` per §2.1, house style: `hypothesis @db.Text`; `marketEnvironment MarketEnvironment`; `timeframe String? @db.VarChar(20)`; `entryTrigger @db.Text`; `entryPrice`/`stopLoss`/`takeProfit`/`positionSize @db.Decimal(20,8)`; `riskAmount @db.Decimal(20,4)`; `expectedRr @db.Decimal(10,2)`; `invalidation @db.Text?`; `strategyType StrategyType`; `status PlanStatus @default(draft)`; timestamps `@db.DateTime(0)`; `deletedAt DateTime? @db.DateTime(0)`. Relations: `user`, `asset UserAsset?`, `reviews TradeReview[]`. Indexes `@@index([userId,status])`, `@@index([userId,strategyType])`.
- [ ] `model DailyReview @@map("daily_reviews")` per §2.3: `reviewDate @db.Date`; `bestTradeId`/`worstTradeId @db.UnsignedBigInt?`; text fields `@db.Text`; `totalTrades`/`winCount`/`lossCount Int?`; `netR @db.Decimal(10,4)?`; `planAdherencePct @db.Decimal(10,2)?`; `@@unique([userId,reviewDate])`.
- [ ] On `TradeReview` add `plan TradePlan? @relation(fields:[planId], references:[id])`. On `User` add `plans TradePlan[]` and `dailyReviews DailyReview[]`. On `UserAsset` add `tradePlans TradePlan[]`.
- [ ] `pnpm prisma:migrate` → **immediately** `pnpm prisma:generate`.
- **Verify:** `pnpm prisma:generate && pnpm typecheck` → exit 0; client exposes `prisma.tradePlan`, `prisma.dailyReview`.

### Task B2: Plan + daily-review service methods + plan-based R-multiple auto-calc
- Modify: `src/services/trade-review/schema.ts`, `src/services/trade-review/index.ts`
- Depends on: B1

- [ ] Zod: `createPlanSchema` (`hypothesis`/`marketEnvironment`/`entryTrigger`/`strategyType` required, rest optional, `status` default draft), `updatePlanSchema = partial`; `dailyReviewSchema` (all optional) for upsert.
- [ ] Implement `createPlan`, `listPlans(userId,{status?,strategyType?,page,pageSize})` (paginated `{items,total,page,pageSize}`), `getPlan` (`deletedAt:null`), `updatePlan` (reject when soft-deleted), `softDeletePlan` (set `deletedAt=now()`), `executePlan(userId,planId,transactionId)` (verify ownership of both, set `status='executed'`). Add `serializePlan` (BigInt→String, Decimal→Number, dates→ISO).
- [ ] Implement `upsertDailyReview(userId,date,data)` via `prisma.dailyReview.upsert` on `(userId,reviewDate)` (parse date → `@db.Date`), `getDailyReview`, `listDailyReviews(userId,{startDate,endDate})`.
- [ ] Wire plan-based R-multiple: in `createReview`/`updateReview`, when `planId` set, `rMultiple` NOT provided, plan has `stopLoss`+`entryPrice`, and transaction has price → `rMultiple = calculateRMultiple(plan.entryPrice, plan.stopLoss, transaction.price)`. No-op gracefully when any input missing.
- **Verify:** `pnpm typecheck && pnpm lint` → exit 0.

### Task B3: `getIndicatorDashboard` service (full 8-field dashboard)
- Modify: `src/services/trade-review/index.ts`
- Depends on: B1

- [ ] `getIndicatorDashboard(userId)` over `includeInSample` reviews ordered by transaction time: `planAdherenceRate` (% followedPlan), `avgRMultiple` (mean non-null rMultiple), `gradeAPercentage` (% grade A), `maxConsecutiveLoss` (longest run rMultiple<0), `maxDrawdownR` (running-cumulative-R minimum, negative), `errorCostR` (sum rMultiple where errorType!=='none'), `totalTrades`, `netR` (sum rMultiple).
- [ ] Keep existing 5-field `getReviewStats` intact for backward compat.
- [ ] Factor `maxConsecutiveLoss` + `maxDrawdownR` as pure helpers (Phase C reuses them).
- **Verify:** `pnpm typecheck` → exit 0.

### Task B4: API routes — trade-plans, daily-reviews, review-stats/indicators
- Create: `src/app/api/trade-plans/route.ts`, `trade-plans/[id]/route.ts`, `trade-plans/[id]/execute/route.ts`, `daily-reviews/route.ts`, `daily-reviews/[date]/route.ts`, `review-stats/indicators/route.ts`
- Depends on: B2, B3

- [ ] `trade-plans/route.ts`: GET (filters → `listPlans`) + POST (`createPlanSchema` → `createPlan`).
- [ ] `trade-plans/[id]/route.ts`: GET (404 if null/soft-deleted) + PUT (`updatePlanSchema`) + DELETE (`softDeletePlan` → `ok(null)`).
- [ ] `trade-plans/[id]/execute/route.ts`: POST `{ transactionId }` → `executePlan`; `ReviewError` 404 handling.
- [ ] `daily-reviews/route.ts`: GET (`startDate`/`endDate`/`page` → `listDailyReviews`). `daily-reviews/[date]/route.ts`: GET (404 if null) + PUT (`dailyReviewSchema` → `upsertDailyReview`).
- [ ] `review-stats/indicators/route.ts`: GET → `getIndicatorDashboard` (own folder, no `[id]` collision).
- **Verify:** `pnpm build` → all six route files compile.

### Task B5: Frontend types + hooks for plans, daily reviews, indicators
- Modify: `src/features/review/types.ts`, `src/features/review/hooks.ts`
- Depends on: B4

- [ ] Types: `PlanStatus` union, `TradePlan`, `DailyReview`, `IndicatorDashboard`, `PlanFilters`, `DateRange`, `PLAN_STATUS_LABELS`.
- [ ] Hooks (apiFetch/useToast pattern): `useTradePlans`/`useTradePlan`/`useCreatePlan`/`useUpdatePlan`/`useDeletePlan`/`useExecutePlan` (invalidate `['trade-plans']`); `useDailyReview`/`useDailyReviews`/`useUpsertDailyReview` (invalidate `['daily-reviews']`); `useIndicatorDashboard` → `/api/review-stats/indicators` (key `['review-stats','indicators']`).
- **Verify:** `pnpm typecheck` → exit 0.

### Task B6: PlanForm + plans page, DailyReviewPanel + calendar daily page, IndicatorDashboard
- Create: `src/features/review/components/PlanForm.tsx`, `DailyReviewPanel.tsx`, `IndicatorDashboard.tsx`, `src/app/(dashboard)/review/plans/page.tsx`, `review/daily/page.tsx`
- Modify: `src/app/(dashboard)/review/page.tsx`, `src/features/review/components/TradeReviewForm.tsx`
- Depends on: B5

- [ ] `PlanForm`: all §5.2 fields, `useCreatePlan`/`useUpdatePlan`. plans page: filter row (status/strategy) + plan list (`useTradePlans`) + `PlanForm` in a dialog, with execute/soft-delete actions.
- [ ] `DailyReviewPanel`: three-question form (best/worst trade selects from that day's transactions + reasons, `tomorrowImprovement`, `marketSummary`, `notes`) + read-only daily stats; `useUpsertDailyReview`. daily page: shadcn `Calendar` marking reviewed dates (from `useDailyReviews(monthRange)`) that loads the selected date's panel.
- [ ] `IndicatorDashboard`: 5 cards (`planAdherenceRate` %, `avgRMultiple` ±X.XR, `gradeAPercentage` %, `maxDrawdownR` -X.XR, `errorCostR` -X.XR + % of netR) with ▲/▼/● indicators; consumes `useIndicatorDashboard`. Swap into `/review` overview in place of (or above) `ReviewStatsCards`.
- [ ] Enable the `planId` select in `TradeReviewForm` Step 1 via `useTradePlans({status:'active'})`.
- **Verify:** `pnpm build && pnpm lint` → `/review`, `/review/plans`, `/review/daily` compile, zero warnings.

### Task B7: Service tests — plans, daily-review upsert, indicator dashboard, plan-based R-multiple
- Modify: `tests/unit/services/trade-review.test.ts`
- Depends on: B2, B3

- [ ] Extend prisma mock with `tradePlan` and `dailyReview` methods.
- [ ] Test `createPlan`/`listPlans` (filter + pagination shape), `executePlan` sets `status='executed'`, `softDeletePlan` sets `deletedAt`, `getPlan` excludes soft-deleted.
- [ ] Test `upsertDailyReview` hits `prisma.dailyReview.upsert` on the `(userId,reviewDate)` key.
- [ ] Test `getIndicatorDashboard` math on a fixed fixture.
- [ ] Test plan-based R-multiple fills `rMultiple` when plan has entry+stop and tx has price, no-ops when `stopLoss` missing.
- **Verify:** `pnpm test` → all pass.

---

## Phase C — Statistics: Weekly / Monthly / Strategy analysis (spec Phase 3)

**Objective:** Add `StrategyStats` (+ `StrategyStatus`), the `calculateExpectancy` pure function and `WeeklyStats`/`MonthlyStats` builders, the weekly/monthly/strategy services and APIs, hooks, and the ECharts suite (`WeeklyStatsChart` sub-charts, `RMultipleChart`, `StrategyComparison`, `EnvironmentFilter`, `MonthlyDecisionPanel`) plus pages.

### Task C1: Add `StrategyStatus` enum + `StrategyStats` model, migrate, regenerate
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_add_strategy_stats/migration.sql`
- Depends on: B1

- [ ] `enum StrategyStatus { active observation paused retired }`.
- [ ] `model StrategyStats @@map("strategy_stats")` per §2.4: `strategyType StrategyType`; `periodStart`/`periodEnd @db.Date`; `sampleCount`/`winCount`/`lossCount Int @default(0)`; `winRate`/`avgWinR`/`avgLossR`/`expectancy`/`profitFactor`/`maxDrawdownR @db.Decimal(10,4)?`; `maxConsecutiveLoss Int?`; `bestEnvironment`/`worstEnvironment MarketEnvironment?`; `status StrategyStatus @default(active)`; `statusReason @db.Text?`; `@@unique([userId,strategyType,periodStart,periodEnd])`; `@@index([userId,status])`.
- [ ] Add `strategyStats StrategyStats[]` to `User`.
- [ ] `pnpm prisma:migrate` → **immediately** `pnpm prisma:generate`.
- **Verify:** `pnpm prisma:generate && pnpm typecheck` → exit 0; client exposes `prisma.strategyStats`.

### Task C2: Pure stats helpers — `calculateExpectancy` + WeeklyStats/MonthlyStats builders
- Create: `src/services/trade-review/stats.ts`, `tests/unit/services/trade-review-stats.test.ts`
- Depends on: C1

- [ ] `calculateExpectancy(reviews): number` per §4.2 (wins rMultiple>0, losses<0; `winRate*avgWinR-(1-winRate)*avgLossR`; null/0 rMultiple excluded).
- [ ] `profitFactor` (Σ+R / |Σ−R|), `maxConsecutiveLoss`, `maxDrawdownR` (reuse Phase B helpers), bin helper for rMultiple buckets (`<-3, -3..-2, …, >+3`).
- [ ] `buildWeeklyStats(reviews) → WeeklyStats`, `buildMonthlyStats(reviews, strategyStats) → MonthlyStats` (WeeklyStats shape + `strategyDecisions` with `suggestedStatus` from sampleCount/winRate/expectancy/maxDrawdownR thresholds).
- [ ] Unit-test all pure helpers with fixtures (no prisma).
- **Verify:** `pnpm vitest run tests/unit/services/trade-review-stats.test.ts` → all pass.

### Task C3: Weekly/monthly/strategy stats service methods
- Modify: `src/services/trade-review/index.ts`
- Depends on: C2

- [ ] `calculateWeeklyStats(userId, weekStart)`: load `includeInSample` reviews in 7-day window (createdAt) → `buildWeeklyStats`.
- [ ] `calculateStrategyStats(userId, strategyType, range)`: filter by strategyType+includeInSample, compute all stats + best/worstEnvironment, `prisma.strategyStats.upsert` on the unique key; return serialized. strategyType omitted = iterate all enum values.
- [ ] `calculateMonthlyStats(userId, month)`: aggregate calendar-month reviews → `buildMonthlyStats`, reading/refreshing per-strategy `strategy_stats` for `suggestedStatus`.
- **Verify:** `pnpm typecheck && pnpm lint` → exit 0.

### Task C4: API routes — review-stats weekly / monthly / strategy
- Create: `src/app/api/review-stats/weekly/route.ts`, `monthly/route.ts`, `strategy/route.ts`
- Depends on: C3

- [ ] weekly: GET requires `startDate`+`endDate` → `calculateWeeklyStats` (`fail(400)` when missing).
- [ ] monthly: GET accepts `month=YYYY-MM` (or date range) → `calculateMonthlyStats`.
- [ ] strategy: GET optional `strategyType` + range → `calculateStrategyStats` (array). All use `getCurrentUserId` + `ok`/`fail`.
- **Verify:** `pnpm build` → three route files compile.

### Task C5: Stats types + hooks
- Modify: `src/features/review/types.ts`, `src/features/review/hooks.ts`
- Depends on: C4

- [ ] Types: `StrategyStatus` union, `StrategyStats`, `StrategyMiniStats`, `WeeklyStats`, `MonthlyStats`, `STRATEGY_STATUS_LABELS`.
- [ ] Hooks: `useWeeklyStats(startDate,endDate)`, `useMonthlyStats(month)`, `useStrategyStats()` → `/api/review-stats/strategy`.
- **Verify:** `pnpm typecheck` → exit 0.

### Task C6: Chart components (ECharts) + weekly/monthly/strategy pages
- Create: `src/features/review/components/RMultipleChart.tsx`, `EnvironmentFilter.tsx`, `StrategyComparison.tsx`, `WeeklyStatsChart.tsx`, `MonthlyDecisionPanel.tsx`, `src/app/(dashboard)/review/weekly/page.tsx`, `review/monthly/page.tsx`, `review/strategies/page.tsx`
- Depends on: C5

- [ ] Copy the ECharts-core registration pattern from `src/features/dashboard/PieChart.tsx` (import only needed chart types: Bar/Line/Radar/Pie/Heatmap; init in `useEffect`; dispose + resize cleanup).
- [ ] `RMultipleChart`: histogram of rMultiple bins. `EnvironmentFilter`: button-group/select over the 5 `MarketEnvironment` values (value/onChange). `StrategyComparison`: grouped bar of expectancy (+winRate) by strategyType, sliceable by `EnvironmentFilter`.
- [ ] `WeeklyStatsChart`: composite — summary table + strategy bar + environment radar + A/B/C pie + plan-adherence line + error-type bar + embedded `RMultipleChart`, driven by `WeeklyStats`.
- [ ] `MonthlyDecisionPanel`: table per strategy (sampleCount, winRate, expectancy, maxDrawdownR, suggestedStatus) with editable decision + reason.
- [ ] weekly/monthly/strategies pages: thin client wrappers. Add `export const dynamic = 'force-dynamic'` (or wrap `useSearchParams` in Suspense) to avoid the Next prerender URL warning.
- **Verify:** `pnpm build && pnpm lint` → three pages compile, no prerender warnings, zero lint warnings.

### Task C7: Service tests — strategy stats upsert + weekly/monthly aggregation
- Modify: `tests/unit/services/trade-review.test.ts`
- Depends on: C3

- [ ] Extend prisma mock with `strategyStats.upsert/findMany`.
- [ ] Test `calculateStrategyStats` computes winRate/expectancy/profitFactor/maxConsecutiveLoss/maxDrawdownR and calls upsert on the unique key; `calculateWeeklyStats`/`calculateMonthlyStats` return expected shapes on a fixture.
- **Verify:** `pnpm test` → all pass.

---

## Phase D — Error Tracking + Action Items (spec Phase 4)

**Objective:** Add `ErrorTracking` and `ReviewAction` models (+ `ReviewSourceType`, `ActionStatus`), wire automatic error aggregation into review create/update, deliver their services/APIs/hooks, build `ErrorHeatmap` and `ActionItemList` with pages, link daily-review `tomorrowImprovement` to action creation, and add nav entries.

### Task D1: Add `ReviewSourceType` + `ActionStatus` enums, `ErrorTracking` + `ReviewAction` models, migrate, regenerate
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<ts>_add_error_tracking_review_actions/migration.sql`
- Depends on: C1

- [ ] `enum ReviewSourceType { trade_review daily_review weekly_review monthly_review }`, `enum ActionStatus { active completed failed cancelled }`.
- [ ] `model ErrorTracking @@map("error_tracking")` per §2.5: `errorType ErrorType`; `occurrenceCount Int @default(0)`; `totalLossR Decimal @default(0) @db.Decimal(10,4)`; text diagnostics `@db.Text?`; `trackingStart`/`trackingEnd @db.Date?`; `isImproving Boolean?`; `@@unique([userId,errorType])`; `@@index([userId,isImproving])`.
- [ ] `model ReviewAction @@map("review_actions")` per §2.6: `sourceType ReviewSourceType`; `sourceId @db.UnsignedBigInt?` (polymorphic, **no FK**); `problem`/`rule @db.Text` NOT NULL; `trackingDays Int?`; `metric @db.Text?`; `status ActionStatus @default(active)`; `result @db.Text?`; `startedAt`/`completedAt @db.Date?`; `@@index([userId,status])`; `@@index([userId,sourceType])`.
- [ ] Add `errorTrackings ErrorTracking[]` and `reviewActions ReviewAction[]` to `User`.
- [ ] `pnpm prisma:migrate` → **immediately** `pnpm prisma:generate`.
- **Verify:** `pnpm prisma:generate && pnpm typecheck` → exit 0; client exposes `prisma.errorTracking`, `prisma.reviewAction`.

### Task D2: Error tracking + action-item services, wire error auto-aggregation
- Modify: `src/services/trade-review/index.ts`, `src/services/trade-review/schema.ts`
- Depends on: D1

- [ ] `trackError(userId, errorType, lossR)`: `prisma.errorTracking.upsert` on `(userId,errorType)` incrementing `occurrenceCount` and adding `lossR` to `totalLossR`; `getErrorStats(userId)` ordered by `occurrenceCount` desc; `updateErrorTracking(userId, errorType, data)` for editable diagnostics (ownership check).
- [ ] `createAction(userId,data)`, `listActions(userId,status?)`, `updateAction(userId,id,data)`, `completeAction(userId,id,result)` (status='completed', completedAt=now()). Add `createActionSchema`/`updateActionSchema`.
- [ ] Wire §4.2 error aggregation: in `createReview` AND `updateReview`, when resulting `errorType !== 'none'`, call `trackError(userId, errorType, rMultiple<0 ? Number(rMultiple) : 0)`. On update, **diff against the persisted prior value** to avoid double-counting.
- **Verify:** `pnpm typecheck && pnpm lint` → exit 0.

### Task D3: API routes — review-stats/errors and review-actions
- Create: `src/app/api/review-stats/errors/route.ts`, `review-actions/route.ts`, `review-actions/[id]/route.ts`, `review-actions/[id]/complete/route.ts`
- Depends on: D2

- [ ] errors: GET → `getErrorStats`.
- [ ] `review-actions/route.ts`: GET (status filter → `listActions`) + POST (`createActionSchema` → `createAction`).
- [ ] `review-actions/[id]/route.ts`: PUT (`updateActionSchema` → `updateAction`, 404 if not owned).
- [ ] `review-actions/[id]/complete/route.ts`: POST `{ result }` → `completeAction`. All use `getCurrentUserId` + `ok`/`fail`.
- **Verify:** `pnpm build` → four route files compile.

### Task D4: Error + action types and hooks
- Modify: `src/features/review/types.ts`, `src/features/review/hooks.ts`
- Depends on: D3

- [ ] Types: `ReviewSourceType` union, `ActionStatus` union, `ErrorTracking`, `ReviewAction`, `ACTION_STATUS_LABELS`, `REVIEW_SOURCE_LABELS`.
- [ ] Hooks: `useErrorStats()` → `/api/review-stats/errors`; `useReviewActions(status?)`, `useCreateAction`, `useUpdateAction(id)`, `useCompleteAction(id)` (invalidate `['review-actions']`).
- **Verify:** `pnpm typecheck` → exit 0.

### Task D5: `ErrorHeatmap` + `ActionItemList`, errors/actions pages, daily→action linkage, nav
- Create: `src/features/review/components/ErrorHeatmap.tsx`, `ActionItemList.tsx`, `src/app/(dashboard)/review/errors/page.tsx`, `review/actions/page.tsx`
- Modify: `src/features/review/components/DailyReviewPanel.tsx`, `src/components/layout/app-sidebar.tsx`
- Depends on: D4

- [ ] `ErrorHeatmap`: ECharts heatmap/matrix of errorType frequency + occurrenceCount/totalLossR columns from `useErrorStats`. errors page renders it.
- [ ] `ActionItemList`: list of `ReviewAction` with status badge, inline status update (`useUpdateAction`), Mark Complete opening a result input (`useCompleteAction`). actions page adds a status filter.
- [ ] In `DailyReviewPanel` add a "generate action" button on `tomorrowImprovement` → `useCreateAction` with `sourceType='daily_review'`.
- [ ] Nav (per Open Question): either add sub-items under `/review` in `navItems` (plans/daily/weekly/monthly/strategies/errors/actions) or an in-page tab bar via a `/review` layout. Implement the chosen approach.
- **Verify:** `pnpm build && pnpm lint` → `/review/errors`, `/review/actions` compile, daily linkage works, zero warnings.

### Task D6: Service tests — error aggregation + action lifecycle, full green sweep
- Modify: `tests/unit/services/trade-review.test.ts`
- Depends on: D2

- [ ] Extend prisma mock with `errorTracking.upsert/findMany` and `reviewAction` methods.
- [ ] `createReview` with `errorType!=='none'` calls `errorTracking.upsert` with the negative rMultiple as lossR; `errorType==='none'` does not; `updateReview` adjusts aggregation only on change.
- [ ] `createAction`/`listActions(status)`/`completeAction` (sets completed + completedAt + result).
- [ ] Final gate: `pnpm test && pnpm typecheck && pnpm lint && pnpm build` → all green.
- **Verify:** all green.

---

## Risks

- **Stale Prisma client** (exact cause of the recent build break): every schema edit MUST be followed by `pnpm prisma:generate` (and `pnpm prisma:migrate` to apply DDL) BEFORE `pnpm typecheck`/`build`. Every schema task above calls this out.
- **totalScore representation drift:** baseline persists an app-computed SmallInt `total_score`; spec §2.7 wants a MySQL `GENERATED ALWAYS AS STORED` column. Switching is a destructive ALTER, makes the column Prisma-read-only (service must stop setting it + read-after-write), and Prisma treats it as drift unless guarded. **Recommend keeping app-computed** unless DB-enforced generation is required.
- **R-multiple auto-calc depends on frequently-absent data:** needs `plan.entryPrice` + `plan.stopLoss` + a transaction exit price, but `planId` is optional and prices nullable. Must no-op gracefully. Formula is long-only — short trades and which leg is "exit" are unresolved (see Open Questions).
- **Existing-row migration:** nullable column adds + new tables are non-destructive (no backfill); the Phase B `TradeReview.plan` FK references `trade_plans` created in the same phase — table before FK. No existing review references a plan, so historical `planId` stays null.
- **Next prerender URL warning:** new client pages use `useSearchParams`/`useParams`; without a Suspense boundary or `export const dynamic = 'force-dynamic'` the build emits CSR-bailout warnings. Phase C/D page tasks add the guard. (This is the same class of warning currently emitted by `/transactions`.)
- **error_type enum subset vs full set:** `trade_reviews.error_type` uses the full 11-value Prisma enum (good); if DB CHECK constraints are added they must NOT block `revenge_trade`/`fomo_entry`/`news_gamble` or aggregation breaks. `error_tracking` uses the full set minus `none`, enforced by app logic.
- **Aggregation correctness:** `maxConsecutiveLoss`/`maxDrawdownR` require deterministic ordering (transactionTime then createdAt); error aggregation on `updateReview` can double-count unless it diffs against the persisted record.
- **`review_actions.sourceId` is polymorphic with no FK** — orphaned references possible; validation is app-level only.

## Open Questions (decide before/within implementation)

1. **totalScore:** keep app-computed persisted SmallInt (recommended) or migrate to MySQL `GENERATED` column (Prisma-read-only, destructive ALTER)?
2. **Score CHECK constraints (0-25/0-25/0-20/0-20/0-10):** rely on existing Zod app-level validation (recommended) or also add DB CHECK constraints in the Phase A migration?
3. **Navigation:** sidebar sub-menu under `/review` for the 7 sub-pages, or one `/review` entry + in-page tab bar (a `/review` route-group layout)?
4. **Route naming:** keep existing `/review/new` + `/review/[id]` (id = review id), or adopt spec's `/review/trades/:id` (id = transaction id, find-or-create)? Plan upgrades existing routes in place and treats spec names as aliases unless told otherwise.
5. **R-multiple semantics:** confirm long-only `(exit-entry)/(entry-stop)`, how to handle short trades, and the entry-price source (`plan.entryPrice` vs entry transaction) when a tx row is a single buy/sell leg.
6. **IndicatorDashboard time window:** all-time (plan default) or rolling 30/90-day? §5.3's delta arrows imply period-over-period needing a defined window.
7. **`trade-reviews/stats` field naming:** keep the existing 5-field response for backward compat alongside the new 8-field `/api/review-stats/indicators`, or rename to spec's `avgRMultiple`/`gradeAPercentage`/`netR` and update `ReviewStatsCards`?
8. **Page file location:** keep app-dir `page.tsx` entrypoints (recommended, matches existing `/review` pages) or add the spec's `src/features/review/pages/*.tsx` layer that app pages re-export?

---

## Suggested commit cadence

One commit per task (`feat:`/`test:`), or one per phase if preferred. Each phase ends green on `pnpm typecheck && pnpm test && pnpm lint && pnpm build` — do not advance phases on red.




