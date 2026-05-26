"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  summary: string;
  generatedAt: string;
};

export function AnalysisCard({ summary, generatedAt }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">组合分析</CardTitle>
            <CardDescription>生成时间 {new Date(generatedAt).toLocaleString("zh-CN")}</CardDescription>
          </div>
          <Badge variant="secondary">规则模板</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
