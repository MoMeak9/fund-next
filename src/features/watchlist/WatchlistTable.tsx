"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useRemoveWatchlist, useWatchlist } from "./hooks";

export function WatchlistTable() {
  const { data: items, isLoading } = useWatchlist();
  const removeMutation = useRemoveWatchlist();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;
  if (!items || items.length === 0) return <p className="py-8 text-center text-muted-foreground">暂无自选资产</p>;

  return (
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
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.assetName}</TableCell>
            <TableCell>{item.symbol}</TableCell>
            <TableCell>{item.assetType}</TableCell>
            <TableCell>{item.market}</TableCell>
            <TableCell className="text-right">{item.quote?.price ?? "-"}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate(item.id)}>移除</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
