/**
 * Seed fund exposure data for testing.
 * Run: node prisma/seed-funds.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Create fund assets for admin (userId=1)
  await prisma.userAsset.upsert({
    where: { id: 1001n },
    update: { marketValue: 62000 },
    create: {
      id: 1001n,
      userId: 1n,
      assetType: "fund",
      symbol: "110011",
      assetName: "易方达中小盘混合",
      market: "CN",
      currency: "CNY",
      quantity: 10000,
      avgCost: 5.5,
      currentPrice: 6.2,
      costAmount: 55000,
      marketValue: 62000,
    },
  });

  await prisma.userAsset.upsert({
    where: { id: 1002n },
    update: { marketValue: 19600 },
    create: {
      id: 1002n,
      userId: 1n,
      assetType: "fund",
      symbol: "005827",
      assetName: "易方达蓝筹精选混合",
      market: "CN",
      currency: "CNY",
      quantity: 8000,
      avgCost: 2.1,
      currentPrice: 2.45,
      costAmount: 16800,
      marketValue: 19600,
    },
  });

  // Clear old holdings
  await prisma.fundHolding.deleteMany({
    where: { fundSymbol: { in: ["110011", "005827"] } },
  });

  // Insert fund holdings - current quarter (2026-03-31)
  const reportDate = new Date("2026-03-31");
  await prisma.fundHolding.createMany({
    data: [
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.089, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.072, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.065, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.058, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000568", holdingName: "泸州老窖", holdingMarket: "CN", industry: "食品饮料", weight: 0.052, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.048, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601012", holdingName: "隆基绿能", holdingMarket: "CN", industry: "新能源", weight: 0.042, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "300750", holdingName: "宁德时代", holdingMarket: "CN", industry: "新能源", weight: 0.038, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.095, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.082, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "AAPL", holdingName: "苹果公司", holdingMarket: "US", industry: "科技", weight: 0.068, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.055, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.050, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.045, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "MSFT", holdingName: "微软", holdingMarket: "US", industry: "科技", weight: 0.040, reportDate },
    ],
  });

  // Historical holdings - Q4 2025 (2025-12-31)
  const q4Date = new Date("2025-12-31");
  await prisma.fundHolding.createMany({
    data: [
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.092, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.078, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.060, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.062, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000568", holdingName: "泸州老窖", holdingMarket: "CN", industry: "食品饮料", weight: 0.055, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.044, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601012", holdingName: "隆基绿能", holdingMarket: "CN", industry: "新能源", weight: 0.050, reportDate: q4Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "300750", holdingName: "宁德时代", holdingMarket: "CN", industry: "新能源", weight: 0.035, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.098, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.075, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "AAPL", holdingName: "苹果公司", holdingMarket: "US", industry: "科技", weight: 0.072, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.058, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.052, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.042, reportDate: q4Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "MSFT", holdingName: "微软", holdingMarket: "US", industry: "科技", weight: 0.038, reportDate: q4Date },
    ],
  });

  // Historical holdings - Q3 2025 (2025-09-30)
  const q3Date = new Date("2025-09-30");
  await prisma.fundHolding.createMany({
    data: [
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.095, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.082, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.055, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.065, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000568", holdingName: "泸州老窖", holdingMarket: "CN", industry: "食品饮料", weight: 0.048, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.040, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601012", holdingName: "隆基绿能", holdingMarket: "CN", industry: "新能源", weight: 0.058, reportDate: q3Date },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "300750", holdingName: "宁德时代", holdingMarket: "CN", industry: "新能源", weight: 0.032, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.100, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.070, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "AAPL", holdingName: "苹果公司", holdingMarket: "US", industry: "科技", weight: 0.075, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.060, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.048, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.038, reportDate: q3Date },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "MSFT", holdingName: "微软", holdingMarket: "US", industry: "科技", weight: 0.035, reportDate: q3Date },
    ],
  });

  console.log("Done! Seeded fund assets and holdings (3 quarters) for exposure demo.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
