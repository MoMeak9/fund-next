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
