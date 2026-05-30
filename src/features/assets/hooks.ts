"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Asset>("/api/assets", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast({ title: "操作成功", description: "资产添加成功" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "操作失败", description: error.message || "请稍后重试" });
    },
  });
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Asset>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast({ title: "操作成功", description: "资产更新成功" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "操作失败", description: error.message || "请稍后重试" });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/assets/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assets"] });
      toast({ title: "操作成功", description: "资产删除成功" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "操作失败", description: error.message || "请稍后重试" });
    },
  });
}
