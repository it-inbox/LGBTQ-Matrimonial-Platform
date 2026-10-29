# EverPride Context & Development Handoff

> Comprehensive knowledge transfer document for continuing development on **EverPride**, an inclusive, privacy-first LGBTQ+ matrimonial and matchmaking platform.

---

## 1. Project High-Level Architecture & Stack

EverPride is organized as a **Turborepo** + **pnpm** monorepo:
* **Web Client (`apps/web`)**: React 18, Vite, Tailwind CSS, TanStack React Query (`@tanstack/react-query`), Zustand (`auth.store.ts`, `chat.store.ts`), Socket.IO Client (`socket.io-client`), React Router v6, Lucide icons.
* **Backend API (`apps/api`)**: NestJS 11 + Express, Socket.IO Gateway (`@nestjs/websockets`), Prisma ORM, Passport JWT + Cookie authentication, Swagger docs at `/api/docs`.
* **Database (`packages/database`)**: PostgreSQL 16 (via Docker on port 5432), Prisma Client (`@everpride/database`), custom seed script (`prisma/seed.ts`).
* **Shared Packages**:
  * `packages/shared`: Shared Zod validation schemas, LGBTQ+ gender and orientation enums, religion, marital status, and chat schemas.
  * `packages/auth`: JWT signing/verification (`TokenService`), password hashing services (`PasswordService`).
  * `packages/typescript-config`: Shared TypeScript compiler configurations.

---

## 2. Seed Data & Test Users

The database seed script is located at [`packages/database/prisma/seed.ts`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/packages/database/prisma/seed.ts) and can be executed via:
```bash
pnpm --filter @everpride/database prisma db seed
```

### Key Seeded Test Accounts
All accounts use password: `Password@123`
* **Aarav Sharma**:
  * Phone: `+919876543210` (or `9876543210`) | Email: `aarav@example.com`
  * Gender: `MAN`, Orientation: `GAY`, Outness: `OUT_TO_ALL`
  * Status: Fully onboarded (`onboardingCompleted: true`), active conversations, mutual matches, received/sent interests, and unblur requests.
* **Priya Patel**:
  * Phone: `+919876543211` | Email: `priya@example.com`
  * Gender: `WOMAN`, Orientation: `LESBIAN`
* **Rohan Verma**:
  * Phone: `+919876543212` | Orientation: `GAY`
* **Ananya Iyer**, **Vikram Malhotra**, **Kabir Joshi**, etc.

> **Note on Authentication & Onboarding**:
> Users are stored in PostgreSQL with their `phoneNumber` stored with country code (e.g. `+919876543210`). The backend `auth.service.ts` normalizes phone numbers (stripping leading `0` or adding `+91` if 10-digit Indian number) so logging in via `9876543210` seamlessly maps to the seeded user and skips onboarding if `onboardingCompleted` is `true`.

---

## 3. Core UI Layout & Design Conventions

### 3.1. Unified Profile Card Layout (`UniversalProfileCard.tsx`)
All activity feeds and lists (`/discover`, `/matches`, `/unblur/received`, `/unblur/sent`, `/interests/received`, `/interests/sent`) use [`UniversalProfileCard.tsx`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/apps/web/src/components/activity/UniversalProfileCard.tsx):
* **Card Container**:
  * Desktop: Horizontal layout (`md:flex-row`, photo on left `md:w-60 md:h-auto`).
  * Mobile: Vertical card layout (`flex-col`, full-width photo banner `w-full h-72`).
  * Modern border styling (`border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all`).
* **Photo Section**:
  * Displays photo count badge (`📷 N`).
  * Displays outness status badge (`Discreet`, `Out to friends`, `Openly Out`) or mutual match status badge.
  * In case of protected photos: applies `filter blur-xl scale-110` with a lock shield overlay and "Request Unblur" button.
* **Details Section**:
  * Header line: Activity status (e.g. `Active Today`, `Just Joined`) or request date.
  * Name & Age: `DisplayName, Age (pronouns)`
  * Sexual identity tag: `GENDER • ORIENTATION`
  * Vital stats: `Height • City • Religion`
  * Profession & Income: `Briefcase • Profession • Annual Income`
  * Education & Marital Status: `GraduationCap • Education` and `Heart • Marital Status`
  * Message snippet: Displays note if included with the interest/request.
