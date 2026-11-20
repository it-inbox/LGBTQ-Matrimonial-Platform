import { describe, it, expect } from "vitest";
import {
  sendOtpSchema,
  verifyOtpSchema,
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema.js";
import {
  createCheckoutSessionSchema,
  completePaymentSchema,
} from "../schemas/payment.schema.js";

describe("Shared Schemas: Auth", () => {
  it("should validate a correct phone number for sendOtp", () => {
    const valid = { phoneNumber: "+919876543210" };
    const res = sendOtpSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("should reject short phone numbers in sendOtp", () => {
    const invalid = { phoneNumber: "123" };
    const res = sendOtpSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should validate verifyOtp with code", () => {
    const valid = { phoneNumber: "+919876543210", otp: "123456" };
    const res = verifyOtpSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("should reject verifyOtp missing otp", () => {
    const invalid = { phoneNumber: "+919876543210", otp: "" };
    const res = verifyOtpSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should validate register payload", () => {
    const valid = { phoneNumber: "+919876543210", otp: "654321" };
    const res = registerSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});

describe("Shared Schemas: Payments", () => {
  it("should validate valid checkout session inputs", () => {
    const valid = {
      planTier: "pro",
      duration: "1-month",
      amount: 29.99,
      currency: "USD",
    };
    const res = createCheckoutSessionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("should reject invalid plan tiers in checkout session", () => {
    const invalid = {
      planTier: "unlimited_vip",
      duration: "1-month",
      amount: 50,
    };
    const res = createCheckoutSessionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should reject negative or zero amount in checkout session", () => {
    const invalid = {
      planTier: "pro",
      duration: "1-month",
      amount: -10,
    };
    const res = createCheckoutSessionSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("should validate complete payment simulation schema", () => {
    const valid = {
      sessionId: "sim_12345",
      planTier: "pro",
      duration: "1-month",
      amount: 29.99,
      simulateSuccess: true,
    };
    const res = completePaymentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
