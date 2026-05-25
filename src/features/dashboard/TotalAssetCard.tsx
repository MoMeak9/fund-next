"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
};

export function TotalAssetCard({ totalAssetValue, totalCost, totalProfit, totalProfitRate }: Props) {
  const profitColor = totalProfit >= 0 ? "text-green-600" : "text-red-600";

  return (
    <Card>
      <CardHeader><CardTitle>总资产</CardTitle></CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">¥{totalAssetValue.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</p>
        <div className="mt-2 flex gap-4 text-sm">
          <span>成本: ¥{totalCost.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</span>
          <span className={profitColor}>盈亏: ¥{totalProfit.toFixed(2)} ({(totalProfitRate * 100).toFixed(2)}%)</span>
        </div>
      </CardContent>
    </Card>
  );
}
