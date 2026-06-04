"use client";

import { ReviewBarChart } from "./ReviewCharts";
import type { StrategyStats } from "../types";
import { STRATEGY_TYPE_LABELS } from "../types";

export function StrategyComparison({ stats }: { stats: StrategyStats[] }) {
  const withData = stats.filter((s) => s.sampleCount > 0);
  return (
    <ReviewBarChart
      title="各策略期望值 (R)"
      categories={withData.map((s) => STRATEGY_TYPE_LABELS[s.strategyType] ?? s.strategyType)}
      values={withData.map((s) => s.expectancy ?? 0)}
    />
  );
}
