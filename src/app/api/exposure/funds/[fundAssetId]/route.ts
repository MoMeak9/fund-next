import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getFundExposureDetail } from "@/services/exposure";

type Params = { params: Promise<{ fundAssetId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const { fundAssetId } = await params;
  const result = await getFundExposureDetail(userId, BigInt(fundAssetId));
  if (!result) return fail(404, "基金资产不存在");

  return ok(result);
}
