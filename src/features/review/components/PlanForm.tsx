"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreatePlan, useUpdatePlan } from "../hooks";
import type { TradePlan } from "../types";
import { MARKET_ENV_LABELS, STRATEGY_TYPE_LABELS, PLAN_STATUS_LABELS } from "../types";

type Props = {
  plan?: TradePlan;
  onDone?: () => void;
};

// FORM-BODY-PLACEHOLDER

export function PlanForm({ plan, onDone }: Props) {
  const isEdit = !!plan;
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(plan?.id ?? "");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    hypothesis: plan?.hypothesis ?? "",
    marketEnvironment: plan?.marketEnvironment ?? "",
    strategyType: plan?.strategyType ?? "",
    entryTrigger: plan?.entryTrigger ?? "",
    timeframe: plan?.timeframe ?? "",
    entryPrice: plan?.entryPrice != null ? String(plan.entryPrice) : "",
    stopLoss: plan?.stopLoss != null ? String(plan.stopLoss) : "",
    takeProfit: plan?.takeProfit != null ? String(plan.takeProfit) : "",
    positionSize: plan?.positionSize != null ? String(plan.positionSize) : "",
    riskAmount: plan?.riskAmount != null ? String(plan.riskAmount) : "",
    expectedRr: plan?.expectedRr != null ? String(plan.expectedRr) : "",
    invalidation: plan?.invalidation ?? "",
    status: plan?.status ?? "draft",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.hypothesis || !form.marketEnvironment || !form.strategyType || !form.entryTrigger) {
      setError("请填写交易假设、市场环境、策略类型与入场触发");
      return;
    }
    const num = (v: string) => (v.trim() !== "" ? Number(v) : undefined);
    const payload: Record<string, unknown> = {
      hypothesis: form.hypothesis,
      marketEnvironment: form.marketEnvironment,
      strategyType: form.strategyType,
      entryTrigger: form.entryTrigger,
      timeframe: form.timeframe || undefined,
      entryPrice: num(form.entryPrice),
      stopLoss: num(form.stopLoss),
      takeProfit: num(form.takeProfit),
      positionSize: num(form.positionSize),
      riskAmount: num(form.riskAmount),
      expectedRr: num(form.expectedRr),
      invalidation: form.invalidation || undefined,
      status: form.status,
    };
    try {
      if (isEdit) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>交易假设 *</Label>
        <Textarea value={form.hypothesis} onChange={(e) => set("hypothesis", e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>市场环境 *</Label>
          <select className="w-full rounded border px-3 py-2" value={form.marketEnvironment} onChange={(e) => set("marketEnvironment", e.target.value)}>
            <option value="">选择</option>
            {Object.entries(MARKET_ENV_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <Label>策略类型 *</Label>
          <select className="w-full rounded border px-3 py-2" value={form.strategyType} onChange={(e) => set("strategyType", e.target.value)}>
            <option value="">选择</option>
            {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>入场触发 *</Label>
        <Textarea value={form.entryTrigger} onChange={(e) => set("entryTrigger", e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>周期</Label><Input value={form.timeframe} onChange={(e) => set("timeframe", e.target.value)} placeholder="1h/1d" /></div>
        <div className="space-y-2"><Label>入场价</Label><Input type="number" step="0.0001" value={form.entryPrice} onChange={(e) => set("entryPrice", e.target.value)} /></div>
        <div className="space-y-2"><Label>止损</Label><Input type="number" step="0.0001" value={form.stopLoss} onChange={(e) => set("stopLoss", e.target.value)} /></div>
        <div className="space-y-2"><Label>止盈</Label><Input type="number" step="0.0001" value={form.takeProfit} onChange={(e) => set("takeProfit", e.target.value)} /></div>
        <div className="space-y-2"><Label>仓位</Label><Input type="number" step="0.0001" value={form.positionSize} onChange={(e) => set("positionSize", e.target.value)} /></div>
        <div className="space-y-2"><Label>风险金额</Label><Input type="number" step="0.01" value={form.riskAmount} onChange={(e) => set("riskAmount", e.target.value)} /></div>
        <div className="space-y-2"><Label>预期盈亏比</Label><Input type="number" step="0.01" value={form.expectedRr} onChange={(e) => set("expectedRr", e.target.value)} /></div>
        <div className="space-y-2">
          <Label>状态</Label>
          <select className="w-full rounded border px-3 py-2" value={form.status} onChange={(e) => set("status", e.target.value as typeof form.status)}>
            {Object.entries(PLAN_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>失效条件</Label>
        <Textarea value={form.invalidation} onChange={(e) => set("invalidation", e.target.value)} rows={2} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>{isPending ? "提交中..." : isEdit ? "更新计划" : "创建计划"}</Button>
        {onDone && <Button type="button" variant="ghost" onClick={onDone}>取消</Button>}
      </div>
    </form>
  );
}
