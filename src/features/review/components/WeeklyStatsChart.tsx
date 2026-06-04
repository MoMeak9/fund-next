"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ReviewBarChart, ReviewPieChart } from "./ReviewCharts";
import { RMultipleChart } from "./RMultipleChart";
import type { WeeklyStats } from "../types";
import { STRATEGY_TYPE_LABELS, TRADE_GRADE_LABELS, ERROR_TYPE_LABELS } from "../types";

export function WeeklyStatsChart({ data }: { data: WeeklyStats }) {
  const strategyEntries = Object.entries(data.byStrategy);
  const errorEntries = Object.entries(data.errorDistribution);

  const summary = [
    { label: "交易数", value: String(data.totalTrades) },
    { label: "净 R", value: `${data.netR > 0 ? "+" : ""}${data.netR}` },
    { label: "胜率", value: `${Math.round(data.winRate * 100)}%` },
    { label: "盈亏比", value: data.profitFactor === Infinity ? "∞" : String(data.profitFactor) },
    { label: "期望值", value: `${data.expectancy}R` },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">本周概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {summary.map((s) => (
              <div key={s.label}>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ReviewBarChart
              title="各策略期望值 (R)"
              categories={strategyEntries.map(([k]) => STRATEGY_TYPE_LABELS[k] ?? k)}
              values={strategyEntries.map(([, v]) => v.expectancy)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ReviewPieChart
              title="评级分布"
              data={Object.entries(data.gradeDistribution)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => ({ name: TRADE_GRADE_LABELS[k] ?? k, value: v }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <RMultipleChart distribution={data.rDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <ReviewBarChart
              title="错误类型分布"
              categories={errorEntries.map(([k]) => ERROR_TYPE_LABELS[k] ?? k)}
              values={errorEntries.map(([, v]) => v)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
