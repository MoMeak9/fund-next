"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useDeleteTransaction, useTransactions } from "./hooks";

const TYPE_LABELS: Record<string, string> = {
  buy: "买入", sell: "卖出", add: "加仓", reduce: "减仓",
  fixed_invest: "定投", transfer_in: "转入", transfer_out: "转出",
};

export function TransactionTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ type?: string }>({});
  const { data, isLoading } = useTransactions({ ...filters, page, pageSize: 20 });
  const deleteMutation = useDeleteTransaction();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;
  if (!data || data.items.length === 0) return <p className="py-8 text-center text-muted-foreground">暂无交易记录</p>;

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div>
      <div className="mb-4">
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>资产</TableHead>
            <TableHead>类型</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">价格</TableHead>
            <TableHead className="text-right">金额</TableHead>
            <TableHead>时间</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{tx.assetName}</TableCell>
              <TableCell>{TYPE_LABELS[tx.transactionType] ?? tx.transactionType}</TableCell>
              <TableCell className="text-right">{tx.quantity}</TableCell>
              <TableCell className="text-right">{tx.price}</TableCell>
              <TableCell className="text-right">{tx.transactionAmount.toFixed(2)}</TableCell>
              <TableCell>{new Date(tx.transactionTime).toLocaleDateString("zh-CN")}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => { if (confirm("确定删除？")) deleteMutation.mutate(tx.id); }}>删除</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</Button>
        </div>
      )}
    </div>
  );
}
