import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth/middleware";
import { AuthError, updatePassword } from "@/services/auth";
import { updatePasswordSchema } from "@/services/auth/schema";

export async function PUT(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) {
    return fail(401, "未登录");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "请求体不是合法 JSON");
  }

  const parsed = updatePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, parsed.error.errors[0].message);
  }

  try {
    await updatePassword(userId, parsed.data);
    return ok(null);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.errorCode) return fail(e.errorCode, e.message);
      return fail(e.code as 400 | 401, e.message);
    }
    throw e;
  }
}
