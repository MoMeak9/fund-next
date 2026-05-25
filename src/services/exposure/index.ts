import { prisma } from "@/lib/db/prisma";
import { aggregateDuplicateHoldings, calculateFundExposureAmount } from "@/lib/finance/calculations";
import type { ExposureHolding } from "@/lib/finance/calculations";

type AllocationItem = { key: string; amount: number; percentage: number };

export async function getFundsExposure(userId: bigint) {
  const fundAssets = await prisma.userAsset.findMany({
    where: { userId, assetType: "fund", deletedAt: null },
  });

  if (fundAssets.length === 0) {
    return { totalFundValue: 0, holdings: [], industryAllocation: [], marketAllocation: [] };
  }

  const totalFundValue = fundAssets.reduce((sum, a) => sum + (a.marketValue ? Number(a.marketValue) : 0), 0);

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
    industryMap.set(h.industry, (industryMap.get(h.industry) ?? 0) + h.exposureAmount);
    marketMap.set(h.holdingMarket, (marketMap.get(h.holdingMarket) ?? 0) + h.exposureAmount);
  }

  const industryAllocation = buildAllocation(industryMap, totalExposure);
  const marketAllocation = buildAllocation(marketMap, totalExposure);

  return { totalFundValue, holdings: merged, industryAllocation, marketAllocation };
}

export async function getFundExposureDetail(userId: bigint, fundAssetId: bigint) {
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
    exposureAmount: calculateFundExposureAmount({ fundMarketValue, holdingWeight: Number(h.weight) }),
  }));

  return { fundName: fund.assetName, holdings: result };
}

function buildAllocation(map: Map<string, number>, total: number): AllocationItem[] {
  return Array.from(map.entries()).map(([key, amount]) => ({
    key,
    amount: Math.round(amount * 100) / 100,
    percentage: total > 0 ? Math.round((amount / total) * 10000) / 10000 : 0,
  }));
}
