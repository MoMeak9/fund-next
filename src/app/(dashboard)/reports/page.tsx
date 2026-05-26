"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AllocationCharts } from "@/features/reports/AllocationCharts";
import { SummaryCards } from "@/features/reports/SummaryCards";
import { useReportSummary } from "@/features/reports/hooks";

export default function ReportsPage() {
  const { data, isLoading } = useReportSummary();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section className="py-12 text-center">
        <h1 className="text-2xl font-semibold">报表</h1>
        <p className="mt-3 text-muted-foreground">暂无资产数据</p>
        <Button className="mt-4" asChild>
          <Link href="/assets/new">添加第一笔资产</Link>
        </Button>
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
      <AllocationCharts assetAllocation={data.assetAllocation} marketAllocation={data.marketAllocation} />
    </section>
  );
}
