import { prisma } from "@/lib/db/prisma";
import { calculateGoalCompletion, calculateMonthlyRequiredContribution } from "@/lib/finance/calculations";

export type AiAnalysis = {
  summary: string;
  insights: string[];
  riskNotes: string[];
  generatedAt: string;
};

const RISK_NOTE = "以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。";

export async function generateAnalysis(userId: bigint): Promise<AiAnalysis> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [assets, recentTransactionCount, activeGoal] = await Promise.all([
    prisma.userAsset.findMany({ where: { userId, deletedAt: null } }),
    prisma.transaction.count({
      where: {
        userId,
        deletedAt: null,
        transactionTime: { gte: thirtyDaysAgo },
      },
    }),
    prisma.goal.findFirst({ where: { userId, status: 1, deletedAt: null } }),
  ]);

  if (assets.length === 0) {
    return {
      summary: "暂无资产数据，请先添加资产后查看分析",
      insights: [],
      riskNotes: [RISK_NOTE],
      generatedAt: now.toISOString(),
    };
  }

  const totalMarketValue = assets.reduce((sum, asset) => sum + decimalToNumber(asset.marketValue), 0);
  const totalCost = assets.reduce((sum, asset) => sum + decimalToNumber(asset.costAmount), 0);
  const safeTotalMarketValue = totalMarketValue > 0 ? totalMarketValue : 1;

  const largestAsset = [...assets].sort((a, b) => decimalToNumber(b.marketValue) - decimalToNumber(a.marketValue))[0];
  const largestAssetPercentage = decimalToNumber(largestAsset.marketValue) / safeTotalMarketValue;

  const assetTypeAllocation = buildAllocation(
    assets.map((asset) => [asset.assetType, decimalToNumber(asset.marketValue)]),
    safeTotalMarketValue,
  );
  const marketAllocation = buildAllocation(
    assets.map((asset) => [asset.market ?? "OTHER", decimalToNumber(asset.marketValue)]),
    safeTotalMarketValue,
  );

  const insights: string[] = [];
  if (largestAssetPercentage > 0.3) {
    insights.push(
      `${largestAsset.assetName} 占总市值 ${formatPercent(largestAssetPercentage)}，单一资产占比较高，请留意集中风险。`,
    );
  }

  const primaryType = assetTypeAllocation[0];
  const secondaryType = assetTypeAllocation[1];
  if (primaryType) {
    insights.push(
      `资产类型以 ${primaryType.key} 为主，占总市值 ${formatPercent(primaryType.percentage)}${
        secondaryType ? `，其次为 ${secondaryType.key} ${formatPercent(secondaryType.percentage)}` : ""
      }。`,
    );
  }

  const primaryMarket = marketAllocation[0];
  const secondaryMarket = marketAllocation[1];
  if (primaryMarket) {
    insights.push(
      `市场配置主要集中在 ${primaryMarket.key}，占比 ${formatPercent(primaryMarket.percentage)}${
        secondaryMarket ? `，其次为 ${secondaryMarket.key} ${formatPercent(secondaryMarket.percentage)}` : ""
      }。`,
    );
  }

  insights.push(`近 30 天记录了 ${recentTransactionCount} 笔交易，可结合交易原因复盘操作节奏。`);

  if (activeGoal) {
    const targetAmount = Number(activeGoal.targetAmount);
    const completion = calculateGoalCompletion({ currentPrincipal: totalCost, targetAmount });
    const monthlyRequired = calculateMonthlyRequiredContribution({
      remainingAmount: completion.remainingAmount,
      currentDate: now,
      targetDate: activeGoal.targetDate,
    });
    insights.push(
      `进行中目标「${activeGoal.goalName}」剩余 ${formatCurrency(completion.remainingAmount)}，月度建议投入 ${formatCurrency(monthlyRequired)}。`,
    );
  }

  return {
    summary: buildSummary(totalMarketValue, assetTypeAllocation[0], marketAllocation[0], recentTransactionCount),
    insights: insights.slice(0, 5),
    riskNotes: [RISK_NOTE],
    generatedAt: now.toISOString(),
  };
}

function buildAllocation(entries: [string, number][], total: number) {
  const map = new Map<string, number>();
  for (const [key, value] of entries) {
    map.set(key, (map.get(key) ?? 0) + value);
  }

  return Array.from(map.entries())
    .map(([key, value]) => ({ key, value, percentage: value / total }))
    .sort((a, b) => b.value - a.value);
}

function buildSummary(
  totalMarketValue: number,
  primaryType: { key: string; percentage: number } | undefined,
  primaryMarket: { key: string; percentage: number } | undefined,
  recentTransactionCount: number,
) {
  const typeSentence = primaryType
    ? `当前组合总市值约 ${formatCurrency(totalMarketValue)}，主要配置在 ${primaryType.key}，占比 ${formatPercent(primaryType.percentage)}。`
    : `当前组合总市值约 ${formatCurrency(totalMarketValue)}。`;
  const marketSentence = primaryMarket
    ? `市场分布以 ${primaryMarket.key} 为主，占比 ${formatPercent(primaryMarket.percentage)}。`
    : "市场分布暂无明确分类。";
  const transactionSentence = `近 30 天共有 ${recentTransactionCount} 笔交易记录，可用于观察近期操作频率。`;

  return `${typeSentence}${marketSentence}${transactionSentence}`;
}

function decimalToNumber(value: unknown) {
  return value == null ? 0 : Number(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString("en-US")}`;
}
