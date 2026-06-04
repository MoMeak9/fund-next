import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { calculateMonthlyStats } from "@/services/trade-review";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const month = request.nextUrl.searchParams.get("month");
  if (!month) return fail(400, "请提供 month (YYYY-MM)");

  const stats = await calculateMonthlyStats(userId, month);
  return ok(stats);
}
