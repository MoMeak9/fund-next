# P0-P1 全功能模块设计文档

> 覆盖范围：认证、资产管理、Dashboard、交易记录、目标规划、基金穿透、自选资产
> 实现模式：全 API Route + React Query（SPA），httpOnly cookie 认证，shadcn/ui 组件库

---

## 1. 整体架构

```
Browser (SPA, client components)
  ├── React Query ←→ API Routes ←→ Service Layer ←→ Prisma + MySQL
  └── Zustand (UI state only: sidebar, modal, toast)

认证：httpOnly cookie 存储 JWT，Next.js middleware 统一校验
```

### 分层职责

| 层 | 位置 | 职责 |
|---|---|---|
| API Route | `src/app/api/` | HTTP 入口，解析 cookie 获取 userId，调用 service，返回统一格式 |
| Service | `src/services/` | 业务逻辑，Prisma 查询，计算，校验归属 |
| Lib | `src/lib/` | 工具函数（finance 计算、env 校验、API response、JWT 工具） |
| Feature | `src/features/` | 按模块组织的前端组件和 hooks |
| Store | `src/store/` | Zustand，仅管理 UI 状态 |

### 前端目录结构

```
src/
├── app/                    # 路由页面
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   └── layout/             # 布局组件
├── features/
│   ├── auth/               # 登录注册表单、hooks
│   ├── assets/             # 资产列表、表单、详情
│   ├── dashboard/          # Dashboard 卡片、图表
│   ├── transactions/       # 交易列表、表单
│   ├── goals/              # 目标卡片、表单
│   ├── exposure/           # 穿透表格、图表
│   └── watchlist/          # 自选列表
├── hooks/                  # 通用 hooks
├── lib/                    # 工具层
├── services/               # 后端 service 层
├── store/                  # Zustand stores
└── types/                  # 类型定义
```

---

## 2. 认证模块

### 2.1 注册

- POST `/api/auth/register` → `{ email, password, nickname? }`
- Zod 校验：email 合法，password >= 8 位，nickname <= 32 字符
- 检查邮箱唯一（409 冲突）
- bcrypt hash password（saltRounds=10）
- 插入 user 记录
- 生成 JWT pair → 设置 httpOnly cookie
- 返回 `{ userId, email, nickname }`

### 2.2 登录

- POST `/api/auth/login` → `{ email, password }`
- Zod 校验
- 查用户（不存在返回 401）
- bcrypt compare（不匹配返回 401，统一错误信息防枚举）
- 生成 JWT pair → 设置 httpOnly cookie
- 返回 `{ userId, email, nickname }`

### 2.3 Token 设计

| Token | 过期时间 | Cookie 名 | Payload |
|---|---|---|---|
| access_token | 15 分钟 | `fund_access` | `{ userId, email }` |
| refresh_token | 7 天 | `fund_refresh` | `{ userId }` |

Cookie 属性：`httpOnly`, `secure`(prod), `sameSite: lax`, `path: /`

### 2.4 Middleware（`src/middleware.ts`）

- 匹配所有路由，排除：`/login`, `/register`, `/api/auth/*`, `/_next/*`, 静态资源
- 读取 `fund_access` cookie → 验证 JWT
- access 过期但 refresh 有效 → 自动刷新，写入新 access cookie
- 无效 → redirect `/login`

### 2.5 退出登录

- POST `/api/auth/logout` → 清除 `fund_access` + `fund_refresh` cookie

### 2.6 获取当前用户

- GET `/api/auth/me` → 从 cookie 解析返回 `{ userId, email, nickname }`
- 封装 `getCurrentUserId(request): bigint` 工具函数供所有 route handler 使用

### 2.7 前端

- `src/features/auth/LoginForm.tsx`：邮箱 + 密码表单
- `src/features/auth/RegisterForm.tsx`：邮箱 + 密码 + 昵称表单
- `src/hooks/useCurrentUser.ts`：React Query hook 调 `/api/auth/me`

---

## 3. 资产管理模块

