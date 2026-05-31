"use client";

import {
  createChart,
  type IChartApi,
  type DeepPartial,
  type ChartOptions,
  type SeriesMarker,
  type Time,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
} from "lightweight-charts";
import { useEffect, useRef, useCallback } from "react";

// --- Data Types ---

export type CandlestickData = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SingleValueData = {
  time: string;
  value: number;
  color?: string;
};

export type ChartMarker = SeriesMarker<Time>;

// --- Series Config ---

type CandlestickSeriesConfig = {
  type: "candlestick";
  data: CandlestickData[];
  markers?: ChartMarker[];
  options?: Record<string, unknown>;
};

type LineSeriesConfig = {
  type: "line";
  data: SingleValueData[];
  markers?: ChartMarker[];
  options?: Record<string, unknown>;
};

type AreaSeriesConfig = {
  type: "area";
  data: SingleValueData[];
  markers?: ChartMarker[];
  options?: Record<string, unknown>;
};

type HistogramSeriesConfig = {
  type: "histogram";
  data: SingleValueData[];
  options?: Record<string, unknown>;
};

export type SeriesConfig =
  | CandlestickSeriesConfig
  | LineSeriesConfig
  | AreaSeriesConfig
  | HistogramSeriesConfig;

// --- Component Props ---

export type LightweightChartProps = {
  series: SeriesConfig[];
  chartOptions?: DeepPartial<ChartOptions>;
  className?: string;
  autoResize?: boolean;
};

const SERIES_MAP = {
  candlestick: CandlestickSeries,
  line: LineSeries,
  area: AreaSeries,
  histogram: HistogramSeries,
} as const;

export function LightweightChart({
  series,
  chartOptions,
  className = "h-80 w-full",
  autoResize = true,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    // Dispose previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(var(--foreground))",
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "hsl(var(--border) / 0.5)" },
        horzLines: { color: "hsl(var(--border) / 0.5)" },
      },
      crosshair: { mode: 0 },
      timeScale: { borderColor: "hsl(var(--border))" },
      rightPriceScale: { borderColor: "hsl(var(--border))" },
      ...chartOptions,
    });

    chartRef.current = chart;

    // Add series
    for (const config of series) {
      const SeriesType = SERIES_MAP[config.type];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = chart.addSeries(SeriesType as any, config.options ?? {});
      s.setData(config.data as Parameters<typeof s.setData>[0]);

      if ("markers" in config && config.markers?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (s as any).setMarkers(config.markers);
      }
    }

    chart.timeScale().fitContent();
  }, [series, chartOptions]);

  // Initialize & update
  useEffect(() => {
    initChart();
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  // Auto-resize
  useEffect(() => {
    if (!autoResize || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        const { width, height } = entry.contentRect;
        chartRef.current.applyOptions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoResize]);

  return <div ref={containerRef} className={className} />;
}
