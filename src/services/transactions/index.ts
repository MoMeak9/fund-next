import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreateTransactionInput, UpdateTransactionInput } from "./schema";

const INCREASE_TYPES = new Set(["buy", "add", "fixed_invest", "transfer_in"]);

type Pagination = { page: number; pageSize: number };
type Filters = { assetId?: string; type?: string; startDate?: string; endDate?: string };

export async function listTransactions(userId: bigint, filters?: Filters, pagination?: Pagination) {
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 20;

  const where: Record<string, unknown> = { userId, deletedAt: null };
  if (filters?.assetId) where.assetId = BigInt(filters.assetId);
  if (filters?.type) where.transactionType = filters.type;
  if (filters?.startDate || filters?.endDate) {
    const timeFilter: Record<string, Date> = {};
    if (filters.startDate) timeFilter.gte = new Date(filters.startDate);
    if (filters.endDate) timeFilter.lte = new Date(filters.endDate);
    where.transactionTime = timeFilter;
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { asset: { select: { assetName: true, symbol: true } } },
      orderBy: { transactionTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    items: items.map(serializeTransaction),
    total,
    page,
    pageSize,
  };
}

export async function getTransaction(userId: bigint, id: bigint) {
  const tx = await prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
    include: { asset: { select: { assetName: true, symbol: true } } },
  });
  if (!tx) return null;
  return serializeTransaction(tx);
}

export async function createTransaction(userId: bigint, input: CreateTransactionInput) {
  const assetId = BigInt(input.assetId);
  const asset = await prisma.userAsset.findFirst({ where: { id: assetId, userId, deletedAt: null } });
  if (!asset) throw new TransactionError(404, "资产不存在");

  const fee = input.fee ?? 0;
  const transactionAmount = input.quantity * input.price + fee;

  const tx = await prisma.transaction.create({
    data: {
      userId,
      assetId,
      transactionType: input.transactionType,
      quantity: new Decimal(input.quantity),
      price: new Decimal(input.price),
      fee: new Decimal(fee),
      currency: input.currency ?? asset.currency,
      transactionAmount: new Decimal(transactionAmount),
      transactionTime: new Date(input.transactionTime),
      reason: input.reason ?? null,
      emotionTag: input.emotionTag ?? null,
    },
    include: { asset: { select: { assetName: true, symbol: true } } },
  });

  await applyTransactionToAsset(asset, input.transactionType, input.quantity, input.price);

  return serializeTransaction(tx);
}

export async function updateTransaction(userId: bigint, id: bigint, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (input.transactionType != null) data.transactionType = input.transactionType;
  if (input.quantity != null) data.quantity = new Decimal(input.quantity);
  if (input.price != null) data.price = new Decimal(input.price);
  if (input.fee != null) data.fee = new Decimal(input.fee);
  if (input.currency != null) data.currency = input.currency;
  if (input.transactionTime != null) data.transactionTime = new Date(input.transactionTime);
  if (input.reason !== undefined) data.reason = input.reason ?? null;
  if (input.emotionTag !== undefined) data.emotionTag = input.emotionTag ?? null;

  const qty = input.quantity ?? Number(existing.quantity);
  const price = input.price ?? Number(existing.price);
  const fee = input.fee ?? Number(existing.fee);
  data.transactionAmount = new Decimal(qty * price + fee);

  const tx = await prisma.transaction.update({
    where: { id },
    data,
    include: { asset: { select: { assetName: true, symbol: true } } },
  });

  return serializeTransaction(tx);
}

export async function deleteTransaction(userId: bigint, id: bigint) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.transaction.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

async function applyTransactionToAsset(
  asset: { id: bigint; quantity: Decimal; avgCost: Decimal | null; currentPrice: Decimal | null },
  transactionType: string,
  quantity: number,
  price: number,
) {
  const oldQuantity = Number(asset.quantity);
  const oldAvgCost = asset.avgCost ? Number(asset.avgCost) : 0;

  let newQuantity: number;
  let newAvgCost: number;

  if (INCREASE_TYPES.has(transactionType)) {
    newQuantity = oldQuantity + quantity;
    newAvgCost = newQuantity > 0 ? (oldQuantity * oldAvgCost + quantity * price) / newQuantity : price;
  } else {
    newQuantity = Math.max(oldQuantity - quantity, 0);
    newAvgCost = oldAvgCost;
  }

  const currentPrice = asset.currentPrice ? Number(asset.currentPrice) : 0;
  const costAmount = newQuantity * newAvgCost;
  const marketValue = newQuantity * currentPrice;

  await prisma.userAsset.update({
    where: { id: asset.id },
    data: {
      quantity: new Decimal(newQuantity),
      avgCost: new Decimal(newAvgCost),
      costAmount: new Decimal(costAmount),
      marketValue: new Decimal(marketValue),
    },
  });
}

function serializeTransaction(tx: Record<string, unknown> & { asset?: { assetName: string; symbol: string | null } }) {
  return {
    id: String(tx.id),
    assetId: String(tx.assetId),
    assetName: tx.asset?.assetName ?? "",
    symbol: tx.asset?.symbol ?? null,
    transactionType: tx.transactionType,
    quantity: Number(tx.quantity),
    price: Number(tx.price),
    fee: Number(tx.fee),
    currency: tx.currency,
    transactionAmount: Number(tx.transactionAmount),
    transactionTime: (tx.transactionTime as Date).toISOString(),
    reason: tx.reason,
    emotionTag: tx.emotionTag,
    createdAt: (tx.createdAt as Date).toISOString(),
  };
}

export class TransactionError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "TransactionError";
  }
}
