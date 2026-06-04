import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { listActions, createAction } from "@/services/trade-review";
import { createActionSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const actions = await listActions(userId, status);
  return ok(actions);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createActionSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const action = await createAction(userId, parsed.data);
  return ok(action);
}
