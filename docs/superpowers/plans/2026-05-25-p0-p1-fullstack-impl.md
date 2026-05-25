# P0-P1 Fullstack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all P0-P1 features (auth, assets, dashboard, transactions, goals, exposure, watchlist) as a working fullstack application.

**Architecture:** SPA-style Next.js App Router with all data flowing through API routes. httpOnly cookie JWT auth with middleware protection. Service layer handles business logic and Prisma queries. React Query for server state, Zustand for UI state only.

**Tech Stack:** Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui, Prisma (MySQL), Zod, TanStack React Query, Zustand, ECharts, bcryptjs, jsonwebtoken, Vitest.

---

## File Structure Map

### Layer 0: Infrastructure

- Create `src/lib/auth/jwt.ts`: JWT sign/verify/refresh utilities
- Create `src/lib/auth/cookies.ts`: cookie set/clear helpers
- Create `src/lib/auth/middleware.ts`: getCurrentUserId helper for route handlers
- Create `src/middleware.ts`: Next.js middleware for route protection
- Create `src/lib/api/client.ts`: frontend apiFetch wrapper
- Create `src/lib/query/client.ts`: React Query client config
- Create `src/lib/query/provider.tsx`: QueryClientProvider wrapper
- Modify `src/app/layout.tsx`: wrap with QueryProvider
- Create `src/store/ui.ts`: Zustand UI store
- Create `src/services/auth/index.ts`: auth service
- Create `src/services/auth/schema.ts`: Zod schemas for auth
- Modify `src/app/api/auth/register/route.ts`: implement register
- Modify `src/app/api/auth/login/route.ts`: implement login
- Create `src/app/api/auth/logout/route.ts`: implement logout
- Create `src/app/api/auth/me/route.ts`: get current user
- Create `src/features/auth/LoginForm.tsx`: login form
- Create `src/features/auth/RegisterForm.tsx`: register form
- Modify `src/app/(auth)/login/page.tsx`: use LoginForm
- Modify `src/app/(auth)/register/page.tsx`: use RegisterForm
- Create `src/hooks/useCurrentUser.ts`: auth hook

### Layer 1: Assets, Goals, Watchlist

- Create `src/services/assets/index.ts`: asset CRUD service
- Create `src/services/assets/schema.ts`: Zod schemas
- Create `src/services/goals/index.ts`: goal CRUD + progress
- Create `src/services/goals/schema.ts`: Zod schemas
- Create `src/services/watchlist/index.ts`: watchlist CRUD
- Create `src/services/watchlist/schema.ts`: Zod schemas

### Layer 2: Transactions, Dashboard, Exposure

- Create `src/services/transactions/index.ts`: transaction CRUD + asset linkage
- Create `src/services/transactions/schema.ts`: Zod schemas
- Create `src/services/dashboard/index.ts`: dashboard aggregation
- Create `src/services/exposure/index.ts`: exposure calculation

---

## Layer 0: Infrastructure (parallel tasks)

### Task 1: Install shadcn/ui Components

**Files:**
- Modify: `src/components/ui/` (multiple new files via CLI)

- [ ] **Step 1: Install shadcn/ui components**

Run:

```bash
npx shadcn@latest add table dialog input select card badge separator dropdown-menu toast skeleton tabs progress popover calendar label textarea -y
```

Expected: Components installed to `src/components/ui/`.

- [ ] **Step 2: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/components/ui
git commit -m "feat: install shadcn/ui components"
```

---

### Task 2: Add Frontend Infrastructure (React Query + API Client + Zustand)

**Files:**
- Create: `src/lib/api/client.ts`
- Create: `src/lib/query/client.ts`
- Create: `src/lib/query/provider.tsx`
- Create: `src/store/ui.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create API client**

Create `src/lib/api/client.ts`:

```ts
export class ApiError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json();

  if (json.code !== 0) {
    if (json.code === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(json.code, json.message);
  }

  return json.data as T;
}
```

- [ ] **Step 2: Create React Query client**

Create `src/lib/query/client.ts`:

```ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: 1,
      },
    },
  });
}
```

- [ ] **Step 3: Create QueryProvider wrapper**

Create `src/lib/query/provider.tsx`:

```tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { makeQueryClient } from "./client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 4: Create Zustand UI store**

Create `src/store/ui.ts`:

```ts
import { create } from "zustand";