### 3.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/assets` | GET | 资产列表，支持 `?type=&market=` 筛选 |
| `/api/assets` | POST | 创建资产 |
| `/api/assets/[id]` | GET | 资产详情（校验归属） |
| `/api/assets/[id]` | PUT | 编辑资产（校验归属） |
| `/api/assets/[id]` | DELETE | 软删除（校验归属） |

### 3.2 Zod Schema

```ts
createAssetSchema: {
  assetType: z.enum(["stock", "fund", "crypto", "cash"]),
  symbol: z.string().optional(),
  assetName: z.string().min(1).max(255),
  market: z.enum(["CN", "HK", "US", "CRYPTO", "CASH"]).optional(),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]),
  quantity: z.number().min(0),
  avgCost: z.number().optional(),
  currentPrice: z.number().optional(),
  remark: z.string().optional(),
}
updateAssetSchema: createAssetSchema.partial()
```

### 3.3 Service（`src/services/assets/`）

- `listAssets(userId, filters?)` → WHERE deletedAt IS NULL + 筛选条件
- `getAsset(userId, id)` → 校验归属
- `createAsset(userId, input)` → 插入，自动计算 costAmount 和 marketValue
- `updateAsset(userId, id, input)` → 校验归属 + 更新 + 重算
- `deleteAsset(userId, id)` → 校验归属 + 设置 deletedAt

自动计算：
- `costAmount = quantity × avgCost`
- `marketValue = quantity × currentPrice`

### 3.4 前端（`src/features/assets/`）

- `AssetListPage`：数据表格，列：名称、类型、市场、数量、当前价、市值、成本、盈亏、盈亏率
- `AssetForm`：添加/编辑共用，资产类型切换动态字段（现金无 symbol/market）
- `useAssets()` / `useCreateAsset()` / `useUpdateAsset()` / `useDeleteAsset()`
- 删除前弹 confirm dialog

---

## 4. Dashboard 模块

### 4.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/dashboard` | GET | 聚合数据 |

### 4.2 返回结构

```ts
{
  totalAssetValue: number,
  totalCost: number,
  totalProfit: number,
  totalProfitRate: number,
  assetAllocation: { assetType: string, value: number, percentage: number }[],
  marketAllocation: { market: string, value: number, percentage: number }[],
  recentTransactions: { id, assetName, transactionType, quantity, price, transactionTime }[],
  activeGoal: { goalName, targetAmount, completionRate, remainingAmount, monthlyRequired } | null,
}
```

### 4.3 Service（`src/services/dashboard/`）

- `getDashboardSummary(userId)`:
  1. 查所有未删除资产 → 求和 marketValue / costAmount
  2. 按 assetType 分组聚合 → assetAllocation
  3. 按 market 分组聚合 → marketAllocation
  4. 查最近 5 条交易
  5. 查 active 目标 → 计算进度

- 复用 `calculateProfit`, `calculateProfitRate`, `calculateGoalCompletion`, `calculateMonthlyRequiredContribution`
- 空资产返回全零

### 4.4 前端（`src/features/dashboard/`）

- `TotalAssetCard`：总资产、成本、盈亏、收益率
- `AssetAllocationChart`：ECharts 饼图
- `MarketAllocationChart`：ECharts 饼图
- `RecentTransactions`：简单列表
- `GoalProgressCard`：进度条 + 数字
- 空状态：引导添加资产 CTA

---

## 5. 交易记录与复盘模块

### 5.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/transactions` | GET | 列表，支持 `?assetId=&type=&startDate=&endDate=&page=&pageSize=` |
| `/api/transactions` | POST | 创建交易 + 更新资产持仓 |
| `/api/transactions/[id]` | GET | 详情（校验归属） |
| `/api/transactions/[id]` | PUT | 编辑（校验归属）+ 回滚重算资产 |
| `/api/transactions/[id]` | DELETE | 软删除（校验归属）+ 回滚资产 |

### 5.2 分页返回结构

```ts
{ items: Transaction[], total: number, page: number, pageSize: number }
```

默认 pageSize=20。

### 5.3 创建交易时的资产联动

| 交易类型 | 资产变化 |
|---|---|
| buy / add / fixed_invest / transfer_in | quantity 增加，avgCost 重算 |
| sell / reduce / transfer_out | quantity 减少，avgCost 不变 |

