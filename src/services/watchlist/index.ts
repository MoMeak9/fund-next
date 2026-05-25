import { prisma } from "@/lib/db/prisma";
import { getQuotes } from "@/services/market-data";
import type { Market } from "@/types/domain";

import type { AddWatchlistInput } from "./schema";

export async function listWatchlist(userId: bigint) {
  const items = await prisma.watchlist.findMany({ where: { userId, deletedAt: null }, orderBy: { createdAt: "desc" } });

  const quoteRequests = items.map((item) => ({
    symbol: item.symbol,
    market: item.market as Market,
  }));

  const quotes = await getQuotes(quoteRequests);
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return items.map((item) => {
    const quote = quoteMap.get(item.symbol);
    return {
      id: String(item.id),
      symbol: item.symbol,
      assetName: item.assetName,
      assetType: item.assetType,
      market: item.market,
      currency: item.currency,
      quote: quote ? { price: quote.price, priceTime: quote.priceTime } : null,
    };
  });
}

export async function addToWatchlist(userId: bigint, input: AddWatchlistInput) {
  const existing = await prisma.watchlist.findFirst({
    where: { userId, symbol: input.symbol, assetType: input.assetType, deletedAt: null },
  });
  if (existing) {
    throw new WatchlistError(409, "该资产已在自选列表中");
  }

  const item = await prisma.watchlist.create({
    data: { userId, ...input },
  });

  return { id: String(item.id), ...input, quote: null };
}

export async function removeFromWatchlist(userId: bigint, id: bigint) {
  const existing = await prisma.watchlist.findFirst({ where: { id, userId, deletedAt: null } });
  if (!existing) return false;

  await prisma.watchlist.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

export class WatchlistError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "WatchlistError";
  }
}
