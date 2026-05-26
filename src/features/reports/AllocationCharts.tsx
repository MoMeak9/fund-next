"use client";

import { PieChart } from "@/features/dashboard/PieChart";

type Props = {
  assetAllocation: { key: string; value: number; percentage: number }[];
  marketAllocation: { key: string; value: number; percentage: number }[];
};

export function AllocationCharts({ assetAllocation, marketAllocation }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <PieChart title="资产类型分布" data={assetAllocation} />
      <PieChart title="市场分布" data={marketAllocation} />
    </div>
  );
}
