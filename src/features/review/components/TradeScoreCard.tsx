"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { TradeReview } from "../types";
import { TRADE_GRADE_LABELS, ERROR_TYPE_LABELS, STRATEGY_TYPE_LABELS } from "../types";

const GRADE_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  A: "default",
  B: "secondary",
  C: "destructive",
};

const DIMENSIONS: { key: keyof TradeReview; label: string; max: number }[] = [
  { key: "scoreOpportunity", label: "交易机会", max: 25 },
  { key: "scorePlanning", label: "交易计划", max: 25 },
  { key: "scoreRiskControl", label: "风险控制", max: 20 },
  { key: "scoreDiscipline", label: "执行纪律", max: 20 },
  { key: "scorePsychology", label: "心理状态", max: 10 },
];

export function TradeScoreCard({ review }: { review: TradeReview }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">
          {review.assetName}
          {review.symbol && <span className="ml-1 text-sm text-muted-foreground">({review.symbol})</span>}
        </CardTitle>
        <div className="flex items-center gap-3">
          {review.tradeGrade && (
            <Badge variant={GRADE_VARIANT[review.tradeGrade] ?? "secondary"}>
              {TRADE_GRADE_LABELS[review.tradeGrade] ?? review.tradeGrade}
            </Badge>
          )}
          <span className="text-lg font-semibold">{review.totalScore ?? 0}/100</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {DIMENSIONS.map((d) => {
            const value = (review[d.key] as number | null) ?? 0;
            return (
              <div key={d.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span>
                    {value}/{d.max}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-muted">
                  <div
                    className="h-full rounded bg-primary"
                    style={{ width: `${d.max > 0 ? (value / d.max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm">
          <span>
            R 倍数：
            {review.rMultiple != null ? (
              <span className={review.rMultiple >= 0 ? "text-green-600" : "text-red-600"}>
                {review.rMultiple > 0 ? "+" : ""}
                {review.rMultiple.toFixed(2)}R
              </span>
            ) : (
              "-"
            )}
          </span>
          <span>
            策略：{review.strategyType ? STRATEGY_TYPE_LABELS[review.strategyType] ?? review.strategyType : "-"}
          </span>
          <span>
            错误：
            {review.errorType && review.errorType !== "none"
              ? ERROR_TYPE_LABELS[review.errorType] ?? review.errorType
              : "无"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
