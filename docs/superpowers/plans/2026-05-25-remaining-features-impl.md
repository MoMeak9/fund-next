# Remaining Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix P0-P1 test gaps and implement Settings, Reports, Admin, and AI analysis pages.

**Architecture:** Extend existing service layer + API routes + React Query hooks pattern. Category A fixes test issues in-place. Category B adds 4 new feature modules following the established `src/features/<module>/` + `src/app/api/<module>/` + `src/services/<module>/` structure.

**Tech Stack:** Next.js 15, React Query, shadcn/ui, Prisma, Vitest, Zod, ECharts (reuse PieChart), bcryptjs.

---

## File Structure

### Category A (Fixes)
- Create: `tests/unit/services/transactions.test.ts`
- Modify: `tests/unit/services/goals.test.ts`
- Modify: `docs/development.md`

### Category B — Settings
- Modify: `src/services/auth/schema.ts`
- Modify: `src/services/auth/index.ts`
- Create: `src/app/api/auth/profile/route.ts`
- Create: `src/app/api/auth/password/route.ts`
- Create: `src/features/settings/hooks.ts`
- Create: `src/features/settings/ProfileForm.tsx`
- Create: `src/features/settings/PasswordForm.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`

### Category B — Reports
- Modify: `src/app/api/reports/summary/route.ts`
- Create: `src/features/reports/hooks.ts`
- Create: `src/features/reports/SummaryCards.tsx`
- Create: `src/features/reports/AllocationCharts.tsx`
- Modify: `src/app/(dashboard)/reports/page.tsx`

### Category B — Admin
- Modify: `src/app/api/admin/status/route.ts`
- Create: `src/features/admin/hooks.ts`
- Create: `src/features/admin/StatusCards.tsx`
- Create: `src/features/admin/StatsCards.tsx`
- Modify: `src/app/(dashboard)/admin/page.tsx`

### Category B — AI Analysis
- Create: `src/services/ai/index.ts`
- Create: `src/app/api/ai/analysis/route.ts`
- Create: `src/features/ai/hooks.ts`
- Create: `src/features/ai/AnalysisCard.tsx`
- Create: `src/features/ai/InsightsList.tsx`
- Create: `src/features/ai/RiskDisclaimer.tsx`
- Modify: `src/app/(dashboard)/ai/page.tsx`

---

### Task 1: Fix goals.test.ts Type Errors

**Files:**
- Modify: `tests/unit/services/goals.test.ts`

The issue is that `prisma.goal.findFirst` and `prisma.userAsset.findMany` are typed as Prisma methods, but `vi.mocked()` at the top level doesn't propagate deeply enough for TypeScript. The fix is to use `vi.mocked()` on each individual method call.

- [ ] **Step 1: Fix the mock type assertions**

Replace the contents of `tests/unit/services/goals.test.ts` with:

```typescript
import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    goal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userAsset: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createGoal, getActiveGoal, GoalError } from "@/services/goals";

describe("goal service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createGoal rejects when active goal exists", async () => {
    vi.mocked(prisma.goal.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      goalName: "Existing",
      targetAmount: new Decimal(100000),
      targetDate: new Date("2027-01-01"),
      initialPrincipal: new Decimal(0),
      includeProfit: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(
      createGoal(BigInt(1), { goalName: "New", targetAmount: 200000, targetDate: "2028-01-01" })
    ).rejects.toThrow(GoalError);

    try {
      await createGoal(BigInt(1), { goalName: "New", targetAmount: 200000, targetDate: "2028-01-01" });
    } catch (e) {
      expect((e as GoalError).code).toBe(409);
    }
  });

  it("getActiveGoal calculates progress", async () => {
    vi.mocked(prisma.goal.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      goalName: "Save 100k",
      targetAmount: new Decimal(100000),
      targetDate: new Date("2027-12-31"),
      initialPrincipal: new Decimal(0),
      includeProfit: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    vi.mocked(prisma.userAsset.findMany).mockResolvedValue([
      { costAmount: new Decimal(30000) } as never,
      { costAmount: new Decimal(20000) } as never,
    ]);

    const result = await getActiveGoal(BigInt(1));

    expect(result).not.toBeNull();
    expect(result!.currentPrincipal).toBe(50000);
    expect(result!.remainingAmount).toBe(50000);
    expect(result!.completionRate).toBe(0.5);
  });
});
```

