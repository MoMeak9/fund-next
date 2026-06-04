"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ChartSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorHeatmap } from "@/features/review/components/ErrorHeatmap";
import { useErrorStats } from "@/features/review/hooks";

export const dynamic = "force-dynamic";

export default function ErrorsPage() {
  const { data, isLoading } = useErrorStats();

  return (
    <section className="space-y-6">
      <PageHeader title="错误追踪" description="高频错误与累计成本，逐项制定预防规则" />
      {isLoading ? <ChartSkeleton /> : data ? <ErrorHeatmap stats={data} /> : null}
    </section>
  );
}
