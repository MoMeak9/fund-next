"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useReviewStats } from "../hooks";

export function ReviewStatsCards() {
  const { data, isLoading } = useReviewStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "计划执行率",
      value: `${data.planAdherenceRate}%`,
      description: "按计划执行的比例",
    },
    {
      title: "平均 R 倍数",
      value: data.avgR >= 0 ? `+${data.avgR.toFixed(2)}R` : `${data.avgR.toFixed(2)}R`,
      description: "平均盈亏比",
      color: data.avgR >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "A 级交易占比",
      value: `${data.aGradeRate}%`,
      description: "优秀交易的比例",
    },
    {
      title: "错误成本",
      value: `${data.errorCostR.toFixed(2)}R`,
      description: "因错误损失的 R 值",
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {s.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${s.color ?? ""}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
