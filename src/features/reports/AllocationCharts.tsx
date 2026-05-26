"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/features/dashboard/PieChart";

import type { AssetAllocationItem, MarketAllocationItem } from "./hooks";

type Props = {
  assetAllocation: AssetAllocationItem[];
  marketAllocation: MarketAllocationItem[];
};

export function AllocationCharts({ assetAllocation, marketAllocation }: Props) {
  const assetChartData = assetAllocation.map(({ assetType, value, percentage }) => ({
    key: assetType,
    value,
    percentage,
  }));
  const marketChartData = marketAllocation.map(({ market, value, percentage }) => ({
    key: market,
    value,
    percentage,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="资产类型分布">
        <PieChart title="资产类型分布" data={assetChartData} />
      </ChartCard>
      <ChartCard title="市场分布">
        <PieChart title="市场分布" data={marketChartData} />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
