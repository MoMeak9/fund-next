"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { summary: string };

export function AnalysisCard({ summary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>资产分析摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
}
