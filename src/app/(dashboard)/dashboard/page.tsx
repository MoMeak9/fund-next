"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/ui/loading-skeleton";
import { GoalProgressCard } from "@/features/dashboard/GoalProgressCard";
import { PieChartLazy } from "@/features/dashboard/PieChartLazy";
import { RecentTransactions } from "@/features/dashboard/RecentTransactions";
import { TotalAssetCard } from "@/features/dashboard/TotalAssetCard";
import { useDashboard } from "@/features/dashboard/hooks";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <PageSkeleton />;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section className="py-12 text-center">
        <p className="text-muted-foreground">暂无资产数据</p>
        <Button className="mt-4" asChild>
          <Link href="/assets/new">添加第一笔资产</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <PageHeader title="Dashboard" />
      <TotalAssetCard
        totalAssetValue={data.totalAssetValue}
        totalCost={data.totalCost}
        totalProfit={data.totalProfit}
        totalProfitRate={data.totalProfitRate}
      />
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <PieChartLazy title="资产配置" data={data.assetAllocation} />
        <PieChartLazy title="市场分布" data={data.marketAllocation} />
      </div>
      {data.activeGoal && <GoalProgressCard {...data.activeGoal} />}
      <RecentTransactions transactions={data.recentTransactions} />
    </section>
  );
}
