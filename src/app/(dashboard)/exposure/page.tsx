"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { ExposureCharts } from "@/features/exposure/ExposureCharts";
import { ExposureTable } from "@/features/exposure/ExposureTable";
import { useFundsExposure } from "@/features/exposure/hooks";

export default function ExposurePage() {
  const { data, isLoading } = useFundsExposure();

  if (isLoading) return <TableSkeleton cols={5} />;

  if (!data || data.holdings.length === 0) {
    return (
      <section>
        <PageHeader title="基金穿透" />
        <p className="text-muted-foreground">
          暂无基金资产或穿透数据。添加基金资产后可查看底层持仓。
        </p>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="基金穿透"
        description={`基金总市值: ¥${data.totalFundValue.toLocaleString()}`}
      />
      <ExposureCharts
        industryAllocation={data.industryAllocation}
        marketAllocation={data.marketAllocation}
      />
      <ExposureTable
        holdings={data.holdings}
        totalFundValue={data.totalFundValue}
      />
    </section>
  );
}
