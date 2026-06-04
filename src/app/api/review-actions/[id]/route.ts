import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { updateAction } from "@/services/trade-review";
import { updateActionSchema } from "@/services/trade-review/schema";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateActionSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const action = await updateAction(userId, BigInt(id), parsed.data);
  if (!action) return fail(404, "行动项不存在");
  return ok(action);
}
