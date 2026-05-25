"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GoalProgressCard } from "@/features/dashboard/GoalProgressCard";
import { PieChart } from "@/features/dashboard/PieChart";
import { RecentTransactions } from "@/features/dashboard/RecentTransactions";
import { TotalAssetCard } from "@/features/dashboard/TotalAssetCard";
import { useDashboard } from "@/features/dashboard/hooks";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (!data || data.totalAssetValue === 0) {
    return (
      <section className="py-12 text-center">
        <p className="text-muted-foreground">暂无资产数据</p>
        <Button className="mt-4" asChild><Link href="/assets/new">添加第一笔资产</Link></Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <TotalAssetCard
        totalAssetValue={data.totalAssetValue}
        totalCost={data.totalCost}
        totalProfit={data.totalProfit}
        totalProfitRate={data.totalProfitRate}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <PieChart title="资产配置" data={data.assetAllocation} />
        <PieChart title="市场分布" data={data.marketAllocation} />
      </div>
      {data.activeGoal && <GoalProgressCard {...data.activeGoal} />}
      <RecentTransactions transactions={data.recentTransactions} />
    </section>
  );
}
