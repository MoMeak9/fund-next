"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";

import { useIndicatorDashboard } from "../hooks";

function fmtR(v: number) {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}R`;
}

export function IndicatorDashboard() {
  const { data, isLoading } = useIndicatorDashboard();

  if (isLoading) return <CardGridSkeleton count={5} />;
  if (!data) return null;

  const cards = [
    { title: "按计划率", value: `${data.planAdherenceRate}%` },
    { title: "平均 R", value: fmtR(data.avgRMultiple), tone: data.avgRMultiple >= 0 ? "text-green-600" : "text-red-600" },
    { title: "A 级占比", value: `${data.gradeAPercentage}%` },
    { title: "最大回撤", value: fmtR(data.maxDrawdownR), tone: "text-red-600" },
    { title: "错误成本", value: fmtR(data.errorCostR), tone: "text-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${c.tone ?? ""}`}>{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
