"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanForm } from "@/features/review/components/PlanForm";
import { useTradePlans, useDeletePlan } from "@/features/review/hooks";
import type { TradePlan } from "@/features/review/types";
import { PLAN_STATUS_LABELS, STRATEGY_TYPE_LABELS } from "@/features/review/types";

export const dynamic = "force-dynamic";

export default function PlansPage() {
  const [status, setStatus] = useState<string>("");
  const { data, isLoading } = useTradePlans({ status: (status || undefined) as TradePlan["status"] | undefined });
  const del = useDeletePlan();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TradePlan | undefined>();

  function openCreate() {
    setEditing(undefined);
    setOpen(true);
  }
  function openEdit(plan: TradePlan) {
    setEditing(plan);
    setOpen(true);
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="交易计划"
        description="先有计划，再有交易"
        actions={<Button onClick={openCreate}>新建计划</Button>}
      />

      <div className="flex gap-3">
        <select className="rounded border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">全部状态</option>
          {Object.entries(PLAN_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : !data || data.items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">暂无交易计划</p>
      ) : (
        <DataTableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>假设</TableHead>
                <TableHead>策略</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="hidden md:table-cell">入场/止损</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-xs truncate font-medium">{p.hypothesis}</TableCell>
                  <TableCell>{STRATEGY_TYPE_LABELS[p.strategyType] ?? p.strategyType}</TableCell>
                  <TableCell><Badge variant="secondary">{PLAN_STATUS_LABELS[p.status] ?? p.status}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {p.entryPrice ?? "-"} / {p.stopLoss ?? "-"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>编辑</Button>
                    <Button variant="ghost" size="sm" onClick={() => del.mutate(p.id)}>删除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableWrapper>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑交易计划" : "新建交易计划"}</DialogTitle>
          </DialogHeader>
          <PlanForm plan={editing} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
