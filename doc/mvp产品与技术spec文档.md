# 个人资产配置追踪产品 MVP Spec 文档

版本：v0.1  
数据库：MySQL 8.x  
适用对象：产品经理、前端研发、后端研发、测试、设计、数据工程、技术负责人

---

# 1. MVP 定位

## 1.1 产品一句话定位

面向个人投资者的多资产配置追踪与投资复盘工具，帮助用户通过一个网页端系统管理股票、基金、虚拟货币等资产，看清资产结构、基金底层暴露、交易行为和长期本金目标进度。

---

## 1.2 MVP 核心目标

MVP 阶段不追求完整金融终端能力，而是验证以下核心假设：

1. 用户是否愿意手动录入自己的资产。
2. 用户是否需要统一查看多资产配置。
3. 用户是否认为基金底层穿透有价值。
4. 用户是否愿意记录交易并进行复盘。
5. 用户是否需要长期本金目标追踪。

---

## 1.3 MVP 核心价值

MVP 需要让用户完成以下闭环：

添加资产 → 查看资产配置 → 查看基金穿透 → 记录交易 → 查看交易复盘 → 设置本金目标 → 查看目标进度

---

# 2. MVP 范围

## 2.1 MVP 必做模块

| 模块 | 是否进入 MVP | 说明 |
|---|---:|---|
| 用户系统 | 是 | 注册、登录、基础账户管理 |
| 资产管理 | 是 | 手动录入股票、基金、虚拟货币、现金 |
| Dashboard | 是 | 总资产、配置图、收益趋势、目标进度 |
| 基金穿透 | 是 | 基于公开持仓数据或内置模拟数据做基础穿透 |
| 交易记录 | 是 | 买入、卖出、加仓、减仓、定投记录 |
| 交易复盘 | 是 | 交易列表、买卖点、收益统计 |
| 目标规划 | 是 | 基于本金的目标金额与进度追踪 |
| 行情数据 | 是 | MVP 可使用延迟行情、第三方 API 或手动 mock 数据 |
| 自选资产 | 是 | 用户可关注资产 |
| 基础报表 | 是 | 简单资产概览与交易总结 |

---

## 2.2 MVP 暂不做模块

| 模块 | 暂不做原因 |
|---|---|
| 券商账户自动同步 | 接入复杂，涉及授权与合规 |
| 加密钱包自动同步 | 链上解析复杂，延后 |
| AI 投资建议 | 存在合规风险，MVP 仅预留接口 |
| 高级风险模型 | 需要更多数据沉淀 |
| 多人/家庭账户 | 暂不验证核心价值 |
| App 端 | 先验证 Web 产品体验 |
| 自动交易 | 合规与安全风险高 |
| 实时高频行情 | MVP 可用分钟级或延迟行情 |
| 完整新闻系统 | 后续版本扩展 |

---

# 3. MVP 用户角色

## 3.1 普通用户

普通用户可以：

- 注册和登录
- 添加、编辑、删除自己的资产
- 添加交易记录
- 查看 Dashboard
- 查看基金穿透结果
- 创建本金目标
- 查看目标进度
- 创建自选资产

---

## 3.2 管理员

管理员可以：

- 查看系统运行状态
- 管理基础资产字典
- 管理基金持仓数据
- 管理行情数据源配置

管理员不应直接查看用户敏感资产明细，除非在合规授权场景下进行脱敏排查。

---

# 4. MVP 核心用户流程

## 4.1 首次使用流程

1. 用户注册账号。
2. 用户登录系统。
3. 系统引导用户添加第一笔资产。
4. 用户选择资产类型：股票 / 基金 / 虚拟货币 / 现金。
5. 用户填写持仓数量、成本价、买入时间等信息。
6. 系统生成资产总览。
7. 用户进入 Dashboard 查看资产配置。

---

## 4.2 资产管理流程

