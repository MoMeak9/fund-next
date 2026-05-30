"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { insights: string[] };

export function InsightsList({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>分析要点</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-info" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
