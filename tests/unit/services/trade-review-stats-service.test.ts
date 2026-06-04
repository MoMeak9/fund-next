import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tradeReview: {
      findMany: vi.fn(),
    },
    strategyStats: {
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import {
  calculateWeeklyStats,
  calculateMonthlyStats,
  calculateStrategyStats,
} from "@/services/trade-review";

const review = (r: number, strategyType: string, env = "trending") => ({
  rMultiple: new Decimal(r),
  tradeGrade: r > 0 ? "A" : "C",
  strategyType,
  marketEnvironment: env,
  errorType: "none",
  followedPlan: true,
});

describe("strategy/weekly/monthly stats services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculateWeeklyStats loads in-window reviews and builds the weekly shape", async () => {
    vi.mocked(prisma.tradeReview.findMany).mockResolvedValue([
      review(2, "breakout"),
      review(-1, "breakout"),
    ] as never);

    const w = await calculateWeeklyStats(BigInt(1), "2026-01-01", "2026-01-07");
    expect(w.totalTrades).toBe(2);
    expect(w.netR).toBeCloseTo(1, 6);
    expect(w.byStrategy.breakout.sampleCount).toBe(2);

    const where = vi.mocked(prisma.tradeReview.findMany).mock.calls[0]![0]!.where as Record<string, unknown>;
    expect(where.includeInSample).toBe(true);
  });

  it("calculateMonthlyStats aggregates the calendar month", async () => {
    vi.mocked(prisma.tradeReview.findMany).mockResolvedValue([
      review(3, "pullback"),
      review(-1, "pullback"),
    ] as never);

    const m = await calculateMonthlyStats(BigInt(1), "2026-02");
    expect(m.month).toBe("2026-02");
    expect(m.strategies.find((s) => s.strategyType === "pullback")?.sampleCount).toBe(2);
  });

  it("calculateStrategyStats computes metrics and upserts on the unique period key", async () => {
    vi.mocked(prisma.tradeReview.findMany).mockResolvedValue([
      review(2, "breakout"),
      review(-1, "breakout"),
      review(3, "breakout"),
    ] as never);
    vi.mocked(prisma.strategyStats.upsert).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async (args: any) => ({
        id: BigInt(1),
        strategyType: "breakout",
        periodStart: new Date("2026-01-01"),
        periodEnd: new Date("2026-01-31"),
        ...args.create,
      })) as never,
    );

    const result = await calculateStrategyStats(BigInt(1), { startDate: "2026-01-01", endDate: "2026-01-31" }, "breakout");

    expect(result).toHaveLength(1);
    expect(result[0].sampleCount).toBe(3);
    expect(result[0].winCount).toBe(2);
    expect(result[0].lossCount).toBe(1);
    const call = vi.mocked(prisma.strategyStats.upsert).mock.calls[0]![0]!;
    expect(call.where).toHaveProperty("userId_strategyType_periodStart_periodEnd");
  });
});
