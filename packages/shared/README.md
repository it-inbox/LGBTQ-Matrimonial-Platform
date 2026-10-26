# @everpride/shared

Shared TypeScript validation schemas and domain models for the EverPride monorepo, powered by **Zod**.

---

## 🎯 Purpose

Eliminates duplicate DTO definitions. Both the **NestJS API**, the **React Web Portal**, and the upcoming **Expo Mobile App** import identical Zod validation schemas and inferred types from this package.

---

## 📦 Exports

```ts
import {
  // Enums
  GenderEnum,
  OrientationEnum,
  OutnessStatusEnum,
  PhotoVisibilityEnum,
  InterestStatusEnum,

  // Auth Schemas & Types
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  RegisterInput,
  LoginInput,

  // Profile Schemas & Types
  createProfileSchema,
  updateProfileSchema,
  updatePrivacySettingsSchema,
  CreateProfileInput,

  // Match Schemas & Types
  partnerPreferenceSchema,
  sendInterestSchema,
  respondInterestSchema,
  requestPhotoAccessSchema,
} from "@everpride/shared";
```

---

## 🛠️ Build Scripts

```bash
# Compile TypeScript into dist/
pnpm build

# Clean build artifacts
pnpm clean
```
