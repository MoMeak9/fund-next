import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { deleteAsset, getAsset, updateAsset } from "@/services/assets";
import { updateAssetSchema } from "@/services/assets/schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const asset = await getAsset(userId, BigInt(id));
  if (!asset) return fail(404, "资产不存在");

  return ok(asset);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const body = await request.json();
  const parsed = updateAssetSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const asset = await updateAsset(userId, BigInt(id), parsed.data);
  if (!asset) return fail(404, "资产不存在");

  return ok(asset);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { id } = await params;
  const deleted = await deleteAsset(userId, BigInt(id));
  if (!deleted) return fail(404, "资产不存在");

  return ok(null);
}
