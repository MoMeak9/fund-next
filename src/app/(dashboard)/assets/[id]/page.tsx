"use client";

import { useParams } from "next/navigation";

import { AssetForm } from "@/features/assets/AssetForm";

export default function AssetDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">编辑资产</h1>
      <AssetForm assetId={params.id} />
    </section>
  );
}
