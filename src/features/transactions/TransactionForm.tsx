"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api/client";

import { useCreateTransaction } from "./hooks";

type Asset = { id: string; assetName: string };

export function TransactionForm() {
  const router = useRouter();
  const createMutation = useCreateTransaction();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({
    assetId: "",
    transactionType: "buy",
    quantity: "",
    price: "",
    fee: "",
    transactionTime: new Date().toISOString().slice(0, 16),
    reason: "",
    emotionTag: "",
  });
  const [error, setError] = useState("");

  if (!loaded) {
    apiFetch<Asset[]>("/api/assets").then(setAssets).finally(() => setLoaded(true));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await createMutation.mutateAsync({
        assetId: form.assetId,
        transactionType: form.transactionType,
        quantity: Number(form.quantity),
        price: Number(form.price),
        fee: form.fee ? Number(form.fee) : undefined,
        transactionTime: new Date(form.transactionTime).toISOString(),
        reason: form.reason || undefined,
        emotionTag: form.emotionTag || undefined,
      });
      router.push("/transactions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>关联资产</Label>
        <select className="w-full rounded border px-3 py-2" value={form.assetId} onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))} required>
          <option value="">选择资产</option>
          {assets.map((a) => <option key={a.id} value={a.id}>{a.assetName}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label>交易类型</Label>
        <select className="w-full rounded border px-3 py-2" value={form.transactionType} onChange={(e) => setForm((f) => ({ ...f, transactionType: e.target.value }))}>
          <option value="buy">买入</option>
          <option value="sell">卖出</option>
          <option value="add">加仓</option>
          <option value="reduce">减仓</option>
          <option value="fixed_invest">定投</option>
          <option value="transfer_in">转入</option>
          <option value="transfer_out">转出</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>数量</Label>
        <Input type="number" step="any" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>价格</Label>
        <Input type="number" step="any" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>手续费</Label>
        <Input type="number" step="any" value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>交易时间</Label>
        <Input type="datetime-local" value={form.transactionTime} onChange={(e) => setForm((f) => ({ ...f, transactionTime: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>交易原因</Label>
        <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>情绪标签</Label>
        <Input value={form.emotionTag} onChange={(e) => setForm((f) => ({ ...f, emotionTag: e.target.value }))} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">添加交易</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  );
}
