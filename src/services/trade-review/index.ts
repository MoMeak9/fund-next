import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreateReviewInput, UpdateReviewInput } from "./schema";
import { ReviewError } from "./errors";
import { maxConsecutiveLoss, maxDrawdownR } from "./metrics";
import { trackError } from "./errors-actions";

export { ReviewError };
export * from "./plans";
export * from "./metrics";
export * from "./stats-service";
export * from "./errors-actions";

type Pagination = { page: number; pageSize: number };
type Filters = {
  tradeGrade?: string;
  strategyType?: string;
  errorType?: string;
  startDate?: string;
  endDate?: string;
};

export async function listReviews(userId: bigint, filters?: Filters, pagination?: Pagination) {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 20;

  const where: Record<string, unknown> = { userId };
  if (filters?.tradeGrade) where.tradeGrade = filters.tradeGrade;
  if (filters?.strategyType) where.strategyType = filters.strategyType;
  if (filters?.errorType) where.errorType = filters.errorType;
  if (filters?.startDate || filters?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (filters.startDate) dateFilter.gte = new Date(filters.startDate);
    if (filters.endDate) dateFilter.lte = new Date(filters.endDate);
    where.createdAt = dateFilter;
  }

  const [items, total] = await Promise.all([
    prisma.tradeReview.findMany({
      where,
      include: {
        transaction: {
          include: { asset: { select: { assetName: true, symbol: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tradeReview.count({ where }),
  ]);

  return {
    items: items.map(serializeReview),
    total,
    page,
    pageSize,
  };
}

export async function getReview(userId: bigint, id: bigint) {
  const review = await prisma.tradeReview.findFirst({
    where: { id, userId },
    include: {
      transaction: {
        include: { asset: { select: { assetName: true, symbol: true } } },
      },
    },
  });
  if (!review) return null;
  return serializeReview(review);
}

export async function getReviewByTransaction(userId: bigint, transactionId: bigint) {
  const review = await prisma.tradeReview.findFirst({
    where: { userId, transactionId },
    include: {
      transaction: {
        include: { asset: { select: { assetName: true, symbol: true } } },
      },
    },
  });
  if (!review) return null;
  return serializeReview(review);
}

export async function createReview(userId: bigint, input: CreateReviewInput) {
  const transactionId = BigInt(input.transactionId);

  // Verify transaction belongs to user
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId, deletedAt: null },
  });
  if (!tx) throw new ReviewError(404, "交易记录不存在");

  // Check if review already exists
  const existing = await prisma.tradeReview.findFirst({
    where: { transactionId },
  });
  if (existing) throw new ReviewError(409, "该交易已有复盘记录");

  // Plan-based R-multiple: auto-derive when not explicitly provided and the plan has entry+stop.
  const resolvedR = await resolveRMultiple(userId, input.planId, input.rMultiple, tx);

  // total_score 是数据库 GENERATED 列，不可写入；这里仅用于推导等级。
  const totalScore = calculateTotalScore(input);

  const review = await prisma.tradeReview.create({
    data: {
      userId,
      transactionId,
      planId: input.planId != null ? BigInt(input.planId) : null,
      marketEnvironment: input.marketEnvironment ?? null,
      keyLevels: input.keyLevels ?? null,
      newsEvents: input.newsEvents ?? null,
      sectorContext: input.sectorContext ?? null,
      followedPlan: input.followedPlan ?? null,
      entryQuality: input.entryQuality ?? null,
      exitQuality: input.exitQuality ?? null,
      movedStopLoss: input.movedStopLoss ?? null,
      addedPosition: input.addedPosition ?? null,
      chasedPrice: input.chasedPrice ?? null,
      riskPerTrade: input.riskPerTrade != null ? new Decimal(input.riskPerTrade) : null,
      accountRiskPct: input.accountRiskPct != null ? new Decimal(input.accountRiskPct) : null,
      dailyRiskTotal: input.dailyRiskTotal != null ? new Decimal(input.dailyRiskTotal) : null,
      mae: input.mae != null ? new Decimal(input.mae) : null,
      mfe: input.mfe != null ? new Decimal(input.mfe) : null,
      rMultiple: resolvedR != null ? new Decimal(resolvedR) : null,
      preTradeEmotion: input.preTradeEmotion ?? null,
      postTradeEmotion: input.postTradeEmotion ?? null,
      scoreOpportunity: input.scoreOpportunity ?? null,
      scorePlanning: input.scorePlanning ?? null,
      scoreRiskControl: input.scoreRiskControl ?? null,
      scoreDiscipline: input.scoreDiscipline ?? null,
      scorePsychology: input.scorePsychology ?? null,
      tradeGrade: input.tradeGrade ?? deriveGrade(totalScore),
      strategyType: input.strategyType ?? null,
      errorType: input.errorType ?? "none",
      profitSource: input.profitSource ?? null,
      lossReason: input.lossReason ?? null,
      isRepeatable: input.isRepeatable ?? null,
      hindsightAction: input.hindsightAction ?? null,
      exposesPattern: input.exposesPattern ?? null,
      includeInSample: input.includeInSample ?? true,
      nextAction: input.nextAction ?? null,
      screenshots: input.screenshots ?? undefined,
      notes: input.notes ?? null,
    },
    include: {
      transaction: {
        include: { asset: { select: { assetName: true, symbol: true } } },
      },
    },
  });

  // Error auto-aggregation: count the error and add any realized loss (negative R).
  const errType = input.errorType ?? "none";
  if (errType !== "none") {
    await trackError(userId, errType, resolvedR != null && resolvedR < 0 ? resolvedR : 0);
  }

  return serializeReview(review);
}

export async function updateReview(userId: bigint, id: bigint, input: UpdateReviewInput) {
  const existing = await prisma.tradeReview.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};

  if (input.planId !== undefined) data.planId = input.planId != null ? BigInt(input.planId) : null;
  if (input.marketEnvironment !== undefined) data.marketEnvironment = input.marketEnvironment ?? null;
  if (input.keyLevels !== undefined) data.keyLevels = input.keyLevels ?? null;
  if (input.newsEvents !== undefined) data.newsEvents = input.newsEvents ?? null;
  if (input.sectorContext !== undefined) data.sectorContext = input.sectorContext ?? null;
  if (input.followedPlan !== undefined) data.followedPlan = input.followedPlan ?? null;
  if (input.entryQuality !== undefined) data.entryQuality = input.entryQuality ?? null;
  if (input.exitQuality !== undefined) data.exitQuality = input.exitQuality ?? null;
  if (input.movedStopLoss !== undefined) data.movedStopLoss = input.movedStopLoss ?? null;
  if (input.addedPosition !== undefined) data.addedPosition = input.addedPosition ?? null;
  if (input.chasedPrice !== undefined) data.chasedPrice = input.chasedPrice ?? null;
  if (input.riskPerTrade !== undefined) data.riskPerTrade = input.riskPerTrade != null ? new Decimal(input.riskPerTrade) : null;
  if (input.accountRiskPct !== undefined) data.accountRiskPct = input.accountRiskPct != null ? new Decimal(input.accountRiskPct) : null;
  if (input.dailyRiskTotal !== undefined) data.dailyRiskTotal = input.dailyRiskTotal != null ? new Decimal(input.dailyRiskTotal) : null;
  if (input.mae !== undefined) data.mae = input.mae != null ? new Decimal(input.mae) : null;
  if (input.mfe !== undefined) data.mfe = input.mfe != null ? new Decimal(input.mfe) : null;
  if (input.rMultiple !== undefined) data.rMultiple = input.rMultiple != null ? new Decimal(input.rMultiple) : null;
  if (input.preTradeEmotion !== undefined) data.preTradeEmotion = input.preTradeEmotion ?? null;
  if (input.postTradeEmotion !== undefined) data.postTradeEmotion = input.postTradeEmotion ?? null;
  if (input.scoreOpportunity !== undefined) data.scoreOpportunity = input.scoreOpportunity ?? null;
  if (input.scorePlanning !== undefined) data.scorePlanning = input.scorePlanning ?? null;
  if (input.scoreRiskControl !== undefined) data.scoreRiskControl = input.scoreRiskControl ?? null;
  if (input.scoreDiscipline !== undefined) data.scoreDiscipline = input.scoreDiscipline ?? null;
  if (input.scorePsychology !== undefined) data.scorePsychology = input.scorePsychology ?? null;
  if (input.tradeGrade !== undefined) data.tradeGrade = input.tradeGrade ?? null;
  if (input.strategyType !== undefined) data.strategyType = input.strategyType ?? null;
  if (input.errorType !== undefined) data.errorType = input.errorType ?? null;
  if (input.profitSource !== undefined) data.profitSource = input.profitSource ?? null;
  if (input.lossReason !== undefined) data.lossReason = input.lossReason ?? null;
  if (input.isRepeatable !== undefined) data.isRepeatable = input.isRepeatable ?? null;
  if (input.hindsightAction !== undefined) data.hindsightAction = input.hindsightAction ?? null;
  if (input.exposesPattern !== undefined) data.exposesPattern = input.exposesPattern ?? null;
  if (input.includeInSample !== undefined) data.includeInSample = input.includeInSample ?? null;
  if (input.nextAction !== undefined) data.nextAction = input.nextAction ?? null;
  if (input.screenshots !== undefined) data.screenshots = input.screenshots ?? undefined;
  if (input.notes !== undefined) data.notes = input.notes ?? null;

  // total_score 由数据库 GENERATED 列自动维护，不写入；仅在分数变化且调用方未显式指定等级时重算 tradeGrade。
  const scores = {
    scoreOpportunity: input.scoreOpportunity ?? existing.scoreOpportunity,
    scorePlanning: input.scorePlanning ?? existing.scorePlanning,
    scoreRiskControl: input.scoreRiskControl ?? existing.scoreRiskControl,
    scoreDiscipline: input.scoreDiscipline ?? existing.scoreDiscipline,
    scorePsychology: input.scorePsychology ?? existing.scorePsychology,
  };
  const totalScore = calculateTotalScore(scores);
  if (totalScore != null && input.tradeGrade === undefined) {
    data.tradeGrade = deriveGrade(totalScore);
  }

  const review = await prisma.tradeReview.update({
    where: { id },
    data,
    include: {
      transaction: {
        include: { asset: { select: { assetName: true, symbol: true } } },
      },
    },
  });

  return serializeReview(review);
}

export async function getReviewStats(userId: bigint) {
  const reviews = await prisma.tradeReview.findMany({
    where: { userId, includeInSample: true },
    select: {
      followedPlan: true,
      rMultiple: true,
      tradeGrade: true,
      errorType: true,
      totalScore: true,
    },
  });

  if (reviews.length === 0) {
    return { totalReviews: 0, planAdherenceRate: 0, avgR: 0, aGradeRate: 0, errorCostR: 0 };
  }

  const withPlanData = reviews.filter((r) => r.followedPlan != null);
  const planAdherenceRate = withPlanData.length > 0
    ? withPlanData.filter((r) => r.followedPlan).length / withPlanData.length
    : 0;

  const withR = reviews.filter((r) => r.rMultiple != null);
  const avgR = withR.length > 0
    ? withR.reduce((sum, r) => sum + Number(r.rMultiple), 0) / withR.length
    : 0;

  const aGradeRate = reviews.filter((r) => r.tradeGrade === "A").length / reviews.length;

  const errorReviews = reviews.filter((r) => r.errorType && r.errorType !== "none" && r.rMultiple != null);
  const errorCostR = errorReviews.reduce((sum, r) => sum + Math.min(0, Number(r.rMultiple)), 0);

  return {
    totalReviews: reviews.length,
    planAdherenceRate: Math.round(planAdherenceRate * 100),
    avgR: Math.round(avgR * 100) / 100,
    aGradeRate: Math.round(aGradeRate * 100),
    errorCostR: Math.round(errorCostR * 100) / 100,
  };
}

export async function getIndicatorDashboard(userId: bigint) {
  const reviews = await prisma.tradeReview.findMany({
    where: { userId, includeInSample: true },
    select: {
      followedPlan: true,
      rMultiple: true,
      tradeGrade: true,
      errorType: true,
      transaction: { select: { transactionTime: true } },
    },
  });

  if (reviews.length === 0) {
    return {
      totalTrades: 0,
      planAdherenceRate: 0,
      avgRMultiple: 0,
      gradeAPercentage: 0,
      maxConsecutiveLoss: 0,
      maxDrawdownR: 0,
      errorCostR: 0,
      netR: 0,
    };
  }

  // Deterministic ordering for drawdown / streak calculations.
  const ordered = [...reviews].sort(
    (a, b) =>
      (a.transaction?.transactionTime?.getTime() ?? 0) -
      (b.transaction?.transactionTime?.getTime() ?? 0),
  );
  const rSeries = ordered.map((r) => (r.rMultiple != null ? Number(r.rMultiple) : null));

  const withPlan = reviews.filter((r) => r.followedPlan != null);
  const planAdherenceRate =
    withPlan.length > 0 ? withPlan.filter((r) => r.followedPlan).length / withPlan.length : 0;

  const withR = rSeries.filter((r): r is number => r != null);
  const avgRMultiple = withR.length > 0 ? withR.reduce((s, r) => s + r, 0) / withR.length : 0;
  const netR = withR.reduce((s, r) => s + r, 0);

  const gradeAPercentage = reviews.filter((r) => r.tradeGrade === "A").length / reviews.length;

  const errorCostR = reviews
    .filter((r) => r.errorType && r.errorType !== "none" && r.rMultiple != null)
    .reduce((s, r) => s + Math.min(0, Number(r.rMultiple)), 0);

  return {
    totalTrades: reviews.length,
    planAdherenceRate: Math.round(planAdherenceRate * 100),
    avgRMultiple: Math.round(avgRMultiple * 100) / 100,
    gradeAPercentage: Math.round(gradeAPercentage * 100),
    maxConsecutiveLoss: maxConsecutiveLoss(rSeries),
    maxDrawdownR: Math.round(maxDrawdownR(rSeries) * 100) / 100,
    errorCostR: Math.round(errorCostR * 100) / 100,
    netR: Math.round(netR * 100) / 100,
  };
}

// --- Helpers ---

/**
 * R-multiple for a long trade: (exit - entry) / (entry - stop).
 * Returns null when the risk denominator is zero (entry === stop) — R is undefined there.
 * Long-only by design (see plan open question); short trades are out of scope for Phase A.
 */
export function calculateRMultiple(
  entryPrice: number,
  stopLoss: number,
  exitPrice: number,
): number | null {
  const risk = entryPrice - stopLoss;
  if (risk === 0) return null;
  return (exitPrice - entryPrice) / risk;
}

/**
 * Resolve the R-multiple to store: the explicit input wins; otherwise, when a plan with
 * entry+stop is linked and the transaction has a price, auto-derive it. No-ops to null
 * gracefully whenever any input is missing.
 */
async function resolveRMultiple(
  userId: bigint,
  planId: string | undefined,
  explicit: number | undefined,
  tx: { price: Decimal | null },
): Promise<number | null> {
  if (explicit != null) return explicit;
  if (planId == null) return null;

  const plan = await prisma.tradePlan.findFirst({
    where: { id: BigInt(planId), userId, deletedAt: null },
    select: { entryPrice: true, stopLoss: true },
  });
  if (!plan || plan.entryPrice == null || plan.stopLoss == null || tx.price == null) return null;

  return calculateRMultiple(Number(plan.entryPrice), Number(plan.stopLoss), Number(tx.price));
}

export function calculateTotalScore(input: {
  scoreOpportunity?: number | null;
  scorePlanning?: number | null;
  scoreRiskControl?: number | null;
  scoreDiscipline?: number | null;
  scorePsychology?: number | null;
}): number | null {
  const scores = [
    input.scoreOpportunity,
    input.scorePlanning,
    input.scoreRiskControl,
    input.scoreDiscipline,
    input.scorePsychology,
  ];
  if (scores.every((s) => s == null)) return null;
  return scores.reduce((sum, s) => (sum ?? 0) + (s ?? 0), 0) ?? 0;
}

export function deriveGrade(totalScore: number | null): "A" | "B" | "C" | null {
  if (totalScore == null) return null;
  if (totalScore >= 80) return "A";
  if (totalScore >= 60) return "B";
  return "C";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeReview(review: any) {
  const tx = review.transaction;
  return {
    id: String(review.id),
    transactionId: String(review.transactionId),
    planId: review.planId != null ? String(review.planId) : null,
    assetName: tx?.asset?.assetName ?? "",
    symbol: tx?.asset?.symbol ?? null,
    transactionType: tx?.transactionType ?? null,
    transactionTime: tx?.transactionTime?.toISOString() ?? null,
    price: tx?.price != null ? Number(tx.price) : null,
    quantity: tx?.quantity != null ? Number(tx.quantity) : null,

    marketEnvironment: review.marketEnvironment,
    followedPlan: review.followedPlan,
    entryQuality: review.entryQuality,
    exitQuality: review.exitQuality,
    movedStopLoss: review.movedStopLoss,
    addedPosition: review.addedPosition,
    chasedPrice: review.chasedPrice,
    riskPerTrade: review.riskPerTrade != null ? Number(review.riskPerTrade) : null,
    accountRiskPct: review.accountRiskPct != null ? Number(review.accountRiskPct) : null,
    dailyRiskTotal: review.dailyRiskTotal != null ? Number(review.dailyRiskTotal) : null,
    mae: review.mae != null ? Number(review.mae) : null,
    mfe: review.mfe != null ? Number(review.mfe) : null,
    rMultiple: review.rMultiple != null ? Number(review.rMultiple) : null,
    preTradeEmotion: review.preTradeEmotion,
    postTradeEmotion: review.postTradeEmotion,
    scoreOpportunity: review.scoreOpportunity,
    scorePlanning: review.scorePlanning,
    scoreRiskControl: review.scoreRiskControl,
    scoreDiscipline: review.scoreDiscipline,
    scorePsychology: review.scorePsychology,
    totalScore: review.totalScore,
    tradeGrade: review.tradeGrade,
    strategyType: review.strategyType,
    errorType: review.errorType,
    profitSource: review.profitSource,
    lossReason: review.lossReason,
    isRepeatable: review.isRepeatable,
    hindsightAction: review.hindsightAction,
    exposesPattern: review.exposesPattern,
    includeInSample: review.includeInSample,
    nextAction: review.nextAction,
    screenshots: review.screenshots ?? null,
    notes: review.notes,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  };
}
