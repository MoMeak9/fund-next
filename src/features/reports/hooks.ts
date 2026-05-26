"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type ReportSummary = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
  assetAllocation: { key: string; value: number; percentage: number }[];
  marketAllocation: { key: string; value: number; percentage: number }[];
};

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => apiFetch<ReportSummary>("/api/reports/summary"),
  });
}
