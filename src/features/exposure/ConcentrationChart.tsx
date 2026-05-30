"use client";

import * as echarts from "echarts/core";
import { LineChart as EchartsLine } from "echarts/charts";
import {
  TooltipComponent,
  GridComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

echarts.use([EchartsLine, TooltipComponent, GridComponent, MarkLineComponent, CanvasRenderer]);

type Holding = {
  holdingName: string;
  exposureAmount: number;
};

type Props = {
  holdings: Holding[];
  totalFundValue: number;
};

/**
 * Cumulative concentration curve - shows how much of total exposure
 * is concentrated in the top N holdings (similar to Lorenz curve).
 */
export function ConcentrationChart({ holdings, totalFundValue }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const sorted = [...holdings].sort((a, b) => b.exposureAmount - a.exposureAmount);
  const totalExposure = sorted.reduce((s, h) => s + h.exposureAmount, 0);

  useEffect(() => {
    if (!chartRef.current || sorted.length === 0) return;

    // Build cumulative data
    let cumulative = 0;
    const data = sorted.map((h, idx) => {
      cumulative += h.exposureAmount;
      return {
        name: h.holdingName,
        index: idx + 1,
        cumulativePct: totalExposure > 0 ? (cumulative / totalExposure) * 100 : 0,
      };
    });

    const chart = echarts.init(chartRef.current);
    chart.setOption({
      tooltip: {
        trigger: "axis",
        formatter: (params: { data: [number, number]; name: string }[]) => {
          const p = params[0];
          const item = data[p.data[0] - 1];
          return `前 ${item.index} 只持仓<br/>累计占比: ${item.cumulativePct.toFixed(1)}%<br/>最后一只: ${item.name}`;
        },
      },
      grid: { left: 50, right: 30, top: 30, bottom: 40 },
      xAxis: {
        type: "value",
        name: "持仓排名",
        nameLocation: "center",
        nameGap: 25,
        min: 1,
        max: sorted.length,
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "累计占比 %",
        max: 100,
        axisLabel: {
          formatter: "{value}%",
          fontSize: 11,
        },
      },
      series: [
        {
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          data: data.map((d) => [d.index, Math.round(d.cumulativePct * 10) / 10]),
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(99, 102, 241, 0.3)" },
              { offset: 1, color: "rgba(99, 102, 241, 0.02)" },
            ]),
          },
          lineStyle: { color: "#6366f1", width: 2 },
          itemStyle: { color: "#6366f1" },
          markLine: {
            silent: true,
            data: [{ yAxis: 80, label: { formatter: "80%", fontSize: 10 } }],
            lineStyle: { type: "dashed", color: "#f59e0b" },
          },
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [sorted, totalExposure]);

  if (sorted.length === 0) return null;

  // Find how many holdings cover 80%
  let cum = 0;
  let count80 = 0;
  for (const h of sorted) {
    cum += h.exposureAmount;
    count80++;
    if (totalExposure > 0 && cum / totalExposure >= 0.8) break;
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">持仓集中度曲线</CardTitle>
          <span className="text-xs text-muted-foreground">
            前 {count80} 只覆盖 80%
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div ref={chartRef} className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}
