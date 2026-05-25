import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreateAssetInput, UpdateAssetInput } from "./schema";

export async function listAssets(userId: bigint, filters?: { type?: string; market?: string }) {
  const where: Record<string, unknown> = { userId, deletedAt: null };
  if (filters?.type) where.assetType = filters.type;
  if (filters?.market) where.market = filters.market;

  const assets = await prisma.userAsset.findMany({ where, orderBy: { createdAt: "desc" } });
  return assets.map(serializeAsset);
}

export async function getAsset(userId: bigint, id: bigint) {
  const asset = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!asset) return null;
  return serializeAsset(asset);
}

export async function createAsset(userId: bigint, input: CreateAssetInput) {
  const costAmount = input.quantity * (input.avgCost ?? 0);
  const marketValue = input.quantity * (input.currentPrice ?? 0);

  const asset = await prisma.userAsset.create({
    data: {
      userId,
      assetType: input.assetType,
      symbol: input.symbol ?? null,
      assetName: input.assetName,
      market: input.market ?? null,
      currency: input.currency,
      quantity: new Decimal(input.quantity),
      avgCost: input.avgCost != null ? new Decimal(input.avgCost) : null,
      currentPrice: input.currentPrice != null ? new Decimal(input.currentPrice) : null,
      costAmount: new Decimal(costAmount),
      marketValue: new Decimal(marketValue),
      remark: input.remark ?? null,
    },
  });

  return serializeAsset(asset);
}

export async function updateAsset(userId: bigint, id: bigint, input: UpdateAssetInput) {
  const existing = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  const quantity = input.quantity ?? Number(existing.quantity);
  const avgCost = input.avgCost ?? (existing.avgCost ? Number(existing.avgCost) : 0);
  const currentPrice = input.currentPrice ?? (existing.currentPrice ? Number(existing.currentPrice) : 0);
  const costAmount = quantity * avgCost;
  const marketValue = quantity * currentPrice;

  const data: Record<string, unknown> = {
    quantity: new Decimal(quantity),
    avgCost: new Decimal(avgCost),
    currentPrice: new Decimal(currentPrice),
    costAmount: new Decimal(costAmount),
    marketValue: new Decimal(marketValue),
  };
  if (input.assetType !== undefined) data.assetType = input.assetType;
  if (input.symbol !== undefined) data.symbol = input.symbol ?? null;
  if (input.assetName !== undefined) data.assetName = input.assetName;
  if (input.market !== undefined) data.market = input.market ?? null;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.remark !== undefined) data.remark = input.remark ?? null;

  const asset = await prisma.userAsset.update({ where: { id }, data });
  return serializeAsset(asset);
}

export async function deleteAsset(userId: bigint, id: bigint) {
  const existing = await prisma.userAsset.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.userAsset.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

function serializeAsset(asset: Record<string, unknown>) {
  return {
    id: String(asset.id),
    assetType: asset.assetType,
    symbol: asset.symbol,
    assetName: asset.assetName,
    market: asset.market,
    currency: asset.currency,
    quantity: Number(asset.quantity),
    avgCost: asset.avgCost != null ? Number(asset.avgCost) : null,
    currentPrice: asset.currentPrice != null ? Number(asset.currentPrice) : null,
    costAmount: asset.costAmount != null ? Number(asset.costAmount) : null,
    marketValue: asset.marketValue != null ? Number(asset.marketValue) : null,
    remark: asset.remark,
    createdAt: (asset.createdAt as Date).toISOString(),
  };
}
