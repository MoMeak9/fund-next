import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getDailyReview, upsertDailyReview } from "@/services/trade-review";
import { dailyReviewSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { date } = await params;
  const review = await getDailyReview(userId, date);
  if (!review) return fail(404, "当日复盘不存在");
  return ok(review);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { date } = await params;
  const body = await request.json();
  const parsed = dailyReviewSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const review = await upsertDailyReview(userId, date, parsed.data);
  return ok(review);
}
