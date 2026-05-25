import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    userAsset: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    fundHolding: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { getFundsExposure } from "@/services/exposure";

const mockPrisma = vi.mocked(prisma);

describe("exposure service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty when no fund assets", async () => {
    mockPrisma.userAsset.findMany.mockResolvedValue([]);

    const result = await getFundsExposure(BigInt(1));

    expect(result.totalFundValue).toBe(0);
    expect(result.holdings).toHaveLength(0);
  });

  it("aggregates duplicate holdings from multiple funds", async () => {
    mockPrisma.userAsset.findMany.mockResolvedValue([
      { id: BigInt(1), symbol: "FUND_A", assetType: "fund", marketValue: new Decimal(100000), deletedAt: null } as never,
      { id: BigInt(2), symbol: "FUND_B", assetType: "fund", marketValue: new Decimal(50000), deletedAt: null } as never,
    ]);

    mockPrisma.fundHolding.findMany
      .mockResolvedValueOnce([
        { holdingSymbol: "0700.HK", holdingName: "Tencent", holdingMarket: "HK", industry: "Internet", weight: new Decimal(0.08) } as never,
      ])
      .mockResolvedValueOnce([
        { holdingSymbol: "0700.HK", holdingName: "Tencent", holdingMarket: "HK", industry: "Internet", weight: new Decimal(0.1) } as never,
      ]);

    const result = await getFundsExposure(BigInt(1));

    expect(result.totalFundValue).toBe(150000);
    expect(result.holdings).toHaveLength(1);
    expect(result.holdings[0].holdingSymbol).toBe("0700.HK");
    expect(result.holdings[0].exposureAmount).toBe(13000);
    expect(result.holdings[0].sourceFundSymbols).toEqual(["FUND_A", "FUND_B"]);
  });
});
