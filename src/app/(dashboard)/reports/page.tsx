"use client";

import { useReportSummary } from "@/features/reports/hooks";
import { SummaryCards } from "@/features/reports/SummaryCards";
import { AllocationCharts } from "@/features/reports/AllocationCharts";

export default function ReportsPage() {
  const { data, isLoading } = useReportSummary();

  if (isLoading) return <p className="text-muted-foreground">加载中...</p>;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section>
        <h1 className="text-2xl font-semibold">报表</h1>
        <p className="mt-4 text-muted-foreground">暂无资产数据，请先添加资产。</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">报表</h1>
      <SummaryCards
        totalAssetValue={data.totalAssetValue}
        totalCost={data.totalCost}
        totalProfit={data.totalProfit}
        totalProfitRate={data.totalProfitRate}
      />
      <AllocationCharts
        assetAllocation={data.assetAllocation}
        marketAllocation={data.marketAllocation}
      />
    </section>
  );
}
