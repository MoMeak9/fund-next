import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    errorTracking: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    reviewAction: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    tradeReview: { findFirst: vi.fn(), create: vi.fn() },
    tradePlan: { findFirst: vi.fn() },
    transaction: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/lib/db/prisma";
import {
  trackError,
  getErrorStats,
  createAction,
  listActions,
  completeAction,
  createReview,
} from "@/services/trade-review";

describe("error tracking + action services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackError upserts on (userId, errorType) incrementing count and loss", async () => {
    vi.mocked(prisma.errorTracking.upsert).mockResolvedValue({} as never);
    await trackError(BigInt(1), "chasing", -1.5);
    const call = vi.mocked(prisma.errorTracking.upsert).mock.calls[0]![0]!;
    expect(call.where).toHaveProperty("userId_errorType");
    expect(call.create.occurrenceCount).toBe(1);
    expect(Number(call.create.totalLossR)).toBe(-1.5);
  });

  it("getErrorStats returns serialized rows ordered by occurrence", async () => {
    vi.mocked(prisma.errorTracking.findMany).mockResolvedValue([
      { id: BigInt(1), errorType: "chasing", occurrenceCount: 3, totalLossR: new Decimal(-4.5), trackingStart: null, trackingEnd: null },
    ] as never);
    const stats = await getErrorStats(BigInt(1));
    expect(stats[0].errorType).toBe("chasing");
    expect(stats[0].totalLossR).toBe(-4.5);
  });

  it("createAction sets status active and startedAt", async () => {
    vi.mocked(prisma.reviewAction.create).mockResolvedValue({
      id: BigInt(1), sourceType: "daily_review", problem: "p", rule: "r", status: "active",
      startedAt: new Date("2026-02-01"), completedAt: null, createdAt: new Date(), updatedAt: new Date(),
    } as never);
    const a = await createAction(BigInt(1), { sourceType: "daily_review", problem: "p", rule: "r" });
    expect(a.status).toBe("active");
    const data = vi.mocked(prisma.reviewAction.create).mock.calls[0]![0]!.data as Record<string, unknown>;
    expect(data.status).toBe("active");
    expect(data.startedAt).toBeInstanceOf(Date);
  });

  it("listActions filters by status", async () => {
    vi.mocked(prisma.reviewAction.findMany).mockResolvedValue([] as never);
    await listActions(BigInt(1), "active");
    const where = vi.mocked(prisma.reviewAction.findMany).mock.calls[0]![0]!.where as Record<string, unknown>;
    expect(where.status).toBe("active");
  });

  it("completeAction sets completed + completedAt + result", async () => {
    vi.mocked(prisma.reviewAction.findFirst).mockResolvedValue({ id: BigInt(1), userId: BigInt(1) } as never);
    vi.mocked(prisma.reviewAction.update).mockResolvedValue({
      id: BigInt(1), sourceType: "daily_review", problem: "p", rule: "r", status: "completed",
      result: "done", startedAt: null, completedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    } as never);
    const a = await completeAction(BigInt(1), BigInt(1), "done");
    expect(a.status).toBe("completed");
    const data = vi.mocked(prisma.reviewAction.update).mock.calls[0]![0]!.data as Record<string, unknown>;
    expect(data.status).toBe("completed");
    expect(data.completedAt).toBeInstanceOf(Date);
  });

  it("createReview triggers error aggregation when errorType != none", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(9), userId: BigInt(1), deletedAt: null, price: new Decimal(10),
      transactionTime: new Date(), asset: {},
    } as never);
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.tradeReview.create).mockResolvedValue({
      id: BigInt(1), transactionId: BigInt(9), createdAt: new Date(), updatedAt: new Date(), transaction: { asset: {} },
    } as never);
    vi.mocked(prisma.errorTracking.upsert).mockResolvedValue({} as never);

    await createReview(BigInt(1), { transactionId: "9", errorType: "chasing", rMultiple: -1 });

    expect(vi.mocked(prisma.errorTracking.upsert)).toHaveBeenCalledTimes(1);
    const call = vi.mocked(prisma.errorTracking.upsert).mock.calls[0]![0]!;
    expect(Number(call.create.totalLossR)).toBe(-1);
  });

  it("createReview does NOT aggregate when errorType is none", async () => {
    vi.mocked(prisma.transaction.findFirst).mockResolvedValue({
      id: BigInt(9), userId: BigInt(1), deletedAt: null, price: new Decimal(10),
      transactionTime: new Date(), asset: {},
    } as never);
    vi.mocked(prisma.tradeReview.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.tradeReview.create).mockResolvedValue({
      id: BigInt(1), transactionId: BigInt(9), createdAt: new Date(), updatedAt: new Date(), transaction: { asset: {} },
    } as never);

    await createReview(BigInt(1), { transactionId: "9", errorType: "none" });
    expect(vi.mocked(prisma.errorTracking.upsert)).not.toHaveBeenCalled();
  });
});
