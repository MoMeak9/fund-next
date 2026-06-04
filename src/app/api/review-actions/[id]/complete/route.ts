import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { completeAction, ReviewError } from "@/services/trade-review";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const action = await completeAction(userId, BigInt(id), body.result);
    return ok(action);
  } catch (e) {
    if (e instanceof ReviewError) return fail(e.code as 404, e.message);
    throw e;
  }
}
