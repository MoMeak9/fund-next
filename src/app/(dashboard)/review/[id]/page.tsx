"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { TradeReviewForm } from "@/features/review/components/TradeReviewForm";
import { useTradeReview } from "@/features/review/hooks";

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: review, isLoading } = useTradeReview(id);

  if (isLoading) {
    return (
      <section>
        <PageHeader title="复盘详情" />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-32 w-full max-w-lg rounded bg-muted" />
        </div>
      </section>
    );
  }

  if (!review) {
    return (
      <section>
        <PageHeader title="复盘详情" />
        <p className="text-muted-foreground">未找到复盘记录</p>
      </section>
    );
  }

  return (
    <section>
      <PageHeader title="编辑复盘" />
      <TradeReviewForm review={review} />
    </section>
  );
}