1. 用户进入资产管理页。
2. 用户点击“添加资产”。
3. 用户选择资产类型。
4. 用户填写资产代码、名称、数量、成本、币种等信息。
5. 系统保存资产。
6. 系统重新计算总资产、收益、配置比例。

---

## 4.3 基金穿透流程

1. 用户添加基金资产。
2. 系统根据基金代码查找基金持仓数据。
3. 若存在持仓数据，则计算底层股票暴露。
4. 若不存在持仓数据，则提示“暂无穿透数据”。
5. 用户进入基金穿透页。
6. 用户查看底层股票、行业分布、重复持仓。

---

## 4.4 交易复盘流程

1. 用户进入交易记录页。
2. 用户添加一笔交易。
3. 系统保存交易方向、价格、数量、时间和交易原因。
4. 系统更新资产成本和持仓。
5. 用户查看交易列表和单笔复盘。
6. 用户在走势图或时间轴上查看买卖点。

---

## 4.5 目标规划流程

1. 用户进入目标规划页。
2. 用户创建目标。
3. 用户填写目标名称、目标本金、目标日期。
4. 系统计算当前本金进度。
5. 系统展示完成百分比、剩余金额和月度建议投入。

---

# 5. MVP 功能 Spec

# 5.1 用户系统

## 5.1.1 功能说明

支持用户注册、登录、退出登录和基础身份鉴权。

---

## 5.1.2 功能列表

| 功能 | 说明 | MVP |
|---|---|---:|
| 邮箱注册 | 使用邮箱和密码注册 | 是 |
| 邮箱登录 | 使用邮箱和密码登录 | 是 |
| 退出登录 | 清除 token | 是 |
| 修改密码 | 登录后修改密码 | 可选 |
| 忘记密码 | 邮件重置密码 | 暂缓 |
| 第三方登录 | Google / Apple / 微信 | 暂缓 |

---

## 5.1.3 字段要求

注册字段：

| 字段 | 必填 | 规则 |
|---|---:|---|
| email | 是 | 合法邮箱 |
| password | 是 | 至少 8 位 |
| nickname | 否 | 最多 32 字符 |

---

## 5.1.4 验收标准

- 用户可以成功注册。
- 重复邮箱不可注册。
- 用户可以成功登录。
- 密码错误时返回明确错误。
- 登录后接口必须携带 token 才可访问。

---

# 5.2 资产管理模块

## 5.2.1 功能说明

资产管理模块是 MVP 的基础数据入口。

MVP 阶段只支持用户手动录入资产，不接入券商或交易所自动同步。

---

## 5.2.2 支持资产类型

| 资产类型 | MVP 支持 | 说明 |
|---|---:|---|
| 股票 | 是 | 支持代码、名称、数量、成本 |
| 基金 | 是 | 支持基金代码、名称、持仓金额 |
| 虚拟货币 | 是 | 支持币种、数量、成本 |
| 现金 | 是 | 支持不同币种现金 |
| 债券 | 暂缓 | 可后续扩展 |
| 一级市场资产 | 暂缓 | 后续作为手动估值资产 |

---

## 5.2.3 添加资产字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| asset_type | enum | 是 | stock / fund / crypto / cash |
| symbol | string | 否 | 股票、基金、币种代码 |
| asset_name | string | 是 | 资产名称 |
| market | enum | 否 | CN / HK / US / CRYPTO / CASH |
| currency | string | 是 | CNY / USD / HKD / USDT 等 |
| quantity | decimal | 是 | 持仓数量 |
| avg_cost | decimal | 否 | 平均成本 |
| current_price | decimal | 否 | 当前价格，可由行情系统更新 |
| remark | text | 否 | 用户备注 |

---

## 5.2.4 资产列表展示字段

