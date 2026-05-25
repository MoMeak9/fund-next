import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { addToWatchlist, listWatchlist, WatchlistError } from "@/services/watchlist";
import { addWatchlistSchema } from "@/services/watchlist/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const items = await listWatchlist(userId);
  return ok({ items });
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = addWatchlistSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const item = await addToWatchlist(userId, parsed.data);
    return ok(item);
  } catch (e) {
    if (e instanceof WatchlistError) return fail(e.code as 409, e.message);
    throw e;
  }
}
