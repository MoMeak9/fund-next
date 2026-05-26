import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env/server";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  let dbConnected = false;
  let dbLatencyMs = 0;
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  const env = getServerEnv();
  const marketDataProvider = env.MARKET_DATA_PROVIDER;
  const marketDataStatus = "ok" as const;

  const [userCount, assetCount, transactionCount] = await Promise.all([
    prisma.user.count(),
    prisma.userAsset.count({ where: { deletedAt: null } }),
    prisma.transaction.count({ where: { deletedAt: null } }),
  ]);

  const status = dbConnected ? "healthy" : "degraded";

  return ok({
    status,
    timestamp: new Date().toISOString(),
    database: { connected: dbConnected, latencyMs: dbLatencyMs },
    marketData: { provider: marketDataProvider, status: marketDataStatus },
    stats: { userCount, assetCount, transactionCount },
  });
}
