import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { calculateWeeklyStats } from "@/services/trade-review";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const sp = request.nextUrl.searchParams;
  const startDate = sp.get("startDate");
  const endDate = sp.get("endDate");
  if (!startDate || !endDate) return fail(400, "请提供 startDate 与 endDate");

  const stats = await calculateWeeklyStats(userId, startDate, endDate);
  return ok(stats);
}