- [ ] **Step 2: Verify typecheck passes**

Run: `pnpm typecheck`

Expected: No errors in `goals.test.ts`.

- [ ] **Step 3: Verify tests pass**

Run: `pnpm vitest run tests/unit/services/goals.test.ts`

Expected: 2 tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/unit/services/goals.test.ts
git commit -m "fix: resolve goals.test.ts type errors with vi.mocked()"
```

---

### Task 2: Add Transaction Service Tests

**Files:**
- Create: `tests/unit/services/transactions.test.ts`

- [ ] **Step 1: Create transaction test file**

Create `tests/unit/services/transactions.test.ts`:

```typescript
import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    userAsset: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createTransaction, listTransactions, deleteTransaction, TransactionError } from "@/services/transactions";

describe("transaction service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTransaction buy increases quantity and recalculates avgCost", async () => {
    const mockAsset = {
      id: BigInt(1),
      userId: BigInt(1),
      quantity: new Decimal(100),
      avgCost: new Decimal(10),
      currentPrice: new Decimal(12),
      currency: "CNY",
      assetType: "stock",
      symbol: "600000",
      assetName: "浦发银行",
      market: "CN",
      costAmount: new Decimal(1000),
      marketValue: new Decimal(1200),
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue(mockAsset);
    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "buy",
      quantity: new Decimal(50),
      price: new Decimal(12),
      fee: new Decimal(5),
      currency: "CNY",
      transactionAmount: new Decimal(605),
      transactionTime: new Date("2026-01-15"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      asset: { assetName: "浦发银行", symbol: "600000" },
    } as never);
    vi.mocked(prisma.userAsset.update).mockResolvedValue(mockAsset);

    await createTransaction(BigInt(1), {
      assetId: "1",
      transactionType: "buy",
      quantity: 50,
      price: 12,
      fee: 5,
      transactionTime: "2026-01-15T00:00:00Z",
    });

    const updateCall = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    const newQuantity = Number(updateCall.data.quantity);
    const newAvgCost = Number(updateCall.data.avgCost);

    expect(newQuantity).toBe(150);
    // (100 * 10 + 50 * 12) / 150 = 1600 / 150 ≈ 10.6667
    expect(newAvgCost).toBeCloseTo(10.6667, 3);
  });

  it("createTransaction sell decreases quantity, keeps avgCost", async () => {
    const mockAsset = {
      id: BigInt(1),
      userId: BigInt(1),
      quantity: new Decimal(100),
      avgCost: new Decimal(10),
      currentPrice: new Decimal(15),
      currency: "CNY",
      assetType: "stock",
      symbol: "600000",
      assetName: "浦发银行",
      market: "CN",
      costAmount: new Decimal(1000),
      marketValue: new Decimal(1500),
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue(mockAsset);
    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: BigInt(2),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "sell",
      quantity: new Decimal(30),
      price: new Decimal(15),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(450),
      transactionTime: new Date("2026-01-20"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      asset: { assetName: "浦发银行", symbol: "600000" },
    } as never);
    vi.mocked(prisma.userAsset.update).mockResolvedValue(mockAsset);

    await createTransaction(BigInt(1), {
      assetId: "1",
      transactionType: "sell",
      quantity: 30,
      price: 15,
      transactionTime: "2026-01-20T00:00:00Z",
    });

    const updateCall = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    const newQuantity = Number(updateCall.data.quantity);
    const newAvgCost = Number(updateCall.data.avgCost);

    expect(newQuantity).toBe(70);
    expect(newAvgCost).toBe(10);
  });

  it("listTransactions returns paginated result", async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.count).mockResolvedValue(0);

    const result = await listTransactions(BigInt(1), {}, { page: 1, pageSize: 20 });

    expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it("deleteTransaction returns false for non-existent", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);

    const result = await deleteTransaction(BigInt(1), BigInt(999));
    expect(result).toBe(false);
  });

  it("createTransaction throws 404 for non-existent asset", async () => {
    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue(null);

    await expect(
      createTransaction(BigInt(1), {
        assetId: "999",
        transactionType: "buy",
        quantity: 10,
        price: 100,
        transactionTime: "2026-01-15T00:00:00Z",
      })
    ).rejects.toThrow(TransactionError);
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `pnpm vitest run tests/unit/services/transactions.test.ts`

Expected: 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/unit/services/transactions.test.ts
git commit -m "test: add transaction service unit tests"
```

---

### Task 3: Update development.md

**Files:**
- Modify: `docs/development.md`

- [ ] **Step 1: Replace file contents**

Replace `docs/development.md` with:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/development.md
git commit -m "docs: update development.md with current module status"
```

---

### Task 4: Settings — Service Layer

**Files:**
- Modify: `src/services/auth/schema.ts`
- Modify: `src/services/auth/index.ts`

- [ ] **Step 1: Add schemas to auth/schema.ts**

Append to `src/services/auth/schema.ts`:

```typescript
export const updateProfileSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空").max(32, "昵称最多 32 个字符"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(8, "新密码至少 8 位"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
```

- [ ] **Step 2: Add service functions to auth/index.ts**

Append to `src/services/auth/index.ts`:

```typescript
import type { UpdateProfileInput, UpdatePasswordInput } from "./schema";

export async function updateProfile(userId: bigint, input: UpdateProfileInput): Promise<AuthUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname: input.nickname },
  });
  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function updatePassword(userId: bigint, input: UpdatePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AuthError(404, "用户不存在");

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw new AuthError(400, "当前密码错误");

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/services/auth/schema.ts src/services/auth/index.ts
git commit -m "feat: add updateProfile and updatePassword to auth service"
```

---

### Task 5: Settings — API Routes

**Files:**
- Create: `src/app/api/auth/profile/route.ts`
- Create: `src/app/api/auth/password/route.ts`

- [ ] **Step 1: Create profile route**

Create `src/app/api/auth/profile/route.ts`:

```typescript
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { updateProfile, AuthError } from "@/services/auth";
import { updateProfileSchema } from "@/services/auth/schema";

export async function PUT(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const user = await updateProfile(userId, parsed.data);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code as 400 | 404, e.message);
    throw e;
  }
}
```

- [ ] **Step 2: Create password route**

Create `src/app/api/auth/password/route.ts`:

```typescript
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { updatePassword, AuthError } from "@/services/auth";
import { updatePasswordSchema } from "@/services/auth/schema";

export async function PUT(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = updatePasswordSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    await updatePassword(userId, parsed.data);
    return ok({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code as 400 | 404, e.message);
    throw e;
  }
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/profile src/app/api/auth/password
git commit -m "feat: add profile and password update API routes"
```

---

### Task 6: Settings — Frontend

**Files:**
- Create: `src/features/settings/hooks.ts`
- Create: `src/features/settings/ProfileForm.tsx`
- Create: `src/features/settings/PasswordForm.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Step 1: Create settings hooks**

Create `src/features/settings/hooks.ts`:

```typescript
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nickname: string }) =>
      apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUser"] }),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiFetch("/api/auth/password", { method: "PUT", body: JSON.stringify(data) }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
  });
}
```

- [ ] **Step 2: Create ProfileForm**

Create `src/features/settings/ProfileForm.tsx`:

```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateProfile } from "./hooks";

