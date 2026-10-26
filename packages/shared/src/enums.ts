import { z } from "zod";

export const GenderEnum = z.enum([
  "MAN",
  "WOMAN",
  "NON_BINARY",
  "TRANS_MAN",
  "TRANS_WOMAN",
  "GENDERQUEER",
  "AGENDER",
  "OTHER",
]);
export type Gender = z.infer<typeof GenderEnum>;

export const OrientationEnum = z.enum([
  "GAY",
  "LESBIAN",
  "BISEXUAL",
  "PANSEXUAL",
  "QUEER",
  "ASEXUAL",
  "DEMISEXUAL",
  "OTHER",
]);
export type Orientation = z.infer<typeof OrientationEnum>;

export const OutnessStatusEnum = z.enum([
  "OUT_TO_ALL",
  "OUT_TO_SELECT_FEW",
  "DISCREET_NOT_OUT",
]);
export type OutnessStatus = z.infer<typeof OutnessStatusEnum>;

export const PhotoVisibilityEnum = z.enum([
  "ALL_MEMBERS",
  "MUTUAL_MATCHES_ONLY",
  "REQUEST_REQUIRED",
]);
export type PhotoVisibility = z.infer<typeof PhotoVisibilityEnum>;

export const InterestStatusEnum = z.enum([
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "CANCELLED",
]);
export type InterestStatus = z.infer<typeof InterestStatusEnum>;
