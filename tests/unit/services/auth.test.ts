import bcrypt from "bcryptjs";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { AuthError, loginUser, registerUser, updatePassword, updateProfile } from "@/services/auth";

const mockUser = {
  findUnique: vi.mocked(prisma.user.findUnique),
  create: vi.mocked(prisma.user.create),
  update: vi.mocked(prisma.user.update),
};

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("creates user and returns auth user", async () => {
      mockUser.findUnique.mockResolvedValue(null);
      mockUser.create.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: "hashed",
        nickname: "Test",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await registerUser({ email: "test@example.com", password: "password123" });

      expect(result.userId).toBe("1");
      expect(result.email).toBe("test@example.com");
      expect(result.nickname).toBe("Test");
      expect(mockUser.create).toHaveBeenCalledOnce();
    });

    it("throws 409 for duplicate email", async () => {
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: "hashed",
        nickname: null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(registerUser({ email: "test@example.com", password: "password123" }))
        .rejects.toThrow(AuthError);

      try {
        await registerUser({ email: "test@example.com", password: "password123" });
      } catch (e) {
        expect((e as AuthError).code).toBe(409);
      }
    });
  });

  describe("loginUser", () => {
    it("returns auth user on valid credentials", async () => {
      const hash = await bcrypt.hash("password123", 10);
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: hash,
        nickname: "Test",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await loginUser({ email: "test@example.com", password: "password123" });

      expect(result.userId).toBe("1");
      expect(result.email).toBe("test@example.com");
    });

    it("throws 401 for wrong password", async () => {
      const hash = await bcrypt.hash("correct", 10);
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: hash,
        nickname: null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(loginUser({ email: "test@example.com", password: "wrong" }))
        .rejects.toThrow(AuthError);
    });

    it("throws 401 for non-existent user", async () => {
      mockUser.findUnique.mockResolvedValue(null);

      await expect(loginUser({ email: "nobody@example.com", password: "password123" }))
        .rejects.toThrow(AuthError);
    });
  });

  describe("updateProfile", () => {
    it("updates nickname and returns auth user", async () => {
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: "hashed",
        nickname: "Old Name",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      mockUser.update.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: "hashed",
        nickname: "New Name",
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      const result = await updateProfile(BigInt(1), { nickname: "New Name" });

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
        data: { nickname: "New Name" },
      });
      expect(result).toEqual({
        userId: "1",
        email: "test@example.com",
        nickname: "New Name",
      });
    });
  });

  describe("updatePassword", () => {
    it("updates password hash when current password is valid", async () => {
      const oldHash = await bcrypt.hash("old-password", 10);
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: oldHash,
        nickname: null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      mockUser.update.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: "new-hash",
        nickname: null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await updatePassword(BigInt(1), {
        currentPassword: "old-password",
        newPassword: "new-password",
      });

      expect(mockUser.update).toHaveBeenCalledOnce();
      const updateArg = mockUser.update.mock.calls[0][0];
      expect(updateArg.where).toEqual({ id: BigInt(1) });
      expect(await bcrypt.compare("new-password", updateArg.data.passwordHash as string)).toBe(true);
    });

    it("throws WRONG_PASSWORD when current password is invalid", async () => {
      const oldHash = await bcrypt.hash("old-password", 10);
      mockUser.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: "test@example.com",
        passwordHash: oldHash,
        nickname: null,
        status: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      await expect(updatePassword(BigInt(1), {
        currentPassword: "wrong-password",
        newPassword: "new-password",
      })).rejects.toMatchObject({
        code: 400,
        errorCode: "WRONG_PASSWORD",
      });
      expect(mockUser.update).not.toHaveBeenCalled();
    });
  });
});
