import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentsService } from "./payments.service.js";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      client: {
        membership: {
          findUnique: vi.fn(),
          findMany: vi.fn(),
          upsert: vi.fn(),
        },
        paymentTransaction: {
          create: vi.fn(),
        },
        $transaction: vi.fn((promises) => Promise.all(promises)),
      },
    };

    service = new PaymentsService(mockPrisma);
  });

  describe("getMembership", () => {
    it("returns default FREE membership when no DB record exists", async () => {
      mockPrisma.client.membership.findUnique.mockResolvedValueOnce(null);

      const membership = await service.getMembership("user-1");

      expect(membership.tier).toBe("FREE");
      expect(membership.planName).toBe("Free Member");
      expect(membership.status).toBe("NONE");
      expect(membership.superInterestsRemaining).toBe(0);
      expect(membership.canViewPhoneNumbers).toBe(false);
    });

    it("returns formatted persisted membership when DB record exists", async () => {
      const now = new Date();
      mockPrisma.client.membership.findUnique.mockResolvedValueOnce({
        userId: "user-1",
        tier: "PRO_MAX",
        planName: "Pro Max",
        expiresAt: now,
        status: "ACTIVE",
        superInterestsRemaining: 45,
        spotlightsRemaining: 40,
        hasGoldBadge: true,
        canViewPhoneNumbers: true,
        lastPaymentAt: now,
        lastPaymentAmount: 49.99,
      });

      const membership = await service.getMembership("user-1");

      expect(membership.tier).toBe("PRO_MAX");
      expect(membership.planName).toBe("Pro Max");
      expect(membership.status).toBe("ACTIVE");
      expect(membership.superInterestsRemaining).toBe(45);
      expect(membership.hasGoldBadge).toBe(true);
      expect(membership.canViewPhoneNumbers).toBe(true);
      expect(membership.lastPaymentAmount).toBe(49.99);
    });
  });

  describe("createCheckoutSession", () => {
    it("generates a simulated checkout session in dev mode", async () => {
      const result = await service.createCheckoutSession("user-1", {
        planTier: "pro-max",
        duration: "3-months",
        amount: 59.99,
      });

      expect(result.isSimulated).toBe(true);
      expect(result.planTier).toBe("pro-max");
      expect(result.duration).toBe("3-months");
      expect(result.amount).toBe(59.99);
      expect(result.sessionId).toMatch(/^sim_sess_/);
      expect(result.checkoutUrl).toContain("payment_step=checkout");
    });
  });

  describe("completeSimulatedPayment", () => {
    it("handles simulated failure when simulateSuccess is false", async () => {
      mockPrisma.client.membership.findUnique.mockResolvedValueOnce(null);

      const result = await service.completeSimulatedPayment("user-1", {
        sessionId: "sim-123",
        planTier: "pro",
        duration: "1-month",
        amount: 29.99,
        simulateSuccess: false,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Payment declined");
      expect(mockPrisma.client.paymentTransaction.create).not.toHaveBeenCalled();
    });

    it("persists membership and payment transaction on success", async () => {
      mockPrisma.client.membership.upsert.mockResolvedValueOnce({});
      mockPrisma.client.paymentTransaction.create.mockResolvedValueOnce({});

      const result = await service.completeSimulatedPayment("user-1", {
        sessionId: "sim-123",
        planTier: "pro-supreme",
        duration: "6-months",
        amount: 99.99,
        simulateSuccess: true,
      });

      expect(result.success).toBe(true);
      expect(result.membership.tier).toBe("PRO_SUPREME");
      expect(result.membership.superInterestsRemaining).toBe(80);
      expect(result.membership.hasGoldBadge).toBe(true);

      expect(mockPrisma.client.$transaction).toHaveBeenCalled();
      expect(mockPrisma.client.paymentTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          sessionId: "sim-123",
          provider: "SIMULATED",
          planTier: "pro-supreme",
          duration: "6-months",
          amount: 99.99,
          status: "SUCCESS",
        },
      });
    });
  });
});
