"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTableWrapper } from "@/components/ui/data-table-wrapper";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFundExposureDetail } from "@/features/exposure/hooks";

export default function FundExposureDetailPage() {
  const params = useParams<{ fundAssetId: string }>();
  const { data, isLoading } = useFundExposureDetail(params.fundAssetId);

  if (isLoading) return <TableSkeleton cols={5} />;

  if (!data || data.holdings.length === 0) {
    return (
      <section>
        <PageHeader title={data?.fundName ?? "基金穿透详情"} />
        <p className="text-muted-foreground">该基金暂无穿透数据。</p>
      </section>
    );
  }

  const sorted = [...data.holdings].sort((a, b) => b.exposureAmount - a.exposureAmount);

  return (
    <section>
      <PageHeader title={`${data.fundName} - 底层持仓`} />
      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>股票名称</TableHead>
              <TableHead>代码</TableHead>
              <TableHead>市场</TableHead>
              <TableHead>行业</TableHead>
              <TableHead className="text-right">权重</TableHead>
              <TableHead className="text-right">穿透金额</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((h, idx) => (
              <TableRow key={h.holdingSymbol}>
                <TableCell>
                  {idx < 10 ? (
                    <Badge variant="secondary" className="text-xs">{idx + 1}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">{idx + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{h.holdingName}</TableCell>
                <TableCell>{h.holdingSymbol}</TableCell>
                <TableCell>{h.holdingMarket}</TableCell>
                <TableCell>{h.industry}</TableCell>
                <TableCell className="text-right">{(h.weight * 100).toFixed(2)}%</TableCell>
                <TableCell className="text-right">¥{h.exposureAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTableWrapper>
    </section>
  );
}
