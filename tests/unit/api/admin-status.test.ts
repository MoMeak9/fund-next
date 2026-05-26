import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/middleware", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
    user: { count: vi.fn() },
    userAsset: { count: vi.fn() },
    transaction: { count: vi.fn() },
  },
}));

vi.mock("@/lib/env/server", () => ({
  getServerEnv: vi.fn(),
}));

vi.mock("@/services/market-data", () => ({
  searchAssets: vi.fn(),
}));

import { getCurrentUserId } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db/prisma";
import { getServerEnv } from "@/lib/env/server";
import { searchAssets } from "@/services/market-data";
import { GET } from "@/app/api/admin/status/route";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockPrisma = vi.mocked(prisma);
const mockGetServerEnv = vi.mocked(getServerEnv);
const mockSearchAssets = vi.mocked(searchAssets);

describe("GET /api/admin/status", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockReturnValue(BigInt(1));
    mockGetServerEnv.mockReturnValue({
      DATABASE_URL: "mysql://user:pass@localhost:3306/fund",
      JWT_ACCESS_SECRET: "access-secret-123456",
      JWT_REFRESH_SECRET: "refresh-secret-123456",
      MARKET_DATA_PROVIDER: "mock",
      MARKET_DATA_API_KEY: "",
      MARKET_DATA_BASE_URL: "",
    });
    mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
    vi.mocked(mockPrisma.user.count).mockResolvedValue(3);
    vi.mocked(mockPrisma.userAsset.count).mockResolvedValue(8);
    vi.mocked(mockPrisma.transaction.count).mockResolvedValue(21);
    mockSearchAssets.mockResolvedValue([]);
  });

  it("returns healthy system status with database, market-data, and stats", async () => {
    const response = await GET(new NextRequest("http://localhost/api/admin/status"));
    const json = await response.json();

    expect(json.code).toBe(0);
    expect(json.data).toMatchObject({
      status: "healthy",
      database: { connected: true },
      marketData: { provider: "mock", status: "ok" },
      stats: { userCount: 3, assetCount: 8, transactionCount: 21 },
    });
    expect(typeof json.data.timestamp).toBe("string");
    expect(typeof json.data.database.latencyMs).toBe("number");
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
    expect(mockPrisma.userAsset.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(mockPrisma.transaction.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it("returns degraded status when a dependency check fails", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(new NextRequest("http://localhost/api/admin/status"));
    const json = await response.json();

    expect(json.code).toBe(0);
    expect(json.data).toMatchObject({
      status: "degraded",
      database: { connected: false },
      marketData: { provider: "mock", status: "ok" },
      stats: { userCount: 3, assetCount: 8, transactionCount: 21 },
    });
  });
});
