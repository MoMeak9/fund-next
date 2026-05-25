import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { createTransaction, listTransactions, TransactionError } from "@/services/transactions";
import { createTransactionSchema } from "@/services/transactions/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const sp = request.nextUrl.searchParams;
  const filters = {
    assetId: sp.get("assetId") ?? undefined,
    type: sp.get("type") ?? undefined,
    startDate: sp.get("startDate") ?? undefined,
    endDate: sp.get("endDate") ?? undefined,
  };
  const pagination = {
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  };

  const result = await listTransactions(userId, filters, pagination);
  return ok(result);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const tx = await createTransaction(userId, parsed.data);
    return ok(tx);
  } catch (e) {
    if (e instanceof TransactionError) return fail(e.code as 404, e.message);
    throw e;
  }
}
