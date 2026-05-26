import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/middleware", () => ({
  getCurrentUserId: vi.fn(),
}));

vi.mock("@/services/auth", async () => {
  const actual = await vi.importActual<typeof import("@/services/auth")>("@/services/auth");
  return {
    ...actual,
    updatePassword: vi.fn(),
    updateProfile: vi.fn(),
  };
});

import { getCurrentUserId } from "@/lib/auth/middleware";
import { AuthError, updatePassword, updateProfile } from "@/services/auth";
import { PUT as updatePasswordRoute } from "@/app/api/auth/password/route";
import { PUT as updateProfileRoute } from "@/app/api/auth/profile/route";

const mockGetCurrentUserId = vi.mocked(getCurrentUserId);
const mockUpdatePassword = vi.mocked(updatePassword);
const mockUpdateProfile = vi.mocked(updateProfile);

describe("auth settings routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUserId.mockReturnValue(BigInt(1));
  });

  it("returns WRONG_PASSWORD code for invalid current password", async () => {
    mockUpdatePassword.mockRejectedValue(new AuthError(400, "当前密码错误", "WRONG_PASSWORD"));

    const response = await updatePasswordRoute(jsonRequest("http://localhost/api/auth/password", {
      currentPassword: "wrong-password",
      newPassword: "new-password",
    }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toMatchObject({
      code: "WRONG_PASSWORD",
      message: "当前密码错误",
      data: null,
    });
  });

  it("returns 400 for malformed password JSON", async () => {
    const response = await updatePasswordRoute(new NextRequest("http://localhost/api/auth/password", {
      method: "PUT",
      body: "{bad-json",
    }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe(400);
    expect(mockUpdatePassword).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed profile JSON", async () => {
    const response = await updateProfileRoute(new NextRequest("http://localhost/api/auth/profile", {
      method: "PUT",
      body: "{bad-json",
    }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe(400);
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});

function jsonRequest(url: string, body: unknown) {
  return new NextRequest(url, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}
