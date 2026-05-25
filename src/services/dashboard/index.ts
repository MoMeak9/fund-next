import { prisma } from "@/lib/db/prisma";
import {
  calculateGoalCompletion,
  calculateMonthlyRequiredContribution,
  calculateProfit,
  calculateProfitRate,
} from "@/lib/finance/calculations";

type AllocationItem = { key: string; value: number; percentage: number };

export async function getDashboardSummary(userId: bigint) {
  const assets = await prisma.userAsset.findMany({ where: { userId, deletedAt: null } });

  let totalAssetValue = 0;
  let totalCost = 0;
  const assetTypeMap = new Map<string, number>();
  const marketMap = new Map<string, number>();

  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    const ca = asset.costAmount ? Number(asset.costAmount) : 0;
    totalAssetValue += mv;
    totalCost += ca;
    assetTypeMap.set(asset.assetType, (assetTypeMap.get(asset.assetType) ?? 0) + mv);
    marketMap.set(asset.market ?? "OTHER", (marketMap.get(asset.market ?? "OTHER") ?? 0) + mv);
  }

  const totalProfit = calculateProfit({ marketValue: totalAssetValue, costAmount: totalCost });
  const totalProfitRate = calculateProfitRate({ profit: totalProfit, costAmount: totalCost });

  const assetAllocation = buildAllocation(assetTypeMap, totalAssetValue);
  const marketAllocation = buildAllocation(marketMap, totalAssetValue);

  const recentTxs = await prisma.transaction.findMany({
    where: { userId, deletedAt: null },
    include: { asset: { select: { assetName: true } } },
    orderBy: { transactionTime: "desc" },
    take: 5,
  });

  const recentTransactions = recentTxs.map((tx) => ({
    id: String(tx.id),
    assetName: tx.asset.assetName,
    transactionType: tx.transactionType,
    quantity: Number(tx.quantity),
    price: Number(tx.price),
    transactionTime: tx.transactionTime.toISOString(),
  }));

  const activeGoalRecord = await prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } });
  let activeGoal = null;

  if (activeGoalRecord) {
    const targetAmount = Number(activeGoalRecord.targetAmount);
    const completion = calculateGoalCompletion({ currentPrincipal: totalCost, targetAmount });
    const monthlyRequired = calculateMonthlyRequiredContribution({
      remainingAmount: completion.remainingAmount,
      currentDate: new Date(),
      targetDate: activeGoalRecord.targetDate,
    });

    activeGoal = {
      goalName: activeGoalRecord.goalName,
      targetAmount,
      completionRate: completion.displayRate,
      remainingAmount: completion.remainingAmount,
      monthlyRequired,
    };
  }

  return {
    totalAssetValue,
    totalCost,
    totalProfit,
    totalProfitRate,
    assetAllocation,
    marketAllocation,
    recentTransactions,
    activeGoal,
  };
}

function buildAllocation(map: Map<string, number>, total: number): AllocationItem[] {
  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    value: Math.round(value * 100) / 100,
    percentage: total > 0 ? Math.round((value / total) * 10000) / 10000 : 0,
  }));
}
