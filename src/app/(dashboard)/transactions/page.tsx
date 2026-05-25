"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TransactionTable } from "@/features/transactions/TransactionTable";

export default function TransactionsPage() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">交易复盘</h1>
        <Button asChild><Link href="/transactions/new">添加交易</Link></Button>
      </div>
      <TransactionTable />
    </section>
  );
}
