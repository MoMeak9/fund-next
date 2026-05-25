import { setAuthCookies } from "@/lib/auth/cookies";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { fail, ok } from "@/lib/api/response";
import { AuthError, loginUser } from "@/services/auth";
import { loginSchema } from "@/services/auth/schema";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return fail(400, parsed.error.errors[0].message);
  }

  try {
    const user = await loginUser(parsed.data);
    const accessToken = signAccessToken({ userId: user.userId, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.userId });
    await setAuthCookies(accessToken, refreshToken);
    return ok(user);
  } catch (e) {
    if (e instanceof AuthError) {
      return fail(e.code as 401, e.message);
    }
    throw e;
  }
}
