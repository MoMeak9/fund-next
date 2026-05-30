"use client";

import * as echarts from "echarts/core";
import { LineChart as EchartsLine } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFundNav } from "./hooks";

echarts.use([
  EchartsLine,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export function FundNavChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { data } = useFundNav();

  useEffect(() => {
    if (!chartRef.current || !data || data.funds.length === 0) return;

    const chart = echarts.init(chartRef.current);

    // Normalize to percentage change from first day
    const allDates = new Set<string>();
    for (const f of data.funds) {
      for (const d of f.navHistory) allDates.add(d.date);
    }
    const dates = Array.from(allDates).sort();

    const series = data.funds.map((f, idx) => {
      const navMap = new Map(f.navHistory.map((d) => [d.date, d.nav]));
      const firstNav = f.navHistory[0]?.nav ?? 1;

      return {
        name: f.name,
        type: "line" as const,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 2, color: COLORS[idx % COLORS.length] },
        itemStyle: { color: COLORS[idx % COLORS.length] },
        data: dates.map((d) => {
          const nav = navMap.get(d);
          if (nav === undefined) return null;
          return Math.round(((nav - firstNav) / firstNav) * 10000) / 100;
        }),
      };
    });

    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (
          params: { seriesName: string; value: number | null; color: string }[],
        ) => {
          const valid = params.filter((p) => p.value !== null);
          if (valid.length === 0) return "";
          let html = `<div style="font-size:12px">`;
          for (const p of valid) {
            const sign = (p.value ?? 0) >= 0 ? "+" : "";
            html += `<div style="display:flex;align-items:center;gap:4px;margin:2px 0">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
              <span>${p.seriesName}: ${sign}${(p.value ?? 0).toFixed(2)}%</span>
            </div>`;
          }
          html += "</div>";
          return html;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: { left: 50, right: 20, top: 20, bottom: 60 },
      dataZoom: [
        {
          type: "inside",
          start: 60,
          end: 100,
        },
        {
          type: "slider",
          height: 20,
          bottom: 25,
          start: 60,
          end: 100,
          borderColor: "transparent",
          backgroundColor: "#f1f5f9",
          fillerColor: "rgba(99,102,241,0.15)",
          handleStyle: { color: "#6366f1" },
        },
      ],
      xAxis: {
        type: "category",
        data: dates.map((d) => d.slice(5)), // MM-DD
        axisLabel: { fontSize: 10, interval: "auto" },
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        axisLabel: { formatter: "{value}%", fontSize: 11 },
        splitLine: { lineStyle: { type: "dashed", color: "#e2e8f0" } },
      },
      series,
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  if (!data || data.funds.length === 0) return null;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            基金净值走势（归一化）
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            拖动下方滑块缩放时间范围
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div ref={chartRef} className="h-[320px] w-full" />
        {/* Performance metrics */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.funds.map((f, idx) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{f.name}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                  <span>
                    净值{" "}
                    <span className="font-medium">
                      {f.latestNav.toFixed(4)}
                    </span>
                  </span>
                  <span
                    className={
                      f.dailyChangePct >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    日涨跌 {f.dailyChangePct >= 0 ? "+" : ""}
                    {(f.dailyChangePct * 100).toFixed(2)}%
                  </span>
                  <span
                    className={
                      f.return30d >= 0 ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    近30日 {f.return30d >= 0 ? "+" : ""}
                    {(f.return30d * 100).toFixed(2)}%
                  </span>
                  <span
                    className={
                      f.totalReturn >= 0 ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    总收益 {f.totalReturn >= 0 ? "+" : ""}
                    {(f.totalReturn * 100).toFixed(2)}%
                  </span>
                  <span className="text-red-600">
                    最大回撤 -{(f.maxDrawdown * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              <Badge
                variant={f.dailyChangePct >= 0 ? "default" : "destructive"}
                className="shrink-0 text-xs"
              >
                {f.dailyChangePct >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(f.dailyChange).toFixed(4)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