type UiState = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
```

- [ ] **Step 5: Wrap root layout with QueryProvider**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";

import { QueryProvider } from "@/lib/query/provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fund Next",
  description: "Personal asset allocation tracking MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/lib/api/client.ts src/lib/query src/store/ui.ts src/app/layout.tsx
git commit -m "feat: add React Query, API client, and Zustand infrastructure"
```

---

### Task 3: Implement Auth Service + JWT Utilities

**Files:**
- Create: `src/lib/auth/jwt.ts`
- Create: `src/lib/auth/cookies.ts`
- Create: `src/lib/auth/middleware.ts`
- Create: `src/services/auth/schema.ts`
- Create: `src/services/auth/index.ts`

- [ ] **Step 1: Create JWT utilities**

Create `src/lib/auth/jwt.ts`:

```ts
import jwt from "jsonwebtoken";

import { getServerEnv } from "@/lib/env/server";

type AccessTokenPayload = {
  userId: string;
  email: string;
};

type RefreshTokenPayload = {
  userId: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const env = getServerEnv();
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const env = getServerEnv();
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const env = getServerEnv();
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const env = getServerEnv();
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Create cookie helpers**

Create `src/lib/auth/cookies.ts`:

```ts
import { cookies } from "next/headers";

const ACCESS_COOKIE = "fund_access";
const REFRESH_COOKIE = "fund_refresh";

const isProduction = process.env.NODE_ENV === "production";

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}
```

- [ ] **Step 3: Create route handler auth helper**

Create `src/lib/auth/middleware.ts`:

```ts
import { NextRequest } from "next/server";

import { verifyAccessToken } from "./jwt";

const ACCESS_COOKIE = "fund_access";

export function getCurrentUserId(request: NextRequest): bigint | null {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return BigInt(payload.userId);
}
```

- [ ] **Step 4: Create auth Zod schemas**

Create `src/services/auth/schema.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(8, "密码至少 8 位"),
  nickname: z.string().max(32).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- [ ] **Step 5: Create auth service**

Create `src/services/auth/index.ts`:

```ts
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

import type { LoginInput, RegisterInput } from "./schema";

export type AuthUser = {
  userId: string;
  email: string;
  nickname: string | null;
};

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError(409, "该邮箱已注册");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      nickname: input.nickname ?? null,
    },
  });

  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError(401, "邮箱或密码错误");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError(401, "邮箱或密码错误");
  }

  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function getUserById(userId: bigint): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export class AuthError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
```

- [ ] **Step 6: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/lib/auth src/services/auth
git commit -m "feat: add auth service and JWT utilities"
```

---

### Task 4: Implement Auth API Routes + Middleware

**Files:**
- Modify: `src/app/api/auth/register/route.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Implement register route**

Replace `src/app/api/auth/register/route.ts`:

```ts
import { setAuthCookies } from "@/lib/auth/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { fail, ok } from "@/lib/api/response";
import { AuthError, registerUser } from "@/services/auth";
import { registerSchema } from "@/services/auth/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return fail(400, parsed.error.errors[0].message);
  }

  try {
    const user = await registerUser(parsed.data);
    const accessToken = signAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.userId });
    await setAuthCookies(accessToken, refreshToken);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code as 409, e.message);
    }
    throw e;
  }
}
```

- [ ] **Step 2: Implement login route**

Replace `src/app/api/auth/login/route.ts`:

```ts
import { setAuthCookies } from "@/lib/auth/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { fail, ok } from "@/lib/api/response";
import { AuthError, loginUser } from "@/services/auth";
import { loginSchema } from "@/services/auth/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail(400, parsed.error.errors[0].message);
  }

  try {
    const user = await loginUser(parsed.data);
    const accessToken = signAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.userId });
    await setAuthCookies(accessToken, refreshToken);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code as 401, e.message);
    }
    throw e;
  }
}
```

- [ ] **Step 3: Create logout route**

Create `src/app/api/auth/logout/route.ts`:

```ts
import { clearAuthCookies } from "@/lib/auth/cookies";
import { ok } from "@/lib/api/response";

export async function POST() {
  await clearAuthCookies();
  return ok(null);
}
```

- [ ] **Step 4: Create me route**