type Props = { currentNickname: string | null };

export function ProfileForm({ currentNickname }: Props) {
  const [nickname, setNickname] = useState(currentNickname ?? "");
  const mutation = useUpdateProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ nickname });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>个人信息</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">昵称</label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={32}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中..." : "保存"}
          </Button>
          {mutation.isSuccess && <p className="text-sm text-green-600">已保存</p>}
          {mutation.isError && <p className="text-sm text-red-600">保存失败</p>}
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create PasswordForm**

Create `src/features/settings/PasswordForm.tsx`:

```tsx
"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdatePassword } from "./hooks";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const mutation = useUpdatePassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("两次输入的新密码不一致");
      return;
    }
    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: () => setError("当前密码错误"),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">当前密码</label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">新密码</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">确认新密码</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "修改中..." : "修改密码"}
          </Button>
          {mutation.isSuccess && <p className="text-sm text-green-600">密码已修改</p>}
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Update settings page**

Replace `src/app/(dashboard)/settings/page.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProfileForm } from "@/features/settings/ProfileForm";
import { PasswordForm } from "@/features/settings/PasswordForm";
import { useLogout } from "@/features/settings/hooks";

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">设置</h1>
      {user && <ProfileForm currentNickname={user.nickname} />}
      <PasswordForm />
      <Button variant="destructive" onClick={handleLogout}>
        退出登录
      </Button>
    </section>
  );
}
```

- [ ] **Step 5: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/settings src/app/\(dashboard\)/settings
git commit -m "feat: implement settings page (profile, password, logout)"
```

