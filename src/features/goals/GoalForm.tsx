"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateGoal } from "./hooks";

export function GoalForm() {
  const createMutation = useCreateGoal();
  const [form, setForm] = useState({ goalName: "", targetAmount: "", targetDate: "", initialPrincipal: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await createMutation.mutateAsync({
        goalName: form.goalName,
        targetAmount: Number(form.targetAmount),
        targetDate: form.targetDate,
        initialPrincipal: form.initialPrincipal ? Number(form.initialPrincipal) : undefined,
      });
      setForm({ goalName: "", targetAmount: "", targetDate: "", initialPrincipal: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>目标名称</Label>
        <Input value={form.goalName} onChange={(e) => setForm((f) => ({ ...f, goalName: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>目标金额</Label>
        <Input type="number" step="any" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>目标日期</Label>
        <Input type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>起始本金（可选）</Label>
        <Input type="number" step="any" value={form.initialPrincipal} onChange={(e) => setForm((f) => ({ ...f, initialPrincipal: e.target.value }))} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        创建目标
      </Button>
    </form>
  );
}
