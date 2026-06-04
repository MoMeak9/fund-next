"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { IndicatorDashboard } from "@/features/review/components/IndicatorDashboard";
import { ReviewStatsCards } from "@/features/review/components/ReviewStatsCards";
import { ReviewTable } from "@/features/review/components/ReviewTable";

export default function ReviewPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="交易复盘"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/review/plans">交易计划</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/review/daily">每日复盘</Link>
            </Button>
            <Button asChild>
              <Link href="/review/new">新建复盘</Link>
            </Button>
          </div>
        }
      />
      <IndicatorDashboard />
      <ReviewStatsCards />
      <ReviewTable />
    </section>
  );
}
