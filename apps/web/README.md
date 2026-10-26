# @everpride/web

Web application portal for the EverPride Matrimonial Platform, built with **React 18**, **Vite**, **Tailwind CSS**, and **TanStack React Query**.

---

## 🎨 Visual Identity & Design System

- **Typography:** Plus Jakarta Sans
- **Colors:** Deep violet/indigo brand tones (`#8B5CF6`, `#6D28D9`), rose accents (`#F43F5E`), and Pride-infused gradient highlights.
- **Glassmorphism:** Frosted translucent overlays (`.glass`, `backdrop-blur-md`) on navigation bars, sticky action footers, and modal cards.
- **Chat Experience:**
  - Messages sent by the signed-in user are styled on the right in theme gradient (`from-rose-500 to-brand-600 text-white rounded-br-xs`).
  - Partner messages are styled on the left in light card styling (`bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs`).
- **Progressive Photo Unblur:** Protected photos are rendered with hardware-accelerated CSS blur filters and lock shield overlays until mutual match or approved unblur access.

---

## 🧭 Pages & Routing

| Route | Access | Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Public | `LandingPage.tsx` | High-trust landing page with Hero search, Live Trust Ticker, Interactive Photo Privacy Simulator, Testimonials & FAQs |
| `/login` | Public | Modal | Instant phone/email authentication modal |
| `/onboarding` | Protected | `OnboardingWizard.tsx` | 3-step LGBTQ+ onboarding flow (Identity, Demographics, Privacy) |
| `/discover` | Protected | `DiscoveryFeedPage.tsx` | Discovery partner feed with photo protection, dual age sliders, and instant interest dispatch |
| `/matches` | Protected | `MatchesPage.tsx` | Deduplicated list of accepted mutual matches with direct chat navigation |
| `/messages` | Protected | `MessengerPage.tsx` | Connect center featuring Messages and Calls tabs, filter pills (All / Unread / Online), conversation search, and active chat |
| `/interests/received` | Protected | `InterestsActivityPage.tsx` | Received connection interests with status filter pills (All / Pending / Accepted / Declined) |
| `/interests/sent` | Protected | `InterestsActivityPage.tsx` | Sent connection interests with status filter pills |
| `/unblur/received` | Protected | `UnblurActivityPage.tsx` | Received photo unblur requests with approval / decline actions |
| `/unblur/sent` | Protected | `UnblurActivityPage.tsx` | Sent photo unblur requests tracking access status |
| `/profile/edit` | Protected | `EditProfilePage.tsx` | Profile editor with sticky left sidebar section tabs, smooth anchor scrolling, and hash URL sync |
| `/privacy-settings` | Protected | `PrivacySettingsPage.tsx` | Photo visibility tier selection (`MUTUAL_MATCHES_ONLY`, `REQUEST_REQUIRED`, `ALL_MEMBERS`) and Ghost Mode toggle |

---

## 📱 Navigation & Responsive Architecture

- **Desktop View (`lg:` and above)**:
  - Top navigation bar displays the EverPride logo on the left and user profile / logout controls on the right.
  - Left navigation is managed by the sticky [`ActivitySidebar.tsx`](src/components/layout/ActivitySidebar.tsx), which displays live unread badge counters for Connect, Interests, and Matches.
  - Profile edit page features a dedicated left sidebar with 8 section tabs (Demographics, Identity, Marital Status, Education & Work, Bio, Lifestyle, Looking For, Privacy).
- **Mobile & Tablet View (`< lg`)**:
  - Bottom sticky navigation bar provides one-tap access to *Discover*, *Matches*, *Connect*, and *Interests*.
  - Top-right hamburger drawer allows access to *Edit Profile*, *Privacy Settings*, and *Logout*.

---

## ⚡ Real-Time Capabilities & State Management

- **Zustand Chat Store (`chat.store.ts`)**:
  - Automatically manages WebSocket connections to `/chat`.
  - Listens for real-time `new_message`, `incoming_message_notification`, `presence_update`, `new_interest`, `interest_accepted`, and `new_match` events.
  - Tracks total unread message counts, unread received interests, and new match badges.
- **Real-Time Notification Toast (`ChatNotificationToast.tsx`)**:
  - Displays interactive floating notifications for incoming messages, interest alerts, and new matches with instant one-click route jumping.

---

## 🛠️ Development Scripts

```bash
# Start Vite development server on port 3000
pnpm dev

# Type check and build production bundle
pnpm build

# Preview production build locally
pnpm preview
```
