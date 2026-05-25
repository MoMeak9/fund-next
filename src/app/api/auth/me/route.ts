import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { getUserById } from "@/services/auth";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) {
    return fail(401, "未登录");
  }

  const user = await getUserById(userId);
  if (!user) {
    return fail(401, "用户不存在");
  }

  return ok(user);
}
