import { describe, expect, it } from "vitest";

import {
  calculateWinRate,
  calculateExpectancy,
  calculateProfitFactor,
  rMultipleDistribution,
  buildWeeklyStats,
  buildMonthlyStats,
  suggestStrategyStatus,
  type StatReview,
} from "@/services/trade-review/stats";

function mk(partial: Partial<StatReview>): StatReview {
  return {
    rMultiple: null,
    tradeGrade: null,
    strategyType: null,
    marketEnvironment: null,
    errorType: null,
    followedPlan: null,
    ...partial,
  };
}

describe("trade-review stats helpers", () => {
  it("calculateWinRate counts positive R over all non-null R", () => {
    const reviews = [mk({ rMultiple: 2 }), mk({ rMultiple: -1 }), mk({ rMultiple: 1 }), mk({ rMultiple: null })];
    expect(calculateWinRate(reviews)).toBeCloseTo(2 / 3, 6);
    expect(calculateWinRate([])).toBe(0);
  });

  it("calculateExpectancy = winRate*avgWin - (1-winRate)*avgLoss", () => {
    // wins: 2,4 (avg 3); losses: -1,-1 (avg 1); winRate 0.5 -> 0.5*3 - 0.5*1 = 1
    const reviews = [mk({ rMultiple: 2 }), mk({ rMultiple: 4 }), mk({ rMultiple: -1 }), mk({ rMultiple: -1 })];
    expect(calculateExpectancy(reviews)).toBeCloseTo(1, 6);
    expect(calculateExpectancy([])).toBe(0);
  });

  it("calculateProfitFactor = gross win / gross loss, Infinity when no losses", () => {
    expect(calculateProfitFactor([mk({ rMultiple: 2 }), mk({ rMultiple: -1 })])).toBeCloseTo(2, 6);
    expect(calculateProfitFactor([mk({ rMultiple: 2 })])).toBe(Infinity);
  });

  it("rMultipleDistribution buckets correctly", () => {
    const reviews = [mk({ rMultiple: -3.5 }), mk({ rMultiple: -0.5 }), mk({ rMultiple: 0.5 }), mk({ rMultiple: 3.2 })];
    const dist = rMultipleDistribution(reviews);
    expect(dist.find((d) => d.bin === "<-3R")!.count).toBe(1);
    expect(dist.find((d) => d.bin === "-1~0R")!.count).toBe(1);
    expect(dist.find((d) => d.bin === "0~+1R")!.count).toBe(1);
    expect(dist.find((d) => d.bin === ">+3R")!.count).toBe(1);
  });

  it("buildWeeklyStats aggregates totals, breakdowns and distributions", () => {
    const reviews = [
      mk({ rMultiple: 2, tradeGrade: "A", strategyType: "breakout", marketEnvironment: "trending", followedPlan: true, errorType: "none" }),
      mk({ rMultiple: -1, tradeGrade: "C", strategyType: "breakout", marketEnvironment: "ranging", followedPlan: false, errorType: "chasing" }),
    ];
    const w = buildWeeklyStats(reviews);
    expect(w.totalTrades).toBe(2);
    expect(w.netR).toBeCloseTo(1, 6);
    expect(w.winRate).toBeCloseTo(0.5, 6);
    expect(w.byStrategy.breakout.sampleCount).toBe(2);
    expect(w.gradeDistribution.A).toBe(1);
    expect(w.errorDistribution.chasing).toBe(1);
    expect(w.planAdherenceRate).toBeCloseTo(0.5, 6);
  });

  it("buildMonthlyStats produces per-strategy decisions with suggestedStatus", () => {
    const reviews = Array.from({ length: 12 }, (_, i) =>
      mk({ rMultiple: i % 2 === 0 ? 2 : -1, strategyType: "pullback" }),
    );
    const m = buildMonthlyStats("2026-01", reviews);
    expect(m.strategies).toHaveLength(1);
    expect(m.strategies[0].strategyType).toBe("pullback");
    expect(m.strategies[0].sampleCount).toBe(12);
    expect(m.strategies[0].suggestedStatus).toBe("active"); // 12 samples, positive expectancy
  });

  it("suggestStrategyStatus thresholds", () => {
    expect(suggestStrategyStatus({ sampleCount: 5, expectancy: 1 })).toBe("observation");
    expect(suggestStrategyStatus({ sampleCount: 20, expectancy: -0.5 })).toBe("retired");
    expect(suggestStrategyStatus({ sampleCount: 20, expectancy: -0.1 })).toBe("paused");
    expect(suggestStrategyStatus({ sampleCount: 20, expectancy: 0.5 })).toBe("active");
  });
});
