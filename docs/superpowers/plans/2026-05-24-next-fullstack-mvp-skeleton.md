# Next Fullstack MVP Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize this repository as a runnable Next.js fullstack MVP development skeleton for the personal asset allocation tracking product.

**Architecture:** Build a single Next.js App Router application at the repository root. Keep business modules under `src/features`, shared infrastructure under `src/lib`, external market/fund data integrations under `src/services/market-data`, and database models under `prisma/schema.prisma`. The skeleton establishes contracts and tests without implementing a complete business workflow.

**Tech Stack:** Next.js, React, TypeScript, TailwindCSS, shadcn/ui-compatible structure, Prisma, MySQL, Zod, TanStack Query, Zustand, ECharts, Vitest, Testing Library.

---

## File Structure Map

- Create `package.json`: project scripts, dependencies, and dev dependencies.
- Create `next.config.ts`: Next.js configuration.
- Create `tsconfig.json`: TypeScript configuration and `@/*` path alias.
- Create `postcss.config.mjs`: Tailwind PostCSS configuration.
- Create `tailwind.config.ts`: Tailwind content paths and theme extension.
- Create `components.json`: shadcn/ui-compatible component configuration.
- Create `.gitignore`: ignore dependencies, build output, environment files, and `.superpowers`.
- Create `.env.example`: database, auth, and market data settings.
- Create `src/app/layout.tsx`: root app shell and metadata.
- Create `src/app/page.tsx`: redirect entry to `/dashboard`.
- Create `src/app/globals.css`: Tailwind layers and CSS variables.
- Create `src/app/(auth)/login/page.tsx`: login route placeholder.
- Create `src/app/(auth)/register/page.tsx`: register route placeholder.
- Create `src/app/(dashboard)/layout.tsx`: dashboard route shell.
- Create `src/app/(dashboard)/dashboard/page.tsx`: dashboard route placeholder.
- Create `src/app/(dashboard)/assets/page.tsx`: asset list placeholder.
- Create `src/app/(dashboard)/assets/new/page.tsx`: add asset placeholder.
- Create `src/app/(dashboard)/assets/[id]/page.tsx`: asset detail placeholder.
- Create `src/app/(dashboard)/exposure/page.tsx`: fund exposure placeholder.
- Create `src/app/(dashboard)/transactions/page.tsx`: transactions placeholder.
- Create `src/app/(dashboard)/transactions/new/page.tsx`: add transaction placeholder.
- Create `src/app/(dashboard)/goals/page.tsx`: goals placeholder.
- Create `src/app/(dashboard)/watchlist/page.tsx`: watchlist placeholder.
- Create `src/app/(dashboard)/reports/page.tsx`: reports placeholder.
- Create `src/app/(dashboard)/settings/page.tsx`: settings placeholder.
- Create `src/app/(dashboard)/ai/page.tsx`: AI placeholder with non-advice copy.
- Create `src/app/(dashboard)/admin/page.tsx`: admin operations placeholder for system status and reference data.
- Create `src/components/layout/app-sidebar.tsx`: MVP navigation.
- Create `src/components/ui/button.tsx`: minimal shadcn-compatible button primitive.
- Create `src/lib/utils.ts`: `cn` helper.
- Create `src/lib/api/response.ts`: success/error response helpers.
- Create `src/lib/env/server.ts`: server environment validation.
- Create `src/lib/db/prisma.ts`: Prisma client singleton.
- Create `src/types/domain.ts`: domain enums and shared DTO types.
- Create `src/app/api/**/route.ts`: MVP API placeholder route handlers.
- Create `prisma/schema.prisma`: MySQL schema for MVP models.
- Create `src/services/market-data/types.ts`: quote, search, and fund holding types.
- Create `src/services/market-data/errors.ts`: normalized market data errors.
- Create `src/services/market-data/providers/mock.ts`: deterministic local provider.
- Create `src/services/market-data/providers/open-api.ts`: open API provider adapter skeleton.
- Create `src/services/market-data/index.ts`: provider selection and public service functions.
- Create `src/lib/finance/calculations.ts`: pure finance calculations.
- Create `tests/unit/finance/calculations.test.ts`: unit tests for finance calculations.
- Create `vitest.config.ts`: test configuration.
- Create `tests/setup.ts`: Testing Library setup placeholder.
- Create `docs/development.md`: commands and recommended next feature order.

---

## PRD and MVP Coverage Check

This plan initializes a development skeleton, so coverage means each MVP function has a page, API contract, data model, service boundary, or testable calculation entrypoint. It does not mean the full business behavior is implemented in this initialization.

