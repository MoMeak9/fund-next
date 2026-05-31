# 交易复盘系统设计文档

> 版本：v1.0
> 日期：2026-05-31
> 依赖：交易记录模块已完成（transactions CRUD + 前端页面）
> 范围：将现有简单交易记录升级为专业交易复盘系统

---

## 1. 设计背景

### 1.1 当前状态

现有交易记录模块仅支持基础 CRUD：买入/卖出/加仓/减仓/定投/转入/转出，字段包含 price、quantity、fee、reason、emotion_tag。复盘能力局限于交易列表查看和简单盈亏统计。

### 1.2 目标状态

建立资深交易员级别的系统化复盘机制，核心回答四个问题：

1. 我有没有按计划交易？
2. 这套打法在什么环境下有效？
3. 亏损来自策略失效、执行变形还是情绪失控？
4. 下一轮如何验证改进？

### 1.3 设计原则

- **过程导向** — 新手复盘结果，高手复盘过程，目标是"过程是否长期产生正期望"
- **数据驱动** — 复盘依据不是感觉，而是五个基准（计划、环境、风险预算、执行质量、样本统计）
- **闭环跟踪** — 复盘必须产出行动项并持续跟踪改善情况
- **渐进增强** — 兼容现有简单交易记录，高级复盘字段均为可选

---

## 2. 数据模型设计

### 2.1 交易计划表 `trade_plans`

存储事前交易计划，作为复盘的基准对照。

