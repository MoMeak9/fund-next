"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            底层持仓穿透明细
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            共 {holdings.length} 只
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DataTableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-6">#</TableHead>
                <TableHead>股票名称</TableHead>
                <TableHead>代码</TableHead>
                <TableHead>市场</TableHead>
                <TableHead>行业</TableHead>
                <TableHead className="text-right">穿透金额</TableHead>
                <TableHead className="text-right">穿透比例</TableHead>
                <TableHead className="pr-6">来源基金</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((h, idx) => {
                const pct =
                  totalFundValue > 0
                    ? (h.exposureAmount / totalFundValue) * 100
                    : 0;
                return (
                  <TableRow key={h.holdingSymbol} className="group">
                    <TableCell className="pl-6">
                      {idx < 10 ? (
                        <Badge
                          variant={idx < 3 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {idx + 1}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {idx + 1}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {h.holdingName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {h.holdingSymbol}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {h.holdingMarket}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{h.industry}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ¥{h.exposureAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-muted group-hover:block">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(pct * 5, 100)}%` }}
                          />
                        </div>
                        <span className="font-medium">{pct.toFixed(2)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex flex-wrap gap-1">
                        {h.sourceFundSymbols.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DataTableWrapper>
      </CardContent>
    </Card>
  );
}
