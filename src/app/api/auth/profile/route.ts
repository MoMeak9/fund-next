import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth/middleware";
import { AuthError, updateProfile } from "@/services/auth";
import { updateProfileSchema } from "@/services/auth/schema";

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

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, parsed.error.errors[0].message);
  }

  try {
    const user = await updateProfile(userId, parsed.data);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code as 400 | 401, e.message);
    }
    throw e;
  }
}
