"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CardGridSkeleton } from "@/components/ui/loading-skeleton";
import { useAiAnalysis } from "@/features/ai/hooks";
import { AnalysisCard } from "@/features/ai/AnalysisCard";
import { InsightsList } from "@/features/ai/InsightsList";
import { RiskDisclaimer } from "@/features/ai/RiskDisclaimer";

export default function AiPage() {
  const { data, isLoading } = useAiAnalysis();

  return (
    <section className="space-y-6">
      <PageHeader title="AI 分析" />
      <div className="rounded-md border border-warning/20 bg-warning/10 p-3">
        <p className="text-sm text-warning">
          AI 分析仅用于信息整理和风险提示，不提供收益承诺、买卖建议或自动投顾服务。
        </p>
      </div>
      {isLoading && <CardGridSkeleton count={2} />}
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
