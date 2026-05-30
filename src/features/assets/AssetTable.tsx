"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";

import { useAssets, useDeleteAsset } from "./hooks";

export function AssetTable() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ type?: string; market?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: assets, isLoading } = useAssets(filters);
  const deleteMutation = useDeleteAsset();
  const pagination = usePagination(assets ?? []);

  if (isLoading) return <TableSkeleton cols={6} />;

  if (!assets || assets.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">暂无资产</p>
        <Button className="mt-4" onClick={() => router.push("/assets/new")}>添加第一笔资产</Button>
      </div>
    );
  }



  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select className="rounded border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={filters.type ?? ""} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value || undefined }))}>
          <option value="">全部类型</option>
          <option value="stock">股票</option>
          <option value="fund">基金</option>
          <option value="crypto">虚拟货币</option>
          <option value="cash">现金</option>
        </select>
        <select className="rounded border px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={filters.market ?? ""} onChange={(e) => setFilters((f) => ({ ...f, market: e.target.value || undefined }))}>
          <option value="">全部市场</option>
          <option value="CN">A股</option>
          <option value="HK">港股</option>
          <option value="US">美股</option>
          <option value="CRYPTO">加密</option>
          <option value="CASH">现金</option>
        </select>
      </div>
      <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead className="hidden sm:table-cell">类型</TableHead>
            <TableHead className="hidden md:table-cell">市场</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="hidden sm:table-cell text-right">当前价</TableHead>
            <TableHead className="text-right">市值</TableHead>
            <TableHead className="hidden lg:table-cell text-right">成本</TableHead>
            <TableHead className="text-right">盈亏</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagination.items.map((asset) => {
            const profit = (asset.marketValue ?? 0) - (asset.costAmount ?? 0);
            return (
              <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{asset.assetName}</TableCell>
                <TableCell className="hidden sm:table-cell">{asset.assetType}</TableCell>
                <TableCell className="hidden md:table-cell">{asset.market ?? "-"}</TableCell>
                <TableCell className="text-right">{asset.quantity}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{asset.currentPrice ?? "-"}</TableCell>
                <TableCell className="text-right">{asset.marketValue?.toFixed(2) ?? "-"}</TableCell>
                <TableCell className="hidden lg:table-cell text-right">{asset.costAmount?.toFixed(2) ?? "-"}</TableCell>
                <TableCell className={`text-right ${profit >= 0 ? "text-success" : "text-danger"}`}>{profit.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => router.push(`/assets/${asset.id}`)}>编辑</Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(asset.id)}>删除</Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </DataTableWrapper>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        hasNextPage={pagination.hasNextPage}
        hasPrevPage={pagination.hasPrevPage}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="删除资产"
        description="确定要删除这个资产吗？此操作无法撤销。"
        confirmLabel="删除"
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}