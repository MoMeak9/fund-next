import { prisma } from "@/lib/db/prisma";
import {
  aggregateDuplicateHoldings,
  calculateFundExposureAmount,
} from "@/lib/finance/calculations";
import type { ExposureHolding } from "@/lib/finance/calculations";

type AllocationItem = { key: string; amount: number; percentage: number };

export async function getFundsExposure(userId: bigint) {
  const fundAssets = await prisma.userAsset.findMany({
    where: { userId, assetType: "fund", deletedAt: null },
  });

  if (fundAssets.length === 0) {
    return {
      totalFundValue: 0,
      holdings: [],
      industryAllocation: [],
      marketAllocation: [],
    };
  }

  const totalFundValue = fundAssets.reduce(
    (sum, a) => sum + (a.marketValue ? Number(a.marketValue) : 0),
    0,
  );

  const allHoldings: ExposureHolding[] = [];

  for (const fund of fundAssets) {
    if (!fund.symbol) continue;
    const fundMarketValue = fund.marketValue ? Number(fund.marketValue) : 0;
    if (fundMarketValue <= 0) continue;

    const holdings = await prisma.fundHolding.findMany({
      where: { fundSymbol: fund.symbol },
      orderBy: { weight: "desc" },
    });

    for (const h of holdings) {
      const exposureAmount = calculateFundExposureAmount({
        fundMarketValue,
        holdingWeight: Number(h.weight),
      });

      allHoldings.push({
        holdingSymbol: h.holdingSymbol,
        holdingName: h.holdingName,
        holdingMarket: h.holdingMarket ?? "CN",
        industry: h.industry ?? "其他",
        exposureAmount,
        sourceFundSymbols: [fund.symbol],
      });
    }
  }

  const merged = aggregateDuplicateHoldings(allHoldings);
  const totalExposure = merged.reduce((sum, h) => sum + h.exposureAmount, 0);

  const industryMap = new Map<string, number>();
  const marketMap = new Map<string, number>();

  for (const h of merged) {
    industryMap.set(
      h.industry,
      (industryMap.get(h.industry) ?? 0) + h.exposureAmount,
    );
    marketMap.set(
      h.holdingMarket,
      (marketMap.get(h.holdingMarket) ?? 0) + h.exposureAmount,
    );
  }

  const industryAllocation = buildAllocation(industryMap, totalExposure);
  const marketAllocation = buildAllocation(marketMap, totalExposure);

  // Build fund summary list
  const fundSummary = fundAssets
    .filter((f) => f.symbol && f.marketValue && Number(f.marketValue) > 0)
    .map((f) => ({
      id: f.id.toString(),
      symbol: f.symbol!,
      name: f.assetName,
      marketValue: Number(f.marketValue),
      percentage:
        totalFundValue > 0 ? Number(f.marketValue) / totalFundValue : 0,
    }));

  return {
    totalFundValue,
    totalExposure,
    holdings: merged,
    industryAllocation,
    marketAllocation,
    fundSummary,
  };
}

export async function getFundExposureDetail(
  userId: bigint,
  fundAssetId: bigint,
) {
  const fund = await prisma.userAsset.findFirst({
    where: { id: fundAssetId, userId, assetType: "fund", deletedAt: null },
  });
  if (!fund) return null;
  if (!fund.symbol) return { fundName: fund.assetName, holdings: [] };

  const fundMarketValue = fund.marketValue ? Number(fund.marketValue) : 0;
  const holdings = await prisma.fundHolding.findMany({
    where: { fundSymbol: fund.symbol },
    orderBy: { weight: "desc" },
  });

  const result = holdings.map((h) => ({
    holdingSymbol: h.holdingSymbol,
    holdingName: h.holdingName,
    holdingMarket: h.holdingMarket ?? "CN",
    industry: h.industry ?? "其他",
    weight: Number(h.weight),
    exposureAmount: calculateFundExposureAmount({
      fundMarketValue,
      holdingWeight: Number(h.weight),
    }),
  }));

  return { fundName: fund.assetName, holdings: result };
}

function buildAllocation(
  map: Map<string, number>,
  total: number,
): AllocationItem[] {
  return Array.from(map.entries()).map(([key, amount]) => ({
    key,
    amount: Math.round(amount * 100) / 100,
    percentage: total > 0 ? Math.round((amount / total) * 10000) / 10000 : 0,
  }));
}

/**
 * Get historical trend of top holdings weight across report dates.
 * Returns data suitable for a multi-line chart.
 */
