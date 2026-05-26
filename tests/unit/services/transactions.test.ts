import { Decimal } from "@prisma/client/runtime/library";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userAsset: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      transaction: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      userAsset: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    })),
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createTransaction, deleteTransaction, listTransactions } from "@/services/transactions";

const mockTransaction = {
  findMany: vi.mocked(prisma.transaction.findMany),
  findFirst: vi.mocked(prisma.transaction.findFirst),
  count: vi.mocked(prisma.transaction.count),
  create: vi.mocked(prisma.transaction.create),
  update: vi.mocked(prisma.transaction.update),
};
const mockUserAsset = {
  findFirst: vi.mocked(prisma.userAsset.findFirst),
  update: vi.mocked(prisma.userAsset.update),
};
const mockTransactionRunner = vi.mocked(prisma.$transaction);

const now = new Date("2026-05-25T10:00:00.000Z");

function asset(overrides: Record<string, unknown> = {}) {
  return {
    id: BigInt(10),
    userId: BigInt(1),
    assetType: "stock",
    symbol: "AAPL",
    assetName: "Apple",
    market: "US",
    currency: "USD",
    quantity: new Decimal(10),
    avgCost: new Decimal(100),
    currentPrice: new Decimal(120),
    costAmount: new Decimal(1000),
    marketValue: new Decimal(1200),
    remark: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function transaction(overrides: Record<string, unknown> = {}) {
  return {
    id: BigInt(100),
    userId: BigInt(1),
    assetId: BigInt(10),
    transactionType: "buy",
    quantity: new Decimal(5),
    price: new Decimal(160),
    fee: new Decimal(0),
    currency: "USD",
    transactionAmount: new Decimal(800),
    transactionTime: now,
    reason: null,
    emotionTag: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    asset: { assetName: "Apple", symbol: "AAPL" },
    ...overrides,
  };
}

describe("transaction service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionRunner.mockImplementation(async (callback) => callback(prisma));
  });

  it("createTransaction buy increases quantity and recalculates weighted average cost", async () => {
    mockUserAsset.findFirst.mockResolvedValue(asset());
    mockTransaction.create.mockResolvedValue(transaction());

    await createTransaction(BigInt(1), {
      assetId: "10",
      transactionType: "buy",
      quantity: 5,
      price: 160,
      currency: "USD",
      transactionTime: now.toISOString(),
    });

    const updateCall = mockUserAsset.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: BigInt(10) });
    expect(Number(updateCall.data.quantity)).toBe(15);
    expect(Number(updateCall.data.avgCost)).toBe(120);
    expect(Number(updateCall.data.costAmount)).toBe(1800);
    expect(Number(updateCall.data.marketValue)).toBe(1800);
  });

  it("createTransaction sell decreases quantity and keeps average cost", async () => {
    mockUserAsset.findFirst.mockResolvedValue(asset());
    mockTransaction.create.mockResolvedValue(transaction({
      transactionType: "sell",
      quantity: new Decimal(3),
      price: new Decimal(150),
      transactionAmount: new Decimal(450),
    }));

    await createTransaction(BigInt(1), {
      assetId: "10",
      transactionType: "sell",
      quantity: 3,
      price: 150,
      currency: "USD",
      transactionTime: now.toISOString(),
    });

    const updateCall = mockUserAsset.update.mock.calls[0][0];
    expect(Number(updateCall.data.quantity)).toBe(7);
    expect(Number(updateCall.data.avgCost)).toBe(100);
    expect(Number(updateCall.data.costAmount)).toBe(700);
    expect(Number(updateCall.data.marketValue)).toBe(840);
  });

  it("listTransactions returns paginated items, total, page, and pageSize", async () => {
    mockTransaction.findMany.mockResolvedValue([transaction()]);
    mockTransaction.count.mockResolvedValue(42);

    const result = await listTransactions(BigInt(1), { type: "buy" }, { page: 2, pageSize: 10 });

    expect(result).toMatchObject({
      total: 42,
      page: 2,
      pageSize: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("100");
    expect(mockTransaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
      skip: 10,
      take: 10,
      where: expect.objectContaining({ userId: BigInt(1), deletedAt: null, transactionType: "buy" }),
    }));
  });

  it("deleteTransaction soft deletes and restores weighted average after deleting a buy", async () => {
    mockTransaction.findFirst.mockResolvedValue(transaction({
      transactionType: "buy",
      quantity: new Decimal(5),
      price: new Decimal(160),
    }));
    mockUserAsset.findFirst.mockResolvedValue(asset({
      quantity: new Decimal(15),
      avgCost: new Decimal(120),
      costAmount: new Decimal(1800),
      marketValue: new Decimal(1800),
    }));
    mockTransaction.update.mockResolvedValue(transaction({ deletedAt: now }));

    const result = await deleteTransaction(BigInt(1), BigInt(100));

    expect(result).toBe(true);
    expect(mockTransaction.update).toHaveBeenCalledWith({
      where: { id: BigInt(100) },
      data: { deletedAt: expect.any(Date) },
    });
    expect(mockUserAsset.update).toHaveBeenCalledOnce();
    const updateCall = mockUserAsset.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: BigInt(10) });
    expect(Number(updateCall.data.quantity)).toBe(10);
    expect(Number(updateCall.data.avgCost)).toBe(100);
    expect(Number(updateCall.data.costAmount)).toBe(1000);
    expect(Number(updateCall.data.marketValue)).toBe(1200);
  });

  it("deleteTransaction does not soft delete when asset rollback fails", async () => {
    mockTransaction.findFirst.mockResolvedValue(transaction());
    mockUserAsset.findFirst.mockResolvedValue(asset());
    mockTransaction.update.mockResolvedValue(transaction({ deletedAt: now }));
    mockUserAsset.update.mockRejectedValue(new Error("asset update failed"));

    await expect(deleteTransaction(BigInt(1), BigInt(100))).rejects.toThrow("asset update failed");

    expect(mockTransactionRunner).toHaveBeenCalledOnce();
  });
});
