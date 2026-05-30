"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

type FundItem = {
  id: string;
  symbol: string;
  name: string;
  marketValue: number;
  percentage: number;
};

type NavInfo = {
  symbol: string;
  latestNav: number;
  dailyChangePct: number;
  return30d: number;
  totalReturn: number;
};

type Props = {
  funds: FundItem[];
  navInfo?: NavInfo[];
};

export function FundListPanel({ funds, navInfo }: Props) {
  if (funds.length === 0) return null;

  const navMap = new Map(navInfo?.map((n) => [n.symbol, n]));

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">持有基金明细</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {funds.map((f) => {
          const nav = navMap.get(f.symbol);
          return (
            <Link
              key={f.id}
              href={`/exposure/${f.id}`}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{f.name}</span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {f.symbol}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span>
                    市值 ¥
                    {f.marketValue.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <span>·</span>
                  <span>占比 {(f.percentage * 100).toFixed(1)}%</span>
                  {nav && (
                    <>
                      <span>·</span>
                      <span>净值 {nav.latestNav.toFixed(4)}</span>
                      <span>·</span>
                      <span
                        className={
                          nav.dailyChangePct >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {nav.dailyChangePct >= 0 ? "+" : ""}
                        {(nav.dailyChangePct * 100).toFixed(2)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {nav &&
                  (nav.dailyChangePct >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  ))}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