export async function getExposureTrend(userId: bigint) {
  const fundAssets = await prisma.userAsset.findMany({
    where: { userId, assetType: "fund", deletedAt: null },
  });

  const symbols = fundAssets.map((f) => f.symbol).filter(Boolean) as string[];
  if (symbols.length === 0) return { dates: [], series: [] };

  // Get all holdings across all report dates for these funds
  const allHoldings = await prisma.fundHolding.findMany({
    where: { fundSymbol: { in: symbols } },
    orderBy: { reportDate: "asc" },
  });

  // Build fund market value map (keyed by symbol)
  const fundValueMap = new Map<string, number>();
  for (const f of fundAssets) {
    if (f.symbol)
      fundValueMap.set(f.symbol, f.marketValue ? Number(f.marketValue) : 0);
  }

  // Group by reportDate -> holdingSymbol -> aggregate weight
  const dateMap = new Map<
    string,
    Map<string, { name: string; totalExposure: number }>
  >();
  const holdingNames = new Map<string, string>();

  for (const h of allHoldings) {
    const dateStr = h.reportDate.toISOString().slice(0, 10);
    if (!dateMap.has(dateStr)) dateMap.set(dateStr, new Map());
    const holdings = dateMap.get(dateStr)!;

    const fundValue = fundValueMap.get(h.fundSymbol) ?? 0;
    const exposure = fundValue * Number(h.weight);

    const existing = holdings.get(h.holdingSymbol);
    if (existing) {
      existing.totalExposure += exposure;
    } else {
      holdings.set(h.holdingSymbol, {
        name: h.holdingName,
        totalExposure: exposure,
      });
    }
    holdingNames.set(h.holdingSymbol, h.holdingName);
  }

  const dates = Array.from(dateMap.keys()).sort();

  // Find top 8 holdings by latest date's exposure
  const latestDate = dates[dates.length - 1];
  const latestHoldings = dateMap.get(latestDate);
  const topSymbols = latestHoldings
    ? Array.from(latestHoldings.entries())
        .sort((a, b) => b[1].totalExposure - a[1].totalExposure)
        .slice(0, 8)
        .map(([sym]) => sym)
    : [];

  // Build series data
  const totalValue = fundAssets.reduce(
    (s, f) => s + (f.marketValue ? Number(f.marketValue) : 0),
    0,
  );
  const series = topSymbols.map((sym) => ({
    symbol: sym,
    name: holdingNames.get(sym) ?? sym,
    data: dates.map((d) => {
      const h = dateMap.get(d)?.get(sym);
      const exposure = h?.totalExposure ?? 0;
      return totalValue > 0
        ? Math.round((exposure / totalValue) * 10000) / 100
        : 0;
    }),
  }));

  return { dates, series };
}

/**
 * Get fund NAV (net asset value) history for all user's funds.
 * Returns daily NAV series + computed performance metrics.
 */
export async function getFundNavHistory(userId: bigint) {
  const fundAssets = await prisma.userAsset.findMany({
    where: { userId, assetType: "fund", deletedAt: null },
  });

  const symbols = fundAssets.map((f) => f.symbol).filter(Boolean) as string[];
  if (symbols.length === 0) return { funds: [] };

  // Get all price records for fund symbols
  const prices = await prisma.assetPrice.findMany({
    where: { symbol: { in: symbols }, assetType: "fund" },
    orderBy: { priceTime: "asc" },
  });

  // Group by symbol
  const priceMap = new Map<string, { date: string; nav: number }[]>();
  for (const p of prices) {
    const sym = p.symbol;
    if (!priceMap.has(sym)) priceMap.set(sym, []);
    priceMap.get(sym)!.push({
      date: p.priceTime.toISOString().slice(0, 10),
      nav: Number(p.price),
    });
  }

  // Build result per fund
  const funds = fundAssets
    .filter((f) => f.symbol && priceMap.has(f.symbol))
    .map((f) => {
      const navData = priceMap.get(f.symbol!)!;
      const latestNav = navData[navData.length - 1]?.nav ?? 0;
      const prevNav =
        navData.length > 1
          ? (navData[navData.length - 2]?.nav ?? latestNav)
          : latestNav;
      const dailyChange = latestNav - prevNav;
      const dailyChangePct = prevNav > 0 ? dailyChange / prevNav : 0;

      // Period returns
      const firstNav = navData[0]?.nav ?? latestNav;
      const totalReturn = firstNav > 0 ? (latestNav - firstNav) / firstNav : 0;

      // Max drawdown
      let peak = 0;
      let maxDrawdown = 0;
      for (const d of navData) {
        if (d.nav > peak) peak = d.nav;
        const dd = peak > 0 ? (peak - d.nav) / peak : 0;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }

      // Recent 30-day return
      const recent30 =
        navData.length > 22 ? navData[navData.length - 23]?.nav : firstNav;
      const return30d = recent30 > 0 ? (latestNav - recent30) / recent30 : 0;

      return {
        id: f.id.toString(),
        symbol: f.symbol!,
        name: f.assetName,
        latestNav,
        dailyChange,
        dailyChangePct,
        totalReturn,
        return30d,
        maxDrawdown,
        navHistory: navData,
      };
    });

  return { funds };
}
