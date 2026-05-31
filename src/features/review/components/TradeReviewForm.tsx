"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";

import { useCreateReview, useUpdateReview } from "../hooks";
import type { TradeReview } from "../types";
import {
  TRADE_GRADE_LABELS,
  STRATEGY_TYPE_LABELS,
  ERROR_TYPE_LABELS,
  MARKET_ENV_LABELS,
} from "../types";

type Transaction = {
  id: string;
  assetName: string;
  symbol: string | null;
  transactionType: string;
  transactionTime: string;
  price: number;
  quantity: number;
};

type TransactionList = {
  items: Transaction[];
  total: number;
};

type Props = {
  review?: TradeReview;
  transactionId?: string;
};

export function TradeReviewForm({ review, transactionId }: Props) {
  const router = useRouter();
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const isEdit = !!review;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    transactionId: review?.transactionId ?? transactionId ?? "",
    followedPlan: review?.followedPlan ?? true,
    tradeGrade: review?.tradeGrade ?? "",
    strategyType: review?.strategyType ?? "",
    errorType: review?.errorType ?? "none",
    marketEnvironment: review?.marketEnvironment ?? "",
    rMultiple: review?.rMultiple != null ? String(review.rMultiple) : "",
    notes: review?.notes ?? "",
  });

  if (!loaded) {
    apiFetch<TransactionList>("/api/transactions?pageSize=100")
      .then((res) => setTransactions(res.items))
      .finally(() => setLoaded(true));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload: Record<string, unknown> = {
      transactionId: form.transactionId || undefined,
      followedPlan: form.followedPlan,
      tradeGrade: form.tradeGrade || undefined,
      strategyType: form.strategyType || undefined,
      errorType: form.errorType || undefined,
      marketEnvironment: form.marketEnvironment || undefined,
      rMultiple: form.rMultiple ? Number(form.rMultiple) : undefined,
      notes: form.notes || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: review.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {/* 关联交易 */}
      {!isEdit && (
        <div className="space-y-2">
          <Label>关联交易</Label>
          <select
            className="w-full rounded border px-3 py-2"
            value={form.transactionId}
            onChange={(e) => setForm((f) => ({ ...f, transactionId: e.target.value }))}
            required
          >
            <option value="">选择交易</option>
            {transactions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.assetName} - {t.transactionType === "buy" ? "买入" : "卖出"} {t.quantity}@{t.price} ({new Date(t.transactionTime).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 是否按计划执行 */}
      <div className="space-y-2">
        <Label>是否按计划执行</Label>
        <select
          className="w-full rounded border px-3 py-2"
          value={form.followedPlan ? "yes" : "no"}
          onChange={(e) => setForm((f) => ({ ...f, followedPlan: e.target.value === "yes" }))}
        >
          <option value="yes">是</option>
          <option value="no">否</option>
        </select>
      </div>

      {/* 交易评级 */}
      <div className="space-y-2">
        <Label>交易评级</Label>
        <select
          className="w-full rounded border px-3 py-2"
          value={form.tradeGrade}
          onChange={(e) => setForm((f) => ({ ...f, tradeGrade: e.target.value }))}
        >
          <option value="">选择评级</option>
          {Object.entries(TRADE_GRADE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 策略类型 */}
      <div className="space-y-2">
        <Label>策略类型</Label>
        <select
          className="w-full rounded border px-3 py-2"
          value={form.strategyType}
          onChange={(e) => setForm((f) => ({ ...f, strategyType: e.target.value }))}
        >
          <option value="">选择策略</option>
          {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 错误类型 */}
      <div className="space-y-2">
        <Label>错误类型</Label>
        <select
          className="w-full rounded border px-3 py-2"
          value={form.errorType}
          onChange={(e) => setForm((f) => ({ ...f, errorType: e.target.value }))}
        >
          {Object.entries(ERROR_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 市场环境 */}
      <div className="space-y-2">
        <Label>市场环境</Label>
        <select
          className="w-full rounded border px-3 py-2"
          value={form.marketEnvironment}
          onChange={(e) => setForm((f) => ({ ...f, marketEnvironment: e.target.value }))}
        >
          <option value="">选择市场环境</option>
          {Object.entries(MARKET_ENV_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* R 倍数 */}
      <div className="space-y-2">
        <Label>R 倍数</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="如 2.5 表示盈利 2.5R，-1 表示亏损 1R"
          value={form.rMultiple}
          onChange={(e) => setForm((f) => ({ ...f, rMultiple: e.target.value }))}
        />
      </div>

      {/* 笔记 */}
      <div className="space-y-2">
        <Label>复盘笔记</Label>
        <Textarea
          placeholder="记录交易反思、可改进的地方..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "提交中..." : isEdit ? "更新复盘" : "创建复盘"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}
