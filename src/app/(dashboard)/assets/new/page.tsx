"use client";

import { AssetForm } from "@/features/assets/AssetForm";

export default function NewAssetPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">添加资产</h1>
      <AssetForm />
    </section>
  );
}
