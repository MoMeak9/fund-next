# UI 系统化优化实施计划

> **For agentic workers:** 使用 `ui-systematic-optimization` skill 配合此计划逐步执行。按 Phase 顺序，每个 Task 完成后 checkbox 打勾。

**Goal:** 将 fund-next 的 UI 从"功能可用"提升到"体验良好"水平，建立可扩展的设计系统。

**原则:**
- 自底向上：先 token → 再组件 → 最后页面应用
- 每层独立可验证：每个 Task 完成后 `pnpm typecheck && pnpm lint` 通过
- 最小改动：不改业务逻辑，只改展示层
- 渐进增强：不破坏现有功能

**Tech Stack:** Next.js 15, Tailwind CSS, shadcn/ui (slate), lucide-react, ECharts, Zustand

---

## Phase 1: 设计 Token 完善 (L1)

### Task 1.1: 暗黑模式 CSS Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1:** 在 `@layer base` 中添加 `.dark {}` 块，定义完整暗黑 token
- [ ] **Step 2:** 添加语义色变量 `--success`, `--warning`, `--info`, `--danger`
- [ ] **Step 3:** 添加 `--chart-1` 到 `--chart-5` 图表专用色

```css
/* 目标结构 */
@layer base {
  :root {
    /* 现有 token 保持 */
    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --info: 199 89% 48%;
    --info-foreground: 0 0% 100%;
    --danger: 0 84% 60%;
    --danger-foreground: 0 0% 100%;
    --chart-1: 221 83% 53%;
    --chart-2: 142 71% 45%;
    --chart-3: 38 92% 50%;
    --chart-4: 280 67% 55%;
    --chart-5: 199 89% 48%;
  }
  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --card: 222 47% 13%;
    --card-foreground: 210 40% 98%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 17%;
    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;
    /* ... 其余 token */
  }
}
```

### Task 1.2: Tailwind 语义色扩展

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1:** 在 `extend.colors` 中添加语义色映射

```ts
colors: {
  success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
  warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
  info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
  danger: { DEFAULT: "hsl(var(--danger))", foreground: "hsl(var(--danger-foreground))" },
  chart: { 1: "hsl(var(--chart-1))", 2: "hsl(var(--chart-2))", ... },
}
```

### Task 1.3: 暗黑模式切换控件

**Files:**
- Create: `src/components/ui/theme-toggle.tsx`
- Modify: `src/app/layout.tsx` (添加 ThemeProvider 或 script)
- Modify: `src/components/layout/app-sidebar.tsx` (放置切换按钮)

- [ ] **Step 1:** 使用 `next-themes` 或手动 script 实现主题切换
- [ ] **Step 2:** 创建 ThemeToggle 组件 (Sun/Moon icon)
- [ ] **Step 3:** 集成到侧栏底部

---

## Phase 2: 通用组件抽取 (L2)

### Task 2.1: PageHeader 组件

**Files:**
- Create: `src/components/layout/page-header.tsx`
- Modify: 所有 `page.tsx` 文件 (11 个)

- [ ] **Step 1:** 创建 `PageHeader` 组件

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode; // 右侧操作按钮
}
```

- [ ] **Step 2:** 逐页面替换手写的 `<h1>` + 按钮组合

### Task 2.2: EmptyState 组件

**Files:**
- Create: `src/components/ui/empty-state.tsx`
- Modify: 涉及空状态的 feature 组件 (~6 个)

- [ ] **Step 1:** 创建通用 EmptyState

```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

- [ ] **Step 2:** 替换各页面的自行实现

### Task 2.3: DataTable 水平滚动包装

**Files:**
- Create: `src/components/ui/data-table-wrapper.tsx`
- Modify: `src/features/assets/AssetTable.tsx`
- Modify: `src/features/transactions/TransactionTable.tsx`
- Modify: `src/features/exposure/ExposureTable.tsx`
- Modify: `src/features/watchlist/WatchlistTable.tsx`

- [ ] **Step 1:** 创建 `DataTableWrapper` (含 `overflow-x-auto` + 阴影指示)
- [ ] **Step 2:** 包裹所有 Table 组件

### Task 2.4: 统一 Loading State

**Files:**
- Create: `src/components/ui/loading-skeleton.tsx`
- Modify: 各 page.tsx 中的 "加载中..." 文字

- [ ] **Step 1:** 创建 `PageSkeleton` (card grid skeleton) 和 `TableSkeleton` (表格行 skeleton)
- [ ] **Step 2:** 替换所有 `加载中...` 文字为 skeleton 组件

---

## Phase 3: 交互反馈增强 (L3)

