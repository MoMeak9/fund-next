import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { createAsset, listAssets } from "@/services/assets";
import { createAssetSchema } from "@/services/assets/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { searchParams } = request.nextUrl;
  const filters = {
    type: searchParams.get("type") ?? undefined,
    market: searchParams.get("market") ?? undefined,
  };

  const assets = await listAssets(userId, filters);
  return ok(assets);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createAssetSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const asset = await createAsset(userId, parsed.data);
  return ok(asset);
}
