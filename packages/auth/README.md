# @everpride/auth

Authentication utilities, password hashing, and JWT token management for EverPride.

---

## 🔐 Core Services

### 1. `PasswordService`
Secures passwords using `bcrypt` with a work factor of 12 salt rounds:
```ts
const passwordService = new PasswordService();
const hash = await passwordService.hash("RawPassword123!");
const isValid = await passwordService.compare("RawPassword123!", hash);
```

### 2. `TokenService`
Generates and verifies cryptographic Access and Refresh JWTs:
```ts
const tokenService = new TokenService(accessSecret, "15m", refreshSecret, "7d");
const accessToken = tokenService.signAccessToken({ userId, email, role });
const payload = tokenService.verifyAccessToken(accessToken);
```

### 3. `createAuthMiddleware`
Express-compatible middleware extracting bearer tokens and verifying active sessions.

---

## 🛠️ Build Scripts

```bash
# Compile TypeScript into dist/
pnpm build

# Clean build artifacts
pnpm clean
```
