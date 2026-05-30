"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useDeleteTransaction, useTransactions } from "./hooks";

const TYPE_LABELS: Record<string, string> = {
  buy: "买入", sell: "卖出", add: "加仓", reduce: "减仓",
  fixed_invest: "定投", transfer_in: "转入", transfer_out: "转出",
};

export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ type?: string }>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useTransactions({ ...filters, page, pageSize: 20 });
  const deleteMutation = useDeleteTransaction();

  if (isLoading) return <TableSkeleton cols={5} />;
  if (!data || data.items.length === 0) return <p className="py-8 text-center text-muted-foreground">暂无交易记录</p>;

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select className="rounded border px-2 py-1 text-sm" value={filters.type ?? ""} onChange={(e) => { setFilters({ type: e.target.value || undefined }); setPage(1); }}>
          <option value="">全部类型</option>
          <option value="buy">买入</option>
          <option value="sell">卖出</option>
          <option value="add">加仓</option>
          <option value="reduce">减仓</option>
          <option value="fixed_invest">定投</option>
          <option value="transfer_in">转入</option>
          <option value="transfer_out">转出</option>
        </select>
      </div>
      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>资产</TableHead>
              <TableHead>类型</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="hidden sm:table-cell text-right">价格</TableHead>
              <TableHead className="text-right">金额</TableHead>
              <TableHead className="hidden md:table-cell">时间</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{tx.assetName}</TableCell>
                <TableCell>{TYPE_LABELS[tx.transactionType] ?? tx.transactionType}</TableCell>
                <TableCell className="text-right">{tx.quantity}</TableCell>
                <TableCell className="hidden sm:table-cell text-right">{tx.price}</TableCell>
                <TableCell className="text-right">{tx.transactionAmount.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(tx.transactionTime).toLocaleDateString("zh-CN")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(tx.id)}>删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableWrapper>
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={data.total}
        onPageChange={setPage}
        hasNextPage={page < totalPages}
        hasPrevPage={page > 1}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="删除交易"
        description="确定要删除这条交易记录吗？此操作无法撤销。"
        confirmLabel="删除"
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
