import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    goal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userAsset: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { createGoal, getActiveGoal, GoalError } from "@/services/goals";

const mockGoal = {
  findMany: vi.mocked(prisma.goal.findMany),
  findFirst: vi.mocked(prisma.goal.findFirst),
  create: vi.mocked(prisma.goal.create),
  update: vi.mocked(prisma.goal.update),
};
const mockUserAsset = {
  findMany: vi.mocked(prisma.userAsset.findMany),
};

describe("goal service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createGoal rejects when active goal exists", async () => {
    mockGoal.findFirst.mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      goalName: "Existing",
      targetAmount: new Decimal(100000),
      targetDate: new Date("2027-01-01"),
      initialPrincipal: new Decimal(0),
      includeProfit: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(
      createGoal(BigInt(1), { goalName: "New", targetAmount: 200000, targetDate: "2028-01-01" })
    ).rejects.toThrow(GoalError);

    try {
      await createGoal(BigInt(1), { goalName: "New", targetAmount: 200000, targetDate: "2028-01-01" });
    } catch (e) {
      expect((e as GoalError).code).toBe(409);
    }
  });

  it("getActiveGoal calculates progress", async () => {
    mockGoal.findFirst.mockResolvedValue({
      id: BigInt(1),
      userId: BigInt(1),
      goalName: "Save 100k",
      targetAmount: new Decimal(100000),
      targetDate: new Date("2027-12-31"),
      initialPrincipal: new Decimal(0),
      includeProfit: false,
      status: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    mockUserAsset.findMany.mockResolvedValue([
      { costAmount: new Decimal(30000) } as never,
      { costAmount: new Decimal(20000) } as never,
    ]);

    const result = await getActiveGoal(BigInt(1));

    expect(result).not.toBeNull();
    expect(result!.currentPrincipal).toBe(50000);
    expect(result!.remainingAmount).toBe(50000);
    expect(result!.completionRate).toBe(0.5);
  });
});
