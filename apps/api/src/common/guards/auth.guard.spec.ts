import { describe, it, expect } from "vitest";
import { AuthGuard } from "./auth.guard.js";
import { TokenService } from "@everpride/auth";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthGuard Unit Tests", () => {
  const guard = new AuthGuard();
  const tokenService = new TokenService(
    process.env.JWT_ACCESS_SECRET || "super-secret-access-token-change-in-production"
  );

  it("should throw UnauthorizedException if authorization header is missing", () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    };

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException if token does not start with Bearer", () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: "Basic 123456" },
        }),
      }),
    };

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it("should validate and set request.user when valid token is provided", () => {
    const validToken = tokenService.signAccessToken({
      userId: "user_guard_test",
      role: "USER",
    });

    const mockRequest: any = {
      headers: { authorization: `Bearer ${validToken}` },
    };

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.userId).toBe("user_guard_test");
  });
});
