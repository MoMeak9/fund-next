import { z } from "zod";

export const createAssetSchema = z.object({
  assetType: z.enum(["stock", "fund", "crypto", "cash"]),
  symbol: z.string().max(64).optional(),
  assetName: z.string().min(1).max(255),
  market: z.enum(["CN", "HK", "US", "CRYPTO", "CASH"]).optional(),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]),
  quantity: z.number().min(0),
  avgCost: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional(),
  remark: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
