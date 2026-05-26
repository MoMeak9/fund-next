"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type CurrentUser = {
  userId: string;
  email: string;
  nickname: string | null;
};

type UpdateProfileInput = {
  nickname: string;
};

type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiFetch<CurrentUser>("/api/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordInput) =>
      apiFetch<null>("/api/auth/password", { method: "PUT", body: JSON.stringify(data) }),
  });
}
