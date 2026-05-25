import jwt from "jsonwebtoken";

import { getServerEnv } from "@/lib/env/server";

type AccessTokenPayload = {
  userId: string;
  email: string;
};

type RefreshTokenPayload = {
  userId: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const env = getServerEnv();
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const env = getServerEnv();
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const env = getServerEnv();
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const env = getServerEnv();
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