| Requirement from PRD/MVP | Skeleton Coverage | Plan Location |
|---|---|---|
| 用户系统：注册、登录、基础账户管理 | `/login`, `/register`, auth API placeholders, `users` model, JWT env secrets | Tasks 2, 3, 4 |
| 普通用户角色 | Dashboard shell and all user-facing MVP pages | Task 2 |
| 管理员角色：系统状态、基础资产字典、基金持仓、行情配置 | `/admin` placeholder plus market data provider and `fund_holdings` / `asset_prices` models; detailed admin workflows require a dedicated admin feature plan | Tasks 2, 4, 5 |
| 资产管理：股票、基金、虚拟货币、现金手动录入 | `/assets`, `/assets/new`, `/assets/[id]`, asset API placeholders, `user_assets` model, domain enums | Tasks 2, 3, 4 |
| Dashboard：总资产、配置、市场分布、收益趋势、目标进度、最近交易 | `/dashboard`, dashboard API placeholder, snapshot model, finance calculation tests | Tasks 2, 3, 4, 6 |
| 基金穿透：一层穿透、底层股票、行业、市值、重复持仓 | `/exposure`, exposure API placeholders, `fund_holdings` model, market data fund holding service, exposure calculation tests | Tasks 2, 3, 4, 5, 6 |
| 交易记录：买入、卖出、加仓、减仓、定投、转入、转出 | `/transactions`, `/transactions/new`, transaction API placeholders, `transactions` model, transaction type union | Tasks 2, 3, 4 |
| 交易复盘：交易列表、单笔详情、时间轴、收益统计 | Transactions page placeholder, transaction detail/update/delete API placeholder, finance profit calculations | Tasks 2, 3, 6 |
| 目标规划：目标金额、目标日期、本金进度、月度建议投入 | `/goals`, goal API placeholders, `goals` model, goal calculation tests | Tasks 2, 3, 4, 6 |
| 行情数据：延迟行情、第三方 API 或 mock 数据 | Dedicated `src/services/market-data` provider interface, mock provider, open API provider skeleton, quote/search/fund holding route placeholders | Tasks 3, 5 |
| 自选资产：添加、删除、价格、涨跌幅 | `/watchlist`, watchlist API placeholders, `watchlists` model, market quote service | Tasks 2, 3, 4, 5 |
| 基础报表：资产概览与交易总结 | `/reports` and reports summary API placeholder; full report generation requires a dedicated reports feature plan | Tasks 2, 3 |
| AI 分析占位与合规提示 | `/ai` placeholder explicitly states non-advice boundary | Task 2 |
| 安全：密码 hash、JWT、用户数据隔离、资源归属校验 | bcrypt/JWT dependencies, auth env, user-owned models, response codes; enforcement is intentionally deferred to first auth feature | Tasks 1, 3, 4 |
| 测试：资产、市值、盈亏、目标、基金穿透、权限、接口、E2E | Unit tests for calculation logic now; API/E2E directories and docs prepare the structure for feature-specific tests | Tasks 6, 7 |

The following PRD items are intentionally outside this skeleton because the PRD or MVP spec excludes them from the approved initialization scope: brokerage sync, crypto wallet sync, automatic trading, high-frequency realtime market data, complete news system, advanced AI investment advice, advanced risk model, family accounts, mobile app, and full microservice infrastructure.

---

### Task 1: Scaffold Next.js Project Configuration

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create package manifest**

Create `package.json` with this content:

```json
{
  "name": "fund-next",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "@tanstack/react-query": "^5.59.20",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "echarts": "^5.5.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.468.0",
    "next": "^15.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.5.4",
    "zod": "^3.23.8",
    "zustand": "^5.0.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.3",
    "eslint": "^9.15.0",
    "eslint-config-next": "^15.0.3",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.15",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Create Next config**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 3: Create TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create Tailwind and shadcn-compatible config**

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
```

Create `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
```

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

- [ ] **Step 5: Create gitignore and environment example**

Create `.gitignore`:

```gitignore
node_modules
.next
out
dist
coverage
.env
.env.local
.env.*.local
.DS_Store
.superpowers
```

Create `.env.example`:

```bash
DATABASE_URL="mysql://user:password@localhost:3306/fund_next"
JWT_ACCESS_SECRET="replace-with-local-access-secret"
JWT_REFRESH_SECRET="replace-with-local-refresh-secret"
MARKET_DATA_PROVIDER="mock"
MARKET_DATA_API_KEY=""
MARKET_DATA_BASE_URL=""
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 7: Commit scaffold config**

Run:

```bash
git add package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs tailwind.config.ts components.json .gitignore .env.example
git commit -m "chore: scaffold next project configuration"
```

Expected: commit succeeds.

---

### Task 2: Create App Shell and MVP Page Placeholders

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/assets/page.tsx`
- Create: `src/app/(dashboard)/assets/new/page.tsx`
- Create: `src/app/(dashboard)/assets/[id]/page.tsx`
- Create: `src/app/(dashboard)/exposure/page.tsx`
- Create: `src/app/(dashboard)/transactions/page.tsx`
- Create: `src/app/(dashboard)/transactions/new/page.tsx`
- Create: `src/app/(dashboard)/goals/page.tsx`
- Create: `src/app/(dashboard)/watchlist/page.tsx`
- Create: `src/app/(dashboard)/reports/page.tsx`
- Create: `src/app/(dashboard)/settings/page.tsx`
- Create: `src/app/(dashboard)/ai/page.tsx`
- Create: `src/app/(dashboard)/admin/page.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create shared utilities and button primitive**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Create `src/components/ui/button.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-border bg-background hover:bg-muted",
        ghost: "hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, className }))} {...props} />
  ),
);

