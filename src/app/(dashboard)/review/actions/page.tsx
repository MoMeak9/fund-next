"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { ActionItemList } from "@/features/review/components/ActionItemList";
import { useReviewActions } from "@/features/review/hooks";
import { ACTION_STATUS_LABELS } from "@/features/review/types";

export const dynamic = "force-dynamic";

export default function ActionsPage() {
  const [status, setStatus] = useState("");
  const { data, isLoading } = useReviewActions(status || undefined);

  return (
    <section className="space-y-6">
      <PageHeader title="行动项" description="把复盘结论转化为可跟踪的改进动作" />
      <select className="rounded border px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">全部状态</option>
        {Object.entries(ACTION_STATUS_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
      {isLoading ? <CardGridSkeleton count={3} /> : data ? <ActionItemList actions={data} /> : null}
    </section>
  );
}
