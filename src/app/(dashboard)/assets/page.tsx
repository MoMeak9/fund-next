"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AssetTable } from "@/features/assets/AssetTable";

export default function AssetsPage() {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">资产列表</h1>
        <Button asChild><Link href="/assets/new">添加资产</Link></Button>
      </div>
      <AssetTable />
    </section>
  );
}
