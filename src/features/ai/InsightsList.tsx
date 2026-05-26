"use client";

import { AlertTriangle, BarChart3, Flag, ListChecks, PieChart, Repeat2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const icons = [AlertTriangle, PieChart, BarChart3, Repeat2, Flag];

type Props = {
  insights: string[];
};

export function InsightsList({ insights }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">分析要点</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <ListChecks className="h-4 w-4" />
            暂无可展示的分析要点
          </div>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = icons[index] ?? ListChecks;
              return (
                <li key={insight} className="flex gap-3 rounded-md border p-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-6">{insight}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
