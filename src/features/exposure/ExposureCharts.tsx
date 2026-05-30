"use client";

import * as echarts from "echarts/core";
import { PieChart as EchartsPie } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

echarts.use([EchartsPie, TooltipComponent, LegendComponent, CanvasRenderer]);

type AllocationItem = { key: string; amount: number; percentage: number };

type Props = {
  industryAllocation: AllocationItem[];
  marketAllocation: AllocationItem[];
};

function AllocationPie({
  title,
  data,
}: {
  title: string;
  data: AllocationItem[];
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}: ¥{c} ({d}%)" },
      legend: { bottom: 0, type: "scroll" },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          label: { show: false },
          emphasis: {
            label: { show: true, fontWeight: "bold" },
          },
          data: data.map((d) => ({
            name: d.key,
            value: Math.round(d.amount * 100) / 100,
          })),
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div ref={chartRef} className="h-64 w-full" />
        <div className="mt-2 space-y-1">
          {data.slice(0, 5).map((d) => (
            <div
              key={d.key}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground truncate max-w-[120px]">
                {d.key}
              </span>
              <span className="font-medium">
                {(d.percentage * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ExposureCharts({
  industryAllocation,
  marketAllocation,
}: Props) {
  if (industryAllocation.length === 0 && marketAllocation.length === 0)
    return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <AllocationPie title="行业穿透分布" data={industryAllocation} />
      <AllocationPie title="市场穿透分布" data={marketAllocation} />
    </div>
  );
}
