"use client";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
import { useReportSummary } from "@/features/reports/hooks";
import { SummaryCards } from "@/features/reports/SummaryCards";
import { AllocationChartsLazy } from "@/features/reports/AllocationChartsLazy";

export default function ReportsPage() {
  const { data, isLoading } = useReportSummary();

  if (isLoading) return <PageSkeleton />;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section>
        <PageHeader title="报表" />
        <p className="mt-4 text-muted-foreground">暂无资产数据，请先添加资产。</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader title="报表" />
      <SummaryCards
        totalAssetValue={data.totalAssetValue}
        totalCost={data.totalCost}
        totalProfit={data.totalProfit}
        totalProfitRate={data.totalProfitRate}
      />
      <AllocationChartsLazy
        assetAllocation={data.assetAllocation}
        marketAllocation={data.marketAllocation}
      />
    </section>
  );
}