Button.displayName = "Button";
```

- [ ] **Step 2: Create global CSS and root layout**

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --border: 214 32% 91%;
  --primary: 217 91% 35%;
  --primary-foreground: 0 0% 100%;
  --destructive: 0 84% 45%;
  --destructive-foreground: 0 0% 100%;
  --radius: 0.5rem;
}

* {
  border-color: hsl(var(--border));
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Fund Next",
  description: "Personal asset allocation tracking MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

Create `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
```

- [ ] **Step 3: Create dashboard navigation shell**

Create `src/components/layout/app-sidebar.tsx`:

```tsx
import Link from "next/link";
import {
  BarChart3,
  Bot,
  ClipboardList,
  Flag,
  Gauge,
  Layers3,
  ListChecks,
  Settings,
  Star,
  WalletCards,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/assets", label: "资产", icon: WalletCards },
  { href: "/exposure", label: "基金穿透", icon: Layers3 },
  { href: "/transactions", label: "交易复盘", icon: ClipboardList },
  { href: "/goals", label: "目标规划", icon: Flag },
  { href: "/watchlist", label: "自选资产", icon: Star },
  { href: "/reports", label: "报表", icon: BarChart3 },
  { href: "/ai", label: "AI 分析", icon: Bot },
  { href: "/settings", label: "设置", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r bg-muted/30 px-4 py-5 md:block">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <ListChecks className="h-5 w-5" />
        Fund Next
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-8">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create auth placeholders**

Create `src/app/(auth)/login/page.tsx`:

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">登录</h1>
      <p className="mt-2 text-sm text-muted-foreground">邮箱登录表单将在认证任务中实现。</p>
      <div className="mt-6">
        <Button asChild={false}>登录占位</Button>
      </div>
      <Link className="mt-4 text-sm text-primary" href="/register">
        创建账户
      </Link>
    </main>
  );
}
```

Create `src/app/(auth)/register/page.tsx`:

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">注册</h1>
      <p className="mt-2 text-sm text-muted-foreground">邮箱注册表单将在认证任务中实现。</p>
      <div className="mt-6">
        <Button>注册占位</Button>
      </div>
      <Link className="mt-4 text-sm text-primary" href="/login">
        已有账户，去登录
      </Link>
    </main>
  );
}
```

- [ ] **Step 5: Create dashboard page placeholders**

Create `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">总资产、配置图、收益趋势、目标进度和最近交易将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/assets/page.tsx`:

```tsx
export default function AssetsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">资产列表</h1>
      <p className="mt-2 text-sm text-muted-foreground">股票、基金、虚拟货币和现金资产管理将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/assets/new/page.tsx`:

```tsx
export default function NewAssetPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">添加资产</h1>
      <p className="mt-2 text-sm text-muted-foreground">资产录入表单将在资产管理任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/assets/[id]/page.tsx`:

```tsx
export default function AssetDetailPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">资产详情</h1>
      <p className="mt-2 text-sm text-muted-foreground">资产详情、编辑和删除操作将在资产管理任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/exposure/page.tsx`:

```tsx
export default function ExposurePage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">基金穿透</h1>
      <p className="mt-2 text-sm text-muted-foreground">一层基金到底层股票的穿透分析将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/transactions/page.tsx`:

```tsx
export default function TransactionsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">交易复盘</h1>
      <p className="mt-2 text-sm text-muted-foreground">交易列表、时间轴和基础复盘将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/transactions/new/page.tsx`:

```tsx
export default function NewTransactionPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">添加交易</h1>
      <p className="mt-2 text-sm text-muted-foreground">买入、卖出、加仓、减仓、定投等交易录入将在交易任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/goals/page.tsx`:

```tsx
export default function GoalsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">目标规划</h1>
      <p className="mt-2 text-sm text-muted-foreground">本金目标、完成度和月度建议投入将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/watchlist/page.tsx`:

```tsx
export default function WatchlistPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">自选资产</h1>
      <p className="mt-2 text-sm text-muted-foreground">关注资产、价格和涨跌幅展示将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/reports/page.tsx`:

```tsx
export default function ReportsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">报表</h1>
      <p className="mt-2 text-sm text-muted-foreground">基础资产概览与交易总结报表将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/settings/page.tsx`:

```tsx
export default function SettingsPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">设置</h1>
      <p className="mt-2 text-sm text-muted-foreground">账户和数据源设置将在后续任务中实现。</p>
    </section>
  );
}
```

Create `src/app/(dashboard)/ai/page.tsx`:

```tsx
export default function AiPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">AI 分析</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        AI 分析仅用于信息整理和风险提示，不提供收益承诺、买卖建议或自动投顾服务。
      </p>
    </section>
  );
}
```

Create `src/app/(dashboard)/admin/page.tsx`:

```tsx
export default function AdminPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold">管理后台</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        系统状态、基础资产字典、基金持仓数据和行情数据源配置将在管理后台任务中实现。
      </p>
    </section>
  );
}
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

- [ ] **Step 7: Commit app shell**

Run:

```bash
git add src/app src/components src/lib/utils.ts
git commit -m "feat: add app shell and route placeholders"
```

Expected: commit succeeds.

---

### Task 3: Add API Response Helpers and Placeholder Routes

**Files:**
- Create: `src/lib/api/response.ts`
- Create: `src/types/domain.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/assets/route.ts`
- Create: `src/app/api/assets/[id]/route.ts`
- Create: `src/app/api/dashboard/route.ts`
- Create: `src/app/api/exposure/funds/route.ts`
- Create: `src/app/api/exposure/funds/[fundAssetId]/route.ts`
- Create: `src/app/api/transactions/route.ts`
- Create: `src/app/api/transactions/[id]/route.ts`
- Create: `src/app/api/goals/active/route.ts`
- Create: `src/app/api/goals/route.ts`
- Create: `src/app/api/goals/[id]/route.ts`
- Create: `src/app/api/watchlists/route.ts`
- Create: `src/app/api/watchlists/[id]/route.ts`
- Create: `src/app/api/reports/summary/route.ts`
- Create: `src/app/api/market-data/quotes/route.ts`
- Create: `src/app/api/market-data/search/route.ts`
- Create: `src/app/api/admin/status/route.ts`

- [ ] **Step 1: Create domain types**

Create `src/types/domain.ts`:

```ts
export type AssetType = "stock" | "fund" | "crypto" | "cash";
export type Market = "CN" | "HK" | "US" | "CRYPTO" | "CASH";
export type Currency = "CNY" | "USD" | "HKD" | "USDT";

