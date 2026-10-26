# @everpride/database

Database and ORM layer for EverPride, powered by **Prisma** and **PostgreSQL 16**.

---

## 🗄️ Database Schema & Models

The Prisma schema is located in [`prisma/schema.prisma`](prisma/schema.prisma).

### Core Enums:
- `Gender`: `MAN`, `WOMAN`, `NON_BINARY`, `TRANS_MAN`, `TRANS_WOMAN`, `GENDERQUEER`, `AGENDER`, `OTHER`
- `Orientation`: `GAY`, `LESBIAN`, `BISEXUAL`, `PANSEXUAL`, `QUEER`, `ASEXUAL`, `DEMISEXUAL`, `OTHER`
- `OutnessStatus`: `OUT_TO_ALL`, `OUT_TO_SELECT_FEW`, `DISCREET_NOT_OUT`
- `PhotoVisibility`: `ALL_MEMBERS`, `MUTUAL_MATCHES_ONLY`, `REQUEST_REQUIRED`
- `InterestStatus`: `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`

### Key Models:
- **`User`**: Account credentials, verification flag, role, and relational links.
- **`Profile`**: Chosen `displayName`, pronouns, gender, orientation, outness, city/state, lifestyle, and privacy toggles.
- **`ProfilePhoto`**: Multiple photos with `blurredUrl`, watermarking flag, and primary indicator.
- **`PhotoAccessRequest`**: Granular per-user unblur approvals (`requesterId` ↔ `targetId`).
- **`PartnerPreference`**: Filtering bounds (target genders, orientations, age ranges, distance).
- **`MatchInterest`**: Interaction between sender and receiver with optional personal note.
- **`Conversation` & `Message`**: Post-match private messaging.
- **`BlockedUser`**: Mutual safety blocking mechanism.

---

## 🚀 Common Commands

```bash
# Push schema updates directly to database (dev environment)
pnpm db:push

# Generate Prisma Client after schema edits
pnpm db:generate

# Open interactive Prisma Studio web UI
pnpm db:studio
```
