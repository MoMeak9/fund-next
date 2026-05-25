import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getQuotes } from "@/services/market-data";
import type { Market } from "@/types/domain";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const symbols = request.nextUrl.searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  const markets = request.nextUrl.searchParams.get("markets")?.split(",").filter(Boolean) ?? [];

  if (symbols.length === 0) return ok([]);

  const requests = symbols.map((symbol, i) => ({
    symbol,
    market: (markets[i] ?? "CN") as Market,
  }));

  const quotes = await getQuotes(requests);
  return ok(quotes);
}
