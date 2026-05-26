import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/middleware", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("@/services/dashboard", () => ({
  getDashboardSummary: vi.fn(),
}));

import { getCurrentUserId } from "@/lib/auth/middleware";
import { getDashboardSummary } from "@/services/dashboard";
import { GET } from "@/app/api/reports/summary/route";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockGetDashboardSummary = vi.mocked(getDashboardSummary);

describe("GET /api/reports/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns dashboard summary fields including market allocation", async () => {
    mockGetCurrentUserId.mockReturnValue(BigInt(1));
    mockGetDashboardSummary.mockResolvedValue({
      totalAssetValue: 100000,
      totalCost: 80000,
      totalProfit: 20000,
      totalProfitRate: 0.25,
      assetAllocation: [{ key: "stock", value: 70000, percentage: 0.7 }],
      marketAllocation: [{ key: "US", value: 70000, percentage: 0.7 }],
      recentTransactions: [],
      activeGoal: null,
    });

    const response = await GET(new NextRequest("http://localhost/api/reports/summary"));
    const json = await response.json();

    expect(json.code).toBe(0);
    expect(json.data).toEqual({
      totalAssetValue: 100000,
      totalCost: 80000,
      totalProfit: 20000,
      totalProfitRate: 0.25,
      assetAllocation: [{ assetType: "stock", value: 70000, percentage: 0.7 }],
      marketAllocation: [{ market: "US", value: 70000, percentage: 0.7 }],
    });
  });
});