| 字段 | 说明 |
|---|---|
| 资产名称 | 股票、基金、币种或现金名称 |
| 资产类型 | 股票 / 基金 / 虚拟货币 / 现金 |
| 市场 | A 股 / 港股 / 美股 / 加密 |
| 持仓数量 | 当前数量 |
| 当前价格 | 最新价格 |
| 当前市值 | quantity × current_price |
| 成本金额 | quantity × avg_cost |
| 盈亏金额 | 当前市值 - 成本金额 |
| 盈亏比例 | 盈亏金额 / 成本金额 |

---

## 5.2.5 计算规则

### 当前市值

当前市值 = 持仓数量 × 当前价格

现金类资产：

当前市值 = 现金金额

---

### 成本金额

成本金额 = 持仓数量 × 平均成本

---

### 盈亏金额

盈亏金额 = 当前市值 - 成本金额

---

## 5.2.6 验收标准

- 用户可以新增股票、基金、虚拟货币和现金资产。
- 用户只能看到自己的资产。
- 用户可以编辑和删除自己的资产。
- 删除资产前需要二次确认。
- 资产列表需要正确展示市值、成本和盈亏。

---

# 5.3 Dashboard 模块

## 5.3.1 功能说明

Dashboard 是用户进入系统后的首页，用于展示核心资产信息。

---

## 5.3.2 MVP 展示内容

| 区块 | 内容 |
|---|---|
| 总资产卡片 | 总资产、市值、成本、盈亏 |
| 资产配置图 | 按资产类型展示占比 |
| 市场分布图 | CN / HK / US / CRYPTO / CASH |
| 收益趋势 | MVP 可展示基于每日快照的资产曲线 |
| 目标进度 | 展示本金目标完成度 |
| 最近交易 | 展示最近 5 条交易记录 |

---

## 5.3.3 总资产计算

总资产 = 股票市值 + 基金市值 + 虚拟货币市值 + 现金

---

## 5.3.4 Dashboard API 输出字段

| 字段 | 说明 |
|---|---|
| total_asset_value | 总资产 |
| total_cost | 总成本 |
| total_profit | 总盈亏 |
| total_profit_rate | 总收益率 |
| asset_allocation | 资产类型分布 |
| market_allocation | 市场分布 |
| recent_transactions | 最近交易 |
| active_goal | 当前目标 |

---

## 5.3.5 验收标准

- Dashboard 首屏能正确加载总资产。
- 资产配置图与用户资产数据一致。
- 没有资产时展示空状态和添加资产入口。
- Dashboard 加载时间在 2 秒以内。

---

# 5.4 基金穿透模块

## 5.4.1 功能说明

基金穿透模块用于展示用户持有基金背后的底层股票、行业和市场暴露。

MVP 阶段只做一层穿透：

基金 → 股票

---

## 5.4.2 MVP 数据来源

MVP 可采用以下方式之一：

1. 手动维护基金持仓数据。
2. 导入公开基金季报数据。
3. 使用第三方 API。
4. 使用 mock 数据验证体验。

---

## 5.4.3 穿透计算公式

用户某基金持仓金额 × 基金底层股票权重 = 用户对该股票的穿透金额

示例：

用户持有基金 A：100,000 元  
基金 A 持有腾讯控股：8%  
用户穿透持有腾讯控股：8,000 元

---

## 5.4.4 展示字段

| 字段 | 说明 |
|---|---|
| 股票名称 | 底层股票名称 |
| 股票代码 | 底层股票代码 |
| 市场 | A 股 / 港股 / 美股 |
| 行业 | 所属行业 |
| 穿透金额 | 用户间接持有金额 |
| 穿透比例 | 占用户总资产比例 |
| 来源基金 | 来自哪些基金 |

---

## 5.4.5 重复持仓逻辑

若多只基金持有同一股票，需要合并计算。

示例：

基金 A 穿透腾讯 8,000 元  
基金 B 穿透腾讯 5,000 元  
用户总穿透腾讯 = 13,000 元

---

## 5.4.6 验收标准

