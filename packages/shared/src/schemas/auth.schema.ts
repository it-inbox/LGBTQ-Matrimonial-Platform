import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const sendOtpSchema = z.object({
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits").trim(),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits").trim(),
  otp: z.string().min(4, "OTP must be at least 4 digits").trim(),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const registerSchema = z.object({
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits").trim(),
  otp: z.string().min(4, "OTP must be at least 4 digits").trim(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  phoneNumber: z.string().min(8, "Phone number must be at least 8 digits").trim(),
  otp: z.string().min(4, "OTP must be at least 4 digits").trim(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
