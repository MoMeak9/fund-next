"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { ConcentrationChart } from "@/features/exposure/ConcentrationChart";
import { ExposureCharts } from "@/features/exposure/ExposureCharts";
import { ExposureSummaryCards } from "@/features/exposure/ExposureSummaryCards";
import { ExposureTable } from "@/features/exposure/ExposureTable";
import { FundListPanel } from "@/features/exposure/FundListPanel";
import { FundNavChart } from "@/features/exposure/FundNavChart";
import { HoldingsBarChart } from "@/features/exposure/HoldingsBarChart";
import { HoldingsTrendChart } from "@/features/exposure/HoldingsTrendChart";
import { useFundsExposure, useFundNav } from "@/features/exposure/hooks";

export default function ExposurePage() {
  const { data, isLoading } = useFundsExposure();
  const { data: navData } = useFundNav();

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

  const topHoldingPct =
    data.totalFundValue > 0
      ? (Math.max(...data.holdings.map((h) => h.exposureAmount)) /
          data.totalFundValue) *
        100
      : 0;

  const industryCount = new Set(data.holdings.map((h) => h.industry)).size;

  // Build nav info for fund list
  const navInfo = navData?.funds.map((f) => ({
    symbol: f.symbol,
    latestNav: f.latestNav,
    dailyChangePct: f.dailyChangePct,
    return30d: f.return30d,
    totalReturn: f.totalReturn,
  }));

  return (
    <section className="space-y-6">
      <PageHeader
        title="基金穿透"
        description="查看所有基金底层穿透持仓、净值走势、行业分布和集中度"
      />

      {/* Summary Cards */}
      <ExposureSummaryCards
        totalFundValue={data.totalFundValue}
        totalExposure={data.totalExposure ?? data.totalFundValue}
        holdingsCount={data.holdings.length}
        topHoldingPercentage={topHoldingPct}
        industryCount={industryCount}
        fundCount={data.fundSummary?.length ?? 0}
      />

      {/* Fund NAV Chart - full width */}
      <FundNavChart />

      {/* Holdings Weight Trend Chart */}
      <HoldingsTrendChart />

      {/* Charts + Fund List */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExposureCharts
            industryAllocation={data.industryAllocation}
            marketAllocation={data.marketAllocation}
          />
        </div>
        <div>
          <FundListPanel funds={data.fundSummary ?? []} navInfo={navInfo} />
        </div>
      </div>

      {/* Bar Chart + Concentration */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HoldingsBarChart
          holdings={data.holdings}
          totalFundValue={data.totalFundValue}
        />
        <ConcentrationChart
          holdings={data.holdings}
          totalFundValue={data.totalFundValue}
        />
      </div>

      {/* Holdings Table */}
      <ExposureTable
        holdings={data.holdings}
        totalFundValue={data.totalFundValue}
      />
    </section>
  );
}
