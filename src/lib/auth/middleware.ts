import { NextRequest } from "next/server";

import { verifyAccessToken } from "./jwt";

const ACCESS_COOKIE = "fund_access";

export function getCurrentUserId(request: NextRequest): bigint | null {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyAccessToken(token);
  if (!payload) return null;

  return BigInt(payload.userId);
}
