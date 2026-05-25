"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type Asset = {
  id: string;
  assetType: string;
  symbol: string | null;
  assetName: string;
  market: string | null;
  currency: string;
  quantity: number;
  avgCost: number | null;
  currentPrice: number | null;
  costAmount: number | null;
  marketValue: number | null;
  remark: string | null;
  createdAt: string;
};

export function useAssets(filters?: { type?: string; market?: string }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.market) params.set("market", filters.market);
  const qs = params.toString();

  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => apiFetch<Asset[]>(`/api/assets${qs ? `?${qs}` : ""}`),
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ["assets", id],
    queryFn: () => apiFetch<Asset>(`/api/assets/${id}`),
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Asset>("/api/assets", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Asset>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/assets/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}