avgCost 重算（加仓类）：

```
newAvgCost = (oldQuantity × oldAvgCost + newQuantity × price) / (oldQuantity + newQuantity)
```

transactionAmount 自动计算：`quantity × price + fee`

### 5.4 Service（`src/services/transactions/`）

- `listTransactions(userId, filters?, pagination?)` → 分页查询
- `createTransaction(userId, input)` → 校验资产归属 → 插入 → 更新资产
- `updateTransaction(userId, id, input)` → 回滚旧影响 → 应用新交易
- `deleteTransaction(userId, id)` → 回滚影响 → 软删除

### 5.5 前端（`src/features/transactions/`）

- `TransactionListPage`：表格 + 筛选器（资产、类型、时间范围）+ 分页
- `TransactionForm`：选择资产 → 类型、数量、价格、手续费、时间、原因、情绪标签
- `TransactionDetail`：dialog 展示单笔详情

---

## 6. 目标规划模块

### 6.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/goals` | GET | 所有目标 |
| `/api/goals` | POST | 创建（限制一个 active） |
| `/api/goals/active` | GET | 当前 active 目标 + 进度 |
| `/api/goals/[id]` | PUT | 编辑（校验归属） |
| `/api/goals/[id]` | DELETE | 软删除（校验归属） |

### 6.2 active 目标返回结构

```ts
{
  ...goal,
  currentPrincipal: number,     // 所有资产 costAmount 之和
  completionRate: number,       // min(currentPrincipal / targetAmount, 1)
  rawRate: number,              // currentPrincipal / targetAmount
  remainingAmount: number,      // max(targetAmount - currentPrincipal, 0)
  monthlyRequired: number,      // remainingAmount / 剩余月数
}
```

### 6.3 Service（`src/services/goals/`）

- `listGoals(userId)`
- `createGoal(userId, input)` → 检查已有 active 目标则拒绝（409）
- `getActiveGoal(userId)` → 查 active 目标 → 查资产总 costAmount → 计算进度
- `updateGoal(userId, id, input)` → 校验归属
- `deleteGoal(userId, id)` → 软删除

复用：`calculateGoalCompletion`, `calculateMonthlyRequiredContribution`

### 6.4 前端（`src/features/goals/`）

- `GoalPage`：当前目标卡片（进度条、剩余金额、月度建议）+ 创建/编辑表单
- `GoalForm`：目标名称、目标金额、目标日期、起始本金
- 无 active 目标时展示创建入口

---

## 7. 基金穿透模块

### 7.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/exposure/funds` | GET | 所有基金穿透汇总 |
| `/api/exposure/funds/[fundAssetId]` | GET | 单基金穿透详情 |

### 7.2 汇总返回结构

```ts
{
  totalFundValue: number,
  holdings: {
    holdingSymbol: string,
    holdingName: string,
    holdingMarket: string,
    industry: string,
    exposureAmount: number,
    sourceFundSymbols: string[],
  }[],
  industryAllocation: { industry: string, amount: number, percentage: number }[],
  marketAllocation: { market: string, amount: number, percentage: number }[],
}
```

### 7.3 计算流程

1. 查用户所有 assetType="fund" 且未删除的资产
2. 对每只基金，用 symbol 查 fund_holdings 表
3. `exposureAmount = fundMarketValue × weight`
4. `aggregateDuplicateHoldings` 合并同一股票
5. 按 industry / market 聚合分布

### 7.4 Service（`src/services/exposure/`）

- `getFundsExposure(userId)` → 汇总穿透
- `getFundExposureDetail(userId, fundAssetId)` → 单基金（校验归属）

复用：`calculateFundExposureAmount`, `aggregateDuplicateHoldings`

### 7.5 前端（`src/features/exposure/`）

- `ExposurePage`：底层股票表格 + 行业饼图 + 市场饼图
- 无基金资产或无持仓数据时展示空状态提示

---

## 8. 自选资产模块