- 用户持有基金后可以进入穿透页。
- 有基金持仓数据时展示底层股票列表。
- 多基金重复持仓可以合并展示。
- 无基金持仓数据时展示空状态。
- 穿透金额计算结果正确。

---

# 5.5 交易记录与复盘模块

## 5.5.1 功能说明

支持用户记录买入、卖出、加仓、减仓、定投等交易行为，并进行基础复盘。

---

## 5.5.2 交易类型

| 类型 | 说明 |
|---|---|
| buy | 买入 |
| sell | 卖出 |
| add | 加仓 |
| reduce | 减仓 |
| fixed_invest | 定投 |
| transfer_in | 转入 |
| transfer_out | 转出 |

---

## 5.5.3 交易字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| asset_id | uuid/bigint | 是 | 关联资产 |
| transaction_type | enum | 是 | 交易类型 |
| quantity | decimal | 是 | 数量 |
| price | decimal | 是 | 价格 |
| fee | decimal | 否 | 手续费 |
| transaction_time | datetime | 是 | 交易时间 |
| reason | text | 否 | 交易原因 |
| emotion_tag | string | 否 | 情绪标签 |

---

## 5.5.4 复盘展示

| 功能 | 说明 |
|---|---|
| 交易列表 | 展示所有交易 |
| 单笔详情 | 查看交易原因、价格、数量 |
| 最近交易 | Dashboard 展示最近 5 条 |
| 盈亏统计 | 按资产统计盈亏 |
| 时间轴 | 按时间展示交易行为 |

---

## 5.5.5 MVP 暂不做

- AI 复盘总结
- K 线叠加买卖点
- 策略标签体系
- 情绪行为模型

---

## 5.5.6 验收标准

- 用户可以为某个资产添加交易记录。
- 交易记录可编辑、删除。
- 最近交易能在 Dashboard 展示。
- 交易记录不允许跨用户访问。

---

# 5.6 目标规划模块

## 5.6.1 功能说明

支持用户创建一个基于本金投入的长期目标。

MVP 阶段默认只计算本金，不把投资收益计入目标完成度。

---

## 5.6.2 创建目标字段

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| goal_name | string | 是 | 目标名称 |
| target_amount | decimal | 是 | 目标本金金额 |
| target_date | date | 是 | 目标日期 |
| initial_principal | decimal | 否 | 起始本金 |
| include_profit | boolean | 否 | MVP 默认 false |

---

## 5.6.3 计算规则

### 当前本金

当前本金 = 用户录入资产的成本金额合计 + 现金本金

MVP 可简化为：

当前本金 = 所有资产 cost_amount 之和

---

### 目标完成度

目标完成度 = 当前本金 / 目标本金

---

### 月度建议投入

月度建议投入 = 剩余本金 / 剩余月份

---

## 5.6.4 验收标准

- 用户可以创建目标。
- 系统可以展示当前完成百分比。
- 系统可以展示剩余金额。
- 系统可以展示月度建议投入金额。
- 当前只允许一个 active 目标，后续支持多目标。

---

# 5.7 自选资产模块

## 5.7.1 功能说明

用户可以关注自己感兴趣但未持有的资产。

---

## 5.7.2 支持资产

- 股票
- 基金
- 虚拟货币

---

## 5.7.3 功能列表

| 功能 | 说明 |
|---|---|
| 添加自选 | 输入代码或名称添加 |
| 删除自选 | 从自选列表移除 |
| 查看价格 | 展示最新价格 |
| 查看涨跌幅 | 展示今日涨跌 |

---

## 5.7.4 验收标准

- 用户可以添加自选资产。
- 用户只能看到自己的自选资产。
- 自选资产价格可正常展示。

---

# 6. MVP 页面 Spec

# 6.1 页面列表

