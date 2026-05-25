"use client";

import { ExposureTable } from "@/features/exposure/ExposureTable";
import { useFundsExposure } from "@/features/exposure/hooks";

export default function ExposurePage() {
  const { data, isLoading } = useFundsExposure();

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">加载中...</div>;

  if (!data || data.holdings.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-semibold">基金穿透</h1>
        <p className="text-muted-foreground">暂无基金资产或穿透数据。添加基金资产后可查看底层持仓。</p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">基金穿透</h1>
      <p className="mb-4 text-sm text-muted-foreground">基金总市值: ¥{data.totalFundValue.toLocaleString()}</p>
      <ExposureTable holdings={data.holdings} />
    </section>
  );
}
