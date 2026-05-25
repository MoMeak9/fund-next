"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type Transaction = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string | null;
  transactionType: string;
  quantity: number;
  price: number;
  fee: number;
  currency: string;
  transactionAmount: number;
  transactionTime: string;
  reason: string | null;
  emotionTag: string | null;
  createdAt: string;
};

type TransactionList = {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
};

type Filters = { assetId?: string; type?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number };

export function useTransactions(filters?: Filters) {
  const params = new URLSearchParams();
  if (filters?.assetId) params.set("assetId", filters.assetId);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  params.set("page", String(filters?.page ?? 1));
  params.set("pageSize", String(filters?.pageSize ?? 20));

  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => apiFetch<TransactionList>(`/api/transactions?${params.toString()}`),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["assets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
