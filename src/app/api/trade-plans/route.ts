import { NextRequest } from "next/server";

import { getCurrentUserId } from "@/lib/auth/middleware";
import { fail, ok } from "@/lib/api/response";
import { listPlans, createPlan } from "@/services/trade-review";
import { createPlanSchema } from "@/services/trade-review/schema";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const sp = request.nextUrl.searchParams;
  const filters = {
    status: sp.get("status") ?? undefined,
    strategyType: sp.get("strategyType") ?? undefined,
  };
  const pagination = {
    page: Number(sp.get("page") ?? 1),
    pageSize: Number(sp.get("pageSize") ?? 20),
  };

  const result = await listPlans(userId, filters, pagination);
  return ok(result);
}

export async function POST(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  const body = await request.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) return fail(400, parsed.error.errors[0].message);

  const plan = await createPlan(userId, parsed.data);
  return ok(plan);
}
