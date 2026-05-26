import { prisma } from "@/lib/db/prisma";
import { getActiveGoal } from "@/services/goals";

type AnalysisResult = {
  summary: string;
  insights: string[];
  riskNotes: string[];
  generatedAt: string;
};

export async function generateAnalysis(userId: bigint): Promise<AnalysisResult> {
  const assets = await prisma.userAsset.findMany({ where: { userId, deletedAt: null } });

  if (assets.length === 0) {
    return {
      summary: "暂无资产数据，请先添加资产后查看分析。",
      insights: [],
      riskNotes: ["以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。"],
      generatedAt: new Date().toISOString(),
    };
  }

  const totalValue = assets.reduce((sum, a) => sum + (a.marketValue ? Number(a.marketValue) : 0), 0);
  const insights: string[] = [];

  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    if (totalValue > 0 && mv / totalValue > 0.3) {
      insights.push(`"${asset.assetName}" 占总资产 ${((mv / totalValue) * 100).toFixed(1)}%，集中度较高，注意分散风险。`);
    }
  }

  const typeMap = new Map<string, number>();
  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    typeMap.set(asset.assetType, (typeMap.get(asset.assetType) ?? 0) + mv);
  }
  const topType = [...typeMap.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topType && totalValue > 0) {
    const pct = ((topType[1] / totalValue) * 100).toFixed(1);
    const typeLabel = TYPE_LABELS[topType[0]] ?? topType[0];
    insights.push(`资产以${typeLabel}为主，占比 ${pct}%。`);
  }

  const marketMap = new Map<string, number>();
  for (const asset of assets) {
    const mv = asset.marketValue ? Number(asset.marketValue) : 0;
    marketMap.set(asset.market ?? "OTHER", (marketMap.get(asset.market ?? "OTHER") ?? 0) + mv);
  }
  const topMarket = [...marketMap.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topMarket && totalValue > 0) {
    const pct = ((topMarket[1] / totalValue) * 100).toFixed(1);
    const marketLabel = MARKET_LABELS[topMarket[0]] ?? topMarket[0];
    insights.push(`主要配置在${marketLabel}，占比 ${pct}%。`);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const txCount = await prisma.transaction.count({
    where: { userId, deletedAt: null, transactionTime: { gte: thirtyDaysAgo } },
  });
  if (txCount > 0) {
    insights.push(`近 30 天交易 ${txCount} 次。`);
  } else {
    insights.push("近 30 天无交易记录。");
  }

  const activeGoal = await getActiveGoal(userId);
  if (activeGoal) {
    insights.push(
      `目标"${activeGoal.goalName}"完成 ${(activeGoal.completionRate * 100).toFixed(1)}%，` +
      `剩余 ¥${activeGoal.remainingAmount.toLocaleString()}，建议每月投入 ¥${Math.round(activeGoal.monthlyRequired).toLocaleString()}。`
    );
  }

  const typeDesc = topType ? `${TYPE_LABELS[topType[0]] ?? topType[0]}` : "多种资产";
  const marketDesc = topMarket ? `${MARKET_LABELS[topMarket[0]] ?? topMarket[0]}` : "多个市场";
  const summary = `您当前持有 ${assets.length} 项资产，总市值 ¥${totalValue.toLocaleString()}，主要配置为${typeDesc}，集中在${marketDesc}。`;

  return {
    summary,
    insights,
    riskNotes: ["以上分析基于您录入的数据自动生成，仅供参考，不构成任何投资建议或收益承诺。"],
    generatedAt: new Date().toISOString(),
  };
}

const TYPE_LABELS: Record<string, string> = {
  stock: "股票",
  fund: "基金",
  crypto: "加密货币",
  cash: "现金",
};

const MARKET_LABELS: Record<string, string> = {
  CN: "A 股市场",
  HK: "港股市场",
  US: "美股市场",
  CRYPTO: "加密市场",
  CASH: "现金",
};
