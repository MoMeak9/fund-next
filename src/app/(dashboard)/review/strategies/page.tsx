"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartSkeleton } from "@/components/ui/loading-skeleton";
import { StrategyComparison } from "@/features/review/components/StrategyComparison";
import { useStrategyStats } from "@/features/review/hooks";

export const dynamic = "force-dynamic";

function ymd(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split("T")[0];
}

function yearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return ymd(d);
}

export default function StrategiesPage() {
  const [startDate, setStartDate] = useState(yearAgo());
  const [endDate, setEndDate] = useState(ymd(new Date()));
  const { data, isLoading } = useStrategyStats({ startDate, endDate });

  return (
    <section className="space-y-6">
      <PageHeader title="策略分析" description="对比各策略在所选区间内的期望值" />
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="s-start">开始</Label>
        <Input id="s-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
        <Label htmlFor="s-end">结束</Label>
        <Input id="s-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
      </div>
      {isLoading ? (
        <ChartSkeleton />
      ) : data ? (
        <Card>
          <CardContent className="pt-6">
            <StrategyComparison stats={data} />
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