* **Bottom Action Footer**:
  * Light rose accent bar (`pt-3 border-t border-rose-50 -mx-5 -mb-5 px-5 py-3.5 bg-rose-50/40 mt-3 flex items-center justify-around text-xs font-semibold`).
  * Action controls tailored to page context (`Interest`, `Ignore`, `Accept`, `Decline`, `Message`, `Call`).

### 3.2. Responsive Navigation
* **Desktop View (`lg:`)**:
  * **Top Navbar**: Displays EverPride logo on the left and user profile dropdown / logout on the right. Topbar center tabs are removed to keep desktop view clean.
  * **Activity Sidebar (`ActivitySidebar.tsx`)**: Left-pinned sidebar with navigation links (`Discover`, `Matches`, `Connect`, `Interests`, `Unblur`) with live badges for unread messages, new matches, and pending interests.
* **Mobile / Tablet View (`< lg`)**:
  * **Bottom Sticky Navbar (`BottomStickyNavbar.tsx`)**: Provides one-tap access to primary pages (*Discover*, *Matches*, *Connect*, *Interests*) with badge pills.
  * **Hamburger Drawer**: In top navbar, opens slide-over menu for *Edit Profile*, *Privacy Settings*, and *Logout*.

### 3.3. Profile Edit Architecture (`/profile/edit`)
Located at [`EditProfilePage.tsx`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/apps/web/src/pages/settings/EditProfilePage.tsx):
* **Left Sticky Navigation Sidebar**: 8 distinct section tabs (*About & Demographics*, *Identity*, *Marital Status*, *Education & Work*, *Bio*, *Lifestyle & Interests*, *Looking For*, *Privacy Safeguards & Photos*).
* **Anchor Hash Jump**: Clicking any tab updates the URL (e.g. `/profile/edit#marital-status`) and smoothly scrolls the screen to the target section card.
* **Intersection Observer**: Automatically highlights the active sidebar tab as the user scrolls through the form.
* **Aligned Right Column**: Top header ("Back to Discover", "Edit Your Profile", and subtitle) is housed inside the right column, perfectly aligned with the left sidebar.

### 3.4. Connect & Messenger Experience (`/messages`)
Located at [`MessengerPage.tsx`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/apps/web/src/pages/chat/MessengerPage.tsx) and [`ActiveChatView.tsx`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/apps/web/src/components/chat/ActiveChatView.tsx):
* Clean container card without duplicate headers.
* Primary navigation tabs: **Messages** | **Calls**.
* Messages sub-filters: **All** | **Unread** | **Online** pill filters.
* Live search to filter conversation list by partner name or city.
* **Differentiated Chat Bubbles**:
  * Signed-in user messages render on the **right** in theme gradient (`bg-gradient-to-r from-rose-500 to-brand-600 text-white rounded-br-xs`).
  * Counterpart messages render on the **left** in clean light card styling (`bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs`).
* Live typing indicators and read receipt synchronization.

### 3.5. Discover Feed Filtering
* Feed endpoint `/api/v1/matches/feed` automatically excludes:
  * Blocked users.
  * Profiles that the user has already sent an interest to.
  * Profiles with whom the user is already matched.
* Feed supports dual age sliders (`18` to `60`), nationality search, and multi-select religion/marital status pills.