Create `src/app/api/auth/me/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getUserById } from "@/services/auth";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) {
    return fail(401, "未登录");
  }

  const user = await getUserById(userId);
  if (!user) {
    return fail(401, "用户不存在");
  }

  return ok(user);
}
```

- [ ] **Step 5: Create Next.js middleware**

Create `src/middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";

import { signAccessToken, verifyAccessToken, verifyRefreshToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("fund_access")?.value;
  const refreshToken = request.cookies.get("fund_refresh")?.value;

  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      return NextResponse.next();
    }
  }

  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      const newAccessToken = signAccessToken({ userId: payload.userId, email: "" });
      const response = NextResponse.next();
      response.cookies.set("fund_access", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
      return response;
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ code: 401, message: "未登录", data: null }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 6: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/app/api/auth src/middleware.ts
git commit -m "feat: implement auth API routes and middleware"
```

---

### Task 5: Implement Auth Frontend (Login + Register Forms)

**Files:**
- Create: `src/features/auth/LoginForm.tsx`
- Create: `src/features/auth/RegisterForm.tsx`
- Create: `src/hooks/useCurrentUser.ts`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Create useCurrentUser hook**

Create `src/hooks/useCurrentUser.ts`:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type CurrentUser = {
  userId: string;
  email: string;
  nickname: string | null;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<CurrentUser>("/api/auth/me"),
    retry: false,
  });
}
```

- [ ] **Step 2: Create LoginForm**

Create `src/features/auth/LoginForm.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Create RegisterForm**

Create `src/features/auth/RegisterForm.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, nickname: nickname || undefined }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nickname">昵称（可选）</Label>
        <Input id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={32} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Update login page**

Replace `src/app/(auth)/login/page.tsx`:

```tsx
import Link from "next/link";

import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-muted-foreground">登录你的 Fund Next 账户</p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <Link className="mt-4 text-sm text-primary" href="/register">
        创建账户
      </Link>
    </main>
  );
}
```

- [ ] **Step 5: Update register page**

Replace `src/app/(auth)/register/page.tsx`:

```tsx
import Link from "next/link";

import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">注册</h1>
      <p className="mt-2 text-sm text-muted-foreground">创建你的 Fund Next 账户</p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <Link className="mt-4 text-sm text-primary" href="/login">
        已有账户，去登录
      </Link>
    </main>
  );
}
```

- [ ] **Step 6: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features/auth src/hooks/useCurrentUser.ts src/app/\(auth\)
git commit -m "feat: implement auth frontend (login + register forms)"
```

---
## Layer 1: Assets, Goals, Watchlist (parallel tasks)

### Task 6: Implement Asset Service + API

**Files:**
- Create: `src/services/assets/schema.ts`
- Create: `src/services/assets/index.ts`
- Modify: `src/app/api/assets/route.ts`
- Modify: `src/app/api/assets/[id]/route.ts`

- [ ] **Step 1: Create asset Zod schemas**

Create `src/services/assets/schema.ts`:

```ts
import { z } from "zod";

export const createAssetSchema = z.object({
  assetType: z.enum(["stock", "fund", "crypto", "cash"]),
  symbol: z.string().max(64).optional(),
  assetName: z.string().min(1).max(255),
  market: z.enum(["CN", "HK", "US", "CRYPTO", "CASH"]).optional(),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]),
  quantity: z.number().min(0),
  avgCost: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional(),
  remark: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
```

- [ ] **Step 2: Create asset service**

Create `src/services/assets/index.ts`:

