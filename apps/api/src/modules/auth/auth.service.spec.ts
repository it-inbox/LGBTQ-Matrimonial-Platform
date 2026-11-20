import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";

describe("AuthService Unit Tests", () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockSmsService: any;
  let mockPaymentsService: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        phoneVerification: {
          findUnique: vi.fn(),
          upsert: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          deleteMany: vi.fn(),
        },
        user: {
          findUnique: vi.fn(),
          findFirst: vi.fn(),
          create: vi.fn(),
        },
        profile: {
          findUnique: vi.fn(),
        },
        refreshToken: {
          create: vi.fn(),
          findUnique: vi.fn(),
          update: vi.fn(),
          updateMany: vi.fn(),
        },
      },
    };

    mockSmsService = {
      sendOtpSms: vi.fn().mockResolvedValue(true),
    };

    mockPaymentsService = {
      getMembership: vi.fn().mockResolvedValue({
        tier: "FREE",
        planName: "Free Member",
        status: "NONE",
      }),
    };

    authService = new AuthService(
      mockPrisma as any,
      mockSmsService as any,
      mockPaymentsService as any
    );
  });

  describe("sendOtp", () => {
    it("should reject OTP request if 30-second cooldown has not passed", async () => {
      mockPrisma.client.phoneVerification.findUnique.mockResolvedValue({
        phoneNumber: "+919876543210",
        updatedAt: new Date(Date.now() - 10 * 1000), // 10 seconds ago
      });

      await expect(
        authService.sendOtp({ phoneNumber: "+919876543210" })
      ).rejects.toThrow(BadRequestException);
    });

    it("should generate OTP and dispatch SMS when cooldown has passed", async () => {
      mockPrisma.client.phoneVerification.findUnique.mockResolvedValue({
        phoneNumber: "+919876543210",
        updatedAt: new Date(Date.now() - 45 * 1000), // 45 seconds ago
      });

      const res = await authService.sendOtp({ phoneNumber: "+919876543210" });
      expect(res.success).toBe(true);
      expect(mockSmsService.sendOtpSms).toHaveBeenCalled();
      expect(mockPrisma.client.phoneVerification.upsert).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should throw NotFoundException if user does not exist in DB", async () => {
      // Mock valid OTP record
      const phone = "+919876543210";
      const otp = "123456";
      const hash = (authService as any).hashOtp(phone, otp);

      mockPrisma.client.phoneVerification.findUnique.mockResolvedValue({
        phoneNumber: phone,
        otpHash: hash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      // User not found in DB
      mockPrisma.client.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({ phoneNumber: phone, otp })
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw UnauthorizedException if user account is deactivated", async () => {
      const phone = "+919876543210";
      const otp = "123456";
      const hash = (authService as any).hashOtp(phone, otp);

      mockPrisma.client.phoneVerification.findUnique.mockResolvedValue({
        phoneNumber: phone,
        otpHash: hash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      mockPrisma.client.user.findFirst.mockResolvedValue({
        id: "user_deactivated",
        phoneNumber: phone,
        isActive: false,
      });

      await expect(
        authService.login({ phoneNumber: phone, otp })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh (Token Rotation & Reuse Detection)", () => {
    it("should trigger reuse detection and revoke ALL sessions if revoked token is re-submitted", async () => {
      const tokenService = (authService as any).tokenService;
      const fakePayload = { userId: "user_compromised", role: "USER" };
      const refreshToken = tokenService.signRefreshToken(fakePayload);

      mockPrisma.client.refreshToken.findUnique.mockResolvedValue({
        tokenHash: (authService as any).hashToken(refreshToken),
        userId: fakePayload.userId,
        revoked: true, // Already revoked!
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await expect(authService.refresh(refreshToken)).rejects.toThrow(
        UnauthorizedException
      );

      // Verify that all active tokens for this user were invalidated
      expect(mockPrisma.client.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: fakePayload.userId },
        data: { revoked: true },
      });
    });
  });
});