### 3.6. Landing Page Experience (`/`)
Located at [`LandingPage.tsx`](file:///c:/Users/Inboxuser.IBDT01/code/helloq-matrimonial/apps/web/src/pages/LandingPage.tsx):
* Hero section with fullscreen imagery (`hero-couple.jpg`), emotional headline, and "Looking For" matchmaking widget.
* Live Trust & Verification ticker (100% ID-verified, Zero public browsing, Private photo shields, Mutual consent).
* Interactive Photo Privacy Simulator with live toggle ("Visitor View" vs "Mutual Match View").
* "How EverPride Works" 3-step animated progression.
* Community love stories and testimonials.
* LGBTQ+ Matrimonial FAQ accordion.
* Pride celebratory bottom CTA and complete footer.

---

## 4. Key Endpoints & Backend Architecture

### Matchmaking & Discovery (`matches.controller.ts` & `matches.service.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/matches/feed` | Fetches active profiles matching user preferences & privacy grants (excludes sent interests and matches) |
| `POST` | `/api/v1/matches/interest` | Sends interest. If reciprocal pending interest exists, automatically auto-matches both members, initializes conversation, and emits `new_match` |
| `GET` | `/api/v1/matches/interests/received` | All received interests with complete sender profiles |
| `GET` | `/api/v1/matches/interests/sent` | All sent interests with complete receiver profiles and statuses |
| `POST` | `/api/v1/matches/interest/:id/respond` | Respond (`ACCEPTED` or `DECLINED`) to an interest. Creates mutual conversation upon acceptance. |
| `GET` | `/api/v1/matches/accepted` | Deduplicated list of mutual matches where interest was accepted in either direction |
| `POST` | `/api/v1/matches/photo-access` | Request photo unblur permission from another member |
| `GET` | `/api/v1/matches/photo-access/received` | All photo access requests received by the current user |
| `GET` | `/api/v1/matches/photo-access/sent` | All photo access requests sent by the current user |
| `POST` | `/api/v1/matches/photo-access/:id/respond` | Approve (`ACCEPTED`) or reject (`DECLINED`) photo unblur access |

### Connect & Real-Time Chat (`chat.controller.ts`, `chat.service.ts`, `chat.gateway.ts`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/chat/conversations` | All user conversations with partner info, unread count, and last message |
| `POST` | `/api/v1/chat/conversations/with/:id` | Get or initialize conversation with matched member |
| `GET` | `/api/v1/chat/conversations/:id/messages` | Paginated message history |
| `POST` | `/api/v1/chat/messages` | Send message (REST fallback) |
| `POST` | `/api/v1/chat/conversations/:id/read` | Mark conversation messages as read |
| `GET` | `/api/v1/chat/online-matches` | Deduplicated list of accepted matches currently online |

### Real-Time WebSocket Events (`/chat`)
* **`send_message`**: Dispatches a new message. Emits `new_message` to the conversation room and `incoming_message_notification` to the recipient's personal user room.
* **`typing`**: Emits `user_typing` to conversation members.
* **`presence_update`**: Broadcasts user online/offline status with timestamps.
* **`new_interest`**: Emitted to recipient when an interest is submitted.
* **`interest_accepted`**: Emitted to sender when an interest is accepted.
* **`new_match`**: Emitted to both parties when reciprocal auto-matching occurs or when interest is accepted.

---

## 5. Development Workflows & Running the System

### Starting Dev Servers
```bash
# Start background database (PostgreSQL 16)
docker compose up -d

# Start both NestJS API (port 4001) and Vite Web (port 3000)
pnpm dev
```

### Verifying Type Checks and Production Builds
```bash
# Build web client
pnpm --filter @everpride/web build

# Check web types without emit
pnpm --filter @everpride/web exec tsc --noEmit

# Build backend API
pnpm --filter @everpride/api build

# Build entire monorepo
pnpm build
```

---

## 6. Current State & Pending Roadmap

1. **Active Features (Completed)**:
   - Authentication (phone/email), onboarding wizard, profile photo protection with watermarking.
   - Discovery feed with reciprocal interest auto-matching, sent-interest exclusions, and dual-thumb age range filters.
   - Real-time WebSocket messaging and presence via Socket.IO `/chat` namespace.
   - Real-time toast notifications with live badges on ActivitySidebar and BottomStickyNavbar.
   - Unified polymorphic activity pages for Interests and Unblur requests.
   - Dedicated `/profile/edit` page with left sticky section navigation tabs and URL hash sync.
   - Senior UI redesigned landing page with interactive privacy simulator and trust metrics.
2. **Upcoming Features (Roadmap)**:
   - WebRTC signaling for in-browser audio and video calling between matched couples.
   - KYC Verification document uploads to Cloudflare R2 / AWS S3 using presigned URLs.
   - Mobile app implementation (`apps/mobile`) using Expo / React Native reusing `@everpride/shared` and `@everpride/auth`.
