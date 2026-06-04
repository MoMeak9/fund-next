"use client";

import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import { TooltipComponent, LegendComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

echarts.use([BarChart, PieChart, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useChart(option: any, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chart.setOption(option);
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function ReviewBarChart({
  title,
  categories,
  values,
}: {
  title: string;
  categories: string[];
  values: number[];
}) {
  const ref = useChart(
    {
      tooltip: { trigger: "axis" },
      grid: { left: 40, right: 16, top: 24, bottom: 40 },
      xAxis: { type: "category", data: categories, axisLabel: { interval: 0, rotate: categories.length > 5 ? 30 : 0 } },
      yAxis: { type: "value" },
      series: [{ type: "bar", data: values, itemStyle: { color: "#6366f1" } }],
    },
    [categories.join(","), values.join(",")],
  );
  if (categories.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      <div ref={ref} className="h-64 w-full" />
    </div>
  );
}

export function ReviewPieChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  const ref = useChart(
    {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0 },
      series: [{ type: "pie", radius: ["40%", "70%"], data }],
    },
    [JSON.stringify(data)],
  );
  if (data.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      <div ref={ref} className="h-64 w-full" />
    </div>
  );
}
