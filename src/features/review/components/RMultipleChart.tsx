"use client";

import { ReviewBarChart } from "./ReviewCharts";

export function RMultipleChart({ distribution }: { distribution: { bin: string; count: number }[] }) {
  return (
    <ReviewBarChart
      title="R 倍数分布"
      categories={distribution.map((d) => d.bin)}
      values={distribution.map((d) => d.count)}
    />
  );
}