```ts
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreateAssetInput, UpdateAssetInput } from "./schema";

export async function listAssets(userId: bigint, filters?: { type?: string; market?: string }) {
  const where: Record<string, unknown> = { userId, deletedAt: null };
  if (filters?.type) where.assetType = filters.type;
  if (filters?.market) where.market = filters.market;

  const assets = await prisma.userAsset.findMany({ where, orderBy: { createdAt: "desc" } });
  return assets.map(serializeAsset);
}

export async function getAsset(userId: bigint, id: bigint) {
  const asset = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!asset) return null;
  return serializeAsset(asset);
}

export async function createAsset(userId: bigint, input: CreateAssetInput) {
  const costAmount = input.quantity * (input.avgCost ?? 0);
  const marketValue = input.quantity * (input.currentPrice ?? 0);

  const asset = await prisma.userAsset.create({
    data: {
      userId,
      assetType: input.assetType,
      symbol: input.symbol ?? null,
      assetName: input.assetName,
      market: input.market ?? null,
      currency: input.currency,
      quantity: new Decimal(input.quantity),
      avgCost: input.avgCost != null ? new Decimal(input.avgCost) : null,
      currentPrice: input.currentPrice != null ? new Decimal(input.currentPrice) : null,
      costAmount: new Decimal(costAmount),
      marketValue: new Decimal(marketValue),
      remark: input.remark ?? null,
    },
  });

  return serializeAsset(asset);
}

export async function updateAsset(userId: bigint, id: bigint, input: UpdateAssetInput) {
  const existing = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  const quantity = input.quantity ?? Number(existing.quantity);
  const avgCost = input.avgCost ?? (existing.avgCost ? Number(existing.avgCost) : 0);
  const currentPrice = input.currentPrice ?? (existing.currentPrice ? Number(existing.currentPrice) : 0);
  const costAmount = quantity * avgCost;
  const marketValue = quantity * currentPrice;

  const asset = await prisma.userAsset.update({
    where: { id },
    data: {
      ...input,
      quantity: new Decimal(quantity),
      avgCost: new Decimal(avgCost),
      currentPrice: new Decimal(currentPrice),
      costAmount: new Decimal(costAmount),
      marketValue: new Decimal(marketValue),
    },
  });

  return serializeAsset(asset);
}

export async function deleteAsset(userId: bigint, id: bigint) {
  const existing = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.userAsset.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

function serializeAsset(asset: Record<string, unknown>) {
  return {
    id: String(asset.id),
    assetType: asset.assetType,
    symbol: asset.symbol,
    assetName: asset.assetName,
    market: asset.market,
    currency: asset.currency,
    quantity: Number(asset.quantity),
    avgCost: asset.avgCost != null ? Number(asset.avgCost) : null,
    currentPrice: asset.currentPrice != null ? Number(asset.currentPrice) : null,
    costAmount: asset.costAmount != null ? Number(asset.costAmount) : null,
    marketValue: asset.marketValue != null ? Number(asset.marketValue) : null,
    remark: asset.remark,
    createdAt: (asset.createdAt as Date).toISOString(),
  };
}
```

- [ ] **Step 3: Implement asset API routes**

Replace `src/app/api/assets/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { createAsset, listAssets } from "@/services/assets";
import { createAssetSchema } from "@/services/assets/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { searchParams } = request.nextUrl;
  const filters = {
    type: searchParams.get("type") ?? undefined,
    market: searchParams.get("market") ?? undefined,
  };

  const assets = await listAssets(userId, filters);
  return ok(assets);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createAssetSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const asset = await createAsset(userId, parsed.data);
  return ok(asset);
}
```

Replace `src/app/api/assets/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { deleteAsset, getAsset, updateAsset } from "@/services/assets";
import { updateAssetSchema } from "@/services/assets/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const asset = await getAsset(userId, BigInt(id));
  if (!asset) return fail(404, "资产不存在");

  return ok(asset);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateAssetSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const asset = await updateAsset(userId, BigInt(id), parsed.data);
  if (!asset) return fail(404, "资产不存在");

  return ok(asset);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await deleteAsset(userId, BigInt(id));
  if (!deleted) return fail(404, "资产不存在");

  return ok(null);
}
```

- [ ] **Step 4: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/services/assets src/app/api/assets
git commit -m "feat: implement asset CRUD service and API"
```

---

### Task 7: Implement Goal Service + API

**Files:**
- Create: `src/services/goals/schema.ts`
- Create: `src/services/goals/index.ts`
- Modify: `src/app/api/goals/route.ts`
- Modify: `src/app/api/goals/[id]/route.ts`
- Modify: `src/app/api/goals/active/route.ts`

- [ ] **Step 1: Create goal Zod schemas**

Create `src/services/goals/schema.ts`:

```ts
import { z } from "zod";

