import { Decimal } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/db/prisma";

import type { CreateActionInput, UpdateActionInput, UpdateErrorTrackingInput } from "./schema";
import { ReviewError } from "./errors";

// --- Error tracking ---

// Upsert aggregation for one error occurrence. lossR should be <= 0 (negative R) or 0.
export async function trackError(userId: bigint, errorType: string, lossR: number) {
  await prisma.errorTracking.upsert({
    where: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId_errorType: { userId, errorType: errorType as any },
    },
    create: {
      userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorType: errorType as any,
      occurrenceCount: 1,
      totalLossR: new Decimal(lossR),
    },
    update: {
      occurrenceCount: { increment: 1 },
      totalLossR: { increment: new Decimal(lossR) },
    },
  });
}

export async function getErrorStats(userId: bigint) {
  const rows = await prisma.errorTracking.findMany({
    where: { userId },
    orderBy: { occurrenceCount: "desc" },
  });
  return rows.map(serializeError);
}

export async function updateErrorTracking(userId: bigint, errorType: string, input: UpdateErrorTrackingInput) {
  const existing = await prisma.errorTracking.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: { userId, errorType: errorType as any },
  });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (input.typicalConditions !== undefined) data.typicalConditions = input.typicalConditions ?? null;
  if (input.triggerEmotion !== undefined) data.triggerEmotion = input.triggerEmotion ?? null;
  if (input.preventionRule !== undefined) data.preventionRule = input.preventionRule ?? null;
  if (input.isImproving !== undefined) data.isImproving = input.isImproving ?? null;
  if (input.improvementNotes !== undefined) data.improvementNotes = input.improvementNotes ?? null;

  const updated = await prisma.errorTracking.update({ where: { id: existing.id }, data });
  return serializeError(updated);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeError(e: any) {
  return {
    id: String(e.id),
    errorType: e.errorType,
    occurrenceCount: e.occurrenceCount,
    totalLossR: e.totalLossR != null ? Number(e.totalLossR) : 0,
    typicalConditions: e.typicalConditions,
    triggerEmotion: e.triggerEmotion,
    preventionRule: e.preventionRule,
    trackingStart: e.trackingStart ? e.trackingStart.toISOString().split("T")[0] : null,
    trackingEnd: e.trackingEnd ? e.trackingEnd.toISOString().split("T")[0] : null,
    isImproving: e.isImproving,
    improvementNotes: e.improvementNotes,
  };
}

// --- Review actions ---

export async function createAction(userId: bigint, input: CreateActionInput) {
  const action = await prisma.reviewAction.create({
    data: {
      userId,
      sourceType: input.sourceType,
      sourceId: input.sourceId != null ? BigInt(input.sourceId) : null,
      problem: input.problem,
      rule: input.rule,
      trackingDays: input.trackingDays ?? null,
      metric: input.metric ?? null,
      status: "active",
      startedAt: new Date(),
    },
  });
  return serializeAction(action);
}

export async function listActions(userId: bigint, status?: string) {
  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  const rows = await prisma.reviewAction.findMany({ where, orderBy: { createdAt: "desc" } });
  return rows.map(serializeAction);
}

export async function updateAction(userId: bigint, id: bigint, input: UpdateActionInput) {
  const existing = await prisma.reviewAction.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: Record<string, unknown> = {};
  if (input.problem !== undefined) data.problem = input.problem;
  if (input.rule !== undefined) data.rule = input.rule;
  if (input.trackingDays !== undefined) data.trackingDays = input.trackingDays ?? null;
  if (input.metric !== undefined) data.metric = input.metric ?? null;
  if (input.status !== undefined) data.status = input.status;
  if (input.result !== undefined) data.result = input.result ?? null;

  const action = await prisma.reviewAction.update({ where: { id }, data });
  return serializeAction(action);
}

export async function completeAction(userId: bigint, id: bigint, result?: string) {
  const existing = await prisma.reviewAction.findFirst({ where: { id, userId } });
  if (!existing) throw new ReviewError(404, "行动项不存在");

  const action = await prisma.reviewAction.update({
    where: { id },
    data: { status: "completed", result: result ?? null, completedAt: new Date() },
  });
  return serializeAction(action);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeAction(a: any) {
  return {
    id: String(a.id),
    sourceType: a.sourceType,
    sourceId: a.sourceId != null ? String(a.sourceId) : null,
    problem: a.problem,
    rule: a.rule,
    trackingDays: a.trackingDays,
    metric: a.metric,
    status: a.status,
    result: a.result,
    startedAt: a.startedAt ? a.startedAt.toISOString().split("T")[0] : null,
    completedAt: a.completedAt ? a.completedAt.toISOString().split("T")[0] : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