---

### Task 7: Reports — API Fix + Frontend

**Files:**
- Modify: `src/app/api/reports/summary/route.ts`
- Create: `src/features/reports/hooks.ts`
- Create: `src/features/reports/SummaryCards.tsx`
- Create: `src/features/reports/AllocationCharts.tsx`
- Modify: `src/app/(dashboard)/reports/page.tsx`

- [ ] **Step 1: Fix reports API to include marketAllocation**

Replace `src/app/api/reports/summary/route.ts`:

```typescript
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getDashboardSummary } from "@/services/dashboard";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const summary = await getDashboardSummary(userId);
  return ok({
    totalAssetValue: summary.totalAssetValue,
    totalCost: summary.totalCost,
    totalProfit: summary.totalProfit,
    totalProfitRate: summary.totalProfitRate,
    assetAllocation: summary.assetAllocation,
    marketAllocation: summary.marketAllocation,
  });
}
```

- [ ] **Step 2: Create reports hooks**

Create `src/features/reports/hooks.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type ReportSummary = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
  assetAllocation: { key: string; value: number; percentage: number }[];
  marketAllocation: { key: string; value: number; percentage: number }[];
};

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => apiFetch<ReportSummary>("/api/reports/summary"),
  });
}
```

- [ ] **Step 3: Create SummaryCards**

Create `src/features/reports/SummaryCards.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
};

export function SummaryCards({ totalAssetValue, totalCost, totalProfit, totalProfitRate }: Props) {
  const cards = [
    { title: "总资产", value: `¥${totalAssetValue.toLocaleString()}` },
    { title: "总成本", value: `¥${totalCost.toLocaleString()}` },
    { title: "总盈亏", value: `¥${totalProfit.toLocaleString()}`, color: totalProfit >= 0 ? "text-green-600" : "text-red-600" },
    { title: "收益率", value: `${(totalProfitRate * 100).toFixed(2)}%`, color: totalProfitRate >= 0 ? "text-green-600" : "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.color ?? ""}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create AllocationCharts**

Create `src/features/reports/AllocationCharts.tsx`:

```tsx
"use client";

import { PieChart } from "@/features/dashboard/PieChart";

type Props = {
  assetAllocation: { key: string; value: number; percentage: number }[];
  marketAllocation: { key: string; value: number; percentage: number }[];
};

export function AllocationCharts({ assetAllocation, marketAllocation }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <PieChart title="资产类型分布" data={assetAllocation} />
      <PieChart title="市场分布" data={marketAllocation} />
    </div>
  );
}
```

- [ ] **Step 5: Update reports page**

Replace `src/app/(dashboard)/reports/page.tsx`:

```tsx
"use client";

import { useReportSummary } from "@/features/reports/hooks";
import { SummaryCards } from "@/features/reports/SummaryCards";
import { AllocationCharts } from "@/features/reports/AllocationCharts";