### 8.1 API

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/watchlists` | GET | 自选列表 + 最新行情 |
| `/api/watchlists` | POST | 添加自选（去重校验） |
| `/api/watchlists/[id]` | DELETE | 删除自选（校验归属） |
| `/api/market-data/search` | GET | 搜索资产，`?keyword=` |
| `/api/market-data/quotes` | GET | 批量行情，`?symbols=&markets=` |

### 8.2 自选列表返回结构

```ts
{
  items: {
    id: number,
    symbol: string,
    assetName: string,
    assetType: AssetType,
    market: Market,
    currency: Currency,
    quote: { price: number, priceTime: string } | null,
  }[]
}
```

### 8.3 Service（`src/services/watchlist/`）

- `listWatchlist(userId)` → 查自选 → 批量调 `getQuotes` 附加行情
- `addToWatchlist(userId, input)` → 唯一性校验 → 插入
- `removeFromWatchlist(userId, id)` → 校验归属 → 软删除

### 8.4 前端（`src/features/watchlist/`）

- `WatchlistPage`：列表表格（名称、代码、类型、市场、最新价格）
- `AddWatchlistDialog`：搜索框 → 调 search API → 选择添加

---

## 9. 前端通用基础设施

### 9.1 React Query 配置（`src/lib/query/client.ts`）

- 全局 QueryClient：staleTime 30s，retry 1
- QueryClientProvider 在 root layout 中包裹

### 9.2 API 请求封装（`src/lib/api/client.ts`）

```ts
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T>
```

- 自动解析 `{ code, message, data }` 格式
- code !== 0 时 throw ApiError
- 401 时 redirect `/login`

### 9.3 Zustand Store（`src/store/ui.ts`）

- sidebar 折叠状态
- 当前 active modal
- toast 队列

### 9.4 shadcn/ui 组件清单

需安装：table, dialog, form, input, select, card, badge, separator, dropdown-menu, toast, skeleton, tabs, progress, popover, calendar

### 9.5 通用 Hooks

- `useCurrentUser()` → GET `/api/auth/me`
- `usePagination()` → 管理 page/pageSize 状态

### 9.6 Layout 改造

- root layout 加 QueryClientProvider（client component wrapper）
- dashboard layout 保持现有 sidebar + 加 toast container
- 未登录由 middleware redirect，前端无需 auth guard

---

## 10. 测试策略

### 10.1 单元测试

- 扩展 `tests/unit/`，按模块组织
- 覆盖：service 层纯逻辑函数、计算、校验

### 10.2 API 集成测试（`tests/api/`）

- vitest + 直接调用 route handler（不启动 server）
- mock Prisma client
- 覆盖：注册、登录、资产 CRUD、交易联动、目标进度、穿透计算

### 10.3 不在 MVP 范围

- E2E 测试（Milestone 5）
- 组件测试（功能稳定后补）

---

## 11. 并行实现依赖图

```text
Layer 0 (无依赖，可并行):
├── 认证 service + API + middleware
├── shadcn/ui 组件安装
└── React Query 基础设施 + API client + QueryProvider

Layer 1 (依赖 Layer 0，三者互相独立可并行):
├── 资产 service + API + 前端
├── 目标 service + API + 前端
└── 自选 service + API + 前端

Layer 2 (依赖 Layer 1 中的资产模块，三者互相独立可并行):
├── 交易 service + API + 前端
├── Dashboard service + API + 前端
└── 基金穿透 service + API + 前端

Layer 3 (收尾):
└── 集成测试 + 联调验证 + bug 修复
```

---

## 12. 关键设计决策汇总

| 决策 | 选择 | 理由 |
|---|---|---|
| 认证方案 | httpOnly cookie + middleware | SSR/CSR 统一鉴权，XSS 安全 |
| 数据获取 | 全 API Route + React Query | SPA 模式，前后端解耦清晰 |
| UI 组件 | shadcn/ui CLI 按需安装 | 源码可控，一致性好 |
| 状态管理 | React Query(server) + Zustand(UI) | 职责分离 |
| 软删除 | deletedAt 字段 | 数据可恢复 |
| 资产归属校验 | service 层统一校验 userId | 防越权 |
| 交易联动 | 创建交易时同步更新资产 | 数据一致性 |
| 目标限制 | MVP 只允许一个 active 目标 | 简化逻辑 |
| 行情数据 | mock provider（MVP） | 后续切 open-api 无需改前端 |
