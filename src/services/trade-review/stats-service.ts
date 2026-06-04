import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import {
  buildWeeklyStats,
  buildMonthlyStats,
  calculateWinRate,
  calculateExpectancy,
  calculateProfitFactor,
  type StatReview,
} from "./stats";
import { maxConsecutiveLoss, maxDrawdownR } from "./metrics";

const STRATEGY_TYPES = ["breakout", "pullback", "reversal", "range", "news", "arbitrage", "experiment"] as const;
const MARKET_ENVS = ["trending", "ranging", "high_volatility", "low_volatility", "news_driven"] as const;

const REVIEW_SELECT = {
  rMultiple: true,
  tradeGrade: true,
  strategyType: true,
  marketEnvironment: true,
  errorType: true,
  followedPlan: true,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStatReview(r: any): StatReview {
  return {
    rMultiple: r.rMultiple != null ? Number(r.rMultiple) : null,
    tradeGrade: r.tradeGrade,
    strategyType: r.strategyType,
    marketEnvironment: r.marketEnvironment,
    errorType: r.errorType,
    followedPlan: r.followedPlan,
  };
}

async function loadReviews(userId: bigint, start: Date, end: Date): Promise<StatReview[]> {
  const rows = await prisma.tradeReview.findMany({
    where: { userId, includeInSample: true, createdAt: { gte: start, lte: end } },
    select: REVIEW_SELECT,
  });
  return rows.map(toStatReview);
}

export async function calculateWeeklyStats(userId: bigint, startDate: string, endDate: string) {
  const reviews = await loadReviews(userId, new Date(startDate), new Date(endDate));
  return buildWeeklyStats(reviews);
}

export async function calculateMonthlyStats(userId: bigint, month: string) {
  // month = "YYYY-MM"
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59));
  const reviews = await loadReviews(userId, start, end);
  return buildMonthlyStats(month, reviews);
}

function bestWorstEnvironment(reviews: StatReview[]): { best: string | null; worst: string | null } {
  let best: string | null = null;
  let worst: string | null = null;
  let bestExp = -Infinity;
  let worstExp = Infinity;
  for (const env of MARKET_ENVS) {
    const subset = reviews.filter((r) => r.marketEnvironment === env);
    if (!subset.length) continue;
    const exp = calculateExpectancy(subset);
    if (exp > bestExp) { bestExp = exp; best = env; }
    if (exp < worstExp) { worstExp = exp; worst = env; }
  }
  return { best, worst };
}

// Compute + persist per-strategy stats for a period. strategyType omitted = all strategies.
export async function calculateStrategyStats(
  userId: bigint,
  range: { startDate: string; endDate: string },
  strategyType?: string,
) {
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const all = await loadReviews(userId, start, end);
  const targets = strategyType ? [strategyType] : [...STRATEGY_TYPES];

  const results = [];
  for (const st of targets) {
    const subset = all.filter((r) => r.strategyType === st);
    const rSeries = subset.map((r) => r.rMultiple);
    const wins = subset.filter((r) => r.rMultiple != null && r.rMultiple > 0);
    const losses = subset.filter((r) => r.rMultiple != null && r.rMultiple < 0);
    const env = bestWorstEnvironment(subset);

    const avgWinR = wins.length ? wins.reduce((s, r) => s + (r.rMultiple ?? 0), 0) / wins.length : null;
    const avgLossR = losses.length ? losses.reduce((s, r) => s + (r.rMultiple ?? 0), 0) / losses.length : null;
    const pf = calculateProfitFactor(subset);

    const data = {
      sampleCount: subset.length,
      winCount: wins.length,
      lossCount: losses.length,
      winRate: subset.length ? new Decimal(calculateWinRate(subset)) : null,
      avgWinR: avgWinR != null ? new Decimal(avgWinR) : null,
      avgLossR: avgLossR != null ? new Decimal(avgLossR) : null,
      expectancy: subset.length ? new Decimal(calculateExpectancy(subset)) : null,
      profitFactor: Number.isFinite(pf) ? new Decimal(pf) : null,
      maxConsecutiveLoss: maxConsecutiveLoss(rSeries),
      maxDrawdownR: new Decimal(maxDrawdownR(rSeries)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bestEnvironment: env.best as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      worstEnvironment: env.worst as any,
    };

    const saved = await prisma.strategyStats.upsert({
      where: {
        userId_strategyType_periodStart_periodEnd: {
          userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          strategyType: st as any,
          periodStart: start,
          periodEnd: end,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { userId, strategyType: st as any, periodStart: start, periodEnd: end, ...data },
      update: data,
    });
    results.push(serializeStrategyStats(saved));
  }
  return results;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeStrategyStats(s: any) {
  return {
    id: String(s.id),
    strategyType: s.strategyType,
    periodStart: s.periodStart.toISOString().split("T")[0],
    periodEnd: s.periodEnd.toISOString().split("T")[0],
    sampleCount: s.sampleCount,
    winCount: s.winCount,
    lossCount: s.lossCount,
    winRate: s.winRate != null ? Number(s.winRate) : null,
    avgWinR: s.avgWinR != null ? Number(s.avgWinR) : null,
    avgLossR: s.avgLossR != null ? Number(s.avgLossR) : null,
    expectancy: s.expectancy != null ? Number(s.expectancy) : null,
    profitFactor: s.profitFactor != null ? Number(s.profitFactor) : null,
    maxConsecutiveLoss: s.maxConsecutiveLoss,
    maxDrawdownR: s.maxDrawdownR != null ? Number(s.maxDrawdownR) : null,
    bestEnvironment: s.bestEnvironment,
    worstEnvironment: s.worstEnvironment,
    status: s.status,
    statusReason: s.statusReason,
  };
}
