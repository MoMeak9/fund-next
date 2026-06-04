"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartSkeleton } from "@/components/ui/loading-skeleton";
import { WeeklyStatsChart } from "@/features/review/components/WeeklyStatsChart";
import { useWeeklyStats } from "@/features/review/hooks";

export const dynamic = "force-dynamic";

// Monday of the current week as YYYY-MM-DD.
function weekStart(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split("T")[0];
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function WeeklyReviewPage() {
  const [start, setStart] = useState(weekStart());
  const end = addDays(start, 6);
  const { data, isLoading } = useWeeklyStats(start, end);

  return (
    <section className="space-y-6">
      <PageHeader title="周复盘" description="按周统计交易表现与策略分布" />
      <div className="flex items-center gap-2">
        <Label htmlFor="week-start">周起始</Label>
        <Input id="week-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-auto" />
        <span className="text-sm text-muted-foreground">~ {end}</span>
      </div>
      {isLoading ? <ChartSkeleton /> : data ? <WeeklyStatsChart data={data} /> : null}
    </section>
  );
}
