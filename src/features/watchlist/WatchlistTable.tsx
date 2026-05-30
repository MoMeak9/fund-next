"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/hooks/usePagination";

import { useRemoveWatchlist, useWatchlist } from "./hooks";

export function WatchlistTable() {
  const { data: items, isLoading } = useWatchlist();
  const removeMutation = useRemoveWatchlist();
  const [removeId, setRemoveId] = useState<string | null>(null);
  const pagination = usePagination(items ?? []);

  if (isLoading) return <TableSkeleton cols={4} />;
  if (!items || items.length === 0) return <p className="py-8 text-center text-muted-foreground">暂无自选资产</p>;

  return (
    <>
      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>代码</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>市场</TableHead>
              <TableHead className="text-right">最新价</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.items.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{item.assetName}</TableCell>
                <TableCell>{item.symbol}</TableCell>
                <TableCell>{item.assetType}</TableCell>
                <TableCell>{item.market}</TableCell>
                <TableCell className="text-right">{item.quote?.price ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setRemoveId(item.id)}>移除</Button>
                </TableCell>
              </TableRow>
            ))}
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
        open={!!removeId}
        onOpenChange={(open) => !open && setRemoveId(null)}
        title="移除自选"
        description="确定要将这个资产从自选列表中移除吗？"
        confirmLabel="移除"
        onConfirm={() => removeMutation.mutate(removeId!)}
        loading={removeMutation.isPending}
      />
    </>
  );
}
