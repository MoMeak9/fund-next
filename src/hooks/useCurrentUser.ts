"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type CurrentUser = {
  userId: string;
  email: string;
  nickname: string | null;
};

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiFetch<CurrentUser>("/api/auth/me"),
    retry: false,
  });
}
