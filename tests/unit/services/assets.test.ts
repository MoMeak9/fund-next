import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    userAsset: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createAsset, deleteAsset, getAsset, listAssets } from "@/services/assets";

const mockUserAsset = {
  findMany: vi.mocked(prisma.userAsset.findMany),
  findFirst: vi.mocked(prisma.userAsset.findFirst),
  create: vi.mocked(prisma.userAsset.create),
  update: vi.mocked(prisma.userAsset.update),
};

describe("asset service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createAsset auto-calculates costAmount and marketValue", async () => {
    mockUserAsset.create.mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      assetType: "stock",
      symbol: "AAPL",
      assetName: "Apple",
      market: "US",
      currency: "USD",
      quantity: new Decimal(10),
      avgCost: new Decimal(150),
      currentPrice: new Decimal(190),
      costAmount: new Decimal(1500),
      marketValue: new Decimal(1900),
      remark: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await createAsset(BigInt(1), {
      assetType: "stock",
      symbol: "AAPL",
      assetName: "Apple",
      market: "US",
      currency: "USD",
      quantity: 10,
      avgCost: 150,
      currentPrice: 190,
    });

    expect(result.costAmount).toBe(1500);
    expect(result.marketValue).toBe(1900);

    const createCall = mockUserAsset.create.mock.calls[0][0];
    expect(Number(createCall.data.costAmount)).toBe(1500);
    expect(Number(createCall.data.marketValue)).toBe(1900);
  });

  it("listAssets applies type filter", async () => {
    mockUserAsset.findMany.mockResolvedValue([]);

    await listAssets(BigInt(1), { type: "stock" });

    const call = mockUserAsset.findMany.mock.calls[0][0];
    expect(call?.where).toMatchObject({ assetType: "stock", deletedAt: null });
  });

  it("deleteAsset returns false for non-existent asset", async () => {
    mockUserAsset.findFirst.mockResolvedValue(null);

    const result = await deleteAsset(BigInt(1), BigInt(999));
    expect(result).toBe(false);
  });

  it("getAsset returns null for wrong userId", async () => {
    mockUserAsset.findFirst.mockResolvedValue(null);

    const result = await getAsset(BigInt(2), BigInt(1));
    expect(result).toBeNull();
    expect(mockUserAsset.findFirst).toHaveBeenCalledWith({
      where: { id: BigInt(1), userId: BigInt(2), deletedAt: null },
    });
  });
});
