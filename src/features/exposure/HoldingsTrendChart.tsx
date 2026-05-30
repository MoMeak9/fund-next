"use client";

import * as echarts from "echarts/core";
import { LineChart as EchartsLine } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExposureTrend } from "./hooks";

echarts.use([EchartsLine, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

export function HoldingsTrendChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { data } = useExposureTrend();

  useEffect(() => {
    if (!chartRef.current || !data || data.dates.length === 0) return;

    const chart = echarts.init(chartRef.current);

    const formatDate = (d: string) => {
      const parts = d.split("-");
      return `${parts[0].slice(2)}/${parts[1]}`;
    };

    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: { seriesName: string; value: number; color: string }[]) => {
          let html = `<div style="font-size:12px">`;
          for (const p of params) {
            html += `<div style="display:flex;align-items:center;gap:4px;margin:2px 0">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
              <span>${p.seriesName}: ${p.value}%</span>
            </div>`;
          }
          html += "</div>";
          return html;
        },
      },
      legend: {
        bottom: 0,
        type: "scroll",
        textStyle: { fontSize: 11 },
      },
      grid: { left: 45, right: 20, top: 20, bottom: 40 },
      xAxis: {
        type: "category",
        data: data.dates.map(formatDate),
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}%", fontSize: 11 },
      },
      series: data.series.map((s, idx) => ({
        name: s.name,
        type: "line",
        data: s.data,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2, color: COLORS[idx % COLORS.length] },
        itemStyle: { color: COLORS[idx % COLORS.length] },
      })),
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  if (!data || data.dates.length < 2) return null;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">持仓权重走势</CardTitle>
          <span className="text-xs text-muted-foreground">
            近 {data.dates.length} 期报告
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div ref={chartRef} className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}
