# 遗留功能项补全设计文档

> 覆盖范围：P0-P1 测试修复 + Settings / Reports / Admin / AI 分析四个占位页面的业务实现
> 依赖：P0-P1 全功能模块已完成（auth, assets, dashboard, transactions, goals, exposure, watchlist）

---

## 1. Category A：P0-P1 遗留修复

### 1.1 补充 Transaction Service 测试

文件：`tests/unit/services/transactions.test.ts`

测试用例：
- `createTransaction` buy 类型：quantity 增加，avgCost 按加权平均重算
- `createTransaction` sell 类型：quantity 减少，avgCost 不变
- `listTransactions` 分页返回正确结构（items, total, page, pageSize）
- `deleteTransaction` 软删除 + 回滚资产数量

Mock 方式：与现有测试一致 — `vi.mock("@/lib/db/prisma")` mock Prisma client。

### 1.2 修复 goals.test.ts 类型错误

问题：`prisma.goal.findFirst.mockResolvedValue` 和 `prisma.userAsset.findMany.mockResolvedValue` 缺少类型断言，TypeScript 报 `Property 'mockResolvedValue' does not exist`。

修复：对 mock 方法使用 `vi.mocked()` 包装，统一所有测试文件的 mock 类型处理模式。

### 1.3 更新 docs/development.md

移除过时描述（"does not implement registration, login, asset CRUD..."），替换为当前已实现模块清单和开发状态说明。

---

## 2. Settings 页面（用户设置）

### 2.1 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/profile` | PUT | 修改昵称 `{ nickname }` |
| `/api/auth/password` | PUT | 修改密码 `{ currentPassword, newPassword }` |
| `/api/auth/logout` | POST | 已有，复用 |

### 2.2 Zod Schema

```ts
updateProfileSchema: { nickname: z.string().min(1).max(32) }
updatePasswordSchema: { currentPassword: z.string(), newPassword: z.string().min(8) }
```

### 2.3 Service

扩展 `src/services/auth/index.ts`：
- `updateProfile(userId, { nickname })` — 更新 user.nickname
- `updatePassword(userId, { currentPassword, newPassword })` — bcrypt compare 旧密码 → hash 新密码 → 更新 user.passwordHash

错误处理：
- 当前密码不匹配 → 返回错误码 `WRONG_PASSWORD`（400）

### 2.4 前端

文件：
- `src/features/settings/hooks.ts` — `useUpdateProfile()`, `useUpdatePassword()`
- `src/features/settings/ProfileForm.tsx` — 昵称修改表单
- `src/features/settings/PasswordForm.tsx` — 当前密码 + 新密码 + 确认新密码
- `src/app/(dashboard)/settings/page.tsx` — 组合页面

页面布局：两个 Card 纵向排列（个人信息、安全设置），底部退出登录按钮。

交互：
- 修改成功 → toast 提示
- 密码错误 → 表单内错误提示
- 退出登录 → POST `/api/auth/logout` → redirect `/login`

---

## 3. Reports 页面（报表展示）

### 3.1 API

复用现有 `GET /api/reports/summary`。修改 route handler 补充透传 `marketAllocation` 字段（dashboard service 已计算）。

完整返回：
```ts
{
  totalAssetValue: number,
  totalCost: number,
  totalProfit: number,
  totalProfitRate: number,
  assetAllocation: { assetType: string, value: number, percentage: number }[],
  marketAllocation: { market: string, value: number, percentage: number }[],
}
```

### 3.2 前端

文件：
- `src/features/reports/hooks.ts` — `useReportSummary()`
- `src/features/reports/SummaryCards.tsx` — 总资产、总成本、总盈亏、收益率四张卡片
- `src/features/reports/AllocationCharts.tsx` — 复用 dashboard 的 `PieChart` 组件展示两个饼图
- `src/app/(dashboard)/reports/page.tsx` — 组合页面

页面布局：顶部 4 张数据卡片，下方两个并排饼图（资产类型分布 + 市场分布）。

空状态：无资产时展示引导添加 CTA。

---

## 4. Admin 页面（系统状态）

### 4.1 API

扩展现有 `GET /api/admin/status`，返回：

```ts
{
  status: "healthy" | "degraded",
  timestamp: string,
  database: { connected: boolean, latencyMs: number },
  marketData: { provider: string, status: "ok" | "error" },
  stats: { userCount: number, assetCount: number, transactionCount: number },
}
```

实现逻辑：
- DB 状态：执行 `SELECT 1` 测连通性 + 计时（`Date.now()` 差值）
- 行情状态：读 `MARKET_DATA_PROVIDER` env 值，尝试调 mock provider 确认可用
- 统计数：`prisma.user.count()` / `prisma.userAsset.count({ where: { deletedAt: null } })` / `prisma.transaction.count({ where: { deletedAt: null } })`
- 任一检查失败 → status 为 "degraded"

### 4.2 前端

文件：
- `src/features/admin/hooks.ts` — `useSystemStatus()`
- `src/features/admin/StatusCards.tsx` — 系统状态、数据库、行情服务三张卡片（绿/红圆点指示）
- `src/features/admin/StatsCards.tsx` — 用户数、资产数、交易数
- `src/app/(dashboard)/admin/page.tsx` — 组合页面

页面布局：状态卡片一行三列，统计卡片一行三列。

权限：MVP 不做角色区分，所有登录用户可访问。

---

## 5. AI 分析页面（规则模板）

### 5.1 API

新增 `GET /api/ai/analysis`

返回：
```ts
{
  summary: string,
  insights: string[],
  riskNotes: string[],
  generatedAt: string,
}
```

### 5.2 Service

新增 `src/services/ai/index.ts` — `generateAnalysis(userId)`：

分析维度：
1. 资产集中度：单一资产市值占比 > 30% → 提示集中风险
2. 资产类型分布：描述主要配置类型及占比
3. 市场分布：描述地域配置
4. 交易频率：近 30 天交易次数
5. 目标进度：有 active 目标时提示剩余金额和月度建议

模板拼接规则：
- 无资产 → summary 为"暂无资产数据，请先添加资产后查看分析"，insights 为空
- 有资产 → 组合各维度生成 summary（2-3 句话）+ insights（3-5 条）
- riskNotes 固定包含："以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。"

### 5.3 前端

文件：
- `src/features/ai/hooks.ts` — `useAiAnalysis()`
- `src/features/ai/AnalysisCard.tsx` — 展示 summary 文本
- `src/features/ai/InsightsList.tsx` — 要点列表（带图标）
- `src/features/ai/RiskDisclaimer.tsx` — 风险提示（灰色小字）
- `src/app/(dashboard)/ai/page.tsx` — 组合页面

页面布局：顶部合规声明 banner（黄色背景），中间分析卡片 + 要点列表，底部风险免责声明。

---

## 6. 依赖关系

```text
Category A（无依赖，可立即执行）:
├── 补 transaction 测试
├── 修 goals.test.ts 类型
└── 更新 development.md

Category B（依赖 Category A 完成后的 clean typecheck）:
├── Settings（独立）
├── Reports（独立）
├── Admin（独立）
└── AI 分析（独立，但复用 assets/transactions/goals service 数据）
```

Category B 四个页面互相独立，可并行实现。

---

## 7. 不在范围

- 角色权限（admin role）
- 数据导出 CSV/PDF
- 历史趋势图（需快照数据）
- LLM 接入
- E2E 测试
