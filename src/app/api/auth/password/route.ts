import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { updatePassword, AuthError } from "@/services/auth";
import { updatePasswordSchema } from "@/services/auth/schema";

export async function PUT(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = updatePasswordSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    await updatePassword(userId, parsed.data);
    return ok({ success: true });
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code as 400 | 404, e.message);
    throw e;
  }
}
