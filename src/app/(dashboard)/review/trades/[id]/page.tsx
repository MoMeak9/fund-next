"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { TradeReviewForm } from "@/features/review/components/TradeReviewForm";
import { TradeScoreCard } from "@/features/review/components/TradeScoreCard";
import { useReviewByTransaction } from "@/features/review/hooks";

// /review/trades/:id — id is a transaction id. Find-or-create the review for that trade.
export default function TradeReviewPage() {
  const { id } = useParams<{ id: string }>();
  const { data: review, isLoading } = useReviewByTransaction(id);

  if (isLoading) {
    return (
      <section>
        <PageHeader title="交易复盘" />
        <TableSkeleton cols={2} />
      </section>
    );
  }

  // Existing review → read-only score card + edit form. None yet → create form prefilled with the txn.
  if (review) {
    return (
      <section className="space-y-6">
        <PageHeader title="交易复盘" description="查看评分并按需编辑" />
        <TradeScoreCard review={review} />
        <TradeReviewForm review={review} />
      </section>
    );
  }

  return (
    <section>
      <PageHeader title="新建复盘" description="为该交易记录创建复盘" />
      <TradeReviewForm transactionId={id} />
    </section>
  );
}