export const createGoalSchema = z.object({
  goalName: z.string().min(1).max(255),
  targetAmount: z.number().positive(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  initialPrincipal: z.number().min(0).optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
```

- [ ] **Step 2: Create goal service**

Create `src/services/goals/index.ts`:

```ts
import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";
import { calculateGoalCompletion, calculateMonthlyRequiredContribution } from "@/lib/finance/calculations";

import type { CreateGoalInput, UpdateGoalInput } from "./schema";

export async function listGoals(userId: bigint) {
  const goals = await prisma.goal.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });
  return goals.map(serializeGoal);
}

export async function createGoal(userId: bigint, input: CreateGoalInput) {
  const activeGoal = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
  if (activeGoal) {
    throw new GoalError(409, "已有进行中的目标，请先完成或删除当前目标");
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      goalName: input.goalName,
      targetAmount: new Decimal(input.targetAmount),
      targetDate: new Date(input.targetDate),
      initialPrincipal: new Decimal(input.initialPrincipal ?? 0),
      includeProfit: false,
      status: 1,
    },
  });

  return serializeGoal(goal);
}

export async function getActiveGoal(userId: bigint) {
  const goal = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
  if (!goal) return null;

  const assets = await prisma.userAsset.findMany({ where: { userId, deletedAt: null } });
  const currentPrincipal = assets.reduce((sum, a) => sum + (a.costAmount ? Number(a.costAmount) : 0), 0);

  const targetAmount = Number(goal.targetAmount);
  const completion = calculateGoalCompletion({ currentPrincipal, targetAmount });
  const monthlyRequired = calculateMonthlyRequiredContribution({
    remainingAmount: completion.remainingAmount,
    currentDate: new Date(),
    targetDate: goal.targetDate,
  });

  return {
    ...serializeGoal(goal),
    currentPrincipal,
    completionRate: completion.displayRate,
    rawRate: completion.rawRate,
    remainingAmount: completion.remainingAmount,
    monthlyRequired,
  };
}

export async function updateGoal(userId: bigint, id: bigint, input: UpdateGoalInput) {
  const existing = await prisma.goal.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (input.goalName != null) data.goalName = input.goalName;
  if (input.targetAmount != null) data.targetAmount = new Decimal(input.targetAmount);
  if (input.targetDate != null) data.targetDate = new Date(input.targetDate);
  if (input.initialPrincipal != null) data.initialPrincipal = new Decimal(input.initialPrincipal);

  const goal = await prisma.goal.update({ where: { id }, data });
  return serializeGoal(goal);
}

export async function deleteGoal(userId: bigint, id: bigint) {
  const existing = await prisma.goal.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.goal.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

function serializeGoal(goal: Record<string, unknown>) {
  return {
    id: String(goal.id),
    goalName: goal.goalName,
    targetAmount: Number(goal.targetAmount),
    targetDate: (goal.targetDate as Date).toISOString().split("T")[0],
    initialPrincipal: Number(goal.initialPrincipal),
    includeProfit: goal.includeProfit,
    status: goal.status,
    createdAt: (goal.createdAt as Date).toISOString(),
  };
}

export class GoalError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "GoalError";
  }
}
```

- [ ] **Step 3: Implement goal API routes**

Replace `src/app/api/goals/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { createGoal, GoalError, listGoals } from "@/services/goals";
import { createGoalSchema } from "@/services/goals/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const goals = await listGoals(userId);
  return ok(goals);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const goal = await createGoal(userId, parsed.data);
    return ok(goal);
  } catch (e) {
    if (e instanceof GoalError) return fail(e.code as 409, e.message);
    throw e;
  }
}
```

Replace `src/app/api/goals/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { deleteGoal, updateGoal } from "@/services/goals";
import { updateGoalSchema } from "@/services/goals/schema";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const goal = await updateGoal(userId, BigInt(id), parsed.data);
  if (!goal) return fail(404, "目标不存在");

  return ok(goal);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await deleteGoal(userId, BigInt(id));
  if (!deleted) return fail(404, "目标不存在");

  return ok(null);
}
```

Replace `src/app/api/goals/active/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getActiveGoal } from "@/services/goals";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const goal = await getActiveGoal(userId);
  return ok(goal);
}
```

- [ ] **Step 4: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/services/goals src/app/api/goals
git commit -m "feat: implement goal CRUD service and API"
```

---

### Task 8: Implement Watchlist Service + API + Market Data Routes

