"use client";

import * as echarts from "echarts/core";
import { PieChart as EchartsPie } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

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
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
        {title}
      </h3>
      <div ref={chartRef} className="h-64 w-full" />
    </div>
  );
}

export function ExposureCharts({
  industryAllocation,
  marketAllocation,
}: Props) {
  if (industryAllocation.length === 0 && marketAllocation.length === 0)
    return null;

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <AllocationPie title="行业穿透分布" data={industryAllocation} />
      <AllocationPie title="市场穿透分布" data={marketAllocation} />
    </div>
  );
}
