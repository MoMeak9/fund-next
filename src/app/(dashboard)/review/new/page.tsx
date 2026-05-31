"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TradeReviewForm } from "@/features/review/components/TradeReviewForm";

export default function NewReviewPage() {
  return (
    <section>
      <PageHeader title="新建复盘" />
      <TradeReviewForm />
    </section>
  );
}
