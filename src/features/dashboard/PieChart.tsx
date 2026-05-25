"use client";

import * as echarts from "echarts/core";
import { PieChart as EchartsPie } from "echarts/charts";
import { TooltipComponent, LegendComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

echarts.use([EchartsPie, TooltipComponent, LegendComponent, CanvasRenderer]);

type Props = {
  title: string;
  data: { key: string; value: number; percentage: number }[];
};

export function PieChart({ title, data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}: {d}%" },
      legend: { bottom: 0 },
      series: [{
        type: "pie",
        radius: ["40%", "70%"],
        data: data.map((d) => ({ name: d.key, value: d.value })),
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); chart.dispose(); };
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      <div ref={chartRef} className="h-64 w-full" />
    </div>
  );
}
