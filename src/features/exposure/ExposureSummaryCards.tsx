"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  TrendingUp,
  BarChart3,
  Layers,
} from "lucide-react";

type Props = {
  totalFundValue: number;
  totalExposure: number;
  holdingsCount: number;
  topHoldingPercentage: number;
  industryCount: number;
  fundCount: number;
};

export function ExposureSummaryCards({
  totalFundValue,
  totalExposure,
  holdingsCount,
  topHoldingPercentage,
  industryCount,
  fundCount,
}: Props) {
  const cards = [
    {
      label: "基金总市值",
      value: `¥${totalFundValue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
      sub: `${fundCount} 只基金`,
      icon: PieChart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "穿透持仓数",
      value: `${holdingsCount} 只`,
      sub: `覆盖 ${industryCount} 个行业`,
      icon: Layers,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "穿透覆盖率",
      value: totalFundValue > 0 ? `${((totalExposure / totalFundValue) * 100).toFixed(1)}%` : "-",
      sub: `穿透金额 ¥${totalExposure.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`,
      icon: BarChart3,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Top 1 集中度",
      value: `${topHoldingPercentage.toFixed(2)}%`,
      sub: topHoldingPercentage > 10 ? "集中度偏高" : "分散良好",
      icon: TrendingUp,
      color: topHoldingPercentage > 10 ? "text-red-600" : "text-emerald-600",
      bgColor: topHoldingPercentage > 10 ? "bg-red-50" : "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </div>
              <div className={`rounded-lg p-2 ${c.bgColor}`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
