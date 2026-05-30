# 基金穿透功能补全 Spec

日期：2026-05-30  
状态：待实施

---

## 1. 需求对照分析

### 1.1 已完成项

| 需求 | 状态 | 位置 |
|---|---|---|
| 基金 → 股票一层穿透计算 | ✅ | `services/exposure/index.ts` |
| 穿透金额 = 基金市值 × 股票权重 | ✅ | `lib/finance/calculations.ts` |
| 多基金重复持仓合并 | ✅ | `aggregateDuplicateHoldings()` |
| 底层股票列表展示 | ✅ | `ExposureTable.tsx` |
| 展示字段：股票名称、代码、市场、行业、穿透金额、来源基金 | ✅ | `ExposureTable.tsx` |
| 无数据空状态 | ✅ | `exposure/page.tsx` |
| 单只基金穿透 API | ✅ | `/api/exposure/funds/[fundAssetId]` |
| industryAllocation / marketAllocation 后端计算 | ✅ | `services/exposure/index.ts` |

### 1.2 缺失项

| 需求 | PRD/Spec 出处 | 缺失说明 |
|---|---|---|
| 穿透比例字段 | MVP Spec 5.4.4 | 表格缺少"占用户总资产比例"列 |
| 行业穿透分布图 | PRD 5.3 页面展示 | API 已返回 `industryAllocation`，前端未渲染 |
| 市场穿透分布图 | PRD 5.3 页面展示 | API 已返回 `marketAllocation`，前端未渲染 |
| 单只基金穿透详情页 | PRD 5.3 "单只基金穿透详情页" | API 存在但无前端页面 |
| Top 10 底层持仓高亮 | PRD 5.3 "Top 10 底层持仓列表" | 表格无排序/分页/Top10 高亮 |

---

## 2. 实施方案

### 2.1 穿透比例列 (P0)

在 `ExposureTable` 中添加"穿透比例"列，计算方式：`exposureAmount / totalFundValue`。

### 2.2 行业/市场分布图 (P0)

在穿透页面表格上方添加两个 ECharts 饼图：
- 行业穿透分布（基于 `industryAllocation`）
- 市场穿透分布（基于 `marketAllocation`）

数据已由 API 返回，前端只需渲染。

### 2.3 单只基金穿透详情页 (P1)

- 路由：`/exposure/[fundAssetId]`
- 展示该基金名称、底层持仓列表（含权重、穿透金额）
- 入口：在资产列表或穿透总览页中基金名称可点击进入

### 2.4 表格排序与 Top10 (P1)

- 默认按穿透金额降序排列
- 前 10 行添加视觉标识（如序号 badge）

---

## 3. 技术细节

### 3.1 前端文件变更

| 文件 | 变更 |
|---|---|
| `src/features/exposure/ExposureTable.tsx` | 添加穿透比例列、默认降序排序、Top10 badge |
| `src/features/exposure/ExposureCharts.tsx` | 新建，行业/市场饼图组件 |
| `src/app/(dashboard)/exposure/page.tsx` | 集成图表组件，传入 allocation 数据 |
| `src/app/(dashboard)/exposure/[fundAssetId]/page.tsx` | 新建，单只基金详情页 |
| `src/features/exposure/hooks.ts` | 添加 `useFundExposureDetail` hook |

### 3.2 API 无需变更

后端已提供：
- `GET /api/exposure/funds` → 含 `holdings`, `industryAllocation`, `marketAllocation`
- `GET /api/exposure/funds/[fundAssetId]` → 含单只基金持仓明细

---

## 4. 验收标准

- [ ] 穿透表格展示穿透比例列
- [ ] 页面上方展示行业穿透饼图
- [ ] 页面上方展示市场穿透饼图
- [ ] 图表与表格数据一致
- [ ] 表格默认按穿透金额降序
- [ ] Top 10 行有视觉标识
- [ ] 可进入单只基金穿透详情页
- [ ] 详情页展示基金名称与底层持仓
