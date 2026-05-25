import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";
import { calculateGoalCompletion, calculateMonthlyRequiredContribution } from "@/lib/finance/calculations";

import type { CreateGoalInput, UpdateGoalInput } from "./schema";

export async function listGoals(userId: bigint) {
  const goals = await prisma.goal.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });
  return goals.map(serializeGoal);
}

export async function createGoal(userId: bigint, input: CreateGoalInput) {
  const activeGoal = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
  if (activeGoal) {
    throw new GoalError(409, "已有进行中的目标，请先完成或删除当前目标");
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
    },
  });

  return serializeGoal(goal);
}

export async function getActiveGoal(userId: bigint) {
  const goal = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
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
    ...serializeGoal(goal),
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

  const data: Record<string, unknown> = {};
  if (input.goalName != null) data.goalName = input.goalName;
  if (input.targetAmount != null) data.targetAmount = new Decimal(input.targetAmount);
  if (input.targetDate != null) data.targetDate = new Date(input.targetDate);
  if (input.initialPrincipal != null) data.initialPrincipal = new Decimal(input.initialPrincipal);

  const goal = await prisma.goal.update({ where: { id }, data });
  return serializeGoal(goal);
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

export class GoalError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "GoalError";
  }
}
