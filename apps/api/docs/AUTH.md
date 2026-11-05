# Authentication & Authorization: how it works

This document explains the design so you can defend it in a review.

## The big picture

| Concept | Meaning | Where it lives |
| --- | --- | --- |
| **Authentication** | Proving who you are (email + password) | `AuthService.login / signup`, `authenticate` middleware |
| **Authorization** | What you are allowed to do (learner vs admin) | `requireRole` middleware |
| **Session** | Staying logged in between requests | Two cookies: access token + refresh token |

## The two-token design

| | Access token | Refresh token |
| --- | --- | --- |
| Format | JWT (signed, HS256) | 48 random bytes (opaque string) |
| Lifetime | 15 minutes | 7 days |
| Contains | user id + role | nothing, it is just a lookup key |
| Cookie path | `/` (sent on every API call) | `/api/auth` (sent only to auth routes) |
| Stored in DB | No (stateless) | Yes, **hashed** (SHA-256) |
| Purpose | Prove identity on each request | Get a new access token without logging in again |

**Why two tokens?** If a 15-minute token is stolen, the damage window is small. The long-lived token is only ever sent to `/api/auth/*`, so it is exposed far less, and because it lives in the database we can revoke it (logout, stolen-token detection).

## Request flow

```
SIGNUP / LOGIN
  browser ── POST /api/auth/login {email, password} ──▶ API
          ◀── 200 + Set-Cookie: access_token, refresh_token ──

NORMAL REQUEST
  browser ── GET /api/courses  (cookie sent automatically) ──▶ authenticate ▶ requireRole ▶ handler

ACCESS TOKEN EXPIRED (after 15 min)
  browser ── GET /api/courses ──▶ 401 { code: "TOKEN_EXPIRED" }
  browser ── POST /api/auth/refresh (refresh cookie) ──▶ 200 + NEW access + NEW refresh token
  browser ── retries GET /api/courses ──▶ 200

REFRESH TOKEN EXPIRED / REVOKED
  browser ── POST /api/auth/refresh ──▶ 401 { code: "SESSION_EXPIRED" }  → redirect to /login
```

## Security decisions (and why)

1. **Passwords are hashed with bcrypt** (cost 12). A database leak does not reveal passwords. Passwords are limited to 72 characters because bcrypt ignores everything after 72 bytes.
2. **Tokens live in `httpOnly` cookies**, not `localStorage`. JavaScript on the page cannot read them, so an XSS bug cannot steal the session. Cookies are `Secure` in production and `SameSite=Lax`, which blocks classic cross-site request forgery.
3. **Refresh-token rotation.** Each refresh token works exactly once. Using it returns a new one and revokes the old one.
4. **Reuse detection.** If a *revoked* refresh token is presented again, someone copied it. The entire token family is revoked and the real user must log in again. (Tested in `auth.test.ts`.)
5. **Refresh tokens are stored hashed.** A leaked database table cannot be turned into working cookies.
6. **No account enumeration.** Wrong password and unknown email return the identical 401, and the unknown-email path still performs a bcrypt comparison so response time does not give it away.
7. **Roles cannot be self-assigned.** The signup schema ignores any `role` field; public signup always creates a `LEARNER`. Admins are created with `npm run db:seed`.
8. **Role is checked on the server for every protected route** (`requireRole('ADMIN')`). Hiding an admin button in the UI is only cosmetics.
9. **Validation at the edge.** Zod validates every body before the controller runs; unknown fields are stripped.
10. **Rate limiting** on signup and login (20 attempts / 15 min / IP), plus `helmet` security headers and a 100 KB body limit.

## Why the browser and API share an origin

Next.js proxies `/api/*` to this service (see the root README). To the browser it is one site, so:
- cookies are first-party and `SameSite=Lax` works,
- no cross-origin cookie configuration is needed,
- CORS is only a safety net.

## Trade-offs and known limitations (mention these, they show maturity)

- **Access tokens cannot be revoked early.** A stolen access token works until it expires (max 15 min). That is the price of stateless JWTs; the short lifetime is the mitigation.
- **Concurrent refreshes.** Two tabs refreshing at the exact same moment can trip reuse detection and log the user out. The frontend should funnel refreshes through one in-flight request (we will do this in the Next.js API client).
- **Rate limiter is in-memory.** On serverless each instance has its own counter, so the limit is approximate. A production system would use Redis (e.g. Upstash).
- **No email verification or password reset yet.** Out of scope for the assessment; listed as a next step.
- **CSRF** is mitigated by `SameSite=Lax` + JSON-only bodies. A production system might add a CSRF token for extra defence.

## Where each piece lives

```
src/modules/auth/
  auth.schemas.ts           Zod rules for signup/login input
  auth.routes.ts            URL → middleware → controller wiring
  auth.controller.ts        HTTP in/out only (thin)
  auth.service.ts           ALL business rules (hashing, rotation, reuse detection)
  auth.repository.ts        Interface: what the service needs from storage
  auth.prisma-repository.ts Real implementation (Postgres via Prisma)
  auth.cookies.ts           Cookie names and options
src/middleware/
  authenticate.ts           Verifies the access token, sets req.user
  require-role.ts           Role-based authorization
  validate.ts               Zod validation middleware
  error-handler.ts          One consistent error format
src/lib/
  tokens.ts  password.ts  errors.ts  prisma.ts
```

Flow of one request: **route → validate → controller → service → repository → database**.
