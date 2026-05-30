import { NextRequest, NextResponse } from "next/server";

import {
  verifyAccessTokenEdge,
  verifyRefreshTokenEdge,
} from "@/lib/auth/jwt-edge";

const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("fund_access")?.value;
  const refreshToken = request.cookies.get("fund_refresh")?.value;

  if (accessToken) {
    const payload = await verifyAccessTokenEdge(accessToken);
    if (payload) {
      return NextResponse.next();
    }
  }

  if (refreshToken) {
    const payload = await verifyRefreshTokenEdge(refreshToken);
    if (payload) {
      // Refresh token valid but access token expired/invalid - let request through
      // The API route can issue a new access token if needed
      return NextResponse.next();
    }
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { code: 401, message: "未登录", data: null },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
