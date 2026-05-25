import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

import type { LoginInput, RegisterInput } from "./schema";

export type AuthUser = {
  userId: string;
  email: string;
  nickname: string | null;
};

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AuthError(409, "该邮箱已注册");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      nickname: input.nickname ?? null,
    },
  });

  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AuthError(401, "邮箱或密码错误");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AuthError(401, "邮箱或密码错误");
  }

  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function getUserById(userId: bigint): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export class AuthError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
