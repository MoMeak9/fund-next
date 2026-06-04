"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useDailyReview, useUpsertDailyReview, useCreateAction } from "../hooks";

export function DailyReviewPanel({ date }: { date: string }) {
  const { data: existing } = useDailyReview(date);
  const mutation = useUpsertDailyReview(date);
  const createAction = useCreateAction();

  const [form, setForm] = useState({
    bestTradeReason: "",
    worstTradeReason: "",
    tomorrowImprovement: "",
    marketSummary: "",
    notes: "",
  });

  // Sync once the saved review loads.
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  if (existing && hydratedFor !== date) {
    setForm({
      bestTradeReason: existing.bestTradeReason ?? "",
      worstTradeReason: existing.worstTradeReason ?? "",
      tomorrowImprovement: existing.tomorrowImprovement ?? "",
      marketSummary: existing.marketSummary ?? "",
      notes: existing.notes ?? "",
    });
    setHydratedFor(date);
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      bestTradeReason: form.bestTradeReason || undefined,
      worstTradeReason: form.worstTradeReason || undefined,
      tomorrowImprovement: form.tomorrowImprovement || undefined,
      marketSummary: form.marketSummary || undefined,
      notes: form.notes || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{date} 每日复盘</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>今日最佳交易（原因）</Label>
            <Textarea value={form.bestTradeReason} onChange={(e) => set("bestTradeReason", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>今日最差交易（原因）</Label>
            <Textarea value={form.worstTradeReason} onChange={(e) => set("worstTradeReason", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>明天只改一个点</Label>
            <Input value={form.tomorrowImprovement} onChange={(e) => set("tomorrowImprovement", e.target.value)} />
            {form.tomorrowImprovement && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={createAction.isPending}
                onClick={() =>
                  createAction.mutate({
                    sourceType: "daily_review",
                    problem: form.tomorrowImprovement,
                    rule: form.tomorrowImprovement,
                  })
                }
              >
                生成行动项
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label>市场总结</Label>
            <Textarea value={form.marketSummary} onChange={(e) => set("marketSummary", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>备注</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "保存中..." : "保存当日复盘"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
