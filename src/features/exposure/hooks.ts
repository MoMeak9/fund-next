"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api/client";

type ExposureData = {
  totalFundValue: number;
  totalExposure: number;
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
  fundSummary: {
    id: string;
    symbol: string;
    name: string;
    marketValue: number;
    percentage: number;
  }[];
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
    queryFn: () =>
      apiFetch<FundDetailData>(`/api/exposure/funds/${fundAssetId}`),
    enabled: !!fundAssetId,
  });
}

type TrendData = {
  dates: string[];
  series: {
    symbol: string;
    name: string;
    data: number[];
  }[];
};

export function useExposureTrend() {
  return useQuery({
    queryKey: ["exposure", "trend"],
    queryFn: () => apiFetch<TrendData>("/api/exposure/trend"),
  });
}

type FundNavItem = {
  id: string;
  symbol: string;
  name: string;
  latestNav: number;
  dailyChange: number;
  dailyChangePct: number;
  totalReturn: number;
  return30d: number;
  maxDrawdown: number;
  navHistory: { date: string; nav: number }[];
};

type NavData = {
  funds: FundNavItem[];
};

export function useFundNav() {
  return useQuery({
    queryKey: ["exposure", "nav"],
    queryFn: () => apiFetch<NavData>("/api/exposure/nav"),
  });
}