| 页面 | 路由 | MVP |
|---|---|---:|
| 登录页 | /login | 是 |
| 注册页 | /register | 是 |
| Dashboard | /dashboard | 是 |
| 资产列表 | /assets | 是 |
| 添加资产 | /assets/new | 是 |
| 资产详情 | /assets/:id | 是 |
| 基金穿透 | /exposure | 是 |
| 交易记录 | /transactions | 是 |
| 添加交易 | /transactions/new | 是 |
| 目标规划 | /goals | 是 |
| 自选资产 | /watchlist | 是 |
| 设置页 | /settings | 可选 |

---

# 6.2 Dashboard 页面

## 页面元素

1. 顶部导航
2. 总资产卡片
3. 盈亏卡片
4. 资产配置图
5. 市场分布图
6. 收益趋势图
7. 目标进度条
8. 最近交易列表
9. 添加资产快捷按钮

---

# 6.3 资产列表页

## 页面元素

1. 资产类型筛选
2. 市场筛选
3. 搜索框
4. 资产表格
5. 添加资产按钮
6. 编辑/删除操作

---

# 6.4 基金穿透页

## 页面元素

1. 穿透总览卡片
2. 底层股票表格
3. 行业分布图
4. 市场分布图
5. 重复持仓列表
6. 无数据空状态

---

# 6.5 交易记录页

## 页面元素

1. 交易筛选器
2. 交易列表
3. 添加交易按钮
4. 单笔交易详情弹窗
5. 删除确认弹窗

---

# 6.6 目标规划页

## 页面元素

1. 当前目标卡片
2. 目标进度条
3. 剩余金额
4. 月度建议投入
5. 创建/编辑目标表单

---

# 7. MVP API Spec

# 7.1 通用返回结构

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

---

# 7.2 错误码

| code | 说明 |
|---:|---|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录或 token 失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 数据冲突 |
| 500 | 服务异常 |

---

# 7.3 用户接口

## POST /api/auth/register

请求：

```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "Tom"
}
```

返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user_id": 1
  }
}
```

---

## POST /api/auth/login

请求：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

---

# 7.4 资产接口

## GET /api/assets

返回用户资产列表。

---

## POST /api/assets

请求：

```json
{
  "asset_type": "stock",
  "symbol": "AAPL",
  "asset_name": "Apple Inc.",
  "market": "US",
  "currency": "USD",
  "quantity": 10,
  "avg_cost": 150
}
```

---

## PUT /api/assets/{id}

编辑资产。

---

## DELETE /api/assets/{id}

删除资产。

---

# 7.5 Dashboard 接口

## GET /api/dashboard

返回：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_asset_value": 100000,
    "total_cost": 80000,
    "total_profit": 20000,
    "total_profit_rate": 0.25,
    "asset_allocation": [],
    "market_allocation": [],
    "recent_transactions": [],
    "active_goal": {}
  }
}
```

---

# 7.6 基金穿透接口

## GET /api/exposure/funds

返回用户所有基金穿透结果。

---

## GET /api/exposure/funds/{fund_asset_id}

返回某只基金穿透详情。

---

# 7.7 交易接口

## GET /api/transactions

返回交易列表。

---

## POST /api/transactions

请求：

```json
{
  "asset_id": 1,
  "transaction_type": "buy",
  "quantity": 10,
  "price": 150,
  "fee": 1,
  "transaction_time": "2026-05-24 10:00:00",
  "reason": "长期看好"
}
```

---

# 7.8 目标接口

## GET /api/goals/active

返回当前 active 目标。

---

## POST /api/goals

创建目标。

---

## PUT /api/goals/{id}

编辑目标。

---

# 8. MySQL 数据库 Spec

# 8.1 数据库版本

建议使用 MySQL 8.x。

原因：

- 支持 JSON 字段
- 支持窗口函数
- 支持 CTE
- 生态成熟
- 研发与运维成本低

---

# 8.2 命名规范

