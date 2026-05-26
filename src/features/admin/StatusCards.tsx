"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { SystemStatus } from "./hooks";

type Props = {
  status: SystemStatus;
};

export function StatusCards({ status }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatusCard
        title="系统状态"
        healthy={status.status === "healthy"}
        value={status.status === "healthy" ? "Healthy" : "Degraded"}
        detail={`更新时间 ${new Date(status.timestamp).toLocaleString("zh-CN")}`}
      />
      <StatusCard
        title="数据库"
        healthy={status.database.connected}
        value={status.database.connected ? "Connected" : "Disconnected"}
        detail={`延迟 ${status.database.latencyMs}ms`}
      />
      <StatusCard
        title="行情服务"
        healthy={status.marketData.status === "ok"}
        value={status.marketData.status === "ok" ? "OK" : "Error"}
        detail={`Provider: ${status.marketData.provider}`}
      />
    </div>
  );
}

function StatusCard({ title, healthy, value, detail }: { title: string; healthy: boolean; value: string; detail: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Badge variant={healthy ? "secondary" : "destructive"}>{healthy ? "正常" : "异常"}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${healthy ? "bg-green-500" : "bg-red-500"}`} />
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
