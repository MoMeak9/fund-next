"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

import type {
  TradeReview,
  ReviewList,
  ReviewStats,
  ReviewFilters,
  TradePlan,
  PlanList,
  PlanFilters,
  DailyReview,
  IndicatorDashboard,
  WeeklyStats,
  MonthlyStats,
  StrategyStats,
} from "./types";

export function useTradeReviews(filters?: ReviewFilters) {
  const params = new URLSearchParams();
  if (filters?.tradeGrade) params.set("tradeGrade", filters.tradeGrade);
  if (filters?.strategyType) params.set("strategyType", filters.strategyType);
  if (filters?.errorType) params.set("errorType", filters.errorType);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  params.set("page", String(filters?.page ?? 1));
  params.set("pageSize", String(filters?.pageSize ?? 20));

  return useQuery({
    queryKey: ["trade-reviews", filters],
    queryFn: () => apiFetch<ReviewList>(`/api/trade-reviews?${params.toString()}`),
  });
}

export function useTradeReview(id: string | null) {
  return useQuery({
    queryKey: ["trade-reviews", id],
    queryFn: () => apiFetch<TradeReview>(`/api/trade-reviews/${id}`),
    enabled: !!id,
  });
}

// Find-or-create: fetch the review linked to a transaction, or null when none exists yet.
export function useReviewByTransaction(transactionId: string | null) {
  return useQuery({
    queryKey: ["trade-reviews", "by-transaction", transactionId],
    queryFn: () =>
      apiFetch<TradeReview | null>(`/api/trade-reviews/by-transaction/${transactionId}`),
    enabled: !!transactionId,
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["trade-reviews", "stats"],
    queryFn: () => apiFetch<ReviewStats>("/api/trade-reviews/stats"),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<TradeReview>("/api/trade-reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-reviews"] });
      toast({ title: "操作成功", description: "复盘记录创建成功" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: error.message || "请稍后重试",
      });
    },
  });
}

export function useUpdateReview() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiFetch<TradeReview>(`/api/trade-reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-reviews"] });
      toast({ title: "操作成功", description: "复盘记录更新成功" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: error.message || "请稍后重试",
      });
    },
  });
}

// === Phase B: Trade Plans ===

export function useTradePlans(filters?: PlanFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.strategyType) params.set("strategyType", filters.strategyType);
  params.set("page", String(filters?.page ?? 1));
  params.set("pageSize", String(filters?.pageSize ?? 20));

  return useQuery({
    queryKey: ["trade-plans", filters],
    queryFn: () => apiFetch<PlanList>(`/api/trade-plans?${params.toString()}`),
  });
}

export function useTradePlan(id: string | null) {
  return useQuery({
    queryKey: ["trade-plans", id],
    queryFn: () => apiFetch<TradePlan>(`/api/trade-plans/${id}`),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<TradePlan>("/api/trade-plans", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-plans"] });
      toast({ title: "操作成功", description: "交易计划已创建" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "操作失败", description: e.message }),
  });
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<TradePlan>(`/api/trade-plans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-plans"] });
      toast({ title: "操作成功", description: "交易计划已更新" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "操作失败", description: e.message }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/trade-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-plans"] });
      toast({ title: "操作成功", description: "交易计划已删除" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "操作失败", description: e.message }),
  });
}

export function useExecutePlan() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, transactionId }: { id: string; transactionId: string }) =>
      apiFetch<TradePlan>(`/api/trade-plans/${id}/execute`, {
        method: "POST",
        body: JSON.stringify({ transactionId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-plans"] });
      toast({ title: "操作成功", description: "计划已标记为执行" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "操作失败", description: e.message }),
  });
}

// === Phase B: Daily Reviews + Indicator Dashboard ===

export function useDailyReview(date: string | null) {
  return useQuery({
    queryKey: ["daily-reviews", date],
    queryFn: () => apiFetch<DailyReview>(`/api/daily-reviews/${date}`),
    enabled: !!date,
  });
}

export function useDailyReviews(range?: { startDate?: string; endDate?: string }) {
  const params = new URLSearchParams();
  if (range?.startDate) params.set("startDate", range.startDate);
  if (range?.endDate) params.set("endDate", range.endDate);
  return useQuery({
    queryKey: ["daily-reviews", "list", range],
    queryFn: () => apiFetch<DailyReview[]>(`/api/daily-reviews?${params.toString()}`),
  });
}

export function useUpsertDailyReview(date: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<DailyReview>(`/api/daily-reviews/${date}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-reviews"] });
      toast({ title: "操作成功", description: "当日复盘已保存" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "操作失败", description: e.message }),
  });
}

export function useIndicatorDashboard() {
  return useQuery({
    queryKey: ["review-stats", "indicators"],
    queryFn: () => apiFetch<IndicatorDashboard>("/api/review-stats/indicators"),
  });
}

// === Phase C: Weekly / Monthly / Strategy stats ===

export function useWeeklyStats(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["review-stats", "weekly", startDate, endDate],
    queryFn: () =>
      apiFetch<WeeklyStats>(`/api/review-stats/weekly?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!startDate && !!endDate,
  });
}

export function useMonthlyStats(month: string) {
  return useQuery({
    queryKey: ["review-stats", "monthly", month],
    queryFn: () => apiFetch<MonthlyStats>(`/api/review-stats/monthly?month=${month}`),
    enabled: !!month,
  });
}

export function useStrategyStats(range: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ["review-stats", "strategy", range],
    queryFn: () =>
      apiFetch<StrategyStats[]>(
        `/api/review-stats/strategy?startDate=${range.startDate}&endDate=${range.endDate}`,
      ),
    enabled: !!range.startDate && !!range.endDate,
  });
}
