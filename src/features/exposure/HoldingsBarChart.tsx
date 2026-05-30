"use client";

import * as echarts from "echarts/core";
import { BarChart as EchartsBar } from "echarts/charts";
import { TooltipComponent, GridComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

echarts.use([EchartsBar, TooltipComponent, GridComponent, CanvasRenderer]);

type Holding = {
  holdingName: string;
  holdingSymbol: string;
  exposureAmount: number;
};

type Props = {
  holdings: Holding[];
  totalFundValue: number;
};

export function HoldingsBarChart({ holdings, totalFundValue }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const top = [...holdings]
    .sort((a, b) => b.exposureAmount - a.exposureAmount)
    .slice(0, 15);

  useEffect(() => {
    if (!chartRef.current || top.length === 0) return;

    const chart = echarts.init(chartRef.current);
    const reversed = [...top].reverse();

    chart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0];
          const pct =
            totalFundValue > 0
              ? ((p.value / totalFundValue) * 100).toFixed(2)
              : "0";
          return `${p.name}<br/>穿透金额: ¥${p.value.toFixed(2)}<br/>占比: ${pct}%`;
        },
      },
      grid: { left: 100, right: 40, top: 10, bottom: 20 },
      xAxis: {
        type: "value",
        axisLabel: {
          formatter: (v: number) => `¥${(v / 1000).toFixed(0)}k`,
        },
      },
      yAxis: {
        type: "category",
        data: reversed.map((h) => h.holdingName),
        axisLabel: { fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          data: reversed.map((h) => h.exposureAmount),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: "#6366f1" },
              { offset: 1, color: "#818cf8" },
            ]),
          },
          barMaxWidth: 20,
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [top, totalFundValue]);

  if (top.length === 0) return null;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top 持仓体量对比</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div ref={chartRef} className="h-[360px] w-full" />
      </CardContent>
    </Card>
  );
}
