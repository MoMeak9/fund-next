import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getReview, updateReview } from "@/services/trade-review";
import { updateReviewSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const review = await getReview(userId, BigInt(id));
  if (!review) return fail(404, "复盘记录不存在");

  return ok(review);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateReviewSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const review = await updateReview(userId, BigInt(id), parsed.data);
  if (!review) return fail(404, "复盘记录不存在");

  return ok(review);
}
