export type TradeReview = {
  id: string;
  transactionId: string;
  planId: string | null;
  assetName: string;
  symbol: string | null;
  transactionType: string | null;
  transactionTime: string | null;
  price: number | null;
  quantity: number | null;

  marketEnvironment: string | null;
  followedPlan: boolean | null;
  entryQuality: string | null;
  exitQuality: string | null;
  movedStopLoss: boolean | null;
  addedPosition: boolean | null;
  chasedPrice: boolean | null;
  riskPerTrade: number | null;
  accountRiskPct: number | null;
  dailyRiskTotal: number | null;
  mae: number | null;
  mfe: number | null;
  rMultiple: number | null;
  preTradeEmotion: string | null;
  postTradeEmotion: string | null;
  scoreOpportunity: number | null;
  scorePlanning: number | null;
  scoreRiskControl: number | null;
  scoreDiscipline: number | null;
  scorePsychology: number | null;
  totalScore: number | null;
  tradeGrade: string | null;
  strategyType: string | null;
  errorType: string | null;
  profitSource: string | null;
  lossReason: string | null;
  isRepeatable: boolean | null;
  hindsightAction: string | null;
  exposesPattern: boolean | null;
  includeInSample: boolean | null;
  nextAction: string | null;
  screenshots: string[] | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReviewList = {
  items: TradeReview[];
  total: number;
  page: number;
  pageSize: number;
};

export type ReviewStats = {
  totalReviews: number;
  planAdherenceRate: number; // integer percentage, e.g. 80 means 80%
  avgR: number;
  aGradeRate: number; // integer percentage
  errorCostR: number;
};

export type ReviewFilters = {
  tradeGrade?: string;
  strategyType?: string;
  errorType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

// === Phase B: Trade Plans / Daily Reviews / Indicator Dashboard ===

export type PlanStatus = "draft" | "active" | "executed" | "cancelled" | "expired";

export type TradePlan = {
  id: string;
  assetId: string | null;
  hypothesis: string;
  marketEnvironment: string;
  timeframe: string | null;
  entryTrigger: string;
  entryPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  positionSize: number | null;
  riskAmount: number | null;
  expectedRr: number | null;
  invalidation: string | null;
  strategyType: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlanList = {
  items: TradePlan[];
  total: number;
  page: number;
  pageSize: number;
};

export type PlanFilters = {
  status?: PlanStatus;
  strategyType?: string;
  page?: number;
  pageSize?: number;
};

export type DailyReview = {
  id: string;
  reviewDate: string;
  bestTradeId: string | null;
  bestTradeReason: string | null;
  worstTradeId: string | null;
  worstTradeReason: string | null;
  tomorrowImprovement: string | null;
  totalTrades: number | null;
  netR: number | null;
  winCount: number | null;
  lossCount: number | null;
  planAdherencePct: number | null;
  marketSummary: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IndicatorDashboard = {
  totalTrades: number;
  planAdherenceRate: number;
  avgRMultiple: number;
  gradeAPercentage: number;
  maxConsecutiveLoss: number;
  maxDrawdownR: number;
  errorCostR: number;
  netR: number;
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  active: "进行中",
  executed: "已执行",
  cancelled: "已取消",
  expired: "已过期",
};

// === Phase C: Statistics ===

export type StrategyStatus = "active" | "observation" | "paused" | "retired";

export type StrategyMiniStats = {
  sampleCount: number;
  winRate: number;
  expectancy: number;
};

export type WeeklyStats = {
  totalTrades: number;
  netR: number;
  winRate: number;
  profitFactor: number;
  expectancy: number;
  byStrategy: Record<string, StrategyMiniStats>;
  byEnvironment: Record<string, StrategyMiniStats>;
  gradeDistribution: Record<string, number>;
  planAdherenceRate: number;
  errorDistribution: Record<string, number>;
  rDistribution: { bin: string; count: number }[];
};

export type StrategyDecision = {
  strategyType: string;
  sampleCount: number;
  winRate: number;
  expectancy: number;
  maxDrawdownR: number;
  suggestedStatus: StrategyStatus;
};

export type MonthlyStats = {
  month: string;
  totalTrades: number;
  netR: number;
  strategies: StrategyDecision[];
};

export type StrategyStats = {
  id: string;
  strategyType: string;
  periodStart: string;
  periodEnd: string;
  sampleCount: number;
  winCount: number;
  lossCount: number;
  winRate: number | null;
  avgWinR: number | null;
  avgLossR: number | null;
  expectancy: number | null;
  profitFactor: number | null;
  maxConsecutiveLoss: number | null;
  maxDrawdownR: number | null;
  bestEnvironment: string | null;
  worstEnvironment: string | null;
  status: StrategyStatus;
  statusReason: string | null;
};

export const STRATEGY_STATUS_LABELS: Record<string, string> = {
  active: "正常运行",
  observation: "观察中",
  paused: "暂停",
  retired: "淘汰",
};

// Enum label maps for UI display
export const TRADE_GRADE_LABELS: Record<string, string> = {
  A: "A 级（优秀）",
  B: "B 级（合格）",
  C: "C 级（待改进）",
};

export const STRATEGY_TYPE_LABELS: Record<string, string> = {
  breakout: "突破",
  pullback: "回撤",
  reversal: "反转",
  range: "区间",
  news: "消息",
  arbitrage: "套利",
  experiment: "实验",
};

export const ERROR_TYPE_LABELS: Record<string, string> = {
  none: "无错误",
  chasing: "追单",
  stop_delay: "止损延迟",
  oversize: "仓位过重",
  early_profit: "过早止盈",
  counter_trend: "逆势操作",
  emotional: "情绪化交易",
  no_plan: "无计划交易",
  revenge_trade: "报复性交易",
  fomo_entry: "FOMO 入场",
  news_gamble: "赌消息",
};

export const MARKET_ENV_LABELS: Record<string, string> = {
  trending: "趋势行情",
  ranging: "震荡行情",
  high_volatility: "高波动",
  low_volatility: "低波动",
  news_driven: "消息驱动",
};

export const EXECUTION_QUALITY_LABELS: Record<string, string> = {
  good: "优秀",
  acceptable: "可接受",
  poor: "较差",
};

export const PRE_EMOTION_LABELS: Record<string, string> = {
  calm: "平静",
  anxious: "焦虑",
  fomo: "恐惧错过",
  revenge: "报复心态",
  fatigued: "疲惫",
  overconfident: "过度自信",
};

export const POST_EMOTION_LABELS: Record<string, string> = {
  calm: "平静",
  regret: "后悔",
  relief: "解脱",
  frustration: "沮丧",
  euphoria: "兴奋",
};
