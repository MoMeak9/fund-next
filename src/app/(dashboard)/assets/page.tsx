"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { AssetTable } from "@/features/assets/AssetTable";

export default function AssetsPage() {
  return (
    <section>
      <PageHeader title="资产列表" actions={<Button asChild><Link href="/assets/new">添加资产</Link></Button>} />
      <AssetTable />
    </section>
  );
}
