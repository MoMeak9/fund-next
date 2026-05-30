"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionTable } from "@/features/transactions/TransactionTable";

export default function TransactionsPage() {
  return (
    <section>
      <PageHeader title="交易复盘" actions={<Button asChild><Link href="/transactions/new">添加交易</Link></Button>} />
      <TransactionTable />
    </section>
  );
}
