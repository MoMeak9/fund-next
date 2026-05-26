import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

import type { LoginInput, RegisterInput, UpdatePasswordInput, UpdateProfileInput } from "./schema";

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

export async function updateProfile(userId: bigint, input: UpdateProfileInput): Promise<AuthUser> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new AuthError(401, "用户不存在");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname: input.nickname },
  });

  return { userId: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function updatePassword(userId: bigint, input: UpdatePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError(401, "用户不存在");
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new AuthError(400, "当前密码错误", "WRONG_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export class AuthError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly errorCode?: "WRONG_PASSWORD",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
