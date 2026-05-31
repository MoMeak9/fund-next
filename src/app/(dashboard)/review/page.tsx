"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewStatsCards } from "@/features/review/components/ReviewStatsCards";
import { ReviewTable } from "@/features/review/components/ReviewTable";

export default function ReviewPage() {
  return (
    <section className="space-y-6">
      <PageHeader
        title="交易复盘"
        actions={
          <Button asChild>
            <Link href="/review/new">新建复盘</Link>
          </Button>
        }
      />
      <ReviewStatsCards />
      <ReviewTable />
    </section>
  );
}