export type TransactionType =
  | "buy"
  | "sell"
  | "add"
  | "reduce"
  | "fixed_invest"
  | "transfer_in"
  | "transfer_out";

export type ApiErrorCode = 400 | 401 | 403 | 404 | 409 | 500;
```

- [ ] **Step 2: Create API response helpers**

Create `src/lib/api/response.ts`:

```ts
import { NextResponse } from "next/server";

import type { ApiErrorCode } from "@/types/domain";

export type ApiSuccess<T> = {
  code: 0;
  message: "success";
  data: T;
};

export type ApiFailure = {
  code: ApiErrorCode;
  message: string;
  data: null;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      code: 0,
      message: "success",
      data,
    },
    init,
  );
}

export function fail(code: ApiErrorCode, message: string, init?: ResponseInit) {
  return NextResponse.json<ApiFailure>(
    {
      code,
      message,
      data: null,
    },
    {
      status: code,
      ...init,
    },
  );
}

export function notImplemented(feature: string) {
  return fail(404, `${feature} is scaffolded but not implemented yet`);
}
```

- [ ] **Step 3: Create auth route placeholders**

Create `src/app/api/auth/register/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function POST() {
  return notImplemented("auth.register");
}
```

Create `src/app/api/auth/login/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function POST() {
  return notImplemented("auth.login");
}
```

- [ ] **Step 4: Create asset route placeholders**

Create `src/app/api/assets/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("assets.list");
}

export async function POST() {
  return notImplemented("assets.create");
}
```

Create `src/app/api/assets/[id]/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function PUT() {
  return notImplemented("assets.update");
}

export async function DELETE() {
  return notImplemented("assets.delete");
}
```

- [ ] **Step 5: Create dashboard and exposure route placeholders**

Create `src/app/api/dashboard/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("dashboard.summary");
}
```

Create `src/app/api/exposure/funds/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("exposure.funds.list");
}
```

Create `src/app/api/exposure/funds/[fundAssetId]/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("exposure.funds.detail");
}
```

- [ ] **Step 6: Create transaction, goal, and watchlist route placeholders**

Create `src/app/api/transactions/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("transactions.list");
}

export async function POST() {
  return notImplemented("transactions.create");
}
```

Create `src/app/api/transactions/[id]/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("transactions.detail");
}

export async function PUT() {
  return notImplemented("transactions.update");
}

export async function DELETE() {
  return notImplemented("transactions.delete");
}
```

Create `src/app/api/goals/active/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("goals.active");
}
```

Create `src/app/api/goals/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("goals.list");
}

export async function POST() {
  return notImplemented("goals.create");
}
```

Create `src/app/api/goals/[id]/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function PUT() {
  return notImplemented("goals.update");
}
```

Create `src/app/api/watchlists/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("watchlists.list");
}

export async function POST() {
  return notImplemented("watchlists.create");
}
```

Create `src/app/api/watchlists/[id]/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function DELETE() {
  return notImplemented("watchlists.delete");
}
```

- [ ] **Step 7: Create report, market data, and admin route placeholders**

Create `src/app/api/reports/summary/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("reports.summary");
}
```

Create `src/app/api/market-data/quotes/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("marketData.quotes");
}
```

Create `src/app/api/market-data/search/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("marketData.search");
}
```

Create `src/app/api/admin/status/route.ts`:

```ts
import { notImplemented } from "@/lib/api/response";

export async function GET() {
  return notImplemented("admin.status");
}
```

- [ ] **Step 8: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

- [ ] **Step 9: Commit API skeleton**

Run:

```bash
git add src/app/api src/lib/api src/types
git commit -m "feat: add mvp api route skeleton"
```

Expected: commit succeeds.

---

### Task 4: Add Prisma MySQL Schema and Database Helpers

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db/prisma.ts`
- Create: `src/lib/env/server.ts`

- [ ] **Step 1: Create server env validation**

Create `src/lib/env/server.ts`:

```ts
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  MARKET_DATA_PROVIDER: z.enum(["mock", "open-api"]).default("mock"),
  MARKET_DATA_API_KEY: z.string().optional().default(""),
  MARKET_DATA_BASE_URL: z.string().optional().default(""),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
```

- [ ] **Step 2: Create Prisma client singleton**

