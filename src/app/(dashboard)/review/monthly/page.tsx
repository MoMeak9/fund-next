"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { MonthlyDecisionPanel } from "@/features/review/components/MonthlyDecisionPanel";
import { useMonthlyStats } from "@/features/review/hooks";

export const dynamic = "force-dynamic";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlyReviewPage() {
  const [month, setMonth] = useState(currentMonth());
  const { data, isLoading } = useMonthlyStats(month);

  return (
    <section className="space-y-6">
      <PageHeader title="月复盘" description="按月评估各策略表现并给出去留建议" />
      <div className="flex items-center gap-2">
        <Label htmlFor="month">月份</Label>
        <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />
      </div>
      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : data ? (
        <>
          <div className="flex gap-6 text-sm">
            <span>交易数：<strong>{data.totalTrades}</strong></span>
            <span>净 R：<strong className={data.netR >= 0 ? "text-green-600" : "text-red-600"}>{data.netR > 0 ? "+" : ""}{data.netR}</strong></span>
          </div>
          <MonthlyDecisionPanel data={data} />
        </>
      ) : null}
    </section>
  );
}
