"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Holding = {
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: string;
  industry: string;
  exposureAmount: number;
  sourceFundSymbols: string[];
};

type Props = { holdings: Holding[] };

export function ExposureTable({ holdings }: Props) {
  if (holdings.length === 0) return <p className="py-8 text-center text-muted-foreground">暂无穿透数据</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>股票名称</TableHead>
          <TableHead>代码</TableHead>
          <TableHead>市场</TableHead>
          <TableHead>行业</TableHead>
          <TableHead className="text-right">穿透金额</TableHead>
          <TableHead>来源基金</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => (
          <TableRow key={h.holdingSymbol}>
            <TableCell className="font-medium">{h.holdingName}</TableCell>
            <TableCell>{h.holdingSymbol}</TableCell>
            <TableCell>{h.holdingMarket}</TableCell>
            <TableCell>{h.industry}</TableCell>
            <TableCell className="text-right">¥{h.exposureAmount.toFixed(2)}</TableCell>
            <TableCell>{h.sourceFundSymbols.join(", ")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
