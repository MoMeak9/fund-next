import { maxDrawdownR } from "./metrics";

// A minimal review shape the stats functions operate on (decoupled from Prisma rows).
export type StatReview = {
  rMultiple: number | null;
  tradeGrade: string | null;
  strategyType: string | null;
  marketEnvironment: string | null;
  errorType: string | null;
  followedPlan: boolean | null;
};

const STRATEGY_TYPES = ["breakout", "pullback", "reversal", "range", "news", "arbitrage", "experiment"] as const;
const MARKET_ENVS = ["trending", "ranging", "high_volatility", "low_volatility", "news_driven"] as const;
const GRADES = ["A", "B", "C"] as const;
const ERROR_TYPES = [
  "none", "chasing", "stop_delay", "oversize", "early_profit",
  "counter_trend", "emotional", "no_plan", "revenge_trade", "fomo_entry", "news_gamble",
] as const;

function rs(reviews: StatReview[]): number[] {
  return reviews.map((r) => r.rMultiple).filter((r): r is number => r != null);
}

export function calculateWinRate(reviews: StatReview[]): number {
  const r = rs(reviews);
  if (r.length === 0) return 0;
  return r.filter((x) => x > 0).length / r.length;
}

export function calculateExpectancy(reviews: StatReview[]): number {
  const r = rs(reviews).filter((x) => x !== 0);
  if (r.length === 0) return 0;
  const wins = r.filter((x) => x > 0);
  const losses = r.filter((x) => x < 0);
  const winRate = wins.length / r.length;
  const avgWin = wins.length ? wins.reduce((s, x) => s + x, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, x) => s + x, 0) / losses.length) : 0;
  return winRate * avgWin - (1 - winRate) * avgLoss;
}

export function calculateProfitFactor(reviews: StatReview[]): number {
  const r = rs(reviews);
  const gross = r.filter((x) => x > 0).reduce((s, x) => s + x, 0);
  const loss = Math.abs(r.filter((x) => x < 0).reduce((s, x) => s + x, 0));
  if (loss === 0) return gross > 0 ? Infinity : 0;
  return gross / loss;
}

export function rMultipleDistribution(reviews: StatReview[]): { bin: string; count: number }[] {
  const bins = [
    { bin: "<-3R", test: (x: number) => x < -3 },
    { bin: "-3~-2R", test: (x: number) => x >= -3 && x < -2 },
    { bin: "-2~-1R", test: (x: number) => x >= -2 && x < -1 },
    { bin: "-1~0R", test: (x: number) => x >= -1 && x < 0 },
    { bin: "0~+1R", test: (x: number) => x >= 0 && x < 1 },
    { bin: "+1~+2R", test: (x: number) => x >= 1 && x < 2 },
    { bin: "+2~+3R", test: (x: number) => x >= 2 && x < 3 },
    { bin: ">+3R", test: (x: number) => x >= 3 },
  ];
  const r = rs(reviews);
  return bins.map((b) => ({ bin: b.bin, count: r.filter(b.test).length }));
}

// PLACEHOLDER-BUILDERS

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

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

function mini(reviews: StatReview[]): StrategyMiniStats {
  return {
    sampleCount: reviews.length,
    winRate: round2(calculateWinRate(reviews)),
    expectancy: round2(calculateExpectancy(reviews)),
  };
}

export function buildWeeklyStats(reviews: StatReview[]): WeeklyStats {
  const r = rs(reviews);
  const netR = r.reduce((s, x) => s + x, 0);
  const pf = calculateProfitFactor(reviews);

  const byStrategy: Record<string, StrategyMiniStats> = {};
  for (const s of STRATEGY_TYPES) {
    const subset = reviews.filter((x) => x.strategyType === s);
    if (subset.length) byStrategy[s] = mini(subset);
  }
  const byEnvironment: Record<string, StrategyMiniStats> = {};
  for (const e of MARKET_ENVS) {
    const subset = reviews.filter((x) => x.marketEnvironment === e);
    if (subset.length) byEnvironment[e] = mini(subset);
  }
  const gradeDistribution: Record<string, number> = {};
  for (const g of GRADES) gradeDistribution[g] = reviews.filter((x) => x.tradeGrade === g).length;
  const errorDistribution: Record<string, number> = {};
  for (const er of ERROR_TYPES) {
    const c = reviews.filter((x) => x.errorType === er).length;
    if (c) errorDistribution[er] = c;
  }
  const withPlan = reviews.filter((x) => x.followedPlan != null);
  const planAdherenceRate = withPlan.length
    ? round2(withPlan.filter((x) => x.followedPlan).length / withPlan.length)
    : 0;

  return {
    totalTrades: reviews.length,
    netR: round2(netR),
    winRate: round2(calculateWinRate(reviews)),
    profitFactor: pf === Infinity ? Infinity : round2(pf),
    expectancy: round2(calculateExpectancy(reviews)),
    byStrategy,
    byEnvironment,
    gradeDistribution,
    planAdherenceRate,
    errorDistribution,
    rDistribution: rMultipleDistribution(reviews),
  };
}

export type StrategyDecision = {
  strategyType: string;
  sampleCount: number;
  winRate: number;
  expectancy: number;
  maxDrawdownR: number;
  suggestedStatus: "active" | "observation" | "paused" | "retired";
};

export type MonthlyStats = {
  month: string;
  totalTrades: number;
  netR: number;
  strategies: StrategyDecision[];
};

// Suggest a strategy status from sample size, expectancy and win rate.
export function suggestStrategyStatus(s: {
  sampleCount: number;
  expectancy: number;
}): StrategyDecision["suggestedStatus"] {
  if (s.sampleCount < 10) return "observation";
  if (s.expectancy <= -0.3) return "retired";
  if (s.expectancy < 0) return "paused";
  return "active";
}

export function buildMonthlyStats(month: string, reviews: StatReview[]): MonthlyStats {
  const strategies: StrategyDecision[] = [];
  for (const st of STRATEGY_TYPES) {
    const subset = reviews.filter((x) => x.strategyType === st);
    if (!subset.length) continue;
    const expectancy = round2(calculateExpectancy(subset));
    const winRate = round2(calculateWinRate(subset));
    strategies.push({
      strategyType: st,
      sampleCount: subset.length,
      winRate,
      expectancy,
      maxDrawdownR: round2(maxDrawdownR(subset.map((x) => x.rMultiple))),
      suggestedStatus: suggestStrategyStatus({ sampleCount: subset.length, expectancy }),
    });
  }
  return {
    month,
    totalTrades: reviews.length,
    netR: round2(rs(reviews).reduce((s, x) => s + x, 0)),
    strategies,
  };
}