Create `src/lib/db/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id           BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  email        String    @unique(map: "uk_users_email") @db.VarChar(255)
  passwordHash String    @map("password_hash") @db.VarChar(255)
  nickname     String?   @db.VarChar(64)
  status       Int       @default(1) @db.TinyInt
  createdAt    DateTime  @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.DateTime(0)
  deletedAt    DateTime? @map("deleted_at") @db.DateTime(0)

  assets       UserAsset[]
  transactions Transaction[]
  goals        Goal[]
  watchlists   Watchlist[]
  snapshots    AssetDailySnapshot[]

  @@map("users")
}

model UserAsset {
  id           BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId       BigInt    @map("user_id") @db.UnsignedBigInt
  assetType    String    @map("asset_type") @db.VarChar(32)
  symbol       String?   @db.VarChar(64)
  assetName    String    @map("asset_name") @db.VarChar(255)
  market       String?   @db.VarChar(32)
  currency     String    @default("CNY") @db.VarChar(16)
  quantity     Decimal   @default(0) @db.Decimal(30, 10)
  avgCost      Decimal?  @map("avg_cost") @db.Decimal(30, 10)
  currentPrice Decimal?  @map("current_price") @db.Decimal(30, 10)
  costAmount   Decimal?  @map("cost_amount") @db.Decimal(30, 10)
  marketValue  Decimal?  @map("market_value") @db.Decimal(30, 10)
  remark       String?   @db.Text
  createdAt    DateTime  @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.DateTime(0)
  deletedAt    DateTime? @map("deleted_at") @db.DateTime(0)

  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]

  @@index([userId], map: "idx_user_assets_user_id")
  @@index([symbol], map: "idx_user_assets_symbol")
  @@index([assetType], map: "idx_user_assets_type")
  @@map("user_assets")
}

model Transaction {
  id                BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId            BigInt    @map("user_id") @db.UnsignedBigInt
  assetId           BigInt    @map("asset_id") @db.UnsignedBigInt
  transactionType   String    @map("transaction_type") @db.VarChar(32)
  quantity          Decimal   @db.Decimal(30, 10)
  price             Decimal   @db.Decimal(30, 10)
  fee               Decimal   @default(0) @db.Decimal(30, 10)
  currency          String    @default("CNY") @db.VarChar(16)
  transactionAmount Decimal   @map("transaction_amount") @db.Decimal(30, 10)
  transactionTime   DateTime  @map("transaction_time") @db.DateTime(0)
  reason            String?   @db.Text
  emotionTag        String?   @map("emotion_tag") @db.VarChar(64)
  createdAt         DateTime  @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt         DateTime  @updatedAt @map("updated_at") @db.DateTime(0)
  deletedAt         DateTime? @map("deleted_at") @db.DateTime(0)

  user              User      @relation(fields: [userId], references: [id])
  asset             UserAsset @relation(fields: [assetId], references: [id])

  @@index([userId], map: "idx_transactions_user_id")
  @@index([assetId], map: "idx_transactions_asset_id")
  @@index([transactionTime], map: "idx_transactions_time")
  @@map("transactions")
}

model Goal {
  id               BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId           BigInt    @map("user_id") @db.UnsignedBigInt
  goalName         String    @map("goal_name") @db.VarChar(255)
  targetAmount     Decimal   @map("target_amount") @db.Decimal(30, 10)
  targetDate       DateTime  @map("target_date") @db.Date
  initialPrincipal Decimal   @default(0) @map("initial_principal") @db.Decimal(30, 10)
  includeProfit    Boolean   @default(false) @map("include_profit")
  status           Int       @default(1) @db.TinyInt
  createdAt        DateTime  @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt        DateTime  @updatedAt @map("updated_at") @db.DateTime(0)
  deletedAt        DateTime? @map("deleted_at") @db.DateTime(0)

  user             User      @relation(fields: [userId], references: [id])

  @@index([userId], map: "idx_goals_user_id")
  @@index([status], map: "idx_goals_status")
  @@map("goals")
}

model FundHolding {
  id            BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  fundSymbol    String   @map("fund_symbol") @db.VarChar(64)
  fundName      String?  @map("fund_name") @db.VarChar(255)
  holdingSymbol String   @map("holding_symbol") @db.VarChar(64)
  holdingName   String   @map("holding_name") @db.VarChar(255)
  holdingMarket String?  @map("holding_market") @db.VarChar(32)
  industry      String?  @db.VarChar(128)
  weight        Decimal  @db.Decimal(10, 6)
  reportDate    DateTime @map("report_date") @db.Date
  createdAt     DateTime @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt     DateTime @updatedAt @map("updated_at") @db.DateTime(0)

  @@index([fundSymbol], map: "idx_fund_holdings_fund_symbol")
  @@index([holdingSymbol], map: "idx_fund_holdings_holding_symbol")
  @@index([reportDate], map: "idx_fund_holdings_report_date")
  @@map("fund_holdings")
}

model AssetPrice {
  id        BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  symbol    String   @db.VarChar(64)
  assetType String   @map("asset_type") @db.VarChar(32)
  market    String?  @db.VarChar(32)
  currency  String   @default("CNY") @db.VarChar(16)
  price     Decimal  @db.Decimal(30, 10)
  priceTime DateTime @map("price_time") @db.DateTime(0)
  source    String?  @db.VarChar(64)
  createdAt DateTime @default(now()) @map("created_at") @db.DateTime(0)

  @@index([symbol, priceTime], map: "idx_asset_prices_symbol_time")
  @@index([assetType], map: "idx_asset_prices_type")
  @@map("asset_prices")
}

model Watchlist {
  id        BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
  userId    BigInt    @map("user_id") @db.UnsignedBigInt
  assetType String    @map("asset_type") @db.VarChar(32)
  symbol    String    @db.VarChar(64)
  assetName String    @map("asset_name") @db.VarChar(255)
  market    String?   @db.VarChar(32)
  currency  String    @default("CNY") @db.VarChar(16)
  createdAt DateTime  @default(now()) @map("created_at") @db.DateTime(0)
  updatedAt DateTime  @updatedAt @map("updated_at") @db.DateTime(0)
  deletedAt DateTime? @map("deleted_at") @db.DateTime(0)

  user      User      @relation(fields: [userId], references: [id])

  @@unique([userId, symbol, assetType], map: "uk_watchlists_user_symbol")
  @@index([userId], map: "idx_watchlists_user_id")
  @@map("watchlists")
}

model AssetDailySnapshot {
  id              BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  userId          BigInt   @map("user_id") @db.UnsignedBigInt
  snapshotDate    DateTime @map("snapshot_date") @db.Date
  totalAssetValue Decimal  @default(0) @map("total_asset_value") @db.Decimal(30, 10)
  totalCost       Decimal  @default(0) @map("total_cost") @db.Decimal(30, 10)
  totalProfit     Decimal  @default(0) @map("total_profit") @db.Decimal(30, 10)
  totalProfitRate Decimal  @default(0) @map("total_profit_rate") @db.Decimal(10, 6)
  createdAt       DateTime @default(now()) @map("created_at") @db.DateTime(0)

  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, snapshotDate], map: "uk_snapshot_user_date")
  @@index([userId], map: "idx_snapshot_user_id")
  @@map("asset_daily_snapshots")
}
```

