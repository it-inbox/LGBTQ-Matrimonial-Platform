import { describe, it, expect } from "vitest";
import { PasswordService, TokenService } from "./index.js";

describe("PasswordService", () => {
  const passwordService = new PasswordService();

  it("should hash a password and verify it correctly", async () => {
    const plain = "Secur3P@ssw0rd!";
    const hash = await passwordService.hash(plain);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plain);

    const isMatch = await passwordService.compare(plain, hash);
    expect(isMatch).toBe(true);
  });

  it("should reject an incorrect password against hash", async () => {
    const plain = "Secur3P@ssw0rd!";
    const hash = await passwordService.hash(plain);

    const isMatch = await passwordService.compare("WrongPassword", hash);
    expect(isMatch).toBe(false);
  });
});

describe("TokenService", () => {
  const accessSecret = "test-secret-at-least-32-chars-long-123456";
  const refreshSecret = "test-refresh-secret-32-chars-long-789012";
  const tokenService = new TokenService(accessSecret, "15m", refreshSecret, "7d");

  const payload = {
    userId: "user_test_123",
    phoneNumber: "+919876543210",
    role: "USER",
  };

  it("should sign and verify access token correctly", () => {
    const token = tokenService.signAccessToken(payload);
    expect(token).toBeDefined();

    const decoded = tokenService.verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.phoneNumber).toBe(payload.phoneNumber);
    expect(decoded.role).toBe(payload.role);
  });

  it("should sign and verify refresh token correctly", () => {
    const token = tokenService.signRefreshToken(payload);
    expect(token).toBeDefined();

    const decoded = tokenService.verifyRefreshToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  it("should throw error when verifying tampered token", () => {
    const token = tokenService.signAccessToken(payload);
    const tampered = token.slice(0, -5) + "abcde";

    expect(() => tokenService.verifyAccessToken(tampered)).toThrow();
  });
});
