import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { searchAssets } from "@/services/market-data";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const keyword = request.nextUrl.searchParams.get("keyword") ?? "";
  if (!keyword.trim()) return ok([]);

  const results = await searchAssets(keyword);
  return ok(results);
}
