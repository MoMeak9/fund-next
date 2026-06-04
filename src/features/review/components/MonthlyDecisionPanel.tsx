"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { MonthlyStats } from "../types";
import { STRATEGY_TYPE_LABELS, STRATEGY_STATUS_LABELS } from "../types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  observation: "secondary",
  paused: "secondary",
  retired: "destructive",
};

export function MonthlyDecisionPanel({ data }: { data: MonthlyStats }) {
  if (data.strategies.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">本月暂无策略样本</p>;
  }

  return (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>策略</TableHead>
            <TableHead className="text-right">样本</TableHead>
            <TableHead className="text-right">胜率</TableHead>
            <TableHead className="text-right">期望值</TableHead>
            <TableHead className="text-right">最大回撤</TableHead>
            <TableHead>建议</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.strategies.map((s) => (
            <TableRow key={s.strategyType}>
              <TableCell className="font-medium">{STRATEGY_TYPE_LABELS[s.strategyType] ?? s.strategyType}</TableCell>
              <TableCell className="text-right">{s.sampleCount}</TableCell>
              <TableCell className="text-right">{Math.round(s.winRate * 100)}%</TableCell>
              <TableCell className={`text-right ${s.expectancy >= 0 ? "text-green-600" : "text-red-600"}`}>
                {s.expectancy > 0 ? "+" : ""}{s.expectancy}R
              </TableCell>
              <TableCell className="text-right text-red-600">{s.maxDrawdownR}R</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[s.suggestedStatus] ?? "secondary"}>
                  {STRATEGY_STATUS_LABELS[s.suggestedStatus] ?? s.suggestedStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableWrapper>
  );
}
