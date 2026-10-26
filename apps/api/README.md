# @everpride/api

Backend REST & WebSocket API for the EverPride Matrimonial Platform, engineered with **NestJS 11** on top of **Express** and **Socket.IO**.

---

## 🏛️ Features & Modular Architecture

The API uses NestJS's modular architecture:

```
src/
├── common/
│   ├── decorators/            # @CurrentUser decorator (extracts userId & role from JWT)
│   ├── filters/               # AllExceptionsFilter (clean 503 on database drop)
│   ├── guards/                # AuthGuard verifying JWT via @everpride/auth
│   └── pipes/                 # ZodValidationPipe running @everpride/shared schemas
├── modules/
│   ├── prisma/                # Global PrismaService lifecycle connection
│   ├── auth/                  # Register, Login, Refresh JWT, phone normalization
│   ├── profiles/              # Profile onboarding, demographics, lifestyle, partner preferences, and privacy controls
│   ├── matches/               # Discovery feed filtering, mutual interest requests, auto-matching, and photo unblur workflows
│   └── chat/                  # WebSocket gateway (/chat namespace), real-time presence, conversations & instant messaging
├── app.module.ts
└── main.ts                    # Bootstrap with global prefix (/api/v1), CORS & Swagger UI
```

---

## 🔑 REST Endpoints Overview

### Authentication & Profiles
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | No | Creates a user account with phone/email and password |
| `POST` | `/api/v1/auth/login` | No | Authenticates and returns access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | No | Rotates tokens using valid refresh JWT |
| `GET` | `/api/v1/profiles/me` | Bearer JWT | Returns current authenticated user's profile |
| `POST` | `/api/v1/profiles` | Bearer JWT | Creates the user's initial onboarding profile |
| `PATCH`| `/api/v1/profiles/me` | Bearer JWT | Updates demographic, identity, career, and lifestyle details |
| `PATCH`| `/api/v1/profiles/me/privacy`| Bearer JWT | Toggles photo visibility and ghost mode |

### Matchmaking & Interests
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/matches/feed` | Bearer JWT | Returns discover feed (excludes blocked, sent interests, and existing matches) |
| `POST` | `/api/v1/matches/interest` | Bearer JWT | Sends interest; automatically matches if reciprocal interest already exists |
| `GET` | `/api/v1/matches/interests/received` | Bearer JWT | Lists all received interests with full sender profiles |
| `GET` | `/api/v1/matches/interests/sent` | Bearer JWT | Lists all sent interests with recipient profiles and statuses |
| `POST` | `/api/v1/matches/interest/:id/respond`| Bearer JWT | Accepts or declines incoming interest; creates mutual conversation on acceptance |
| `GET` | `/api/v1/matches/accepted` | Bearer JWT | Deduplicated list of mutual matches accepted in either direction |
| `POST` | `/api/v1/matches/photo-access` | Bearer JWT | Requests unblur permission for member photos |
| `GET` | `/api/v1/matches/photo-access/received` | Bearer JWT | Lists received photo access requests |
| `GET` | `/api/v1/matches/photo-access/sent` | Bearer JWT | Lists sent photo access requests |
| `POST` | `/api/v1/matches/photo-access/:id/respond`| Bearer JWT | Approves or declines photo unblur access |

### Connect & Real-Time Chat
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/chat/conversations` | Bearer JWT | Lists all conversations with partner info, unread counts, and last message |
| `POST`| `/api/v1/chat/conversations/with/:id`| Bearer JWT | Gets or initializes a conversation with a matched partner |
| `GET` | `/api/v1/chat/conversations/:id/messages`| Bearer JWT | Paginated message history for a conversation |
| `POST`| `/api/v1/chat/messages` | Bearer JWT | REST fallback to send a message |
| `POST`| `/api/v1/chat/conversations/:id/read` | Bearer JWT | Marks conversation messages as read |
| `GET` | `/api/v1/chat/online-matches` | Bearer JWT | Returns deduplicated list of accepted matches currently online |

---

## ⚡ WebSocket Gateway (`/chat`)

Real-time bidirectional gateway handling instant messaging, presence, and event notifications.

* **Namespace:** `/chat`
* **Handshake Authentication:** Bearer JWT in `auth.token` or `headers.authorization`.
* **Client to Server Events:**
  * `join_conversation`: Joins a conversation room (`conversation:{id}`).
  * `leave_conversation`: Leaves a conversation room.
  * `send_message`: Dispatches message `{ conversationId, content }`.
  * `typing`: Emits live typing status `{ conversationId, isTyping }`.
  * `mark_read`: Marks messages as read and notifies the counterpart.
* **Server to Client Broadcasts:**
  * `new_message`: Delivered to all sockets in `conversation:{id}`.
  * `incoming_message_notification`: Delivered to recipient's personal room `user:{id}` for toasts and badges.
  * `presence_update`: Broadcasts `{ userId, isOnline, lastSeenAt }`.
  * `new_interest`: Sent when an interest is submitted to a member.
  * `interest_accepted`: Sent when a recipient accepts an interest.
  * `new_match`: Dispatched to **both** members upon mutual acceptance or reciprocal auto-match.

---

## 🧪 Interactive API Documentation (Swagger)

Start the server and visit:
```
http://localhost:4001/api/docs
```

---

## 🛠️ Development Scripts

```bash
# Start with hot reload
pnpm dev

# Build production bundle
pnpm build

# Clean build artifacts
pnpm clean
```
