"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAsset, useCreateAsset, useUpdateAsset } from "./hooks";

type Props = { assetId?: string };

export function AssetForm({ assetId }: Props) {
  const router = useRouter();
  const { data: existing } = useAsset(assetId ?? "");
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset(assetId ?? "");

  const [form, setForm] = useState({
    assetType: "stock",
    symbol: "",
    assetName: "",
    market: "CN",
    currency: "CNY",
    quantity: "",
    avgCost: "",
    currentPrice: "",
    remark: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setForm({
        assetType: existing.assetType,
        symbol: existing.symbol ?? "",
        assetName: existing.assetName,
        market: existing.market ?? "CN",
        currency: existing.currency,
        quantity: existing.quantity.toString(),
        avgCost: existing.avgCost?.toString() ?? "",
        currentPrice: existing.currentPrice?.toString() ?? "",
        remark: existing.remark ?? "",
      });
    }
  }, [existing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const data = {
      assetType: form.assetType,
      symbol: form.symbol || undefined,
      assetName: form.assetName,
      market: form.assetType === "cash" ? "CASH" : form.market,
      currency: form.currency,
      quantity: Number(form.quantity),
      avgCost: form.avgCost ? Number(form.avgCost) : undefined,
      currentPrice: form.currentPrice ? Number(form.currentPrice) : undefined,
      remark: form.remark || undefined,
    };

    try {
      if (assetId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      router.push("/assets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    }
  }

  const isCash = form.assetType === "cash";

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>资产类型</Label>
        <select className="w-full rounded border px-3 py-2" value={form.assetType} onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value }))}>
          <option value="stock">股票</option>
          <option value="fund">基金</option>
          <option value="crypto">虚拟货币</option>
          <option value="cash">现金</option>
        </select>
      </div>
      {!isCash && (
        <>
          <div className="space-y-2">
            <Label>代码</Label>
            <Input value={form.symbol} onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>市场</Label>
            <select className="w-full rounded border px-3 py-2" value={form.market} onChange={(e) => setForm((f) => ({ ...f, market: e.target.value }))}>
              <option value="CN">A股</option>
              <option value="HK">港股</option>
              <option value="US">美股</option>
              <option value="CRYPTO">加密</option>
            </select>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label>名称</Label>
        <Input value={form.assetName} onChange={(e) => setForm((f) => ({ ...f, assetName: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>币种</Label>
        <select className="w-full rounded border px-3 py-2" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
          <option value="CNY">CNY</option>
          <option value="USD">USD</option>
          <option value="HKD">HKD</option>
          <option value="USDT">USDT</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>数量</Label>
        <Input type="number" step="any" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} required />
      </div>
      <div className="space-y-2">
        <Label>平均成本</Label>
        <Input type="number" step="any" value={form.avgCost} onChange={(e) => setForm((f) => ({ ...f, avgCost: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>当前价格</Label>
        <Input type="number" step="any" value={form.currentPrice} onChange={(e) => setForm((f) => ({ ...f, currentPrice: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>备注</Label>
        <Input value={form.remark} onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit">{assetId ? "保存" : "添加"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
      </div>
    </form>
  );
}