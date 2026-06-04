import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreatePlanInput, UpdatePlanInput, DailyReviewInput } from "./schema";
import { ReviewError } from "./errors";

type Pagination = { page: number; pageSize: number };
type PlanFilters = { status?: string; strategyType?: string };

function dec(v: number | undefined) {
  return v != null ? new Decimal(v) : null;
}

// --- Trade Plans ---

export async function listPlans(userId: bigint, filters?: PlanFilters, pagination?: Pagination) {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 20;

  const where: Record<string, unknown> = { userId, deletedAt: null };
  if (filters?.status) where.status = filters.status;
  if (filters?.strategyType) where.strategyType = filters.strategyType;

  const [items, total] = await Promise.all([
    prisma.tradePlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tradePlan.count({ where }),
  ]);

  return { items: items.map(serializePlan), total, page, pageSize };
}

export async function getPlan(userId: bigint, id: bigint) {
  const plan = await prisma.tradePlan.findFirst({ where: { id, userId, deletedAt: null } });
  if (!plan) return null;
  return serializePlan(plan);
}

export async function createPlan(userId: bigint, input: CreatePlanInput) {
  const plan = await prisma.tradePlan.create({
    data: {
      userId,
      assetId: input.assetId != null ? BigInt(input.assetId) : null,
      hypothesis: input.hypothesis,
      marketEnvironment: input.marketEnvironment,
      timeframe: input.timeframe ?? null,
      entryTrigger: input.entryTrigger,
      entryPrice: dec(input.entryPrice),
      stopLoss: dec(input.stopLoss),
      takeProfit: dec(input.takeProfit),
      positionSize: dec(input.positionSize),
      riskAmount: dec(input.riskAmount),
      expectedRr: dec(input.expectedRr),
      invalidation: input.invalidation ?? null,
      strategyType: input.strategyType,
      status: input.status ?? "draft",
    },
  });
  return serializePlan(plan);
}

export async function updatePlan(userId: bigint, id: bigint, input: UpdatePlanInput) {
  const existing = await prisma.tradePlan.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (input.assetId !== undefined) data.assetId = input.assetId != null ? BigInt(input.assetId) : null;
  if (input.hypothesis !== undefined) data.hypothesis = input.hypothesis;
  if (input.marketEnvironment !== undefined) data.marketEnvironment = input.marketEnvironment;
  if (input.timeframe !== undefined) data.timeframe = input.timeframe ?? null;
  if (input.entryTrigger !== undefined) data.entryTrigger = input.entryTrigger;
  if (input.entryPrice !== undefined) data.entryPrice = dec(input.entryPrice);
  if (input.stopLoss !== undefined) data.stopLoss = dec(input.stopLoss);
  if (input.takeProfit !== undefined) data.takeProfit = dec(input.takeProfit);
  if (input.positionSize !== undefined) data.positionSize = dec(input.positionSize);
  if (input.riskAmount !== undefined) data.riskAmount = dec(input.riskAmount);
  if (input.expectedRr !== undefined) data.expectedRr = dec(input.expectedRr);
  if (input.invalidation !== undefined) data.invalidation = input.invalidation ?? null;
  if (input.strategyType !== undefined) data.strategyType = input.strategyType;
  if (input.status !== undefined) data.status = input.status;

  const plan = await prisma.tradePlan.update({ where: { id }, data });
  return serializePlan(plan);
}

export async function softDeletePlan(userId: bigint, id: bigint) {
  const existing = await prisma.tradePlan.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;
  await prisma.tradePlan.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

export async function executePlan(userId: bigint, planId: bigint, transactionId: bigint) {
  const plan = await prisma.tradePlan.findFirst({ where: { id: planId, userId, deletedAt: null } });
  if (!plan) throw new ReviewError(404, "交易计划不存在");

  const tx = await prisma.transaction.findFirst({ where: { id: transactionId, userId, deletedAt: null } });
  if (!tx) throw new ReviewError(404, "交易记录不存在");

  const updated = await prisma.tradePlan.update({ where: { id: planId }, data: { status: "executed" } });
  return serializePlan(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializePlan(plan: any) {
  return {
    id: String(plan.id),
    assetId: plan.assetId != null ? String(plan.assetId) : null,
    hypothesis: plan.hypothesis,
    marketEnvironment: plan.marketEnvironment,
    timeframe: plan.timeframe,
    entryTrigger: plan.entryTrigger,
    entryPrice: plan.entryPrice != null ? Number(plan.entryPrice) : null,
    stopLoss: plan.stopLoss != null ? Number(plan.stopLoss) : null,
    takeProfit: plan.takeProfit != null ? Number(plan.takeProfit) : null,
    positionSize: plan.positionSize != null ? Number(plan.positionSize) : null,
    riskAmount: plan.riskAmount != null ? Number(plan.riskAmount) : null,
    expectedRr: plan.expectedRr != null ? Number(plan.expectedRr) : null,
    invalidation: plan.invalidation,
    strategyType: plan.strategyType,
    status: plan.status,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
}

// --- Daily Reviews ---

export async function getDailyReview(userId: bigint, date: string) {
  const review = await prisma.dailyReview.findFirst({
    where: { userId, reviewDate: new Date(date) },
  });
  if (!review) return null;
  return serializeDaily(review);
}

export async function listDailyReviews(userId: bigint, range?: { startDate?: string; endDate?: string }) {
  const where: Record<string, unknown> = { userId };
  if (range?.startDate || range?.endDate) {
    const f: Record<string, Date> = {};
    if (range.startDate) f.gte = new Date(range.startDate);
    if (range.endDate) f.lte = new Date(range.endDate);
    where.reviewDate = f;
  }
  const items = await prisma.dailyReview.findMany({ where, orderBy: { reviewDate: "desc" } });
  return items.map(serializeDaily);
}

export async function upsertDailyReview(userId: bigint, date: string, input: DailyReviewInput) {
  const reviewDate = new Date(date);
  const data = {
    bestTradeId: input.bestTradeId != null ? BigInt(input.bestTradeId) : null,
    bestTradeReason: input.bestTradeReason ?? null,
    worstTradeId: input.worstTradeId != null ? BigInt(input.worstTradeId) : null,
    worstTradeReason: input.worstTradeReason ?? null,
    tomorrowImprovement: input.tomorrowImprovement ?? null,
    totalTrades: input.totalTrades ?? null,
    netR: dec(input.netR),
    winCount: input.winCount ?? null,
    lossCount: input.lossCount ?? null,
    planAdherencePct: dec(input.planAdherencePct),
    marketSummary: input.marketSummary ?? null,
    notes: input.notes ?? null,
  };
  const review = await prisma.dailyReview.upsert({
    where: { userId_reviewDate: { userId, reviewDate } },
    create: { userId, reviewDate, ...data },
    update: data,
  });
  return serializeDaily(review);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDaily(r: any) {
  return {
    id: String(r.id),
    reviewDate: r.reviewDate.toISOString().split("T")[0],
    bestTradeId: r.bestTradeId != null ? String(r.bestTradeId) : null,
    bestTradeReason: r.bestTradeReason,
    worstTradeId: r.worstTradeId != null ? String(r.worstTradeId) : null,
    worstTradeReason: r.worstTradeReason,
    tomorrowImprovement: r.tomorrowImprovement,
    totalTrades: r.totalTrades,
    netR: r.netR != null ? Number(r.netR) : null,
    winCount: r.winCount,
    lossCount: r.lossCount,
    planAdherencePct: r.planAdherencePct != null ? Number(r.planAdherencePct) : null,
    marketSummary: r.marketSummary,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
