"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
};

export function SummaryCards({ totalAssetValue, totalCost, totalProfit, totalProfitRate }: Props) {
  const profitColor = totalProfit >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="总资产" value={formatCurrency(totalAssetValue)} />
      <MetricCard label="总成本" value={formatCurrency(totalCost)} />
      <MetricCard label="总盈亏" value={formatCurrency(totalProfit)} valueClassName={profitColor} />
      <MetricCard label="收益率" value={`${(totalProfitRate * 100).toFixed(2)}%`} valueClassName={profitColor} />
    </div>
  );
}

function MetricCard({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold ${valueClassName ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
