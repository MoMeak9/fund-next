"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const LightweightChartLazy = dynamic(
  () =>
    import("./LightweightChart").then((mod) => ({
      default: mod.LightweightChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-80 w-full rounded-lg" />,
  },
);

export type {
  LightweightChartProps,
  SeriesConfig,
  CandlestickData,
  SingleValueData,
  ChartMarker,
} from "./LightweightChart";
