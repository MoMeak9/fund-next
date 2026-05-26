"use client";

import { StatsCards } from "@/features/admin/StatsCards";
import { StatusCards } from "@/features/admin/StatusCards";
import { useSystemStatus } from "@/features/admin/hooks";

export default function AdminPage() {
  const { data, isLoading } = useSystemStatus();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (!data) return <p className="py-8 text-center text-muted-foreground">暂无系统状态</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">管理后台</h1>
      <StatusCards status={data} />
      <StatsCards stats={data.stats} />
    </section>
  );
}
