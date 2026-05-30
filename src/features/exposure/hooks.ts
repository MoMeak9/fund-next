"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type ExposureData = {
  totalFundValue: number;
  holdings: {
    holdingSymbol: string;
    holdingName: string;
    holdingMarket: string;
    industry: string;
    exposureAmount: number;
    sourceFundSymbols: string[];
  }[];
  industryAllocation: { key: string; amount: number; percentage: number }[];
  marketAllocation: { key: string; amount: number; percentage: number }[];
};

type FundDetailData = {
  fundName: string;
  holdings: {
    holdingSymbol: string;
    holdingName: string;
    holdingMarket: string;
    industry: string;
    weight: number;
    exposureAmount: number;
  }[];
};

export function useFundsExposure() {
  return useQuery({
    queryKey: ["exposure", "funds"],
    queryFn: () => apiFetch<ExposureData>("/api/exposure/funds"),
  });
}

export function useFundExposureDetail(fundAssetId: string) {
  return useQuery({
    queryKey: ["exposure", "fund", fundAssetId],
    queryFn: () => apiFetch<FundDetailData>(`/api/exposure/funds/${fundAssetId}`),
    enabled: !!fundAssetId,
  });
}
