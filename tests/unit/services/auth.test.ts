import bcrypt from "bcryptjs";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { AuthError, loginUser, registerUser } from "@/services/auth";

const mockPrisma = vi.mocked(prisma);

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("creates user and returns auth user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
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
      expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    });

    it("throws 409 for duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
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
      mockPrisma.user.findUnique.mockResolvedValue({
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
      mockPrisma.user.findUnique.mockResolvedValue({
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
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser({ email: "nobody@example.com", password: "password123" }))
        .rejects.toThrow(AuthError);
    });
  });
});
