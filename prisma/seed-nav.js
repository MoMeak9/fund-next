/**
 * Seed fund NAV (net asset value) historical prices.
 * Run: node prisma/seed-nav.js
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Generate daily NAV data with realistic random walk
function generateNavSeries(startNav, days, volatility = 0.008) {
  const prices = [];
  let nav = startNav;
  const startDate = new Date("2025-07-01");

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    const dow = date.getDay();
    if (dow === 0 || dow === 6) continue;

    // Random walk with slight upward drift
    const change = (Math.random() - 0.48) * volatility;
    nav = nav * (1 + change);
    nav = Math.round(nav * 10000) / 10000;

    prices.push({ price: nav, priceTime: new Date(date) });
  }
  return prices;
}

async function main() {
  // Clear old NAV data for these symbols
  await prisma.assetPrice.deleteMany({
    where: { symbol: { in: ["110011", "005827"] }, assetType: "fund" },
  });

  // Generate ~240 trading days of NAV data (roughly 11 months)
  const nav110011 = generateNavSeries(5.8, 330, 0.009); // 易方达中小盘
  const nav005827 = generateNavSeries(2.2, 330, 0.012); // 易方达蓝筹

  const records = [];

  for (const p of nav110011) {
    records.push({
      symbol: "110011",
      assetType: "fund",
      market: "CN",
      currency: "CNY",
      price: p.price,
      priceTime: p.priceTime,
      source: "seed",
    });
  }

  for (const p of nav005827) {
    records.push({
      symbol: "005827",
      assetType: "fund",
      market: "CN",
      currency: "CNY",
      price: p.price,
      priceTime: p.priceTime,
      source: "seed",
    });
  }

  await prisma.assetPrice.createMany({ data: records });

  console.log(
    `Done! Seeded ${records.length} NAV price records for 110011 and 005827.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
