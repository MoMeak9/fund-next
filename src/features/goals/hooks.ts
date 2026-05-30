"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

export type GoalAllocation = {
  id: string;
  name: string;
  percentage: number;
  targetAmount: number;
  assets: string | null;
  role: string | null;
  sortOrder: number;
};

type Goal = {
  id: string;
  goalName: string;
  targetAmount: number;
  targetDate: string;
  initialPrincipal: number;
  status: number;
  allocations: GoalAllocation[];
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
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch<Goal>("/api/goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "操作成功", description: "目标保存成功" });
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

export function useDeleteGoal() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<null>(`/api/goals/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "操作成功", description: "目标删除成功" });
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
