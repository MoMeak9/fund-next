"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type SystemStatus = {
  status: "healthy" | "degraded";
  timestamp: string;
  database: { connected: boolean; latencyMs: number };
  marketData: { provider: string; status: "ok" | "error" };
  stats: { userCount: number; assetCount: number; transactionCount: number };
};

export function useSystemStatus() {
  return useQuery({
    queryKey: ["admin", "status"],
    queryFn: () => apiFetch<SystemStatus>("/api/admin/status"),
    refetchInterval: 30000,
  });
}
