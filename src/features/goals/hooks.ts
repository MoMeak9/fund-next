"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type Goal = {
  id: string;
  goalName: string;
  targetAmount: number;
  targetDate: string;
  initialPrincipal: number;
  status: number;
};

type ActiveGoal = Goal & {
  currentPrincipal: number;
  completionRate: number;
  rawRate: number;
  remainingAmount: number;
  monthlyRequired: number;
};

export function useActiveGoal() {
  return useQuery({
    queryKey: ["goals", "active"],
    queryFn: () => apiFetch<ActiveGoal | null>("/api/goals/active"),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Goal>("/api/goals", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<null>(`/api/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}
