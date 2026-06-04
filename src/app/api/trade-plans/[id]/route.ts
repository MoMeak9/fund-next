import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getPlan, updatePlan, softDeletePlan } from "@/services/trade-review";
import { updatePlanSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const plan = await getPlan(userId, BigInt(id));
  if (!plan) return fail(404, "交易计划不存在");
  return ok(plan);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const plan = await updatePlan(userId, BigInt(id), parsed.data);
  if (!plan) return fail(404, "交易计划不存在");
  return ok(plan);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const removed = await softDeletePlan(userId, BigInt(id));
  if (!removed) return fail(404, "交易计划不存在");
  return ok(null);
}
