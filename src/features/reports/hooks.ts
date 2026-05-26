"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

export type AssetAllocationItem = {
  assetType: string;
  value: number;
  percentage: number;
};

export type MarketAllocationItem = {
  market: string;
  value: number;
  percentage: number;
};

export type ReportSummary = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
  assetAllocation: AssetAllocationItem[];
  marketAllocation: MarketAllocationItem[];
};

export function useReportSummary() {
  return useQuery({
    queryKey: ["reports", "summary"],
    queryFn: () => apiFetch<ReportSummary>("/api/reports/summary"),
  });
}
