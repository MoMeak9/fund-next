import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tradePlan: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    dailyReview: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    tradeReview: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import {
  listPlans,
  executePlan,
  softDeletePlan,
  upsertDailyReview,
  getIndicatorDashboard,
  maxConsecutiveLoss,
  maxDrawdownR,
  createReview,
} from "@/services/trade-review";

const planRow = {
  id: BigInt(5),
  userId: BigInt(1),
  assetId: null,
  hypothesis: "突破回踩",
  marketEnvironment: "trending",
  timeframe: "1d",
  entryTrigger: "站上均线",
  entryPrice: new Decimal(100),
  stopLoss: new Decimal(90),
  takeProfit: new Decimal(130),
  positionSize: null,
  riskAmount: null,
  expectedRr: null,
  invalidation: null,
  strategyType: "breakout",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("trade-plan + daily + indicator services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PLACEHOLDER-PLAN-TESTS

  it("listPlans filters soft-deleted and returns paginated shape", async () => {
    vi.mocked(prisma.tradePlan.findMany).mockResolvedValue([planRow] as never);
    vi.mocked(prisma.tradePlan.count).mockResolvedValue(1);

    const result = await listPlans(BigInt(1), { status: "active" }, { page: 1, pageSize: 20 });

    expect(result.total).toBe(1);
    expect(result.items[0].id).toBe("5");
    const where = vi.mocked(prisma.tradePlan.findMany).mock.calls[0]![0]!.where as Record<string, unknown>;
    expect(where.deletedAt).toBeNull();
    expect(where.status).toBe("active");
  });

  it("executePlan sets status=executed after verifying ownership", async () => {
    vi.mocked(prisma.tradePlan.findFirst).mockResolvedValue(planRow as never);
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({ id: BigInt(9), userId: BigInt(1) } as never);
    vi.mocked(prisma.tradePlan.update).mockResolvedValue({ ...planRow, status: "executed" } as never);

    const result = await executePlan(BigInt(1), BigInt(5), BigInt(9));
    expect(result.status).toBe("executed");
    expect(vi.mocked(prisma.tradePlan.update).mock.calls[0][0].data).toMatchObject({ status: "executed" });
  });

  it("executePlan throws 404 when plan missing", async () => {
    vi.mocked(prisma.tradePlan.findFirst).mockResolvedValue(null);
    await expect(executePlan(BigInt(1), BigInt(5), BigInt(9))).rejects.toMatchObject({ code: 404 });
  });

  it("softDeletePlan sets deletedAt and returns true", async () => {
    vi.mocked(prisma.tradePlan.findFirst).mockResolvedValue(planRow as never);
    vi.mocked(prisma.tradePlan.update).mockResolvedValue(planRow as never);
    const ok = await softDeletePlan(BigInt(1), BigInt(5));
    expect(ok).toBe(true);
    expect(vi.mocked(prisma.tradePlan.update).mock.calls[0][0].data).toHaveProperty("deletedAt");
  });

  it("upsertDailyReview upserts on the (userId, reviewDate) key", async () => {
    vi.mocked(prisma.dailyReview.upsert).mockResolvedValue({
      id: BigInt(1),
      reviewDate: new Date("2026-02-01"),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await upsertDailyReview(BigInt(1), "2026-02-01", { notes: "x" });

    const call = vi.mocked(prisma.dailyReview.upsert).mock.calls[0][0];
    expect(call.where).toHaveProperty("userId_reviewDate");
  });

  it("getIndicatorDashboard computes the 8 metrics from reviews", async () => {
    // 4 trades ordered by time: +2, -1, -1, +3  → net +3, win rate via grade not used here
    const mk = (r: number, grade: string, err: string, t: string) => ({
      followedPlan: true,
      rMultiple: new Decimal(r),
      tradeGrade: grade,
      errorType: err,
      transaction: { transactionTime: new Date(t) },
    });
    vi.mocked(prisma.tradeReview.findMany).mockResolvedValue([
      mk(2, "A", "none", "2026-01-01"),
      mk(-1, "C", "chasing", "2026-01-02"),
      mk(-1, "C", "none", "2026-01-03"),
      mk(3, "A", "none", "2026-01-04"),
    ] as never);

    const d = await getIndicatorDashboard(BigInt(1));
    expect(d.totalTrades).toBe(4);
    expect(d.netR).toBeCloseTo(3, 6);
    expect(d.avgRMultiple).toBeCloseTo(0.75, 6);
    expect(d.gradeAPercentage).toBe(50);
    expect(d.planAdherenceRate).toBe(100);
    expect(d.maxConsecutiveLoss).toBe(2);
    expect(d.errorCostR).toBeCloseTo(-1, 6); // only the chasing(-1) trade counts
  });

  it("maxConsecutiveLoss + maxDrawdownR pure helpers", () => {
    expect(maxConsecutiveLoss([2, -1, -1, 3, -1])).toBe(2);
    expect(maxConsecutiveLoss([1, 2, 3])).toBe(0);
    // cumulative: 2,1,0,3 -> peak 2 then dips to 0 => drawdown -2
    expect(maxDrawdownR([2, -1, -1, 3])).toBeCloseTo(-2, 6);
    expect(maxDrawdownR([1, 2, 3])).toBe(0);
  });

  it("plan-based R-multiple auto-calc fills rMultiple from plan entry/stop and tx price", async () => {
    // plan entry 100, stop 90 (risk 10); tx price 120 -> +2R
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(9),
      userId: BigInt(1),
      deletedAt: null,
      price: new Decimal(120),
      transactionTime: new Date(),
      asset: { assetName: "x", symbol: "X" },
    } as never);
    vi.mocked(prisma.tradeReview.findFirst)
      .mockResolvedValueOnce(null); // no existing review
    vi.mocked(prisma.tradePlan.findFirst).mockResolvedValue({ entryPrice: new Decimal(100), stopLoss: new Decimal(90) } as never);
    vi.mocked(prisma.tradeReview.create).mockResolvedValue({
      id: BigInt(1), transactionId: BigInt(9), planId: BigInt(5), createdAt: new Date(), updatedAt: new Date(),
      transaction: { asset: {} },
    } as never);

    await createReview(BigInt(1), { transactionId: "9", planId: "5" });

    const data = vi.mocked(prisma.tradeReview.create).mock.calls[0][0].data as Record<string, unknown>;
    expect(Number(data.rMultiple)).toBeCloseTo(2, 6);
  });
});
