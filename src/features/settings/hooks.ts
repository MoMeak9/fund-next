"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nickname: string }) =>
      apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiFetch("/api/auth/password", { method: "PUT", body: JSON.stringify(data) }),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
  });
}
