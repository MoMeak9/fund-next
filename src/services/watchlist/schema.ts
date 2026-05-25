import { z } from "zod";

export const addWatchlistSchema = z.object({
  assetType: z.enum(["stock", "fund", "crypto"]),
  symbol: z.string().min(1).max(64),
  assetName: z.string().min(1).max(255),
  market: z.enum(["CN", "HK", "US", "CRYPTO"]),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]),
});

export type AddWatchlistInput = z.infer<typeof addWatchlistSchema>;
