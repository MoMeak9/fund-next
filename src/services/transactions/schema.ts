import { z } from "zod";

export const createTransactionSchema = z.object({
  assetId: z.string().min(1),
  transactionType: z.enum(["buy", "sell", "add", "reduce", "fixed_invest", "transfer_in", "transfer_out"]),
  quantity: z.number().positive(),
  price: z.number().min(0),
  fee: z.number().min(0).optional(),
  currency: z.enum(["CNY", "USD", "HKD", "USDT"]).optional(),
  transactionTime: z.string().datetime(),
  reason: z.string().optional(),
  emotionTag: z.string().max(64).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
