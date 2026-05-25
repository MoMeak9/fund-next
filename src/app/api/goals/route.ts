import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { createGoal, GoalError, listGoals } from "@/services/goals";
import { createGoalSchema } from "@/services/goals/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const goals = await listGoals(userId);
  return ok(goals);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const goal = await createGoal(userId, parsed.data);
    return ok(goal);
  } catch (e) {
    if (e instanceof GoalError) return fail(e.code as 409, e.message);
    throw e;
  }
}
