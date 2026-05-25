import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { removeFromWatchlist } from "@/services/watchlist";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await removeFromWatchlist(userId, BigInt(id));
  if (!deleted) return fail(404, "自选不存在");

  return ok(null);
}