- [ ] **Step 4: Generate Prisma client**

Run:

```bash
npm run prisma:generate
```

Expected: Prisma client generation succeeds.

- [ ] **Step 5: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

- [ ] **Step 6: Commit database skeleton**

Run:

```bash
git add prisma src/lib/db src/lib/env
git commit -m "feat: add prisma mysql schema"
```

Expected: commit succeeds.

---

### Task 5: Add External Market Data Service Layer

**Files:**
- Create: `src/services/market-data/types.ts`
- Create: `src/services/market-data/errors.ts`
- Create: `src/services/market-data/providers/mock.ts`
- Create: `src/services/market-data/providers/open-api.ts`
- Create: `src/services/market-data/index.ts`

- [ ] **Step 1: Create market data types**

Create `src/services/market-data/types.ts`:

```ts
import type { AssetType, Currency, Market } from "@/types/domain";

export type Quote = {
  symbol: string;
  assetName: string;
  assetType: AssetType;
  market: Market;
  currency: Currency;
  price: number;
  priceTime: string;
  source: string;
};

export type AssetSearchResult = {
  symbol: string;
  assetName: string;
  assetType: AssetType;
  market: Market;
  currency: Currency;
};

export type FundHolding = {
  fundSymbol: string;
  fundName: string;
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: Market;
  industry: string;
  weight: number;
  reportDate: string;
};

export type QuoteRequest = {
  symbol: string;
  market: Market;
};

export interface MarketDataProvider {
  getQuote(request: QuoteRequest): Promise<Quote | null>;
  getQuotes(requests: QuoteRequest[]): Promise<Quote[]>;
  getFundHoldings(fundSymbol: string): Promise<FundHolding[]>;
  searchAssets(keyword: string): Promise<AssetSearchResult[]>;
}
```

- [ ] **Step 2: Create normalized error type**

Create `src/services/market-data/errors.ts`:

```ts
export class MarketDataError extends Error {
  constructor(
    message: string,
    readonly code: "provider_not_configured" | "request_failed" | "invalid_response",
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}
```

- [ ] **Step 3: Create mock provider**

Create `src/services/market-data/providers/mock.ts`:

```ts
import type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "../types";

const mockQuotes: Quote[] = [
  {
    symbol: "AAPL",
    assetName: "Apple Inc.",
    assetType: "stock",
    market: "US",
    currency: "USD",
    price: 190,
    priceTime: "2026-05-24T00:00:00.000Z",
    source: "mock",
  },
  {
    symbol: "BTC",
    assetName: "Bitcoin",
    assetType: "crypto",
    market: "CRYPTO",
    currency: "USDT",
    price: 68000,
    priceTime: "2026-05-24T00:00:00.000Z",
    source: "mock",
  },
];

const mockFundHoldings: FundHolding[] = [
  {
    fundSymbol: "FUND001",
    fundName: "Mock Growth Fund",
    holdingSymbol: "AAPL",
    holdingName: "Apple Inc.",
    holdingMarket: "US",
    industry: "Technology",
    weight: 0.08,
    reportDate: "2026-03-31",
  },
];

export class MockMarketDataProvider implements MarketDataProvider {
  async getQuote(request: QuoteRequest): Promise<Quote | null> {
    return mockQuotes.find((quote) => quote.symbol === request.symbol && quote.market === request.market) ?? null;
  }

  async getQuotes(requests: QuoteRequest[]): Promise<Quote[]> {
    const results = await Promise.all(requests.map((request) => this.getQuote(request)));
    return results.filter((quote): quote is Quote => quote !== null);
  }

  async getFundHoldings(fundSymbol: string): Promise<FundHolding[]> {
    return mockFundHoldings.filter((holding) => holding.fundSymbol === fundSymbol);
  }

  async searchAssets(keyword: string): Promise<AssetSearchResult[]> {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return [];
    }

    return mockQuotes
      .filter(
        (quote) =>
          quote.symbol.toLowerCase().includes(normalizedKeyword) ||
          quote.assetName.toLowerCase().includes(normalizedKeyword),
      )
      .map(({ symbol, assetName, assetType, market, currency }) => ({
        symbol,
        assetName,
        assetType,
        market,
        currency,
      }));
  }
}
```

