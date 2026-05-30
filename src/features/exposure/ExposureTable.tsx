"use client";

import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Holding = {
  holdingSymbol: string;
  holdingName: string;
  holdingMarket: string;
  industry: string;
  exposureAmount: number;
  sourceFundSymbols: string[];
};

type Props = { holdings: Holding[]; totalFundValue: number };

export function ExposureTable({ holdings, totalFundValue }: Props) {
  if (holdings.length === 0)
    return (
      <p className="py-8 text-center text-muted-foreground">暂无穿透数据</p>
    );

  const sorted = [...holdings].sort(
    (a, b) => b.exposureAmount - a.exposureAmount,
  );

  return (
    <DataTableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>股票名称</TableHead>
            <TableHead>代码</TableHead>
            <TableHead>市场</TableHead>
            <TableHead>行业</TableHead>
            <TableHead className="text-right">穿透金额</TableHead>
            <TableHead className="text-right">穿透比例</TableHead>
            <TableHead>来源基金</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((h, idx) => (
            <TableRow key={h.holdingSymbol}>
              <TableCell>
                {idx < 10 ? (
                  <Badge variant="secondary" className="text-xs">
                    {idx + 1}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    {idx + 1}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-medium">{h.holdingName}</TableCell>
              <TableCell>{h.holdingSymbol}</TableCell>
              <TableCell>{h.holdingMarket}</TableCell>
              <TableCell>{h.industry}</TableCell>
              <TableCell className="text-right">
                ¥{h.exposureAmount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totalFundValue > 0
                  ? ((h.exposureAmount / totalFundValue) * 100).toFixed(2) + "%"
                  : "-"}
              </TableCell>
              <TableCell>{h.sourceFundSymbols.join(", ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTableWrapper>
  );
}
