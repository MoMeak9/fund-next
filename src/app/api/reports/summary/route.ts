import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getDashboardSummary } from "@/services/dashboard";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const summary = await getDashboardSummary(userId);
  return ok({
    totalAssetValue: summary.totalAssetValue,
    totalCost: summary.totalCost,
    totalProfit: summary.totalProfit,
    totalProfitRate: summary.totalProfitRate,
    assetAllocation: summary.assetAllocation,
    marketAllocation: summary.marketAllocation,
  });
}
