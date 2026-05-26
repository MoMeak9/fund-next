"use client";

import { useAiAnalysis } from "@/features/ai/hooks";
import { AnalysisCard } from "@/features/ai/AnalysisCard";
import { InsightsList } from "@/features/ai/InsightsList";
import { RiskDisclaimer } from "@/features/ai/RiskDisclaimer";

export default function AiPage() {
  const { data, isLoading } = useAiAnalysis();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">AI 分析</h1>
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
        <p className="text-sm text-yellow-800">
          AI 分析仅用于信息整理和风险提示，不提供收益承诺、买卖建议或自动投顾服务。
        </p>
      </div>
      {isLoading && <p className="text-muted-foreground">分析中...</p>}
      {data && (
        <>
          <AnalysisCard summary={data.summary} />
          <InsightsList insights={data.insights} />
          <RiskDisclaimer notes={data.riskNotes} />
          <p className="text-xs text-muted-foreground">
            生成时间: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </section>
  );
}
