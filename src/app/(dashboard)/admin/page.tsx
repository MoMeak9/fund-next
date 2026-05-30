"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { useSystemStatus } from "@/features/admin/hooks";
import { StatusCards } from "@/features/admin/StatusCards";
import { StatsCards } from "@/features/admin/StatsCards";

export default function AdminPage() {
  const { data, isLoading } = useSystemStatus();

  if (isLoading) return <CardGridSkeleton count={4} />;
  if (!data) return <p className="text-muted-foreground">无法获取系统状态</p>;

  return (
    <section className="space-y-6">
      <PageHeader title="管理后台" />
      <StatusCards status={data.status} database={data.database} marketData={data.marketData} />
      <StatsCards stats={data.stats} />
      <p className="text-xs text-muted-foreground">最后更新: {new Date(data.timestamp).toLocaleString()}</p>
    </section>
  );
}
