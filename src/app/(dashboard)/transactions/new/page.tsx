"use client";

import { TransactionForm } from "@/features/transactions/TransactionForm";

export default function NewTransactionPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">添加交易</h1>
      <TransactionForm />
    </section>
  );
}
