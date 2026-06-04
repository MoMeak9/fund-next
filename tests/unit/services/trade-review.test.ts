import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    tradeReview: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    transaction: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import {
  createReview,
  updateReview,
  calculateRMultiple,
  calculateTotalScore,
  deriveGrade,
  ReviewError,
} from "@/services/trade-review";

const txRow = {
  id: BigInt(1),
  userId: BigInt(1),
  deletedAt: null,
  price: new Decimal(12),
  quantity: new Decimal(100),
  transactionType: "buy",
  transactionTime: new Date("2026-01-01"),
  asset: { assetName: "浦发银行", symbol: "600000" },
};

function createdRow(extra: Record<string, unknown>) {
  return {
    id: BigInt(10),
    userId: BigInt(1),
    transactionId: BigInt(1),
    planId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    transaction: { ...txRow },
    ...extra,
  };
}

describe("trade-review service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PLACEHOLDER-TESTS

  it("createReview persists planId/dailyRiskTotal, derives grade, and does NOT write total_score (DB-generated)", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(txRow as never);
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.tradeReview.create).mockResolvedValue(
      createdRow({ scoreOpportunity: 25, scorePlanning: 25, scoreRiskControl: 20, scoreDiscipline: 20, scorePsychology: 10, totalScore: 100, tradeGrade: "A", planId: BigInt(7), dailyRiskTotal: new Decimal(500) }) as never,
    );

    await createReview(BigInt(1), {
      transactionId: "1",
      planId: "7",
      dailyRiskTotal: 500,
      scoreOpportunity: 25,
      scorePlanning: 25,
      scoreRiskControl: 20,
      scoreDiscipline: 20,
      scorePsychology: 10,
    });

    const data = vi.mocked(prisma.tradeReview.create).mock.calls[0][0].data as Record<string, unknown>;
    expect(data.planId).toBe(BigInt(7));
    expect(Number(data.dailyRiskTotal)).toBe(500);
    expect(data.tradeGrade).toBe("A"); // 100 -> A
    // total_score is a DB GENERATED column and must never be in the write payload.
    expect("totalScore" in data).toBe(false);
  });

  it("createReview throws 404 when the transaction does not exist", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null);
    await expect(
      createReview(BigInt(1), { transactionId: "999" }),
    ).rejects.toThrow(ReviewError);
    await expect(
      createReview(BigInt(1), { transactionId: "999" }),
    ).rejects.toMatchObject({ code: 404 });
  });

  it("createReview throws 409 when a review already exists for the transaction", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue(txRow as never);
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(createdRow({}) as never);
    await expect(
      createReview(BigInt(1), { transactionId: "1" }),
    ).rejects.toMatchObject({ code: 409 });
  });

  it("updateReview recomputes grade on score change but never writes total_score", async () => {
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(
      createdRow({ scoreOpportunity: 10, scorePlanning: 10, scoreRiskControl: 10, scoreDiscipline: 10, scorePsychology: 5 }) as never,
    );
    vi.mocked(prisma.tradeReview.update).mockResolvedValue(createdRow({ tradeGrade: "B" }) as never);

    await updateReview(BigInt(1), BigInt(10), { scoreOpportunity: 25, scorePlanning: 25, scoreRiskControl: 20, scoreDiscipline: 20, scorePsychology: 10 });

    const data = vi.mocked(prisma.tradeReview.update).mock.calls[0][0].data as Record<string, unknown>;
    expect("totalScore" in data).toBe(false);
    expect(data.tradeGrade).toBe("A"); // new total 100 -> A
  });

  it("updateReview keeps an explicitly provided grade and returns null for non-existent review", async () => {
    // explicit grade respected
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(
      createdRow({ scoreOpportunity: 25, scorePlanning: 25, scoreRiskControl: 20, scoreDiscipline: 20, scorePsychology: 10 }) as never,
    );
    vi.mocked(prisma.tradeReview.update).mockResolvedValue(createdRow({ tradeGrade: "C" }) as never);
    await updateReview(BigInt(1), BigInt(10), { tradeGrade: "C", scoreOpportunity: 25 });
    const data = vi.mocked(prisma.tradeReview.update).mock.calls[0][0].data as Record<string, unknown>;
    expect(data.tradeGrade).toBe("C");

    // non-existent
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(null);
    const result = await updateReview(BigInt(1), BigInt(999), { notes: "x" });
    expect(result).toBeNull();
  });

  it("calculateRMultiple uses the long-side formula and returns null when entry === stop", () => {
    // entry 100, stop 90 (risk 10), exit 120 -> +2R
    expect(calculateRMultiple(100, 90, 120)).toBeCloseTo(2, 6);
    // loss: exit 95 -> -0.5R
    expect(calculateRMultiple(100, 90, 95)).toBeCloseTo(-0.5, 6);
    // undefined risk
    expect(calculateRMultiple(100, 100, 120)).toBeNull();
  });

  it("calculateTotalScore sums dimensions and is null when all scores are null", () => {
    expect(calculateTotalScore({ scoreOpportunity: 25, scorePlanning: 25, scoreRiskControl: 20, scoreDiscipline: 20, scorePsychology: 10 })).toBe(100);
    expect(calculateTotalScore({ scoreOpportunity: 10 })).toBe(10);
    expect(calculateTotalScore({})).toBeNull();
  });

  it("deriveGrade maps totals to A/B/C at the 80/60 boundaries", () => {
    expect(deriveGrade(80)).toBe("A");
    expect(deriveGrade(79)).toBe("B");
    expect(deriveGrade(60)).toBe("B");
    expect(deriveGrade(59)).toBe("C");
    expect(deriveGrade(null)).toBeNull();
  });
});
