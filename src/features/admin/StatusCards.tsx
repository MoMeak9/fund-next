"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  status: "healthy" | "degraded";
  database: { connected: boolean; latencyMs: number };
  marketData: { provider: string; status: "ok" | "error" };
};

function Indicator({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-block h-3 w-3 rounded-full ${ok ? "bg-success" : "bg-danger"}`} />
  );
}

export function StatusCards({ status, database, marketData }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">系统状态</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={status === "healthy"} />
          <span className="font-semibold">{status === "healthy" ? "正常" : "异常"}</span>
        </CardContent>
      </Card>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">数据库</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={database.connected} />
          <span>{database.connected ? `${database.latencyMs}ms` : "断开"}</span>
        </CardContent>
      </Card>
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">行情服务</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Indicator ok={marketData.status === "ok"} />
          <span>{marketData.provider}</span>
        </CardContent>
      </Card>
    </div>
  );
}