### Task 3.1: 侧栏路由高亮

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`

- [ ] **Step 1:** 导入 `usePathname()`
- [ ] **Step 2:** 当前路由项添加 `bg-primary/10 text-primary font-medium` 样式
- [ ] **Step 3:** 验证所有路由都能正确高亮

### Task 3.2: 全局 Toast 反馈

**Files:**
- Modify: `src/features/assets/hooks.ts`
- Modify: `src/features/transactions/hooks.ts` (如有 mutation)
- Modify: `src/features/goals/hooks.ts`
- Modify: `src/features/watchlist/hooks.ts`
- Modify: `src/features/settings/hooks.ts`

- [ ] **Step 1:** 在所有 `useMutation` 的 `onSuccess` 中添加 `toast({ title: "操作成功", ... })`
- [ ] **Step 2:** 在所有 `onError` 中添加 `toast({ variant: "destructive", ... })`

### Task 3.3: Submit 按钮 Loading 状态

**Files:**
- Modify: 所有含表单提交的 feature 组件 (~8 个)

- [ ] **Step 1:** 利用 React Query `isPending` 状态
- [ ] **Step 2:** Submit 按钮在 pending 时 `disabled` + 显示 Loader2 icon spin

### Task 3.4: 删除确认对话框统一

**Files:**
- Create: `src/components/ui/confirm-dialog.tsx` (基于 AlertDialog)
- Modify: AssetTable, GoalCard 等含删除操作的组件

- [ ] **Step 1:** 创建 `ConfirmDialog` 封装
- [ ] **Step 2:** 所有删除按钮改为先弹确认再执行

---

## Phase 4: 响应式适配 (L4)

### Task 4.1: 移动端侧栏抽屉

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/store/ui.ts` (添加 mobileSidebarOpen 状态)

- [ ] **Step 1:** 使用 shadcn `Sheet` 组件包裹移动端侧栏
- [ ] **Step 2:** 在 dashboard layout 顶部添加汉堡菜单触发按钮
- [ ] **Step 3:** Zustand store 控制 open/close 状态

### Task 4.2: 表格响应式列隐藏

**Files:**
- Modify: `src/features/assets/AssetTable.tsx`
- Modify: `src/features/transactions/TransactionTable.tsx`

- [ ] **Step 1:** 次要列添加 `hidden md:table-cell` class
- [ ] **Step 2:** 移动端仅展示核心信息 (名称、金额、操作)

### Task 4.3: Card Grid 统一断点

**Files:**
- Modify: 所有使用 grid 的页面 (dashboard, reports, admin, goals)

- [ ] **Step 1:** 统一为 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- [ ] **Step 2:** 根据卡片内容合理选择 col-span

---

## Phase 5: 性能优化 (L6)

### Task 5.1: ECharts 动态导入

**Files:**
- Modify: `src/features/dashboard/PieChart.tsx`
- Modify: `src/features/reports/AllocationCharts.tsx`

- [ ] **Step 1:** 使用 `next/dynamic` + `{ ssr: false }` 懒加载
- [ ] **Step 2:** 加载时显示 chart skeleton

### Task 5.2: Skeleton Loading 全覆盖

**Files:**
- Modify: 各 page.tsx 的 loading 分支

- [ ] **Step 1:** Dashboard: 4 个 card skeleton + chart skeleton
- [ ] **Step 2:** Tables: TableSkeleton (5 rows)
- [ ] **Step 3:** Forms: FormSkeleton

---

## Phase 6: 语义色迁移 (L1 收尾)

### Task 6.1: 硬编码颜色替换

**Files:**
- Modify: 含 `text-green-600`, `text-red-600`, `bg-yellow-50` 等的组件

- [ ] **Step 1:** `text-green-600` → `text-success`
- [ ] **Step 2:** `text-red-600` → `text-danger`
- [ ] **Step 3:** `bg-yellow-50 border-yellow-200 text-yellow-800` → `bg-warning/10 border-warning/20 text-warning`

---

## 验收标准

| 维度 | 指标 |
|------|------|
| 编译 | `pnpm typecheck` 零错误 |
| Lint | `pnpm lint` 零警告 |
| 响应式 | 375px / 768px / 1440px 三个断点正常展示 |
| 暗黑模式 | 切换后无色彩异常 |
| 交互反馈 | 所有 CUD 操作有 toast |
| 性能 | Lighthouse Performance ≥ 85 |
| 可访问性 | Lighthouse Accessibility ≥ 80 |

---

## 依赖关系

```
Phase 1 (Token)  ←── 无依赖，最先执行
    ↓
Phase 2 (组件) ←── 依赖 Phase 1 的 token
    ↓
Phase 3 (交互) ←── 可与 Phase 2 并行
    ↓
Phase 4 (响应式) ←── 依赖 Phase 2 组件
    ↓
Phase 5 (性能) ←── 可独立执行
    ↓
Phase 6 (迁移) ←── 依赖 Phase 1 的语义色
```

## 预计新增/修改文件

| 类型 | 文件数 | 说明 |
|------|--------|------|
| 新增 | ~6 | theme-toggle, page-header, empty-state, data-table-wrapper, loading-skeleton, confirm-dialog |
| 修改 | ~25 | globals.css, tailwind.config, app-sidebar, layout, 所有 page.tsx, feature hooks |
| 依赖 | 1 | `next-themes` (可选) |
