"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const AllocationChartsLazy = dynamic(
  () =>
    import("./AllocationCharts").then((mod) => ({
      default: mod.AllocationCharts,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    ),
  }
);
