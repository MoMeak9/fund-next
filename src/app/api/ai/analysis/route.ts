import { NextRequest } from "next/server";

import { fail, ok } from "@/lib/api/response";
import { getCurrentUserId } from "@/lib/auth/middleware";
import { generateAnalysis } from "@/services/ai";

export async function GET(request: NextRequest) {
  const userId = getCurrentUserId(request);
  if (!userId) return fail(401, "未登录");

  try {
    const analysis = await generateAnalysis(userId);
    return ok(analysis);
  } catch {
    return fail(500, "AI 分析生成失败");
  }
}
