# EverPride Matrimonial Platform

> An inclusive, privacy-first matrimonial and matchmaking platform built specifically for the **LGBTQ+ community**.

---

## 🏳️‍🌈 Vision & Privacy Philosophy

Traditional matrimonial websites operate on public profiles, family-mediated discovery, and rigid gender binaries. **EverPride** is built from the ground up to empower queer, transgender, and non-binary individuals to find lifelong partners in a safe, authentic, and discreet environment:

- **100% Gated Discovery:** Profiles are never indexed by search engines or viewable without an active, verified account.
- **Display Alias vs. Legal Records Separation:** Members can use a preferred chosen name and pronouns for discovery while sensitive legal records remain strictly encrypted for verification.
- **Granular Photo Visibility:** Photos can be blurred by default; unblurring requires mutual match acceptance or manual approval per member.
- **Ghost & Discreet Browsing:** Browse profiles without leaving traces in visitor history, with background Ghost Mode settings.
- **Location Obfuscation:** City and state level visibility prevents triangulation of exact home or work locations.
- **Real-Time Mutual Consent:** Communication unlocks seamlessly only after mutual interest acceptance or reciprocal auto-matching.

---

## 🏛️ Monorepo Architecture

This project is built using a modern **Turborepo** + **pnpm** monorepo setup:

```
helloq-matrimonial/
├── apps/
│   ├── api/                   # NestJS 11 + Express + Socket.IO REST & WS API (@everpride/api)
│   ├── web/                   # React 18 + Vite + Tailwind CSS Web Portal (@everpride/web)
│   └── mobile/                # Expo / React Native App (Phase 5 - @everpride/mobile)
├── packages/
│   ├── database/              # Prisma schema & PostgreSQL client (@everpride/database)
│   ├── shared/                # Zod schemas, LGBTQ+ enums, DTO types (@everpride/shared)
│   ├── auth/                  # JWT TokenService, Bcrypt PasswordService (@everpride/auth)
│   └── typescript-config/     # Base tsconfig presets (@everpride/typescript-config)
├── docs/
│   ├── ARCHITECTURE.md        # Deep architectural design, security model & ERD
│   └── CONTEXT_HANDOFF.md     # Engineering knowledge transfer & current system state
├── docker-compose.yml         # Local PostgreSQL container configuration
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v20+` or `v24+`
- **pnpm**: `v9+` (`npm i -g pnpm`)
- **Docker Desktop**: For running local PostgreSQL

### 1. Install Workspace Dependencies
```bash
pnpm install
```

### 2. Start PostgreSQL with Docker
```bash
docker compose up -d
```

### 3. Initialize & Seed Database Schema
```bash
# Push Prisma schema to create tables in PostgreSQL
pnpm db:push

# Generate Prisma Client
pnpm db:generate

# Seed test queer matrimonial profiles
pnpm --filter @everpride/database prisma db seed
```

### 4. Build All Packages & Apps
```bash
pnpm build
```

### 5. Launch Development Servers
```bash
pnpm dev
```

* **Web Portal:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:4001/api/v1](http://localhost:4001/api/v1)
* **Interactive Swagger Docs:** [http://localhost:4001/api/docs](http://localhost:4001/api/docs)
* **Real-Time WebSocket Gateway:** `ws://localhost:4001/chat`

---

## 👥 Seed Test Accounts

All seeded accounts share password: `Password@123`

| Name | Phone Number | Gender / Orientation | Highlights |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `+919876543210` (or `9876543210`) | `MAN` • `GAY` | Fully onboarded, active conversations, mutual matches, pending interests |
| **Priya Patel** | `+919876543211` | `WOMAN` • `LESBIAN` | Onboarded, received & sent interests |
| **Rohan Verma** | `+919876543212` | `MAN` • `GAY` | Mutual match with Aarav, chat conversations |
| **Ananya Iyer** | `+919876543213` | `WOMAN` • `BISEXUAL` | Active profile in Mumbai |
| **Vikram Malhotra** | `+919876543214` | `TRANS_MAN` • `QUEER` | Active profile in Delhi |

---

## 📚 Documentation & Subsystem Guides

- 🔄 **[Project Context & Handoff Guide](docs/CONTEXT_HANDOFF.md)**: Comprehensive knowledge transfer, state machines, and active system status.
- 🏛️ **[Detailed Architecture & Security Guide](docs/ARCHITECTURE.md)**: Deep dive into the data model, privacy state machine, token rotation, and WebSocket gateway.
- ⚙️ **[Backend API (`apps/api`)](apps/api/README.md)**: NestJS modules, Swagger documentation, WebSocket gateway, and REST endpoints.
- 💻 **[Web Portal (`apps/web`)](apps/web/README.md)**: React 18, Tailwind tokens, Connect messaging, profile edit sidebar, and Zustand stores.
- 🗄️ **[Database Package (`packages/database`)](packages/database/README.md)**: Prisma models, migration scripts, and relation definitions.
- 📦 **[Shared Package (`packages/shared`)](packages/shared/README.md)**: Zod schemas and TypeScript types shared across API, Web, and Mobile.
- 🔐 **[Auth Package (`packages/auth`)](packages/auth/README.md)**: Token and password services with Express middleware.

---

## 🛡️ License

Private and proprietary. Built with pride for the LGBTQ+ community.
