import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { deleteGoal, GoalError, updateGoal } from "@/services/goals";
import { updateGoalSchema } from "@/services/goals/schema";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const goal = await updateGoal(userId, BigInt(id), parsed.data);
    if (!goal) return fail(404, "目标不存在");
    return ok(goal);
  } catch (e) {
    if (e instanceof GoalError) return fail(e.code as 400, e.message);
    throw e;
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await deleteGoal(userId, BigInt(id));
  if (!deleted) return fail(404, "目标不存在");

  return ok(null);
}
