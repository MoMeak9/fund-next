"use client";

import { AlertTriangle } from "lucide-react";

import { AnalysisCard } from "@/features/ai/AnalysisCard";
import { InsightsList } from "@/features/ai/InsightsList";
import { RiskDisclaimer } from "@/features/ai/RiskDisclaimer";
import { useAiAnalysis } from "@/features/ai/hooks";

export default function AiPage() {
  const { data, isError, isLoading } = useAiAnalysis();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (isError || !data) {
    return <div className="py-8 text-center text-muted-foreground">分析数据加载失败，请稍后重试</div>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI 分析</h1>
        <p className="mt-2 text-sm text-muted-foreground">基于您录入的资产、交易和目标数据生成规则化分析。</p>
      </div>

      <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>AI 分析仅用于信息整理和风险提示，不提供收益承诺、买卖建议或自动投顾服务。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <AnalysisCard summary={data.summary} generatedAt={data.generatedAt} />
        <InsightsList insights={data.insights} />
      </div>

      <RiskDisclaimer notes={data.riskNotes} />
    </section>
  );
}
