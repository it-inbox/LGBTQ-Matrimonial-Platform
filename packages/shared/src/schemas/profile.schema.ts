import { z } from "zod";
import { GenderEnum, OrientationEnum, OutnessStatusEnum, PhotoVisibilityEnum } from "../enums.js";

export const createProfileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50).trim(),
  gender: GenderEnum,
  orientation: OrientationEnum,
  pronouns: z.string().max(30).trim().optional(),
  outnessStatus: OutnessStatusEnum.default("DISCREET_NOT_OUT"),
  dateOfBirth: z.string().refine((val: string) => !isNaN(Date.parse(val)), {
    message: "Valid date of birth is required",
  }),
  heightCm: z.number().int().min(120).max(250).optional(),
  nationality: z.string().max(100).trim().optional(),
  religion: z.string().max(100).trim().optional(),
  motherTongue: z.string().max(50).trim().optional(),
  languagesSpoken: z.array(z.string().trim()).default([]),
  maritalStatus: z.string().max(50).trim().optional(),

  // Phone & Backup Email
  phoneNumber: z.string().max(30).trim().optional(),
  phoneVerified: z.boolean().default(false),
  backupEmail: z.string().email("Invalid backup email").optional().or(z.literal("")),

  // Location
  city: z.string().min(1, "City is required").max(100).trim(),
  state: z.string().min(1, "State is required").max(100).trim(),
  country: z.string().max(100).default("India"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Education & Work
  education: z.string().max(100).trim().optional(),
  degree: z.string().max(100).trim().optional(),
  sector: z.string().max(100).trim().optional(),
  profession: z.string().max(100).trim().optional(),
  company: z.string().max(100).trim().optional(),
  annualIncome: z.string().max(50).trim().optional(),

  // Bio & Lifestyle
  bio: z.string().max(1000).trim().optional(),
  diet: z.string().max(50).trim().optional(),
  drinking: z.string().max(50).trim().optional(),
  smoking: z.string().max(50).trim().optional(),
  pets: z.string().max(50).trim().optional(),
  hobbies: z.array(z.string().trim()).default([]),
  photos: z.array(z.string()).default([]),

  photoVisibility: PhotoVisibilityEnum.default("MUTUAL_MATCHES_ONLY"),
  ghostModeEnabled: z.boolean().default(false),
  partnerPreference: z
    .object({
      preferredGenders: z.array(GenderEnum).default([]),
      preferredOrientations: z.array(OrientationEnum).default([]),
      minAge: z.number().int().min(18).max(80).default(21),
      maxAge: z.number().int().min(18).max(100).default(50),
      minHeightCm: z.number().int().min(120).max(250).optional().nullable(),
      maxHeightCm: z.number().int().min(120).max(250).optional().nullable(),
      maxDistanceKm: z.number().int().min(5).max(1000).optional().nullable(),
      acceptableOutness: z.array(OutnessStatusEnum).default([]),
    })
    .optional(),
});
export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export const updateProfileSchema = createProfileSchema.partial();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePrivacySettingsSchema = z.object({
  photoVisibility: PhotoVisibilityEnum.optional(),
  ghostModeEnabled: z.boolean().optional(),
});
export type UpdatePrivacySettingsInput = z.infer<typeof updatePrivacySettingsSchema>;
