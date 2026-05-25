"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useAssets, useDeleteAsset } from "./hooks";

export function AssetTable() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ type?: string; market?: string }>({});
  const { data: assets, isLoading } = useAssets(filters);
  const deleteMutation = useDeleteAsset();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (!assets || assets.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">暂无资产</p>
        <Button className="mt-4" onClick={() => router.push("/assets/new")}>添加第一笔资产</Button>
      </div>
    );
  }

  function handleDelete(id: string) {
    if (confirm("确定删除该资产？")) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <select className="rounded border px-2 py-1 text-sm" value={filters.type ?? ""} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined }))}>
          <option value="">全部类型</option>
          <option value="stock">股票</option>
          <option value="fund">基金</option>
          <option value="crypto">虚拟货币</option>
          <option value="cash">现金</option>
        </select>
        <select className="rounded border px-2 py-1 text-sm" value={filters.market ?? ""} onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value || undefined }))}>
          <option value="">全部市场</option>
          <option value="CN">A股</option>
          <option value="HK">港股</option>
          <option value="US">美股</option>
          <option value="CRYPTO">加密</option>
          <option value="CASH">现金</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>市场</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">当前价</TableHead>
            <TableHead className="text-right">市值</TableHead>
            <TableHead className="text-right">成本</TableHead>
            <TableHead className="text-right">盈亏</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const profit = (asset.marketValue ?? 0) - (asset.costAmount ?? 0);
            return (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.assetName}</TableCell>
                <TableCell>{asset.assetType}</TableCell>
                <TableCell>{asset.market ?? "-"}</TableCell>
                <TableCell className="text-right">{asset.quantity}</TableCell>
                <TableCell className="text-right">{asset.currentPrice ?? "-"}</TableCell>
                <TableCell className="text-right">{asset.marketValue?.toFixed(2) ?? "-"}</TableCell>
                <TableCell className="text-right">{asset.costAmount?.toFixed(2) ?? "-"}</TableCell>
                <TableCell className={`text-right ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>{profit.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/assets/${asset.id}`)}>编辑</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id)}>删除</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}