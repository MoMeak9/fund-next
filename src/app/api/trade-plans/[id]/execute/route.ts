import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { executePlan, ReviewError } from "@/services/trade-review";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!body.transactionId) return fail(400, "请提供 transactionId");

  try {
    const plan = await executePlan(userId, BigInt(id), BigInt(body.transactionId));
    return ok(plan);
  } catch (e) {
    if (e instanceof ReviewError) return fail(e.code as 404, e.message);
    throw e;
  }
}
