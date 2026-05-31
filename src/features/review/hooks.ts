"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

import type { TradeReview, ReviewList, ReviewStats, ReviewFilters } from "./types";

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
