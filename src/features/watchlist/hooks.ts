"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

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
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/api/watchlists", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}

export function useRemoveWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/watchlists/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });
}
