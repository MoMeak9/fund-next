"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type AiAnalysis = {
  summary: string;
  insights: string[];
  riskNotes: string[];
  generatedAt: string;
};

export function useAiAnalysis() {
  return useQuery({
    queryKey: ["ai", "analysis"],
    queryFn: () => apiFetch<AiAnalysis>("/api/ai/analysis"),
  });
}