- [ ] **Step 4: Create open API provider skeleton**

Create `src/services/market-data/providers/open-api.ts`:

```ts
import { MarketDataError } from "../errors";
import type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "../types";

type OpenApiProviderOptions = {
  apiKey: string;
  baseUrl: string;
};

export class OpenApiMarketDataProvider implements MarketDataProvider {
  constructor(private readonly options: OpenApiProviderOptions) {}

  async getQuote(_request: QuoteRequest): Promise<Quote | null> {
    this.assertConfigured();
    throw new MarketDataError("Open API quote integration is not implemented", "request_failed");
  }

  async getQuotes(requests: QuoteRequest[]): Promise<Quote[]> {
    const results = await Promise.all(requests.map((request) => this.getQuote(request)));
    return results.filter((quote): quote is Quote => quote !== null);
  }

  async getFundHoldings(_fundSymbol: string): Promise<FundHolding[]> {
    this.assertConfigured();
    throw new MarketDataError("Open API fund holdings integration is not implemented", "request_failed");
  }

  async searchAssets(_keyword: string): Promise<AssetSearchResult[]> {
    this.assertConfigured();
    throw new MarketDataError("Open API asset search integration is not implemented", "request_failed");
  }

  private assertConfigured() {
    if (!this.options.apiKey || !this.options.baseUrl) {
      throw new MarketDataError("Market data provider credentials are missing", "provider_not_configured");
    }
  }
}
```

- [ ] **Step 5: Create service entrypoint**

Create `src/services/market-data/index.ts`:

```ts
import { getServerEnv } from "@/lib/env/server";

import { MockMarketDataProvider } from "./providers/mock";
import { OpenApiMarketDataProvider } from "./providers/open-api";
import type { MarketDataProvider, QuoteRequest } from "./types";

export function createMarketDataProvider(): MarketDataProvider {
  const env = getServerEnv();

  if (env.MARKET_DATA_PROVIDER === "open-api") {
    return new OpenApiMarketDataProvider({
      apiKey: env.MARKET_DATA_API_KEY,
      baseUrl: env.MARKET_DATA_BASE_URL,
    });
  }

  return new MockMarketDataProvider();
}

export async function getQuote(request: QuoteRequest) {
  return createMarketDataProvider().getQuote(request);
}

export async function getQuotes(requests: QuoteRequest[]) {
  return createMarketDataProvider().getQuotes(requests);
}

export async function getFundHoldings(fundSymbol: string) {
  return createMarketDataProvider().getFundHoldings(fundSymbol);
}

export async function searchAssets(keyword: string) {
  return createMarketDataProvider().searchAssets(keyword);
}

export type {
  AssetSearchResult,
  FundHolding,
  MarketDataProvider,
  Quote,
  QuoteRequest,
} from "./types";
export { MarketDataError } from "./errors";
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

- [ ] **Step 7: Commit market data service**

Run:

```bash
git add src/services/market-data
git commit -m "feat: add market data service layer"
```

Expected: commit succeeds.

---

### Task 6: Add Finance Calculation Library with Unit Tests

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `src/lib/finance/calculations.ts`
- Create: `tests/unit/finance/calculations.test.ts`

- [ ] **Step 1: Create test configuration**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing finance tests**

Create `tests/unit/finance/calculations.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  aggregateDuplicateHoldings,
  calculateCostAmount,
  calculateFundExposureAmount,
  calculateGoalCompletion,
  calculateMarketValue,
  calculateMonthlyRequiredContribution,
  calculateProfit,
  calculateProfitRate,
} from "@/lib/finance/calculations";