```sql
CREATE TABLE trade_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  asset_id BIGINT NULL,           -- 关联资产，可为空（计划阶段可能未明确）
  
  -- 交易假设
  hypothesis TEXT NOT NULL,        -- 交易假设描述
  market_environment ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NOT NULL,
  timeframe VARCHAR(20) NULL,      -- 交易周期：1m/5m/15m/1h/4h/1d/1w
  
  -- 触发条件
  entry_trigger TEXT NOT NULL,     -- 入场触发条件
  entry_price DECIMAL(20, 8) NULL, -- 计划入场价
  stop_loss DECIMAL(20, 8) NULL,   -- 止损价
  take_profit DECIMAL(20, 8) NULL, -- 目标价
  position_size DECIMAL(20, 8) NULL, -- 计划仓位
  
  -- 风险参数
  risk_amount DECIMAL(20, 4) NULL,   -- 计划风险金额
  expected_rr DECIMAL(10, 2) NULL,   -- 预期收益风险比
  invalidation TEXT NULL,             -- 失效条件
  
  -- 策略分类
  strategy_type ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NOT NULL,
  
  -- 状态
  status ENUM('draft', 'active', 'executed', 'cancelled', 'expired') NOT NULL DEFAULT 'draft',
  
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_strategy (user_id, strategy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.2 交易复盘表 `trade_reviews`

每笔交易的复盘记录，关联 transaction 和可选的 trade_plan。

```sql
CREATE TABLE trade_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  transaction_id BIGINT NOT NULL,   -- 关联交易记录
  plan_id BIGINT NULL,              -- 关联交易计划（可选）
  
  -- 交易背景
  market_environment ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
  key_levels TEXT NULL,              -- 关键位描述
  news_events TEXT NULL,             -- 消息事件
  sector_context TEXT NULL,          -- 大盘/板块环境
  
  -- 执行评价
  followed_plan BOOLEAN NULL,        -- 是否按计划执行
  entry_quality ENUM('good', 'acceptable', 'poor') NULL,  -- 入场质量
  exit_quality ENUM('good', 'acceptable', 'poor') NULL,   -- 出场质量
  moved_stop_loss BOOLEAN NULL,      -- 是否移动止损
  added_position BOOLEAN NULL,       -- 是否加仓
  chased_price BOOLEAN NULL,         -- 是否追单
  
  -- 风控数据
  risk_per_trade DECIMAL(20, 4) NULL,    -- 单笔风险
  account_risk_pct DECIMAL(10, 4) NULL,  -- 账户风险占比
  daily_risk_total DECIMAL(20, 4) NULL,  -- 当日累计风险
  mae DECIMAL(20, 8) NULL,               -- 最大浮亏 (Maximum Adverse Excursion)
  mfe DECIMAL(20, 8) NULL,               -- 最大浮盈 (Maximum Favorable Excursion)
  
  -- R 值计算
  r_multiple DECIMAL(10, 4) NULL,        -- 实际 R 倍数（盈亏 / 初始风险）
  
  -- 心理状态
  pre_trade_emotion ENUM('calm', 'anxious', 'fomo', 'revenge', 'fatigued', 'overconfident') NULL,
  post_trade_emotion ENUM('calm', 'regret', 'relief', 'frustration', 'euphoria') NULL,
  
  -- 交易质量评分（100 分制）
  score_opportunity INT NULL CHECK (score_opportunity BETWEEN 0 AND 25),    -- 交易机会 25 分
  score_planning INT NULL CHECK (score_planning BETWEEN 0 AND 25),          -- 交易计划 25 分
  score_risk_control INT NULL CHECK (score_risk_control BETWEEN 0 AND 20),  -- 风险控制 20 分
  score_discipline INT NULL CHECK (score_discipline BETWEEN 0 AND 20),      -- 执行纪律 20 分
  score_psychology INT NULL CHECK (score_psychology BETWEEN 0 AND 10),      -- 心理状态 10 分
  total_score INT GENERATED ALWAYS AS (
    COALESCE(score_opportunity, 0) + COALESCE(score_planning, 0) + 
    COALESCE(score_risk_control, 0) + COALESCE(score_discipline, 0) + 
    COALESCE(score_psychology, 0)
  ) STORED,
  
  -- 交易等级
  trade_grade ENUM('A', 'B', 'C') NULL,
  
  -- 分类标签
  strategy_type ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NULL,
  error_type ENUM('none', 'chasing', 'stop_delay', 'oversize', 'early_profit', 'counter_trend', 'emotional', 'no_plan') NULL DEFAULT 'none',
  
  -- 归因与反思
  profit_source TEXT NULL,            -- 盈利来源
  loss_reason TEXT NULL,              -- 亏损原因
  is_repeatable BOOLEAN NULL,         -- 是否可复制
  hindsight_action TEXT NULL,         -- 如果重来一次会怎么做
  exposes_pattern BOOLEAN NULL,       -- 是否暴露重复性错误
  include_in_sample BOOLEAN NULL DEFAULT TRUE, -- 是否纳入策略样本
  next_action TEXT NULL,              -- 下一步行动
  
  -- 证据材料
  screenshots JSON NULL,              -- 截图 URL 数组
  notes TEXT NULL,                    -- 补充备注
  
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  UNIQUE INDEX idx_transaction (transaction_id),
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_user_grade (user_id, trade_grade),
  INDEX idx_user_strategy (user_id, strategy_type),
  INDEX idx_user_error (user_id, error_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.3 每日复盘表 `daily_reviews`

```sql
CREATE TABLE daily_reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  review_date DATE NOT NULL,
  
  -- 三个核心问题
  best_trade_id BIGINT NULL,          -- 今天最好的交易
  best_trade_reason TEXT NULL,         -- 为什么是最好的
  worst_trade_id BIGINT NULL,         -- 今天最差的交易
  worst_trade_reason TEXT NULL,        -- 为什么是最差的
  tomorrow_improvement TEXT NULL,      -- 明天只改一个点
  
  -- 当日统计快照
  total_trades INT NULL,
  net_r DECIMAL(10, 4) NULL,           -- 当日净 R
  win_count INT NULL,
  loss_count INT NULL,
  plan_adherence_pct DECIMAL(10, 2) NULL, -- 按计划交易比例
  
  -- 补充
  market_summary TEXT NULL,            -- 当日市场总结
  notes TEXT NULL,
  
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  UNIQUE INDEX idx_user_date (user_id, review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.4 策略表现表 `strategy_stats`

按策略聚合统计，定期刷新。

```sql
CREATE TABLE strategy_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  strategy_type ENUM('breakout', 'pullback', 'reversal', 'range', 'news', 'arbitrage', 'experiment') NOT NULL,
  
  -- 统计期间
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- 核心统计
  sample_count INT NOT NULL DEFAULT 0,
  win_count INT NOT NULL DEFAULT 0,
  loss_count INT NOT NULL DEFAULT 0,
  win_rate DECIMAL(10, 4) NULL,
  avg_win_r DECIMAL(10, 4) NULL,
  avg_loss_r DECIMAL(10, 4) NULL,
  expectancy DECIMAL(10, 4) NULL,       -- 期望值
  profit_factor DECIMAL(10, 4) NULL,    -- 盈利因子
  max_consecutive_loss INT NULL,
  max_drawdown_r DECIMAL(10, 4) NULL,
  
  -- 适用环境
  best_environment ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
  worst_environment ENUM('trending', 'ranging', 'high_volatility', 'low_volatility', 'news_driven') NULL,
  
  -- 策略状态
  status ENUM('active', 'observation', 'paused', 'retired') NOT NULL DEFAULT 'active',
  status_reason TEXT NULL,
  
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  UNIQUE INDEX idx_user_strategy_period (user_id, strategy_type, period_start, period_end),
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.5 错误追踪表 `error_tracking`

```sql
CREATE TABLE error_tracking (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  
  error_type ENUM('chasing', 'stop_delay', 'oversize', 'early_profit', 'counter_trend', 'emotional', 'no_plan', 'revenge_trade', 'fomo_entry', 'news_gamble') NOT NULL,
  occurrence_count INT NOT NULL DEFAULT 0,
  total_loss_r DECIMAL(10, 4) NOT NULL DEFAULT 0,
  
  -- 条件与触发
  typical_conditions TEXT NULL,        -- 典型出现条件
  trigger_emotion TEXT NULL,           -- 触发情绪
  prevention_rule TEXT NULL,           -- 预防规则
  
  -- 跟踪
  tracking_start DATE NULL,
  tracking_end DATE NULL,
  is_improving BOOLEAN NULL,
  improvement_notes TEXT NULL,
  
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  UNIQUE INDEX idx_user_error (user_id, error_type),
  INDEX idx_user_improving (user_id, is_improving)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.6 行动项表 `review_actions`

```sql
CREATE TABLE review_actions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  
  -- 来源
  source_type ENUM('trade_review', 'daily_review', 'weekly_review', 'monthly_review') NOT NULL,
  source_id BIGINT NULL,
  
  -- 行动描述
  problem TEXT NOT NULL,               -- 问题描述
  rule TEXT NOT NULL,                  -- 规则/行动
  tracking_days INT NULL,              -- 跟踪天数
  metric TEXT NULL,                    -- 衡量指标
  
  -- 状态
  status ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
  result TEXT NULL,                    -- 改善/未改善 + 说明
  
  started_at DATE NULL,
  completed_at DATE NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX idx_user_status (user_id, status),
  INDEX idx_user_source (user_id, source_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2.7 Prisma Schema 增量

```prisma
// === 交易复盘系统 ===

model TradePlan {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  assetId         BigInt?   @map("asset_id")
  
  hypothesis      String    @db.Text
  marketEnvironment MarketEnvironment @map("market_environment")
  timeframe       String?   @db.VarChar(20)
  
  entryTrigger    String    @map("entry_trigger") @db.Text
  entryPrice      Decimal?  @map("entry_price") @db.Decimal(20, 8)
  stopLoss        Decimal?  @map("stop_loss") @db.Decimal(20, 8)
  takeProfit      Decimal?  @map("take_profit") @db.Decimal(20, 8)
  positionSize    Decimal?  @map("position_size") @db.Decimal(20, 8)
  
  riskAmount      Decimal?  @map("risk_amount") @db.Decimal(20, 4)
  expectedRr      Decimal?  @map("expected_rr") @db.Decimal(10, 2)
  invalidation    String?   @db.Text
  
  strategyType    StrategyType @map("strategy_type")
  status          PlanStatus   @default(draft)
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")
  
  user            User      @relation(fields: [userId], references: [id])
  asset           UserAsset? @relation(fields: [assetId], references: [id])
  reviews         TradeReview[]
  
  @@index([userId, status])
  @@index([userId, strategyType])
  @@map("trade_plans")
}

model TradeReview {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  transactionId   BigInt    @unique @map("transaction_id")
  planId          BigInt?   @map("plan_id")
  
  marketEnvironment MarketEnvironment? @map("market_environment")
  keyLevels       String?   @map("key_levels") @db.Text
  newsEvents      String?   @map("news_events") @db.Text
  sectorContext   String?   @map("sector_context") @db.Text
  
  followedPlan    Boolean?  @map("followed_plan")
  entryQuality    ExecutionQuality? @map("entry_quality")
  exitQuality     ExecutionQuality? @map("exit_quality")
  movedStopLoss   Boolean?  @map("moved_stop_loss")
  addedPosition   Boolean?  @map("added_position")
  chasedPrice     Boolean?  @map("chased_price")
  
  riskPerTrade    Decimal?  @map("risk_per_trade") @db.Decimal(20, 4)
  accountRiskPct  Decimal?  @map("account_risk_pct") @db.Decimal(10, 4)
  dailyRiskTotal  Decimal?  @map("daily_risk_total") @db.Decimal(20, 4)
  mae             Decimal?  @db.Decimal(20, 8)
  mfe             Decimal?  @db.Decimal(20, 8)
  rMultiple       Decimal?  @map("r_multiple") @db.Decimal(10, 4)
  
  preTradeEmotion  PreTradeEmotion? @map("pre_trade_emotion")
  postTradeEmotion PostTradeEmotion? @map("post_trade_emotion")
  
  scoreOpportunity Int?     @map("score_opportunity")
  scorePlanning    Int?     @map("score_planning")
  scoreRiskControl Int?     @map("score_risk_control")
  scoreDiscipline  Int?     @map("score_discipline")
  scorePsychology  Int?     @map("score_psychology")
  totalScore       Int?     @map("total_score")
  
  tradeGrade      TradeGrade? @map("trade_grade")
  strategyType    StrategyType? @map("strategy_type")
  errorType       ErrorType?   @map("error_type") @default(none)
  
  profitSource    String?   @map("profit_source") @db.Text
  lossReason      String?   @map("loss_reason") @db.Text
  isRepeatable    Boolean?  @map("is_repeatable")
  hindsightAction String?   @map("hindsight_action") @db.Text
  exposesPattern  Boolean?  @map("exposes_pattern")
  includeInSample Boolean?  @map("include_in_sample") @default(true)
  nextAction      String?   @map("next_action") @db.Text
  
  screenshots     Json?
  notes           String?   @db.Text
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  transaction     Transaction @relation(fields: [transactionId], references: [id])
  plan            TradePlan?  @relation(fields: [planId], references: [id])
  
  @@index([userId, createdAt])
  @@index([userId, tradeGrade])
  @@index([userId, strategyType])
  @@index([userId, errorType])
  @@map("trade_reviews")
}

model DailyReview {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  reviewDate      DateTime  @map("review_date") @db.Date
  
  bestTradeId     BigInt?   @map("best_trade_id")
  bestTradeReason String?   @map("best_trade_reason") @db.Text
  worstTradeId    BigInt?   @map("worst_trade_id")
  worstTradeReason String?  @map("worst_trade_reason") @db.Text
  tomorrowImprovement String? @map("tomorrow_improvement") @db.Text
  
  totalTrades     Int?      @map("total_trades")
  netR            Decimal?  @map("net_r") @db.Decimal(10, 4)
  winCount        Int?      @map("win_count")
  lossCount       Int?      @map("loss_count")
  planAdherencePct Decimal? @map("plan_adherence_pct") @db.Decimal(10, 2)
  
  marketSummary   String?   @map("market_summary") @db.Text
  notes           String?   @db.Text
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, reviewDate])
  @@map("daily_reviews")
}

model StrategyStats {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  strategyType    StrategyType @map("strategy_type")
  
  periodStart     DateTime  @map("period_start") @db.Date
  periodEnd       DateTime  @map("period_end") @db.Date
  
  sampleCount     Int       @default(0) @map("sample_count")
  winCount        Int       @default(0) @map("win_count")
  lossCount       Int       @default(0) @map("loss_count")
  winRate         Decimal?  @map("win_rate") @db.Decimal(10, 4)
  avgWinR         Decimal?  @map("avg_win_r") @db.Decimal(10, 4)
  avgLossR        Decimal?  @map("avg_loss_r") @db.Decimal(10, 4)
  expectancy      Decimal?  @db.Decimal(10, 4)
  profitFactor    Decimal?  @map("profit_factor") @db.Decimal(10, 4)
  maxConsecutiveLoss Int?   @map("max_consecutive_loss")
  maxDrawdownR    Decimal?  @map("max_drawdown_r") @db.Decimal(10, 4)
  
  bestEnvironment  MarketEnvironment? @map("best_environment")
  worstEnvironment MarketEnvironment? @map("worst_environment")
  
  status          StrategyStatus @default(active)
  statusReason    String?   @map("status_reason") @db.Text
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, strategyType, periodStart, periodEnd])
  @@index([userId, status])
  @@map("strategy_stats")
}

model ErrorTracking {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  
  errorType       ErrorType @map("error_type")
  occurrenceCount Int       @default(0) @map("occurrence_count")
  totalLossR      Decimal   @default(0) @map("total_loss_r") @db.Decimal(10, 4)
  
  typicalConditions String? @map("typical_conditions") @db.Text
  triggerEmotion    String? @map("trigger_emotion") @db.Text
  preventionRule    String? @map("prevention_rule") @db.Text
  
  trackingStart   DateTime? @map("tracking_start") @db.Date
  trackingEnd     DateTime? @map("tracking_end") @db.Date
  isImproving     Boolean?  @map("is_improving")
  improvementNotes String?  @map("improvement_notes") @db.Text
  
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([userId, errorType])
  @@index([userId, isImproving])
  @@map("error_tracking")
}

model ReviewAction {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt    @map("user_id")
  
  sourceType      ReviewSourceType @map("source_type")
  sourceId        BigInt?   @map("source_id")
  
  problem         String    @db.Text
  rule            String    @db.Text
  trackingDays    Int?      @map("tracking_days")
  metric          String?   @db.Text
  
  status          ActionStatus @default(active)
  result          String?   @db.Text
  
  startedAt       DateTime? @map("started_at") @db.Date
  completedAt     DateTime? @map("completed_at") @db.Date
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId, status])
  @@index([userId, sourceType])
  @@map("review_actions")
}

// === 新增枚举 ===

enum MarketEnvironment {
  trending
  ranging
  high_volatility
  low_volatility
  news_driven
}

enum StrategyType {
  breakout
  pullback
  reversal
  range
  news
  arbitrage
  experiment
}

enum PlanStatus {
  draft
  active
  executed
  cancelled
  expired
}

enum ExecutionQuality {
  good
  acceptable
  poor
}

enum PreTradeEmotion {
  calm
  anxious
  fomo
  revenge
  fatigued
  overconfident
}

enum PostTradeEmotion {
  calm
  regret
  relief
  frustration
  euphoria
}

enum TradeGrade {
  A
  B
  C
}

enum ErrorType {
  none
  chasing
  stop_delay
  oversize
  early_profit
  counter_trend
  emotional
  no_plan
  revenge_trade
  fomo_entry
  news_gamble
}

enum StrategyStatus {
  active
  observation
  paused
  retired
}

enum ReviewSourceType {
  trade_review
  daily_review
  weekly_review
  monthly_review
}

enum ActionStatus {
  active
  completed
  failed
  cancelled
}
```

---

## 3. API 设计

### 3.1 交易计划 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/trade-plans` | GET | 获取计划列表（支持 status/strategy 筛选） |
| `/api/trade-plans` | POST | 创建交易计划 |
| `/api/trade-plans/:id` | GET | 获取计划详情 |
| `/api/trade-plans/:id` | PUT | 更新计划 |
| `/api/trade-plans/:id` | DELETE | 软删除计划 |
| `/api/trade-plans/:id/execute` | POST | 标记计划为已执行（关联交易） |

### 3.2 交易复盘 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/trade-reviews` | GET | 复盘列表（支持 grade/strategy/error/date 筛选） |
| `/api/trade-reviews` | POST | 创建/更新复盘（基于 transactionId） |
| `/api/trade-reviews/:id` | GET | 复盘详情 |
| `/api/trade-reviews/:id` | PUT | 更新复盘 |
| `/api/trade-reviews/stats` | GET | 复盘统计概览 |

### 3.3 每日复盘 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/daily-reviews` | GET | 每日复盘列表 |
| `/api/daily-reviews/:date` | GET | 获取某日复盘 |
| `/api/daily-reviews/:date` | PUT | 创建/更新某日复盘 |

### 3.4 统计与分析 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/review-stats/weekly` | GET | 周统计（query: startDate, endDate） |
| `/api/review-stats/monthly` | GET | 月统计 |
| `/api/review-stats/strategy` | GET | 策略表现统计 |
| `/api/review-stats/errors` | GET | 错误追踪统计 |
| `/api/review-stats/indicators` | GET | 核心指标看板数据 |

### 3.5 行动项 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/review-actions` | GET | 行动项列表（支持 status 筛选） |
| `/api/review-actions` | POST | 创建行动项 |
| `/api/review-actions/:id` | PUT | 更新行动项状态 |
| `/api/review-actions/:id/complete` | POST | 标记完成并记录结果 |

---

## 4. Service 层设计

### 4.1 TradeReviewService

```typescript
// src/services/trade-review/index.ts

export class TradeReviewService {
  // === 交易计划 ===
  async createPlan(userId: bigint, data: CreatePlanInput): Promise<TradePlan>
  async listPlans(userId: bigint, filters: PlanFilters): Promise<PaginatedResult<TradePlan>>
  async executePlan(userId: bigint, planId: bigint, transactionId: bigint): Promise<TradePlan>
  
  // === 单笔复盘 ===
  async createReview(userId: bigint, data: CreateReviewInput): Promise<TradeReview>
  async updateReview(userId: bigint, id: bigint, data: UpdateReviewInput): Promise<TradeReview>
  async getReview(userId: bigint, transactionId: bigint): Promise<TradeReview | null>
  async listReviews(userId: bigint, filters: ReviewFilters): Promise<PaginatedResult<TradeReview>>
  
  // === 每日复盘 ===
  async upsertDailyReview(userId: bigint, date: string, data: DailyReviewInput): Promise<DailyReview>
  async getDailyReview(userId: bigint, date: string): Promise<DailyReview | null>
  async listDailyReviews(userId: bigint, range: DateRange): Promise<DailyReview[]>
  
  // === 统计计算 ===
  async calculateWeeklyStats(userId: bigint, weekStart: string): Promise<WeeklyStats>
  async calculateMonthlyStats(userId: bigint, month: string): Promise<MonthlyStats>
  async calculateStrategyStats(userId: bigint, strategyType: StrategyType, range: DateRange): Promise<StrategyStats>
  async getIndicatorDashboard(userId: bigint): Promise<IndicatorDashboard>
  
  // === 错误追踪 ===
  async trackError(userId: bigint, errorType: ErrorType, lossR: number): Promise<void>
  async getErrorStats(userId: bigint): Promise<ErrorTracking[]>
  async updateErrorTracking(userId: bigint, errorType: ErrorType, data: ErrorTrackingUpdate): Promise<void>
  
  // === 行动项 ===
  async createAction(userId: bigint, data: CreateActionInput): Promise<ReviewAction>
  async listActions(userId: bigint, status?: ActionStatus): Promise<ReviewAction[]>
  async completeAction(userId: bigint, id: bigint, result: string): Promise<ReviewAction>
}
```

### 4.2 核心统计计算逻辑

```typescript
// 期望值计算
function calculateExpectancy(reviews: TradeReview[]): number {
  const wins = reviews.filter(r => r.rMultiple && r.rMultiple > 0)
  const losses = reviews.filter(r => r.rMultiple && r.rMultiple < 0)
  
  const winRate = wins.length / reviews.length
  const avgWinR = wins.reduce((sum, r) => sum + Number(r.rMultiple), 0) / wins.length
  const avgLossR = Math.abs(losses.reduce((sum, r) => sum + Number(r.rMultiple), 0) / losses.length)
  
  return winRate * avgWinR - (1 - winRate) * avgLossR
}

// 指标看板
interface IndicatorDashboard {
  planAdherenceRate: number      // 按计划交易比例
  avgRMultiple: number           // 平均 R 值
  gradeAPercentage: number       // A 级交易占比
  maxDrawdownR: number           // 最大回撤 R
  maxConsecutiveLoss: number     // 最大连续亏损
  errorCostR: number             // 错误成本（非计划交易亏损 R）
  totalTrades: number            // 总交易笔数
  netR: number                   // 净 R 值
}
```

---

## 5. 前端页面设计

### 5.1 路由结构

| 页面 | 路由 | 说明 |
|------|------|------|
| 复盘总览 | `/review` | 核心指标看板 + 最近复盘 |
| 交易计划 | `/review/plans` | 计划列表与创建 |
| 单笔复盘 | `/review/trades/:id` | 针对某笔交易的复盘表单 |
| 每日复盘 | `/review/daily` | 日历视图 + 每日复盘面板 |
| 周复盘 | `/review/weekly` | 周统计仪表盘 |
| 月复盘 | `/review/monthly` | 月度策略决策面板 |
| 策略分析 | `/review/strategies` | 策略表现对比 |
| 错误追踪 | `/review/errors` | 错误看板 |
| 行动项 | `/review/actions` | 行动项列表与跟踪 |

### 5.2 核心组件

```
src/features/review/
├── hooks.ts                      -- React Query hooks
├── types.ts                      -- 前端类型定义
├── components/
│   ├── IndicatorDashboard.tsx    -- 5 大核心指标卡片
│   ├── TradeReviewForm.tsx       -- 100 分制复盘表单
│   ├── TradeScoreCard.tsx        -- 评分展示卡片
│   ├── DailyReviewPanel.tsx      -- 每日三问面板
│   ├── WeeklyStatsChart.tsx      -- 周统计图表
│   ├── MonthlyDecisionPanel.tsx  -- 月度策略决策
│   ├── StrategyComparison.tsx    -- 策略期望值对比图
│   ├── ErrorHeatmap.tsx          -- 错误热力图
│   ├── ActionItemList.tsx        -- 行动项列表
│   ├── PlanForm.tsx              -- 交易计划表单
│   ├── RMultipleChart.tsx        -- R 值分布图
│   └── EnvironmentFilter.tsx     -- 市场环境筛选器
└── pages/
    ├── ReviewOverview.tsx
    ├── TradeReviewPage.tsx
    ├── DailyReviewPage.tsx
    ├── WeeklyReviewPage.tsx
    ├── MonthlyReviewPage.tsx
    ├── StrategyPage.tsx
    ├── ErrorTrackingPage.tsx
    └── ActionsPage.tsx
```

### 5.3 核心指标看板 UI

```
┌─────────────────────────────────────────────────────────────┐
│                    交易复盘 Dashboard                         │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ 按计划率  │ 平均 R   │ A 级占比  │ 最大回撤  │  错误成本       │
│   85%    │  +0.8R   │   62%    │  -4.2R   │  -3.1R (28%)   │
│  ▲ +3%   │  ▲ +0.2  │  ▲ +5%   │  ● 持平  │  ▼ -1.2R      │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### 5.4 单笔复盘表单结构

分三步骤（Step Form）：

**Step 1：交易背景与计划**
- 关联交易计划（下拉选择已有计划）
- 市场环境选择
- 关键位描述
- 消息事件

**Step 2：执行评价与风控**
- 是否按计划（是/否）
- 入场/出场质量
- 是否追单/移动止损/加仓
- MAE/MFE
- R 倍数（可自动计算：如果关联了计划的止损位）

**Step 3：评分与归因**
- 五维度评分滑块（交易机会/计划/风控/纪律/心理）
- 交易等级自动计算（A/B/C 基于总分）
- 错误类型选择
- 盈利来源/亏损原因
- 下一步行动

### 5.5 每日复盘面板

- 日历组件显示已复盘/未复盘日期
- 当日交易列表（快速浏览）
- 三个问题输入框：
  - 最好的交易 → 下拉选择当日交易 + 原因输入
  - 最差的交易 → 下拉选择当日交易 + 原因输入
  - 明天只改一个点 → 文本输入（可关联生成行动项）
- 当日统计摘要：交易数、净 R、胜率、按计划率

### 5.6 周统计仪表盘

- 核心数据表格：总笔数、净 R、胜率、盈亏比、期望值
- 分策略类型表现柱状图
- 分市场环境表现雷达图
- A/B/C 级交易占比饼图
- 按计划率趋势线
- 错误类型分布图
- R 值分布直方图

### 5.7 月度策略决策面板

表格形式展示每个策略的：
- 样本数、胜率、期望值、最大回撤
- 状态建议（保留/观察/暂停/放大）
- 用户可手动确认决策并记录原因

---

## 6. 实现分期

### Phase 1：基础复盘（MVP 扩展）

扩展现有交易记录，增加复盘能力：

- [ ] 数据库迁移：新增 `trade_reviews` 表
- [ ] TradeReview CRUD API
- [ ] 单笔复盘表单（简化版：仅 followedPlan、tradeGrade、errorType、rMultiple、notes）
- [ ] 复盘列表页面
- [ ] 基础统计：按计划率、平均 R、A 级占比

### Phase 2：计划与每日复盘

- [ ] 数据库迁移：`trade_plans` + `daily_reviews` 表
- [ ] 交易计划 CRUD
- [ ] 每日复盘面板
- [ ] 指标看板（5 大核心指标）
- [ ] 100 分制评分表单完整版

### Phase 3：统计与策略分析

- [ ] 数据库迁移：`strategy_stats` 表
- [ ] 周统计计算与展示
- [ ] 月统计与策略决策面板
- [ ] 分策略/环境/时段的期望值拆分
- [ ] R 值分布图表

### Phase 4：错误追踪与行动闭环

- [ ] 数据库迁移：`error_tracking` + `review_actions` 表
- [ ] 错误自动聚合（基于 trade_reviews.error_type）
- [ ] 错误热力图/看板
- [ ] 行动项 CRUD + 跟踪
- [ ] 行动项与每日复盘联动

### Phase 5：AI 辅助复盘（远期）

- [ ] AI 自动生成交易背景摘要
- [ ] AI 模式识别（重复错误检测）
- [ ] AI 策略优化建议
- [ ] 自然语言复盘输入（AI 结构化提取）

---

## 7. 验收标准

### 7.1 Phase 1 验收标准

- 用户可为已有交易创建复盘记录
- 复盘支持评分（A/B/C）和 R 倍数记录
- 复盘列表支持按等级、策略类型筛选
- 复盘统计页展示按计划率、平均 R、A 级占比
- 用户只能查看/编辑自己的复盘数据

### 7.2 整体验收标准

- 一笔交易只能对应一个复盘记录
- R 倍数可自动计算（若有止损价和出场价）
- 错误追踪自动聚合复盘中的错误标记
- 行动项可从每日/周/月复盘中一键生成
- 周/月统计数据可导出
- 所有数据隔离：用户仅可见自己的复盘数据

---

## 8. 合规声明

本复盘系统属于交易教育和流程管理工具，旨在帮助用户建立系统化的交易记录与自我改进机制。

- 不提供具体投资建议或交易信号
- 不承诺使用本系统能产生正收益
- 所有统计分析基于用户自行录入数据，准确性由用户负责
- 参考 CME Group 交易计划教育框架和 FINRA 风险提示原则设计
