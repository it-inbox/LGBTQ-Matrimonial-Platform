import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planTier: z.enum(["pro", "pro-max", "pro-supreme", "premier-lite"]),
  duration: z.enum(["1-month", "3-months", "6-months", "12-months", "till-marriage"]),
  amount: z.number().positive("Amount must be greater than zero"),
  currency: z.string().default("USD").optional(),
});

export const completePaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  planTier: z.string().min(1, "Plan tier is required"),
  duration: z.string().min(1, "Duration is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  simulateSuccess: z.boolean().optional(),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>;
export type CompletePaymentInput = z.infer<typeof completePaymentSchema>;
