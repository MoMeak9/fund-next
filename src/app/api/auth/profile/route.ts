import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { updateProfile, AuthError } from "@/services/auth";
import { updateProfileSchema } from "@/services/auth/schema";

export async function PUT(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  try {
    const user = await updateProfile(userId, parsed.data);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) return fail(e.code as 400 | 404, e.message);
    throw e;
  }
}
