"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { nickname: string }) =>
      apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "操作成功", description: "个人信息更新成功" });
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

export function useUpdatePassword() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiFetch("/api/auth/password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({ title: "操作成功", description: "密码修改成功" });
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

export function useLogout() {
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
  });
}
