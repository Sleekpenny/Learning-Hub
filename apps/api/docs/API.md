# API Reference (v0.1: authentication)

Base URL: `http://localhost:4000` (local) · all routes are prefixed with `/api`.

## Conventions

**Success**: `{ "data": ... }`

**Error**: always this shape
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid", "details": [{ "field": "email", "message": "Enter a valid email address" }] } }
```

**Auth**: send requests with credentials (`fetch(url, { credentials: "include" })`). The API sets and reads `access_token` / `refresh_token` cookies itself. For Postman/curl you can instead send `Authorization: Bearer <access_token>`.

| HTTP | Error code | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body failed validation; see `details` |
| 400 | `INVALID_JSON` | Body is not valid JSON |
| 401 | `UNAUTHENTICATED` | No token |
| 401 | `TOKEN_EXPIRED` | Access token expired: call `/auth/refresh`, then retry |
| 401 | `INVALID_TOKEN` | Token is malformed or forged |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `SESSION_EXPIRED` | Refresh failed: send the user to login |
| 403 | `FORBIDDEN` | Logged in, but your role is not allowed |
| 404 | `NOT_FOUND` | Unknown route or resource |
| 409 | `EMAIL_TAKEN` | An account with this email already exists |
| 429 | `RATE_LIMITED` | Too many attempts |
| 500 | `INTERNAL_ERROR` | Server bug (details are logged, not returned) |

---

## `GET /api/health`
Liveness check. → `200 { "data": { "status": "ok", "time": "..." } }`

## `POST /api/auth/signup`
Creates a **learner** account and logs the user in.

Body
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "Sup3rSecret", "country": "Nigeria", "areaOfInterest": "Web Development" }
```
Rules: name 2–80 chars · valid email (trimmed, lowercased) · password 8–72 chars with a lowercase letter, an uppercase letter and a number. Any extra field (e.g. `role`) is ignored.

`201`
```json
{ "data": { "user": { "id": "…", "email": "ada@example.com", "name": "Ada Lovelace", "role": "LEARNER", "createdAt": "…" } } }
```
Sets cookies `access_token` and `refresh_token`. Errors: `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`, `429`.

## `POST /api/auth/login`
Body `{ "email": "...", "password": "..." }` → `200` same shape as signup, cookies set.

Header `X-Login-Portal: learner | admin` says which login form was used. No header means `learner`.
The role has to match, and it is checked only after the password is correct:

| Form used | Account is | Result |
|---|---|---|
| `admin` | ADMIN | `200`, session created |
| `admin` | LEARNER | `403 NOT_ADMIN`, no cookies |
| `learner` / none | LEARNER | `200`, session created |
| `learner` / none | ADMIN | `403 USE_ADMIN_LOGIN`, no cookies |

Errors: `400` (bad body or unknown header value), `401 INVALID_CREDENTIALS`, `403 NOT_ADMIN`, `403 USE_ADMIN_LOGIN`, `429`.

## `POST /api/auth/refresh`
No body. Uses the `refresh_token` cookie. Rotates it and issues a fresh pair.
`200 { "data": { "user": {…} } }` · Errors: `401 SESSION_EXPIRED` (cookies are cleared).

## `POST /api/auth/logout`
No body. Revokes the session on the server and clears cookies. Always `204`.

## `GET /api/auth/me`  🔒
Returns the logged-in user. `200 { "data": { "user": {…} } }` · Errors: `401`.

---

## Try it with curl

```bash
# sign up (-c saves cookies to a file, -b sends them back)
curl -i -c jar.txt -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"Sup3rSecret","country":"Nigeria","areaOfInterest":"Web Development"}'

# admin login (note the header)
curl -i -c admin.txt -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" -H "X-Login-Portal: admin" \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}'

# who am I?
curl -b jar.txt http://localhost:4000/api/auth/me

# rotate the session
curl -b jar.txt -c jar.txt -X POST http://localhost:4000/api/auth/refresh

# log out
curl -b jar.txt -c jar.txt -X POST http://localhost:4000/api/auth/logout
```

> Coming next: courses, lessons, enrollment, progress, dashboards, admin endpoints. This file grows with each module.