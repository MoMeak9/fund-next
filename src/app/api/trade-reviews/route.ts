import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { listReviews, createReview, ReviewError } from "@/services/trade-review";
import { createReviewSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const sp = request.nextUrl.searchParams;
  const filters = {
    tradeGrade: sp.get("tradeGrade") ?? undefined,
    strategyType: sp.get("strategyType") ?? undefined,
    errorType: sp.get("errorType") ?? undefined,
    startDate: sp.get("startDate") ?? undefined,
    endDate: sp.get("endDate") ?? undefined,
  };
  const pagination = {
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  };

  const result = await listReviews(userId, filters, pagination);
  return ok(result);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const review = await createReview(userId, parsed.data);
    return ok(review);
  } catch (e) {
    if (e instanceof ReviewError) return fail(e.code as 409, e.message);
    throw e;
  }
}
