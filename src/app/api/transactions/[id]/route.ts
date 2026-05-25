import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { deleteTransaction, getTransaction, updateTransaction } from "@/services/transactions";
import { updateTransactionSchema } from "@/services/transactions/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const tx = await getTransaction(userId, BigInt(id));
  if (!tx) return fail(404, "交易不存在");

  return ok(tx);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const tx = await updateTransaction(userId, BigInt(id), parsed.data);
  if (!tx) return fail(404, "交易不存在");

  return ok(tx);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await deleteTransaction(userId, BigInt(id));
  if (!deleted) return fail(404, "交易不存在");

  return ok(null);
}
