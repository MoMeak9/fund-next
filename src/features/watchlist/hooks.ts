"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

type WatchlistItem = {
  id: string;
  symbol: string;
  assetName: string;
  assetType: string;
  market: string;
  currency: string;
  quote: { price: number; priceTime: string } | null;
};

type SearchResult = {
  symbol: string;
  assetName: string;
  assetType: string;
  market: string;
  currency: string;
};

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () => apiFetch<{ items: WatchlistItem[] }>("/api/watchlists").then((r) => r.items),
  });
}

export function useSearchAssets(keyword: string) {
  return useQuery({
    queryKey: ["market-data", "search", keyword],
    queryFn: () => apiFetch<SearchResult[]>(`/api/market-data/search?keyword=${encodeURIComponent(keyword)}`),
    enabled: keyword.length >= 1,
  });
}

export function useAddWatchlist() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/api/watchlists", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "操作成功", description: "已添加到自选" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "操作失败", description: error.message || "请稍后重试" });
    },
  });
}

export function useRemoveWatchlist() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/watchlists/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "操作成功", description: "已从自选移除" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "操作失败", description: error.message || "请稍后重试" });
    },
  });
}