**Files:**
- Create: `src/services/watchlist/schema.ts`
- Create: `src/services/watchlist/index.ts`
- Modify: `src/app/api/watchlists/route.ts`
- Modify: `src/app/api/watchlists/[id]/route.ts`
- Modify: `src/app/api/market-data/search/route.ts`
- Modify: `src/app/api/market-data/quotes/route.ts`

- [ ] **Step 1: Create watchlist Zod schemas**

Create `src/services/watchlist/schema.ts`:

```ts
import { z } from "zod";

export const addWatchlistSchema = z.object({
  assetType: z.enum(["stock", "fund", "crypto"]),
  symbol: z.string().min(1).max(64),
  assetName: z.string().min(1).max(255),
  market: z.enum(["CN", "HK", "US", "CRYPTO"]),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]),
});

export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>;
```

- [ ] **Step 2: Create watchlist service**

Create `src/services/watchlist/index.ts`:

```ts
import { prisma } from "@/lib/db/prisma";
import { getQuotes } from "@/services/market-data";
import type { Market } from "@/types/domain";

import type { AddWatchlistInput } from "./schema";

export async function listWatchlist(userId: bigint) {
  const items = await prisma.watchlist.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });

  const quoteRequests = items.map((item) => ({
    symbol: item.symbol,
    market: item.market as Market,
  }));

  const quotes = await getQuotes(quoteRequests);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return items.map((item) => {
    const quote = quoteMap.get(item.symbol);
    return {
      id: String(item.id),
      symbol: item.symbol,
      assetName: item.assetName,
      assetType: item.assetType,
      market: item.market,
      currency: item.currency,
      quote: quote ? { price: quote.price, priceTime: quote.priceTime } : null,
    };
  });
}

export async function addToWatchlist(userId: bigint, input: AddWatchlistInput) {
  const existing = await prisma.watchlist.findFirst({
    where: { userId, symbol: input.symbol, assetType: input.assetType, deletedAt: null },
  });
  if (existing) {
    throw new WatchlistError(409, "该资产已在自选列表中");
  }

  const item = await prisma.watchlist.create({
    data: { userId, ...input },
  });

  return { id: String(item.id), ...input, quote: null };
}

export async function removeFromWatchlist(userId: bigint, id: bigint) {
  const existing = await prisma.watchlist.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.watchlist.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

export class WatchlistError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "WatchlistError";
  }
}
```

- [ ] **Step 3: Implement watchlist API routes**

Replace `src/app/api/watchlists/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { addToWatchlist, listWatchlist, WatchlistError } from "@/services/watchlist";
import { addWatchlistSchema } from "@/services/watchlist/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const items = await listWatchlist(userId);
  return ok({ items });
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = addWatchlistSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const item = await addToWatchlist(userId, parsed.data);
    return ok(item);
  } catch (e) {
    if (e instanceof WatchlistError) return fail(e.code as 409, e.message);
    throw e;
  }
}
```

Replace `src/app/api/watchlists/[id]/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { removeFromWatchlist } from "@/services/watchlist";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await removeFromWatchlist(userId, BigInt(id));
  if (!deleted) return fail(404, "自选不存在");

  return ok(null);
}
```

- [ ] **Step 4: Implement market data API routes**

Replace `src/app/api/market-data/search/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { searchAssets } from "@/services/market-data";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";
  if (!keyword.trim()) return ok([]);

  const results = await searchAssets(keyword);
  return ok(results);
}
```

Replace `src/app/api/market-data/quotes/route.ts`:

```ts
import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getQuotes } from "@/services/market-data";
import type { Market } from "@/types/domain";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const symbols = request.nextUrl.searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  const markets = request.nextUrl.searchParams.get("markets")?.split(",").filter(Boolean) ?? [];

  if (symbols.length === 0) return ok([]);

  const requests = symbols.map((symbol, i) => ({
    symbol,
    market: (markets[i] ?? "CN") as Market,
  }));

  const quotes = await getQuotes(requests);
  return ok(quotes);
}
```

- [ ] **Step 5: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: exits with code 0.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/services/watchlist src/app/api/watchlists src/app/api/market-data
git commit -m "feat: implement watchlist service and market data API"
```

---
## Layer 2 and Layer 3

See companion plan files:
- `2026-05-25-p0-p1-layer2-impl.md` — Transactions, Dashboard, Exposure services + API + frontend
- `2026-05-25-p0-p1-layer3-impl.md` — Frontend pages for all modules + integration tests