export default function ReportsPage() {
  const { data, isLoading } = useReportSummary();

  if (isLoading) return <p className="text-muted-foreground">加载中...</p>;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">报表</h1>
        <p className="mt-4 text-muted-foreground">暂无资产数据，请先添加资产。</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">报表</h1>
      <SummaryCards
        totalAssetValue={data.totalAssetValue}
        totalCost={data.totalCost}
        totalProfit={data.totalProfit}
        totalProfitRate={data.totalProfitRate}
      />
      <AllocationCharts
        assetAllocation={data.assetAllocation}
        marketAllocation={data.marketAllocation}
      />
    </section>
  );
}
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/reports src/features/reports src/app/\(dashboard\)/reports
git commit -m "feat: implement reports page with summary cards and charts"
```

---

### Task 8: Admin — API + Frontend

**Files:**
- Modify: `src/app/api/admin/status/route.ts`
- Create: `src/features/admin/hooks.ts`
- Create: `src/features/admin/StatusCards.tsx`
- Create: `src/features/admin/StatsCards.tsx`
- Modify: `src/app/(dashboard)/admin/page.tsx`

- [ ] **Step 1: Expand admin status API**

Replace `src/app/api/admin/status/route.ts`:

```typescript
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { serverEnv } from "@/lib/env/server";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  let dbConnected = false;
  let dbLatencyMs = 0;
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  const marketDataProvider = serverEnv.MARKET_DATA_PROVIDER;
  const marketDataStatus = marketDataProvider === "mock" ? "ok" : "ok";

  const [userCount, assetCount, transactionCount] = await Promise.all([
    prisma.user.count(),
    prisma.userAsset.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
  ]);

  const status = dbConnected ? "healthy" : "degraded";

  return ok({
    status,
    timestamp: new Date().toISOString(),
    database: { connected: dbConnected, latencyMs: dbLatencyMs },
    marketData: { provider: marketDataProvider, status: marketDataStatus },
    stats: { userCount, assetCount, transactionCount },
  });
}
```

- [ ] **Step 2: Create admin hooks**

Create `src/features/admin/hooks.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type SystemStatus = {
  status: "healthy" | "degraded";
  timestamp: string;
  database: { connected: boolean; latencyMs: number };
  marketData: { provider: string; status: "ok" | "error" };
  stats: { userCount: number; assetCount: number; transactionCount: number };
};

export function useSystemStatus() {
  return useQuery({
    queryKey: ["admin", "status"],
    queryFn: () => apiFetch<SystemStatus>("/api/admin/status"),
    refetchInterval: 30000,
  });
}
```

- [ ] **Step 3: Create StatusCards**

Create `src/features/admin/StatusCards.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  status: "healthy" | "degraded";
  database: { connected: boolean; latencyMs: number };
  marketData: { provider: string; status: "ok" | "error" };
};

function Indicator({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />
  );
}

export function StatusCards({ status, database, marketData }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">系统状态</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={status === "healthy"} />
          <span className="font-semibold">{status === "healthy" ? "正常" : "异常"}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">数据库</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={database.connected} />
          <span>{database.connected ? `${database.latencyMs}ms` : "断开"}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">行情服务</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={marketData.status === "ok"} />
          <span>{marketData.provider}</span>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Create StatsCards**

Create `src/features/admin/StatsCards.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  stats: { userCount: number; assetCount: number; transactionCount: number };
};

export function StatsCards({ stats }: Props) {
  const items = [
    { title: "用户数", value: stats.userCount },
    { title: "资产数", value: stats.assetCount },
    { title: "交易数", value: stats.transactionCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Update admin page**

Replace `src/app/(dashboard)/admin/page.tsx`:

```tsx
"use client";

import { useSystemStatus } from "@/features/admin/hooks";
import { StatusCards } from "@/features/admin/StatusCards";
import { StatsCards } from "@/features/admin/StatsCards";

export default function AdminPage() {
  const { data, isLoading } = useSystemStatus();

  if (isLoading) return <p className="text-muted-foreground">加载中...</p>;
  if (!data) return <p className="text-muted-foreground">无法获取系统状态</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">管理后台</h1>
      <StatusCards status={data.status} database={data.database} marketData={data.marketData} />
      <StatsCards stats={data.stats} />
      <p className="text-xs text-muted-foreground">最后更新: {new Date(data.timestamp).toLocaleString()}</p>
    </section>
  );
}
```

- [ ] **Step 6: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin src/features/admin src/app/\(dashboard\)/admin
git commit -m "feat: implement admin page with system status and stats"
```

