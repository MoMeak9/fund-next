"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SystemStatus } from "./hooks";

type Props = {
  stats: SystemStatus["stats"];
};

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatsCard title="用户数" value={stats.userCount} />
      <StatsCard title="资产数" value={stats.assetCount} />
      <StatsCard title="交易数" value={stats.transactionCount} />
    </div>
  );
}

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value.toLocaleString("zh-CN")}</p>
      </CardContent>
    </Card>
  );
}
