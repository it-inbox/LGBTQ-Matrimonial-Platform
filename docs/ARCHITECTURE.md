# EverPride System Architecture & Design Documentation

## 1. Executive Summary & Core Constraints

EverPride is an LGBTQ+ matrimonial and matchmaking platform. Unlike conventional dating apps or public matrimonial networks, EverPride operates under strict privacy and safety constraints:
1. **Zero Public Indexing:** Profiles cannot be crawled by search engines or viewed without authenticated verification.
2. **Identity Decoupling:** Users may live in discreet or non-affirming environments; their public-facing display alias is strictly isolated from legal verification documents (KYC).
3. **Progressive Photo Disclosure:** Profile photos are masked/blurred by default, revealed only upon mutual interest acceptance or explicitly granted unblur permission.
4. **Discreet Operation:** Ghost Mode allows safe usage without leaving digital footprints.
5. **Mutual Consent Communication:** In-app chat communication is strictly gated behind mutual interest acceptance or reciprocal auto-matching.

---

## 2. Monorepo Structural Topology

The platform uses a **Turborepo** + **pnpm** monorepo to maintain strong type boundaries while sharing validation schemas across backend, web, and mobile clients:

```mermaid
graph TD
  subgraph packages [Shared Packages]
    TS[typescript-config]
    DB[database - Prisma]
    SHARED[shared - Zod Schemas & Types]
    AUTH[auth - Token & Password Services]
  end

  subgraph apps [Applications]
    API[apps/api - NestJS 11 + Express + Socket.IO]
    WEB[apps/web - React 18 + Vite]
    MOB[apps/mobile - Expo / React Native]
  end

  TS --> DB
  TS --> SHARED
  TS --> AUTH
  TS --> API
  TS --> WEB
  TS --> MOB

  SHARED --> API
  SHARED --> WEB
  SHARED --> MOB

  AUTH --> API
  DB --> API
```

---

## 3. Data Model & Entity Relationship (ERD)

The database runs on **PostgreSQL 16** managed via **Prisma ORM** (`packages/database`).

```mermaid
erDiagram
  User ||--o| Profile : "has one"
  User ||--o{ RefreshToken : "owns"
  User ||--o{ MatchInterest : "sends/receives"
  User ||--o{ PhotoAccessRequest : "requests/approves"
  User ||--o{ Conversation : "participates in"
  User ||--o{ BlockedUser : "blocks/blocked by"
  Profile ||--o{ ProfilePhoto : "contains"
  Profile ||--o| PartnerPreference : "defines"
  Conversation ||--o{ Message : "contains"

  User {
    string id PK
    string email UK
    string phoneNumber UK
    string passwordHash
    enum role "USER, MODERATOR, ADMIN"
    boolean isVerified
    boolean isActive
    boolean onboardingCompleted
  }

  Profile {
    string id PK
    string userId FK
    string displayName "Alias"
    string legalNameEncrypted "Optional KYC only"
    enum gender "MAN, WOMAN, NON_BINARY, TRANS_MAN, ..."
    enum orientation "GAY, LESBIAN, BISEXUAL, PANSEXUAL, ..."
    string pronouns
    enum outnessStatus "DISCREET_NOT_OUT, OUT_TO_SELECT_FEW, OUT_TO_ALL"
    datetime dateOfBirth
    string city
    string state
    string country
    string nationality
    string religion
    string motherTongue
    string[] languagesSpoken
    string maritalStatus
    string education
    string profession
    string annualIncome
    string bio
    string diet
    string drinking
    string smoking
    string[] hobbies
    enum photoVisibility "ALL_MEMBERS, MUTUAL_MATCHES_ONLY, REQUEST_REQUIRED"
    boolean ghostModeEnabled
  }

  ProfilePhoto {
    string id PK
    string profileId FK
    string originalUrl
    string blurredUrl
    boolean isPrimary
    boolean isWatermarked
    boolean isApproved
  }

  PartnerPreference {
    string id PK
    string profileId FK
    enum_array preferredGenders
    enum_array preferredOrientations
    int minAge
    int maxAge
    int minHeightCm
    int maxHeightCm
    string[] acceptableOutness
    int maxDistanceKm
  }

  MatchInterest {
    string id PK
    string senderId FK
    string receiverId FK
    enum status "PENDING, ACCEPTED, DECLINED, CANCELLED"
    string message
    datetime createdAt
    datetime updatedAt
  }

  Conversation {
    string id PK
    string participant1Id FK
    string participant2Id FK
    datetime createdAt
    datetime updatedAt
  }

  Message {
    string id PK
    string conversationId FK
    string senderId FK
    string content
    boolean isRead
    datetime createdAt
  }
```

---

## 4. Privacy & Access Control State Machine

### 4.1 Photo Privacy Matrix
When a user visits the discovery feed or opens a profile:

| Photo Visibility Setting | Requester Status | Result |
| :--- | :--- | :--- |
| `ALL_MEMBERS` | Any authenticated member | Original photo returned (watermarked) |
| `MUTUAL_MATCHES_ONLY` | Mutual interest `ACCEPTED` | Original photo returned |
| `MUTUAL_MATCHES_ONLY` | Interest `PENDING` or none | Blurred photo + Unblur Request CTA |
| `REQUEST_REQUIRED` | PhotoAccessRequest `ACCEPTED` | Original photo returned |
| `REQUEST_REQUIRED` | No access granted | Blurred photo + Unblur Request CTA |

```mermaid
stateDiagram-v2
  [*] --> BlurredByDefault : Profile photo uploaded
  BlurredByDefault --> MutualAccepted : Both accept MatchInterest OR Reciprocal Auto-Match
  MutualAccepted --> OriginalRevealed : Access Granted Automatically
  BlurredByDefault --> AccessRequested : Member clicks Request Unblur
  AccessRequested --> AccessApproved : Owner accepts request
  AccessRequested --> AccessDeclined : Owner denies request
  AccessApproved --> OriginalRevealed : Photo Unblurred
  AccessDeclined --> BlurredByDefault : Remains Blurred
```

---

## 5. Security & Real-Time Architecture

1. **Password Storage:** Uses `bcrypt` with 12 salt rounds (`packages/auth/PasswordService`).
2. **Token Strategy:**
   * Short-lived Access JWT: `15 minutes`.
   * Refresh JWT: `7 days`, stored securely in HTTP-only cookies or encrypted local storage.
3. **Screenshot & Exfiltration Protection:**
   * Profile photos are served with dynamic watermarking ("EverPride Verified").
   * Mobile app integrates `FLAG_SECURE` / screen capture blocking on profile albums.
4. **WebSocket Real-Time Gateway (`/chat`):**
   * Instant messaging and presence updates delivered over Socket.IO.
   * Personal user channels (`user:{id}`) receive instant notifications for new interests, interest acceptances, and mutual matches.
5. **Reciprocal Match Engine:**
   * When user A sends an interest to user B, the system checks if user B has already sent an interest to user A.
   * If yes, the engine automatically upgrades both interests to `ACCEPTED`, initializes the shared `Conversation` entity, and dispatches real-time `new_match` events to both users.