---

### Task 9: AI Analysis — Service Layer

**Files:**
- Create: `src/services/ai/index.ts`

- [ ] **Step 1: Create AI analysis service**

Create `src/services/ai/index.ts`:

```typescript
import { prisma } from "@/lib/db/prisma";
import { getActiveGoal } from "@/services/goals";

type AnalysisResult = {
  summary: string;
  insights: string[];
  riskNotes: string[];
  generatedAt: string;
};

export async function generateAnalysis(userId: bigint): Promise<AnalysisResult> {
  const assets = await prisma.userAsset.findMany({ where: { userId, deletedAt: null } });

  if (assets.length === 0) {
    return {
      summary: "暂无资产数据，请先添加资产后查看分析。",
      insights: [],
      riskNotes: ["以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。"],
      generatedAt: new Date().toISOString(),
    };
  }

  const totalValue = assets.reduce((sum, a) => sum + (a.marketValue ? Number(a.marketValue) : 0), 0);
  const insights: string[] = [];

  // Concentration analysis
  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    if (totalValue > 0 && mv / totalValue > 0.3) {
      insights.push(`"${asset.assetName}" 占总资产 ${((mv / totalValue) * 100).toFixed(1)}%，集中度较高，注意分散风险。`);
    }
  }

  // Asset type distribution
  const typeMap = new Map<string, number>();
  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    typeMap.set(asset.assetType, (typeMap.get(asset.assetType) ?? 0) + mv);
  }
  const topType = [...typeMap.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topType && totalValue > 0) {
    const pct = ((topType[1] / totalValue) * 100).toFixed(1);
    const typeLabel = TYPE_LABELS[topType[0]] ?? topType[0];
    insights.push(`资产以${typeLabel}为主，占比 ${pct}%。`);
  }

  // Market distribution
  const marketMap = new Map<string, number>();
  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    marketMap.set(asset.market ?? "OTHER", (marketMap.get(asset.market ?? "OTHER") ?? 0) + mv);
  }
  const topMarket = [...marketMap.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topMarket && totalValue > 0) {
    const pct = ((topMarket[1] / totalValue) * 100).toFixed(1);
    const marketLabel = MARKET_LABELS[topMarket[0]] ?? topMarket[0];
    insights.push(`主要配置在${marketLabel}，占比 ${pct}%。`);
  }

  // Transaction frequency
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const txCount = await prisma.transaction.count({
    where: { userId, deletedAt: null, transactionTime: { gte: thirtyDaysAgo } },
  });
  if (txCount > 0) {
    insights.push(`近 30 天交易 ${txCount} 次。`);
  } else {
    insights.push("近 30 天无交易记录。");
  }

  // Goal progress
  const activeGoal = await getActiveGoal(userId);
  if (activeGoal) {
    insights.push(
      `目标"${activeGoal.goalName}"完成 ${(activeGoal.completionRate * 100).toFixed(1)}%，` +
      `剩余 ¥${activeGoal.remainingAmount.toLocaleString()}，建议每月投入 ¥${Math.round(activeGoal.monthlyRequired).toLocaleString()}。`
    );
  }

  // Build summary
  const typeDesc = topType ? `${TYPE_LABELS[topType[0]] ?? topType[0]}` : "多种资产";
  const marketDesc = topMarket ? `${MARKET_LABELS[topMarket[0]] ?? topMarket[0]}` : "多个市场";
  const summary = `您当前持有 ${assets.length} 项资产，总市值 ¥${totalValue.toLocaleString()}，主要配置为${typeDesc}，集中在${marketDesc}。`;

  return {
    summary,
    insights,
    riskNotes: ["以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。"],
    generatedAt: new Date().toISOString(),
  };
}

const TYPE_LABELS: Record<string, string> = {
  stock: "股票",
  fund: "基金",
  crypto: "加密货币",
  cash: "现金",
};

const MARKET_LABELS: Record<string, string> = {
  CN: "A 股市场",
  HK: "港股市场",
  US: "美股市场",
  CRYPTO: "加密市场",
  CASH: "现金",
};
```

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/ai
git commit -m "feat: add rule-based AI analysis service"
```

---

### Task 10: AI Analysis — API Route + Frontend

**Files:**
- Create: `src/app/api/ai/analysis/route.ts`
- Create: `src/features/ai/hooks.ts`
- Create: `src/features/ai/AnalysisCard.tsx`
- Create: `src/features/ai/InsightsList.tsx`
- Create: `src/features/ai/RiskDisclaimer.tsx`
- Modify: `src/app/(dashboard)/ai/page.tsx`

- [ ] **Step 1: Create AI analysis API route**

Create `src/app/api/ai/analysis/route.ts`:

```typescript
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { generateAnalysis } from "@/services/ai";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const analysis = await generateAnalysis(userId);
  return ok(analysis);
}
```

- [ ] **Step 2: Create AI hooks**

Create `src/features/ai/hooks.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type AiAnalysis = {
  summary: string;
  insights: string[];
  riskNotes: string[];
  generatedAt: string;
};

