"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ReviewBarChart } from "./ReviewCharts";
import type { ErrorTracking } from "../types";
import { ERROR_TYPE_LABELS } from "../types";

export function ErrorHeatmap({ stats }: { stats: ErrorTracking[] }) {
  const ranked = [...stats].filter((s) => s.errorType !== "none").sort((a, b) => b.occurrenceCount - a.occurrenceCount);

  if (ranked.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">暂无错误记录</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <ReviewBarChart
            title="错误频次"
            categories={ranked.map((s) => ERROR_TYPE_LABELS[s.errorType] ?? s.errorType)}
            values={ranked.map((s) => s.occurrenceCount)}
          />
        </CardContent>
      </Card>
      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>错误类型</TableHead>
              <TableHead className="text-right">出现次数</TableHead>
              <TableHead className="text-right">累计亏损 (R)</TableHead>
              <TableHead className="hidden md:table-cell">预防规则</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ranked.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{ERROR_TYPE_LABELS[s.errorType] ?? s.errorType}</TableCell>
                <TableCell className="text-right">{s.occurrenceCount}</TableCell>
                <TableCell className="text-right text-red-600">{s.totalLossR}R</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {s.preventionRule ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableWrapper>
    </div>
  );
}
