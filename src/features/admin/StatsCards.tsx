"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  stats: { userCount: number; assetCount: number; transactionCount: number };
};

export function StatsCards({ stats }: Props) {
  const items = [
    { title: "用户数", value: stats.userCount },
    { title: "资产数", value: stats.assetCount },
    { title: "交易数", value: stats.transactionCount },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Card key={item.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
