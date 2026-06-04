import { Decimal } from "@prisma/client/runtime/library";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    userAsset: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createTransaction, deleteTransaction, listTransactions, updateTransaction, TransactionError } from "@/services/transactions";

describe("transaction service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTransaction buy increases quantity and recalculates avgCost", async () => {
    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      assetType: "stock",
      symbol: "600000",
      assetName: "浦发银行",
      market: "CN",
      currency: "CNY",
      quantity: new Decimal(100),
      avgCost: new Decimal(10),
      currentPrice: new Decimal(12),
      costAmount: new Decimal(1000),
      marketValue: new Decimal(1200),
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "buy",
      quantity: new Decimal(50),
      price: new Decimal(12),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(600),
      transactionTime: new Date("2026-01-01"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      asset: { assetName: "浦发银行", symbol: "600000" },
    } as never);

    await createTransaction(BigInt(1), {
      assetId: "1",
      transactionType: "buy",
      quantity: 50,
      price: 12,
      transactionTime: "2026-01-01T00:00:00.000Z",
    });

    const updateCall = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    expect(Number(updateCall.data.quantity)).toBe(150);
    expect(Number(updateCall.data.avgCost)).toBeCloseTo(10.6667, 4);
  });

  it("createTransaction sell decreases quantity and keeps avgCost unchanged", async () => {
    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      assetType: "stock",
      symbol: "600000",
      assetName: "浦发银行",
      market: "CN",
      currency: "CNY",
      quantity: new Decimal(100),
      avgCost: new Decimal(10),
      currentPrice: new Decimal(15),
      costAmount: new Decimal(1000),
      marketValue: new Decimal(1500),
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    vi.mocked(prisma.transaction.create).mockResolvedValue({
      id: BigInt(2),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "sell",
      quantity: new Decimal(30),
      price: new Decimal(15),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(450),
      transactionTime: new Date("2026-01-02"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      asset: { assetName: "浦发银行", symbol: "600000" },
    } as never);

    await createTransaction(BigInt(1), {
      assetId: "1",
      transactionType: "sell",
      quantity: 30,
      price: 15,
      transactionTime: "2026-01-02T00:00:00.000Z",
    });

    const updateCall = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    expect(Number(updateCall.data.quantity)).toBe(70);
    expect(Number(updateCall.data.avgCost)).toBe(10);
  });

  it("listTransactions returns paginated structure", async () => {
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.count).mockResolvedValue(0);

    const result = await listTransactions(BigInt(1), undefined, { page: 2, pageSize: 10 });

    expect(result).toEqual({ items: [], total: 0, page: 2, pageSize: 10 });
  });

  it("deleteTransaction returns false for non-existent transaction", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);

    const result = await deleteTransaction(BigInt(1), BigInt(999));
    expect(result).toBe(false);
  });

  it("createTransaction throws TransactionError(404) for non-existent asset", async () => {
    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue(null);

    await expect(
      createTransaction(BigInt(1), {
        assetId: "999",
        transactionType: "buy",
        quantity: 10,
        price: 5,
        transactionTime: "2026-01-01T00:00:00.000Z",
      }),
    ).rejects.toThrow(TransactionError);

    await expect(
      createTransaction(BigInt(1), {
        assetId: "999",
        transactionType: "buy",
        quantity: 10,
        price: 5,
        transactionTime: "2026-01-01T00:00:00.000Z",
      }),
    ).rejects.toMatchObject({ code: 404 });
  });

  it("deleteTransaction reverses a buy: restores asset quantity and avgCost", async () => {
    // Asset currently reflects a prior buy of 50@12 on top of 100@10 → 150 @ 10.6667.
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(10),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "buy",
      quantity: new Decimal(50),
      price: new Decimal(12),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(600),
      transactionTime: new Date("2026-01-01"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as never);

    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      quantity: new Decimal(150),
      avgCost: new Decimal(1600 / 150),
      currentPrice: new Decimal(12),
      costAmount: new Decimal(1600),
      marketValue: new Decimal(1800),
    } as never);

    const result = await deleteTransaction(BigInt(1), BigInt(10));

    expect(result).toBe(true);
    const assetUpdate = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    expect(Number(assetUpdate.data.quantity)).toBe(100);
    expect(Number(assetUpdate.data.avgCost)).toBeCloseTo(10, 6);
    // The transaction row is soft-deleted.
    const txUpdate = vi.mocked(prisma.transaction.update).mock.calls[0][0];
    expect(txUpdate.data.deletedAt).toBeInstanceOf(Date);
  });

  it("deleteTransaction reverses a sell: restores the sold quantity, avgCost unchanged", async () => {
    // Asset reflects a prior sell of 30@15 from 100@10 → 70 @ 10.
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(11),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "sell",
      quantity: new Decimal(30),
      price: new Decimal(15),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(450),
      transactionTime: new Date("2026-01-02"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as never);

    vi.mocked(prisma.userAsset.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      quantity: new Decimal(70),
      avgCost: new Decimal(10),
      currentPrice: new Decimal(15),
      costAmount: new Decimal(700),
      marketValue: new Decimal(1050),
    } as never);

    const result = await deleteTransaction(BigInt(1), BigInt(11));

    expect(result).toBe(true);
    const assetUpdate = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    expect(Number(assetUpdate.data.quantity)).toBe(100);
    expect(Number(assetUpdate.data.avgCost)).toBe(10);
  });

  it("updateTransaction reverses the old buy then reapplies the new quantity", async () => {
    // Existing buy of 50@12 on an asset now at 150 @ 10.6667. Update qty 50 → 20.
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(12),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "buy",
      quantity: new Decimal(50),
      price: new Decimal(12),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(600),
      transactionTime: new Date("2026-01-01"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as never);

    // First findFirst (reverse) sees 150; second findFirst (reapply) sees the reversed 100 @ 10.
    vi.mocked(prisma.userAsset.findFirst)
      .mockResolvedValueOnce({
        id: BigInt(1),
        userId: BigInt(1),
        quantity: new Decimal(150),
        avgCost: new Decimal(1600 / 150),
        currentPrice: new Decimal(12),
        costAmount: new Decimal(1600),
        marketValue: new Decimal(1800),
      } as never)
      .mockResolvedValueOnce({
        id: BigInt(1),
        userId: BigInt(1),
        quantity: new Decimal(100),
        avgCost: new Decimal(10),
        currentPrice: new Decimal(12),
        costAmount: new Decimal(1000),
        marketValue: new Decimal(1200),
      } as never);

    vi.mocked(prisma.transaction.update).mockResolvedValue({
      id: BigInt(12),
      userId: BigInt(1),
      assetId: BigInt(1),
      transactionType: "buy",
      quantity: new Decimal(20),
      price: new Decimal(12),
      fee: new Decimal(0),
      currency: "CNY",
      transactionAmount: new Decimal(240),
      transactionTime: new Date("2026-01-01"),
      reason: null,
      emotionTag: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      asset: { assetName: "浦发银行", symbol: "600000" },
    } as never);

    await updateTransaction(BigInt(1), BigInt(12), { quantity: 20 });

    // Two asset updates: reverse (→100 @ 10), then reapply (→120 @ (1000+20*12)/120 = 10.3333).
    const reverseCall = vi.mocked(prisma.userAsset.update).mock.calls[0][0];
    expect(Number(reverseCall.data.quantity)).toBe(100);
    expect(Number(reverseCall.data.avgCost)).toBeCloseTo(10, 6);

    const reapplyCall = vi.mocked(prisma.userAsset.update).mock.calls[1][0];
    expect(Number(reapplyCall.data.quantity)).toBe(120);
    expect(Number(reapplyCall.data.avgCost)).toBeCloseTo(1240 / 120, 4);
  });
});
