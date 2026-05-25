"use client";

type Transaction = {
  id: string;
  assetName: string;
  transactionType: string;
  quantity: number;
  price: number;
  transactionTime: string;
};

type Props = { transactions: Transaction[] };

const TYPE_LABELS: Record<string, string> = {
  buy: "买入", sell: "卖出", add: "加仓", reduce: "减仓",
  fixed_invest: "定投", transfer_in: "转入", transfer_out: "转出",
};

export function RecentTransactions({ transactions }: Props) {
  if (transactions.length === 0) return <p className="text-sm text-muted-foreground">暂无交易记录</p>;

  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">最近交易</h3>
      <ul className="space-y-2">
        {transactions.map((tx) => (
          <li key={tx.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span>{tx.assetName} · {TYPE_LABELS[tx.transactionType] ?? tx.transactionType}</span>
            <span className="text-muted-foreground">{tx.quantity} × {tx.price}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
