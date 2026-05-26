import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env/server";
import { searchAssets } from "@/services/market-data";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  let provider = "unknown";
  let envAvailable = true;
  try {
    provider = getServerEnv().MARKET_DATA_PROVIDER;
  } catch {
    envAvailable = false;
  }

  const [database, marketData, stats] = await Promise.all([
    checkDatabase(),
    envAvailable ? checkMarketData(provider) : Promise.resolve({ provider, status: "error" as const }),
    getStats(),
  ]);

  return ok({
    status: database.connected && marketData.status === "ok" && stats.available ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    database,
    marketData,
    stats: {
      userCount: stats.userCount,
      assetCount: stats.assetCount,
      transactionCount: stats.transactionCount,
    },
  });
}

async function checkDatabase() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, latencyMs: Date.now() - startedAt };
  } catch {
    return { connected: false, latencyMs: Date.now() - startedAt };
  }
}

async function checkMarketData(provider: string) {
  try {
    await searchAssets("AAPL");
    return { provider, status: "ok" as const };
  } catch {
    return { provider, status: "error" as const };
  }
}

async function getStats() {
  try {
    const [userCount, assetCount, transactionCount] = await Promise.all([
      prisma.user.count(),
      prisma.userAsset.count({ where: { deletedAt: null } }),
      prisma.transaction.count({ where: { deletedAt: null } }),
    ]);

    return { available: true, userCount, assetCount, transactionCount };
  } catch {
    return { available: false, userCount: 0, assetCount: 0, transactionCount: 0 };
  }
}
