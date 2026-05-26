import { Decimal } from "@prisma/client/runtime/library";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    goal: {
      findFirst: vi.fn(),
    },
    transaction: {
      count: vi.fn(),
    },
    userAsset: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { generateAnalysis } from "@/services/ai";

describe("ai analysis service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-25T08:00:00.000Z"));
  });

  it("returns empty-state analysis when the user has no assets", async () => {
    vi.mocked(prisma.userAsset.findMany).mockResolvedValue([]);
    vi.mocked(prisma.transaction.count).mockResolvedValue(0);
    vi.mocked(prisma.goal.findFirst).mockResolvedValue(null);

    const result = await generateAnalysis(BigInt(1));

    expect(result.summary).toBe("暂无资产数据，请先添加资产后查看分析");
    expect(result.insights).toEqual([]);
    expect(result.riskNotes).toContain("以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。");
    expect(result.generatedAt).toBe("2026-05-25T08:00:00.000Z");
  });

  it("generates allocation, transaction, goal, and concentration insights for assets", async () => {
    vi.mocked(prisma.userAsset.findMany).mockResolvedValue([
      asset({ assetName: "Apple", assetType: "stock", market: "US", marketValue: 60000, costAmount: 45000 }),
      asset({ assetName: "沪深300ETF", assetType: "fund", market: "CN", marketValue: 25000, costAmount: 22000 }),
      asset({ assetName: "现金", assetType: "cash", market: null, marketValue: 15000, costAmount: 15000 }),
    ]);
    vi.mocked(prisma.transaction.count).mockResolvedValue(7);
    vi.mocked(prisma.goal.findFirst).mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      goalName: "长期储蓄",
      targetAmount: new Decimal(150000),
      targetDate: new Date("2026-11-25"),
      initialPrincipal: new Decimal(0),
      includeProfit: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await generateAnalysis(BigInt(1));

    expect(result.summary.split("。").filter(Boolean)).toHaveLength(3);
    expect(result.insights).toHaveLength(5);
    expect(result.insights[0]).toContain("Apple");
    expect(result.insights[0]).toContain("60.0%");
    expect(result.insights).toContain("资产类型以 stock 为主，占总市值 60.0%，其次为 fund 25.0%。");
    expect(result.insights).toContain("市场配置主要集中在 US，占比 60.0%，其次为 CN 25.0%。");
    expect(result.insights).toContain("近 30 天记录了 7 笔交易，可结合交易原因复盘操作节奏。");
    expect(result.insights.some((item) => item.includes("长期储蓄") && item.includes("剩余 ¥68,000"))).toBe(true);
    expect(prisma.transaction.count).toHaveBeenCalledWith({
      where: {
        userId: BigInt(1),
        deletedAt: null,
        transactionTime: { gte: new Date("2026-04-25T08:00:00.000Z") },
      },
    });
  });
});

function asset(input: {
  assetName: string;
  assetType: string;
  market: string | null;
  marketValue: number;
  costAmount: number;
}) {
  return {
    id: BigInt(Math.floor(Math.random() * 1000) + 1),
    userId: BigInt(1),
    symbol: null,
    currency: "CNY",
    quantity: new Decimal(1),
    avgCost: new Decimal(input.costAmount),
    currentPrice: new Decimal(input.marketValue),
    remark: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...input,
    marketValue: new Decimal(input.marketValue),
    costAmount: new Decimal(input.costAmount),
  };
}
