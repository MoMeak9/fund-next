import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Default test accounts for development/testing:
 *
 * Admin:  admin@test.com  / admin123456
 * User:   user@test.com   / user123456
 */
async function main() {
  // bcrypt hash with cost 10
  const adminHash =
    "$2a$10$fBKdBD0bt0wboswE.1WPpeV49o5f57JBcrPpMmwDu6gGw1LmSGvmS";
  const userHash =
    "$2a$10$uZYocgwCHUntGIMM9U1inuOaRAZaB53vbcjyV5BYMnUHeTFFHgilG";

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      passwordHash: adminHash,
      nickname: "Admin",
      status: 1,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      email: "user@test.com",
      passwordHash: userHash,
      nickname: "测试用户",
      status: 1,
    },
  });

  console.log("Seeded test accounts:");
  console.log(`  Admin: admin@test.com / admin123456 (id: ${admin.id})`);
  console.log(`  User:  user@test.com / user123456 (id: ${user.id})`);

  // Seed fund assets for admin user (exposure/penetration demo)
  const fund1 = await prisma.userAsset.upsert({
    where: { id: 1001n },
    update: {},
    create: {
      id: 1001n,
      userId: admin.id,
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

  const fund2 = await prisma.userAsset.upsert({
    where: { id: 1002n },
    update: {},
    create: {
      id: 1002n,
      userId: admin.id,
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

  console.log(`  Fund assets: ${fund1.assetName}, ${fund2.assetName}`);

  // Seed fund holdings data (public holding data for penetration)
  const reportDate = new Date("2026-03-31");

  await prisma.fundHolding.deleteMany({
    where: { fundSymbol: { in: ["110011", "005827"] } },
  });

  await prisma.fundHolding.createMany({
    data: [
      // 易方达中小盘混合 (110011) top holdings
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.089, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.072, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.065, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.058, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "000568", holdingName: "泸州老窖", holdingMarket: "CN", industry: "食品饮料", weight: 0.052, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.048, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "601012", holdingName: "隆基绿能", holdingMarket: "CN", industry: "新能源", weight: 0.042, reportDate },
      { fundSymbol: "110011", fundName: "易方达中小盘混合", holdingSymbol: "300750", holdingName: "宁德时代", holdingMarket: "CN", industry: "新能源", weight: 0.038, reportDate },
      // 易方达蓝筹精选混合 (005827) top holdings
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "600519", holdingName: "贵州茅台", holdingMarket: "CN", industry: "食品饮料", weight: 0.095, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "00700", holdingName: "腾讯控股", holdingMarket: "HK", industry: "互联网", weight: 0.082, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "AAPL", holdingName: "苹果公司", holdingMarket: "US", industry: "科技", weight: 0.068, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000858", holdingName: "五粮液", holdingMarket: "CN", industry: "食品饮料", weight: 0.055, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "601318", holdingName: "中国平安", holdingMarket: "CN", industry: "金融", weight: 0.050, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "000333", holdingName: "美的集团", holdingMarket: "CN", industry: "家用电器", weight: 0.045, reportDate },
      { fundSymbol: "005827", fundName: "易方达蓝筹精选混合", holdingSymbol: "MSFT", holdingName: "微软", holdingMarket: "US", industry: "科技", weight: 0.040, reportDate },
    ],
  });

  console.log("  Fund holdings seeded for exposure penetration demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
