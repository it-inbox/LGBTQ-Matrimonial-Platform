import { z } from "zod";
import { GenderEnum, OrientationEnum, OutnessStatusEnum } from "../enums.js";

export const partnerPreferenceSchema = z.object({
  preferredGenders: z.array(GenderEnum).default([]),
  preferredOrientations: z.array(OrientationEnum).default([]),
  minAge: z.number().int().min(18).max(80).default(21),
  maxAge: z.number().int().min(18).max(100).default(50),
  minHeightCm: z.number().int().min(120).max(250).optional(),
  maxHeightCm: z.number().int().min(120).max(250).optional(),
  maxDistanceKm: z.number().int().min(5).max(1000).optional(),
  acceptableOutness: z.array(OutnessStatusEnum).default([]),
});
export type PartnerPreferenceInput = z.infer<typeof partnerPreferenceSchema>;

export const sendInterestSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
  message: z.string().max(250).trim().optional(),
});
export type SendInterestInput = z.infer<typeof sendInterestSchema>;

export const respondInterestSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});
export type RespondInterestInput = z.infer<typeof respondInterestSchema>;

export const requestPhotoAccessSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
});
export type RequestPhotoAccessInput = z.infer<typeof requestPhotoAccessSchema>;
