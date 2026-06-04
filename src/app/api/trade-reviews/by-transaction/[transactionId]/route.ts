import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getReviewByTransaction } from "@/services/trade-review";

// Find-or-create support: returns the review for a transaction, or null data when none exists yet.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> },
) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { transactionId } = await params;
  const review = await getReviewByTransaction(userId, BigInt(transactionId));
  return ok(review);
}
