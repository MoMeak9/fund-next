"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DailyReviewPanel } from "@/features/review/components/DailyReviewPanel";

export const dynamic = "force-dynamic";

function today() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().split("T")[0];
}

export default function DailyReviewPage() {
  const [date, setDate] = useState(today());

  return (
    <section className="space-y-6">
      <PageHeader title="每日复盘" description="收盘后三个问题：最佳、最差、明天改一个点" />
      <div className="flex items-center gap-2">
        <Label htmlFor="daily-date">日期</Label>
        <Input
          id="daily-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
      </div>
      {date && <DailyReviewPanel date={date} />}
    </section>
  );
}
