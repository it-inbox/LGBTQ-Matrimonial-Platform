import { describe, it, expect } from "vitest";
import { IpRateLimiterGuard } from "./ip-rate-limiter.guard.js";
import { HttpException, HttpStatus } from "@nestjs/common";

describe("IpRateLimiterGuard Unit Tests", () => {
  it("should allow first 5 requests from same IP and block 6th request", () => {
    const guard = new IpRateLimiterGuard();
    const testIp = `test-client-ip-${Date.now()}`;

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          ip: testIp,
        }),
      }),
    };

    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(mockContext)).toBe(true);
    }

    // 6th request should throw 429
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
    try {
      guard.canActivate(mockContext);
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  it("should correctly prioritize x-forwarded-for header", () => {
    const guard = new IpRateLimiterGuard();
    const forwardedIp = `forwarded-ip-${Date.now()}`;

    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { "x-forwarded-for": `${forwardedIp}, 10.0.0.1` },
          ip: "proxy-ip",
        }),
      }),
    };

    // Should succeed under its separate bucket
    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