export function useAiAnalysis() {
  return useQuery({
    queryKey: ["ai", "analysis"],
    queryFn: () => apiFetch<AiAnalysis>("/api/ai/analysis"),
  });
}
```

- [ ] **Step 3: Create AnalysisCard**

Create `src/features/ai/AnalysisCard.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { summary: string };

export function AnalysisCard({ summary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>资产分析摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create InsightsList**

Create `src/features/ai/InsightsList.tsx`:

```tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { insights: string[] };

export function InsightsList({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>分析要点</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Create RiskDisclaimer**

Create `src/features/ai/RiskDisclaimer.tsx`:

```tsx
"use client";

type Props = { notes: string[] };

export function RiskDisclaimer({ notes }: Props) {
  return (
    <div className="rounded-md border border-muted bg-muted/30 p-4">
      {notes.map((note, i) => (
        <p key={i} className="text-xs text-muted-foreground">{note}</p>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Update AI page**

Replace `src/app/(dashboard)/ai/page.tsx`:

```tsx
"use client";

import { useAiAnalysis } from "@/features/ai/hooks";
import { AnalysisCard } from "@/features/ai/AnalysisCard";
import { InsightsList } from "@/features/ai/InsightsList";
import { RiskDisclaimer } from "@/features/ai/RiskDisclaimer";

export default function AiPage() {
  const { data, isLoading } = useAiAnalysis();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">AI 分析</h1>
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-sm text-yellow-800">
          AI 分析仅用于信息整理和风险提示，不提供收益承诺、买卖建议或自动投顾服务。
        </p>
      </div>
      {isLoading && <p className="text-muted-foreground">分析中...</p>}
      {data && (
        <>
          <AnalysisCard summary={data.summary} />
          <InsightsList insights={data.insights} />
          <RiskDisclaimer notes={data.riskNotes} />
          <p className="text-xs text-muted-foreground">
            生成时间: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 7: Verify typecheck**

Run: `pnpm typecheck`

Expected: No errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/ai src/features/ai src/app/\(dashboard\)/ai
git commit -m "feat: implement AI analysis page with rule-based insights"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run full verification**

```bash
pnpm typecheck
pnpm test
pnpm build
```

Expected: All exit with code 0.

- [ ] **Step 2: Fix any issues found**

If typecheck or tests fail, fix the issues and re-run.

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "fix: resolve any remaining issues from final verification"
```