| 类型 | 规范 |
|---|---|
| 表名 | 小写，下划线，复数或业务名，例如 user_assets |
| 字段名 | 小写，下划线 |
| 主键 | id BIGINT UNSIGNED AUTO_INCREMENT |
| 时间字段 | created_at / updated_at / deleted_at |
| 金额字段 | DECIMAL(20,8) |
| 比例字段 | DECIMAL(10,6) |
| 状态字段 | TINYINT |

---

# 8.3 表结构设计

## 8.3.1 users 用户表

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(64) DEFAULT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 active, 0 disabled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.2 user_assets 用户资产表

```sql
CREATE TABLE user_assets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  asset_type VARCHAR(32) NOT NULL COMMENT 'stock, fund, crypto, cash',
  symbol VARCHAR(64) DEFAULT NULL,
  asset_name VARCHAR(255) NOT NULL,
  market VARCHAR(32) DEFAULT NULL COMMENT 'CN, HK, US, CRYPTO, CASH',
  currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
  quantity DECIMAL(30,10) NOT NULL DEFAULT 0,
  avg_cost DECIMAL(30,10) DEFAULT NULL,
  current_price DECIMAL(30,10) DEFAULT NULL,
  cost_amount DECIMAL(30,10) DEFAULT NULL,
  market_value DECIMAL(30,10) DEFAULT NULL,
  remark TEXT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_user_assets_user_id (user_id),
  KEY idx_user_assets_symbol (symbol),
  KEY idx_user_assets_type (asset_type),
  CONSTRAINT fk_user_assets_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.3 transactions 交易记录表

```sql
CREATE TABLE transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  asset_id BIGINT UNSIGNED NOT NULL,
  transaction_type VARCHAR(32) NOT NULL COMMENT 'buy, sell, add, reduce, fixed_invest, transfer_in, transfer_out',
  quantity DECIMAL(30,10) NOT NULL,
  price DECIMAL(30,10) NOT NULL,
  fee DECIMAL(30,10) NOT NULL DEFAULT 0,
  currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
  transaction_amount DECIMAL(30,10) NOT NULL,
  transaction_time DATETIME NOT NULL,
  reason TEXT DEFAULT NULL,
  emotion_tag VARCHAR(64) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_transactions_user_id (user_id),
  KEY idx_transactions_asset_id (asset_id),
  KEY idx_transactions_time (transaction_time),
  CONSTRAINT fk_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_transactions_asset_id FOREIGN KEY (asset_id) REFERENCES user_assets(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.4 goals 目标表

```sql
CREATE TABLE goals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(30,10) NOT NULL,
  target_date DATE NOT NULL,
  initial_principal DECIMAL(30,10) NOT NULL DEFAULT 0,
  include_profit TINYINT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 active, 0 inactive',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_goals_user_id (user_id),
  KEY idx_goals_status (status),
  CONSTRAINT fk_goals_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.5 fund_holdings 基金持仓表

```sql
CREATE TABLE fund_holdings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  fund_symbol VARCHAR(64) NOT NULL,
  fund_name VARCHAR(255) DEFAULT NULL,
  holding_symbol VARCHAR(64) NOT NULL,
  holding_name VARCHAR(255) NOT NULL,
  holding_market VARCHAR(32) DEFAULT NULL,
  industry VARCHAR(128) DEFAULT NULL,
  weight DECIMAL(10,6) NOT NULL COMMENT '0.080000 means 8%',
  report_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fund_holdings_fund_symbol (fund_symbol),
  KEY idx_fund_holdings_holding_symbol (holding_symbol),
  KEY idx_fund_holdings_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.6 asset_prices 行情价格表

```sql
CREATE TABLE asset_prices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  symbol VARCHAR(64) NOT NULL,
  asset_type VARCHAR(32) NOT NULL,
  market VARCHAR(32) DEFAULT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
  price DECIMAL(30,10) NOT NULL,
  price_time DATETIME NOT NULL,
  source VARCHAR(64) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_asset_prices_symbol_time (symbol, price_time),
  KEY idx_asset_prices_type (asset_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.7 watchlists 自选资产表

```sql
CREATE TABLE watchlists (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  asset_type VARCHAR(32) NOT NULL,
  symbol VARCHAR(64) NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  market VARCHAR(32) DEFAULT NULL,
  currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_watchlists_user_symbol (user_id, symbol, asset_type),
  KEY idx_watchlists_user_id (user_id),
  CONSTRAINT fk_watchlists_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 8.3.8 asset_daily_snapshots 资产每日快照表

```sql
CREATE TABLE asset_daily_snapshots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  snapshot_date DATE NOT NULL,
  total_asset_value DECIMAL(30,10) NOT NULL DEFAULT 0,
  total_cost DECIMAL(30,10) NOT NULL DEFAULT 0,
  total_profit DECIMAL(30,10) NOT NULL DEFAULT 0,
  total_profit_rate DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_snapshot_user_date (user_id, snapshot_date),
  KEY idx_snapshot_user_id (user_id),
  CONSTRAINT fk_snapshots_user_id FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

# 9. 后端服务 Spec

# 9.1 技术建议

MVP 推荐：

- 后端：Node.js + NestJS 或 Java Spring Boot
- 数据库：MySQL 8.x
- 缓存：Redis，可选
- 鉴权：JWT
- 部署：Docker

---

# 9.2 服务模块

MVP 不强制拆微服务，可采用模块化单体架构，后续再拆分。

建议模块：

- AuthModule
- UserModule
- AssetModule
- TransactionModule
- DashboardModule
- ExposureModule
- GoalModule
- WatchlistModule
- PriceModule

---

# 9.3 模块化单体优点

- 开发速度快
- 部署简单
- 团队协作成本低
- 适合 MVP 验证
- 后续可平滑拆分服务

---

# 10. 前端 Spec

# 10.1 技术建议

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- ECharts
- React Query
- Zustand

---

# 10.2 前端页面优先级

## P0

- 登录页
- 注册页
- Dashboard
- 资产列表页
- 添加资产页

## P1

- 基金穿透页
- 交易记录页
- 目标规划页
- 自选资产页

## P2

- 设置页
- 报表页
- AI 分析页占位

---

# 10.3 前端状态管理

建议拆分：

- authStore
- assetStore
- dashboardStore
- uiStore

行情与服务端数据优先使用 React Query 管理。

---

# 11. 非功能性要求

## 11.1 性能要求

| 项目 | 要求 |
|---|---|
| Dashboard 首屏加载 | < 2 秒 |
| 普通 API 响应 P95 | < 500ms |
| 资产列表加载 | < 1 秒 |
| 图表渲染 | < 1 秒 |

---

## 11.2 安全要求

- 密码必须 hash 存储。
- 推荐使用 bcrypt 或 argon2。
- 所有用户数据接口必须鉴权。
- 所有查询必须带 user_id 数据隔离。
- 关键操作需要校验资源归属。
- 日志中不允许输出密码、token、完整资产明细。

---

## 11.3 兼容性要求

支持浏览器：

- Chrome 最新版
- Safari 最新版
- Edge 最新版

移动端只要求基础响应式，不作为 MVP 重点。

---

# 12. 测试 Spec

# 12.1 单元测试

重点覆盖：

- 资产市值计算
- 盈亏计算
- 目标完成度计算
- 基金穿透计算
- 权限校验

---

# 12.2 接口测试

覆盖接口：

- 注册
- 登录
- 添加资产
- 编辑资产
- 删除资产
- 添加交易
- 创建目标
- 查询 Dashboard

---

# 12.3 端到端测试

核心链路：

1. 注册用户
2. 登录
3. 添加股票资产
4. 添加基金资产
5. 查看 Dashboard
6. 查看基金穿透
7. 添加交易
8. 创建目标
9. 查看目标进度

---

# 13. MVP 里程碑

## Milestone 1：基础框架

周期：第 1-2 周

交付：

- 前端项目初始化
- 后端项目初始化
- MySQL 表结构
- 用户注册登录
- JWT 鉴权

---

## Milestone 2：资产管理与 Dashboard

周期：第 3-4 周

交付：

- 资产 CRUD
- Dashboard API
- 总资产计算
- 资产配置图
- 市场分布图

---

## Milestone 3：交易与目标

周期：第 5-6 周

交付：

- 交易记录
- 最近交易
- 目标创建
- 目标进度计算

---

## Milestone 4：基金穿透与自选

周期：第 7-8 周

交付：

- 基金持仓数据维护
- 基金穿透计算
- 穿透页
- 自选资产

---

## Milestone 5：测试与上线准备

周期：第 9-10 周

交付：

- Bug 修复
- 权限检查
- 数据校验
- 部署脚本
- 上线文档

---

# 14. MVP 验收标准

## 14.1 产品验收

MVP 需要满足：

- 用户可以完成注册登录。
- 用户可以手动添加资产。
- 用户可以查看资产总览。
- 用户可以看到资产配置图。
- 用户可以添加基金并查看基础穿透结果。
- 用户可以添加交易记录。
- 用户可以创建本金目标并查看进度。

---

## 14.2 研发验收

- 接口符合统一返回格式。
- 所有用户数据按 user_id 隔离。
- MySQL 表结构已通过 migration 管理。
- 核心接口有参数校验。
- 关键计算逻辑有单元测试。

---

## 14.3 测试验收

- P0 功能无阻塞 bug。
- P1 功能无严重 bug。
- 核心链路端到端通过。
- 权限越权测试通过。
- 删除操作有二次确认。

---

# 15. MVP 成功指标

## 15.1 用户行为指标

| 指标 | 目标 |
|---|---:|
| 注册后添加资产比例 | > 60% |
| 添加 3 个以上资产比例 | > 30% |
| 使用基金穿透比例 | > 20% |
| 添加交易记录比例 | > 20% |
| 创建目标比例 | > 15% |

---

## 15.2 留存指标

| 指标 | 目标 |
|---|---:|
| 次日留存 | > 25% |
| 7 日留存 | > 10% |
| 30 日留存 | > 5% |

---

# 16. 主要风险与处理方式

## 16.1 用户不愿意手动录入

处理方式：

- 优化新手引导
- 提供示例资产
- 支持 Excel 导入作为后续版本

---

## 16.2 基金穿透数据不足

处理方式：

- MVP 先支持重点基金样例
- 后台支持手动维护
- 页面明确显示数据日期

---

## 16.3 行情数据不稳定

处理方式：

- MVP 支持手动刷新
- 接口失败时展示最近一次价格
- 明确价格更新时间

---

## 16.4 金融合规风险

处理方式：

- 不提供买卖建议
- 不承诺收益
- 所有分析标注为辅助信息
- AI 功能 MVP 暂不正式上线

---

# 17. 后续版本方向

## V1.1

- Excel 导入资产
- 更多图表
- 资产日报/周报
- 基金穿透历史变化

## V1.2

- 新闻订阅
- AI 交易复盘总结
- 风险提示
- 多目标管理

## V2.0

- 券商账户同步
- 加密钱包同步
- 高级 AI Agent
- 多币种统一换算
- 移动端 App

---

# 18. MVP 最终交付定义

MVP 的最终交付不是一个完整金融平台，而是一个能够验证核心价值的可用产品。

它必须做到：

1. 用户能录入资产。
2. 用户能看清资产配置。
3. 用户能理解基金底层暴露。
4. 用户能记录交易。
5. 用户能追踪本金目标。

只要这五件事被顺畅完成，MVP 就达成了第一阶段目标。