describe("finance calculations", () => {
  it("calculates market value", () => {
    expect(calculateMarketValue({ quantity: 10, currentPrice: 25 })).toBe(250);
  });

  it("calculates cost amount", () => {
    expect(calculateCostAmount({ quantity: 10, avgCost: 15 })).toBe(150);
  });

  it("calculates profit", () => {
    expect(calculateProfit({ marketValue: 250, costAmount: 150 })).toBe(100);
  });

  it("calculates profit rate", () => {
    expect(calculateProfitRate({ profit: 100, costAmount: 400 })).toBe(0.25);
  });

  it("returns zero profit rate when cost is zero", () => {
    expect(calculateProfitRate({ profit: 100, costAmount: 0 })).toBe(0);
  });

  it("calculates goal completion and caps display rate at 1", () => {
    expect(calculateGoalCompletion({ currentPrincipal: 120000, targetAmount: 100000 })).toEqual({
      rawRate: 1.2,
      displayRate: 1,
      remainingAmount: 0,
    });
  });

  it("calculates monthly required contribution", () => {
    expect(
      calculateMonthlyRequiredContribution({
        remainingAmount: 12000,
        currentDate: new Date("2026-05-24T00:00:00.000Z"),
        targetDate: new Date("2027-05-24T00:00:00.000Z"),
      }),
    ).toBe(1000);
  });

  it("calculates one-layer fund exposure amount", () => {
    expect(calculateFundExposureAmount({ fundMarketValue: 100000, holdingWeight: 0.08 })).toBe(8000);
  });

  it("aggregates duplicate underlying holdings", () => {
    expect(
      aggregateDuplicateHoldings([
        {
          holdingSymbol: "0700.HK",
          holdingName: "Tencent",
          holdingMarket: "HK",
          industry: "Internet",
          exposureAmount: 8000,
          sourceFundSymbols: ["FUND_A"],
        },
        {
          holdingSymbol: "0700.HK",
          holdingName: "Tencent",
          holdingMarket: "HK",
          industry: "Internet",
          exposureAmount: 5000,
          sourceFundSymbols: ["FUND_B"],
        },
      ]),
    ).toEqual([
      {
        holdingSymbol: "0700.HK",
        holdingName: "Tencent",
        holdingMarket: "HK",
        industry: "Internet",
        exposureAmount: 13000,
        sourceFundSymbols: ["FUND_A", "FUND_B"],
      },
    ]);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```bash
npm test -- tests/unit/finance/calculations.test.ts
```

Expected: FAIL because `src/lib/finance/calculations.ts` does not exist.

- [ ] **Step 4: Implement finance calculations**

Create `src/lib/finance/calculations.ts`:

```ts
type QuantityPriceInput = {
  quantity: number;
  currentPrice: number;
};

type QuantityCostInput = {
  quantity: number;
  avgCost: number;
};

type ProfitInput = {
  marketValue: number;
  costAmount: number;
};

type ProfitRateInput = {
  profit: number;
  costAmount: number;
};

type GoalCompletionInput = {
  currentPrincipal: number;
  targetAmount: number;
};

type MonthlyContributionInput = {
  remainingAmount: number;
  currentDate: Date;
  targetDate: Date;
};

type FundExposureInput = {
  fundMarketValue: number;
  holdingWeight: number;
};

export type ExposureHolding = {
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: string;
  industry: string;
  exposureAmount: number;
  sourceFundSymbols: string[];
};

export function calculateMarketValue(input: QuantityPriceInput) {
  return roundMoney(input.quantity * input.currentPrice);
}

export function calculateCostAmount(input: QuantityCostInput) {
  return roundMoney(input.quantity * input.avgCost);
}

export function calculateProfit(input: ProfitInput) {
  return roundMoney(input.marketValue - input.costAmount);
}

export function calculateProfitRate(input: ProfitRateInput) {
  if (input.costAmount <= 0) {
    return 0;
  }

  return roundRate(input.profit / input.costAmount);
}

export function calculateGoalCompletion(input: GoalCompletionInput) {
  if (input.targetAmount <= 0) {
    return {
      rawRate: 0,
      displayRate: 0,
      remainingAmount: 0,
    };
  }

  const rawRate = roundRate(input.currentPrincipal / input.targetAmount);
  return {
    rawRate,
    displayRate: Math.min(rawRate, 1),
    remainingAmount: roundMoney(Math.max(input.targetAmount - input.currentPrincipal, 0)),
  };
}

export function calculateMonthlyRequiredContribution(input: MonthlyContributionInput) {
  if (input.remainingAmount <= 0) {
    return 0;
  }

  const months = monthsBetween(input.currentDate, input.targetDate);
  if (months <= 0) {
    return roundMoney(input.remainingAmount);
  }

  return roundMoney(input.remainingAmount / months);
}

export function calculateFundExposureAmount(input: FundExposureInput) {
  return roundMoney(input.fundMarketValue * input.holdingWeight);
}

export function aggregateDuplicateHoldings(holdings: ExposureHolding[]) {
  const grouped = new Map<string, ExposureHolding>();

  for (const holding of holdings) {
    const existing = grouped.get(holding.holdingSymbol);
    if (!existing) {
      grouped.set(holding.holdingSymbol, {
        ...holding,
        sourceFundSymbols: [...holding.sourceFundSymbols],
      });
      continue;
    }

    existing.exposureAmount = roundMoney(existing.exposureAmount + holding.exposureAmount);
    existing.sourceFundSymbols = Array.from(
      new Set([...existing.sourceFundSymbols, ...holding.sourceFundSymbols]),
    );
  }

  return Array.from(grouped.values());
}

function monthsBetween(currentDate: Date, targetDate: Date) {
  const yearDiff = targetDate.getUTCFullYear() - currentDate.getUTCFullYear();
  const monthDiff = targetDate.getUTCMonth() - currentDate.getUTCMonth();
  const baseMonths = yearDiff * 12 + monthDiff;
  return targetDate.getUTCDate() >= currentDate.getUTCDate() ? baseMonths : baseMonths - 1;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundRate(value: number) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}
```

- [ ] **Step 5: Run tests to verify pass**

Run:

```bash
npm test -- tests/unit/finance/calculations.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: TypeScript exits with code 0.

- [ ] **Step 7: Commit calculation library**

Run:

```bash
git add vitest.config.ts tests src/lib/finance
git commit -m "feat: add finance calculation tests"
```

Expected: commit succeeds.

---

### Task 7: Add Development Documentation and Final Verification

**Files:**
- Create: `docs/development.md`

- [ ] **Step 1: Create development guide**

Create `docs/development.md`:

```md
# Development Guide

## Purpose

This repository is a Next.js fullstack MVP skeleton for a personal asset allocation tracking product.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run prisma:generate
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
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 3: Review git status**

Run:

```bash
git status --short
```

Expected: only intentional files are modified or untracked. `.DS_Store` and existing `doc/` may remain outside the skeleton commits unless the user asks to track them.

- [ ] **Step 4: Commit documentation**

Run:

```bash
git add docs/development.md
git commit -m "docs: add development guide"
```

Expected: commit succeeds.
