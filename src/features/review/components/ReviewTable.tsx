"use client";

import { useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTradeReviews } from "../hooks";
import type { ReviewFilters } from "../types";
import {
  TRADE_GRADE_LABELS,
  STRATEGY_TYPE_LABELS,
  ERROR_TYPE_LABELS,
} from "../types";

const GRADE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  A: "default",
  B: "secondary",
  C: "destructive",
};

export function ReviewTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<ReviewFilters, "page" | "pageSize">>({});
  const { data, isLoading } = useTradeReviews({ ...filters, page, pageSize: 20 });

  if (isLoading) return <TableSkeleton cols={6} />;
  if (!data || data.items.length === 0)
    return (
      <p className="py-8 text-center text-muted-foreground">暂无复盘记录</p>
    );

  const totalPages = Math.ceil(data.total / data.pageSize);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          className="rounded border px-2 py-1 text-sm"
          value={filters.tradeGrade ?? ""}
          onChange={(e) => {
            setFilters((f) => ({ ...f, tradeGrade: e.target.value || undefined }));
            setPage(1);
          }}
        >
          <option value="">全部评级</option>
          {Object.entries(TRADE_GRADE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          className="rounded border px-2 py-1 text-sm"
          value={filters.strategyType ?? ""}
          onChange={(e) => {
            setFilters((f) => ({ ...f, strategyType: e.target.value || undefined }));
            setPage(1);
          }}
        >
          <option value="">全部策略</option>
          {Object.entries(STRATEGY_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <select
          className="rounded border px-2 py-1 text-sm"
          value={filters.errorType ?? ""}
          onChange={(e) => {
            setFilters((f) => ({ ...f, errorType: e.target.value || undefined }));
            setPage(1);
          }}
        >
          <option value="">全部错误</option>
          {Object.entries(ERROR_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>资产</TableHead>
              <TableHead>评级</TableHead>
              <TableHead>策略</TableHead>
              <TableHead>错误</TableHead>
              <TableHead className="text-right">R 倍数</TableHead>
              <TableHead className="hidden md:table-cell">按计划</TableHead>
              <TableHead className="hidden md:table-cell">日期</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  {r.assetName}
                  {r.symbol && <span className="ml-1 text-muted-foreground text-xs">({r.symbol})</span>}
                </TableCell>
                <TableCell>
                  {r.tradeGrade ? (
                    <Badge variant={GRADE_VARIANT[r.tradeGrade] ?? "secondary"}>
                      {TRADE_GRADE_LABELS[r.tradeGrade] ?? r.tradeGrade}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {r.strategyType
                    ? STRATEGY_TYPE_LABELS[r.strategyType] ?? r.strategyType
                    : "-"}
                </TableCell>
                <TableCell>
                  {r.errorType && r.errorType !== "none"
                    ? ERROR_TYPE_LABELS[r.errorType] ?? r.errorType
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {r.rMultiple != null ? (
                    <span className={r.rMultiple >= 0 ? "text-green-600" : "text-red-600"}>
                      {r.rMultiple > 0 ? "+" : ""}{r.rMultiple.toFixed(2)}R
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {r.followedPlan != null ? (r.followedPlan ? "✓" : "✗") : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {new Date(r.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/review/${r.id}`}>详情</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableWrapper>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={data.total}
            onPageChange={setPage}
            hasNextPage={page < totalPages}
            hasPrevPage={page > 1}
          />
        </div>
      )}
    </div>
  );
}
