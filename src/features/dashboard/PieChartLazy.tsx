"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const PieChartLazy = dynamic(
  () => import("./PieChart").then((mod) => ({ default: mod.PieChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);
