import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";
import { calculateGoalCompletion, calculateMonthlyRequiredContribution } from "@/lib/finance/calculations";

import type { AllocationInput, CreateGoalInput, UpdateGoalInput } from "./schema";

export async function listGoals(userId: bigint) {
  const goals = await prisma.goal.findMany({
    where: { userId, deletedAt: null },
    include: { allocations: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return goals.map(serializeGoalWithAllocations);
}

export async function createGoal(userId: bigint, input: CreateGoalInput) {
  const activeGoal = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
  if (activeGoal) {
    throw new GoalError(409, "已有进行中的目标，请先完成或删除当前目标");
  }

  if (input.allocations?.length) {
    const totalPct = input.allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      throw new GoalError(400, "配置比例合计必须为 100%");
    }
  }

  const goal = await prisma.goal.create({
    data: {
      userId,
      goalName: input.goalName,
      targetAmount: new Decimal(input.targetAmount),
      targetDate: new Date(input.targetDate),
      initialPrincipal: new Decimal(input.initialPrincipal ?? 0),
      includeProfit: false,
      status: 1,
      allocations: input.allocations?.length
        ? {
            create: input.allocations.map((a, idx) => ({
              name: a.name,
              percentage: new Decimal(a.percentage),
              targetAmount: new Decimal(a.targetAmount),
              assets: a.assets ?? null,
              role: a.role ?? null,
              sortOrder: a.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    include: { allocations: { orderBy: { sortOrder: "asc" } } },
  });

  return serializeGoalWithAllocations(goal);
}

export async function getActiveGoal(userId: bigint) {
  const goal = await prisma.goal.findFirst({
    where: { userId, status: 1, deletedAt: null },
    include: { allocations: { orderBy: { sortOrder: "asc" } } },
  });
  if (!goal) return null;

  const assets = await prisma.userAsset.findMany({ where: { userId, deletedAt: null } });
  const currentPrincipal = assets.reduce((sum, a) => sum + (a.costAmount ? Number(a.costAmount) : 0), 0);

  const targetAmount = Number(goal.targetAmount);
  const completion = calculateGoalCompletion({ currentPrincipal, targetAmount });
  const monthlyRequired = calculateMonthlyRequiredContribution({
    remainingAmount: completion.remainingAmount,
    currentDate: new Date(),
    targetDate: goal.targetDate,
  });

  return {
    ...serializeGoalWithAllocations(goal),
    currentPrincipal,
    completionRate: completion.displayRate,
    rawRate: completion.rawRate,
    remainingAmount: completion.remainingAmount,
    monthlyRequired,
  };
}

export async function updateGoal(userId: bigint, id: bigint, input: UpdateGoalInput) {
  const existing = await prisma.goal.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return null;

  if (input.allocations?.length) {
    const totalPct = input.allocations.reduce((sum, a) => sum + a.percentage, 0);
    if (Math.abs(totalPct - 100) > 0.01) {
      throw new GoalError(400, "配置比例合计必须为 100%");
    }
  }

  const data: Record<string, unknown> = {};
  if (input.goalName != null) data.goalName = input.goalName;
  if (input.targetAmount != null) data.targetAmount = new Decimal(input.targetAmount);
  if (input.targetDate != null) data.targetDate = new Date(input.targetDate);
  if (input.initialPrincipal != null) data.initialPrincipal = new Decimal(input.initialPrincipal);

  // If allocations provided, replace all existing ones
  if (input.allocations) {
    await prisma.goalAllocation.deleteMany({ where: { goalId: id } });
    if (input.allocations.length > 0) {
      await prisma.goalAllocation.createMany({
        data: input.allocations.map((a, idx) => ({
          goalId: id,
          name: a.name,
          percentage: new Decimal(a.percentage),
          targetAmount: new Decimal(a.targetAmount),
          assets: a.assets ?? null,
          role: a.role ?? null,
          sortOrder: a.sortOrder ?? idx,
        })),
      });
    }
  }

  const goal = await prisma.goal.update({
    where: { id },
    data,
    include: { allocations: { orderBy: { sortOrder: "asc" } } },
  });
  return serializeGoalWithAllocations(goal);
}

export async function deleteGoal(userId: bigint, id: bigint) {
  const existing = await prisma.goal.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.goal.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

function serializeGoal(goal: Record<string, unknown>) {
  return {
    id: String(goal.id),
    goalName: goal.goalName,
    targetAmount: Number(goal.targetAmount),
    targetDate: (goal.targetDate as Date).toISOString().split("T")[0],
    initialPrincipal: Number(goal.initialPrincipal),
    includeProfit: goal.includeProfit,
    status: goal.status,
    createdAt: (goal.createdAt as Date).toISOString(),
  };
}

function serializeGoalWithAllocations(goal: Record<string, unknown>) {
  const base = serializeGoal(goal);
  const allocations = (goal.allocations as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...base,
    allocations: allocations.map((a) => ({
      id: String(a.id),
      name: a.name,
      percentage: Number(a.percentage),
      targetAmount: Number(a.targetAmount),
      assets: a.assets ?? null,
      role: a.role ?? null,
      sortOrder: Number(a.sortOrder),
    })),
  };
}

export class GoalError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "GoalError";
  }
}
