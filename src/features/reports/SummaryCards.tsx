"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
};

export function SummaryCards({ totalAssetValue, totalCost, totalProfit, totalProfitRate }: Props) {
  const cards = [
    { title: "总资产", value: `¥${totalAssetValue.toLocaleString()}` },
    { title: "总成本", value: `¥${totalCost.toLocaleString()}` },
    { title: "总盈亏", value: `¥${totalProfit.toLocaleString()}`, color: totalProfit >= 0 ? "text-success" : "text-danger" },
    { title: "收益率", value: `${(totalProfitRate * 100).toFixed(2)}%`, color: totalProfitRate >= 0 ? "text-success" : "text-danger" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${card.color ?? ""}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
