import { z } from "zod";

const marketEnvironments = ["trending", "ranging", "high_volatility", "low_volatility", "news_driven"] as const;
const strategyTypes = ["breakout", "pullback", "reversal", "range", "news", "arbitrage", "experiment"] as const;
const executionQualities = ["good", "acceptable", "poor"] as const;
const preTradeEmotions = ["calm", "anxious", "fomo", "revenge", "fatigued", "overconfident"] as const;
const postTradeEmotions = ["calm", "regret", "relief", "frustration", "euphoria"] as const;
const tradeGrades = ["A", "B", "C"] as const;
const errorTypes = ["none", "chasing", "stop_delay", "oversize", "early_profit", "counter_trend", "emotional", "no_plan", "revenge_trade", "fomo_entry", "news_gamble"] as const;

export const createReviewSchema = z.object({
  transactionId: z.string().min(1),
  planId: z.string().optional(),

  // 交易背景
  marketEnvironment: z.enum(marketEnvironments).optional(),
  keyLevels: z.string().optional(),
  newsEvents: z.string().optional(),
  sectorContext: z.string().optional(),

  // 执行评价
  followedPlan: z.boolean().optional(),
  entryQuality: z.enum(executionQualities).optional(),
  exitQuality: z.enum(executionQualities).optional(),
  movedStopLoss: z.boolean().optional(),
  addedPosition: z.boolean().optional(),
  chasedPrice: z.boolean().optional(),

  // 风控
  riskPerTrade: z.number().optional(),
  accountRiskPct: z.number().min(0).max(100).optional(),
  dailyRiskTotal: z.number().optional(),
  mae: z.number().optional(),
  mfe: z.number().optional(),
  rMultiple: z.number().optional(),

  // 心理
  preTradeEmotion: z.enum(preTradeEmotions).optional(),
  postTradeEmotion: z.enum(postTradeEmotions).optional(),

  // 评分
  scoreOpportunity: z.number().int().min(0).max(25).optional(),
  scorePlanning: z.number().int().min(0).max(25).optional(),
  scoreRiskControl: z.number().int().min(0).max(20).optional(),
  scoreDiscipline: z.number().int().min(0).max(20).optional(),
  scorePsychology: z.number().int().min(0).max(10).optional(),

  // 分类
  tradeGrade: z.enum(tradeGrades).optional(),
  strategyType: z.enum(strategyTypes).optional(),
  errorType: z.enum(errorTypes).optional(),

  // 归因
  profitSource: z.string().optional(),
  lossReason: z.string().optional(),
  isRepeatable: z.boolean().optional(),
  hindsightAction: z.string().optional(),
  exposesPattern: z.boolean().optional(),
  includeInSample: z.boolean().optional(),
  nextAction: z.string().optional(),

  // 证据
  screenshots: z.array(z.string()).optional(),

  // 其他
  notes: z.string().optional(),
});

export const updateReviewSchema = createReviewSchema.omit({ transactionId: true }).partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

const planStatuses = ["draft", "active", "executed", "cancelled", "expired"] as const;

export const createPlanSchema = z.object({
  hypothesis: z.string().min(1, "请填写交易假设"),
  marketEnvironment: z.enum(marketEnvironments),
  entryTrigger: z.string().min(1, "请填写入场触发条件"),
  strategyType: z.enum(strategyTypes),
  assetId: z.string().optional(),
  timeframe: z.string().max(20).optional(),
  entryPrice: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  positionSize: z.number().optional(),
  riskAmount: z.number().optional(),
  expectedRr: z.number().optional(),
  invalidation: z.string().optional(),
  status: z.enum(planStatuses).optional(),
});

export const updatePlanSchema = createPlanSchema.partial();

export const dailyReviewSchema = z.object({
  bestTradeId: z.string().optional(),
  bestTradeReason: z.string().optional(),
  worstTradeId: z.string().optional(),
  worstTradeReason: z.string().optional(),
  tomorrowImprovement: z.string().optional(),
  totalTrades: z.number().int().optional(),
  netR: z.number().optional(),
  winCount: z.number().int().optional(),
  lossCount: z.number().int().optional(),
  planAdherencePct: z.number().optional(),
  marketSummary: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type DailyReviewInput = z.infer<typeof dailyReviewSchema>;
