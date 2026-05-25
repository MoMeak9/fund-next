"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type DashboardData = {
  totalAssetValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
  assetAllocation: { key: string; value: number; percentage: number }[];
  marketAllocation: { key: string; value: number; percentage: number }[];
  recentTransactions: { id: string; assetName: string; transactionType: string; quantity: number; price: number; transactionTime: string }[];
  activeGoal: { goalName: string; targetAmount: number; completionRate: number; remainingAmount: number; monthlyRequired: number } | null;
};

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiFetch<DashboardData>("/api/dashboard"),
  });
}
