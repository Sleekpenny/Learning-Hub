# LearnHub architecture

LearnHub is two apps in one repository: a **Next.js web app** (`apps/web`) and an **Express API** (`apps/api`) backed by **PostgreSQL on Neon**. Each is deployed as its own Vercel project.

```
Browser ──► Next.js (apps/web) ──/api/* rewrite──► Express API (apps/api) ──Prisma──► Neon Postgres
```

## 1. One origin for the browser

The browser only ever talks to the Next.js site. A rewrite in `apps/web/next.config.ts` forwards every `/api/*` request to the Express API. This gives three benefits:

- The auth cookies belong to the web site's own domain, so they are first-party and need no cross-site cookie settings.
- No CORS setup is needed.
- The API's address is a single setting, `API_URL`, read at build time.

## 2. Backend (`apps/api`)

**Layers.** Each module (auth, courses, lessons, enrollments, progress, admin) follows `route → validation → logic → Prisma`. Zod schemas validate every body and query at the edge, and one error handler returns a single error format (`{ error: { code, message, details } }`). The complete endpoint list with examples is in `apps/api/docs/API.md`.

**Data model** (Prisma, `prisma/schema.prisma`):

| Model | Purpose |
|---|---|
| `User` | A learner or an admin (`role`). Password stored as a bcrypt hash. |
| `RefreshToken` | One row per session, so a refresh token can be rotated and revoked. |
| `Course` | Title, category, description, thumbnail, `published` flag (a new course is a draft). |
| `Lesson` | Belongs to a course, has a `position`, a video link and a duration. |
| `Enrollment` | Unique per (user, course). The database prevents double enrollment. |
| `LessonProgress` | Unique per (user, lesson): the saved video position and `completed`. |

Deleting a course removes its lessons, enrollments and progress (cascade).

**Authentication** (details in `apps/api/docs/AUTH.md`):

- Login sets two httpOnly cookies: a **15-minute access token** (JWT) and a **7-day refresh token** (random, stored hashed). Neither can be read by JavaScript.
- Refresh **rotates** the token on every use. If an old token is used again, the whole session is revoked (reuse detection).
- Passwords: bcrypt, with a strength rule and a rate limit on login and signup.

**Authorization in three layers**, so an admin area cannot be reached by accident:

1. The **API** checks the role on every admin route and on every course and lesson write (`403` for a learner). The login endpoint also checks the portal: an admin account cannot sign in on the learner form and the reverse.
2. The login **action** on the web side double-checks the returned role.
3. The admin **pages** sit behind a guard that sends anyone who is not an admin to their dashboard.

**Learning rules** live on the server: a lesson can only be opened by an enrolled learner, the video link is never sent to anyone else, a completed lesson stays completed, and the enrollment is marked complete when every lesson is.

## 3. Frontend (`apps/web`)

- **Next.js App Router**, with route groups that separate the public pages, the login and signup pages, the learner area and the admin area, each with its own layout.
- **API calls go through "actions"** (`src/actions`). Each action wraps one request in `try/catch` and returns either `{ success: true, data }` or `{ success: false, message, ... }`, so the UI never has to catch exceptions.
- **One request function** (`src/lib/api.ts`) acts as the interceptor: it sends the cookies, adds the portal header on admin login, and on a `401` it refreshes the session once and retries the original request. A short guard stops two refreshes from running at the same time.
- **Reads use TanStack Query** (catalogue, course, dashboard, admin lists). Writes are plain actions followed by a targeted refresh of the affected queries, so there is no mutation boilerplate.
- **UI**: shadcn components, Tailwind with the project's colour tokens, every part in its own reusable component. Forms use react-hook-form, and toasts use sonner.
- **The video player** saves the position every few seconds and when the video ends, and starts from the saved position, which gives resume.
- **The admin** is two pages, Overview and Courses. Create, edit, delete and lessons are modals driven by one piece of state in the courses page, so only one modal is open at a time. The table rows are plain components that report clicks.

## 4. Testing

- **API:** 136 automated tests (Vitest and Supertest) run against the real Express app with an in-memory repository, so they need no database and finish in seconds.
- **Web:** type check, lint and a production build. Browser flows (catalogue, enrollment, lesson resume, navbar, admin modals, mobile width) were run with Playwright against a mock API.

## 5. Deployment

Two Vercel projects from one repository (root directories `apps/api` and `apps/web`). The API's entry point is `apps/api/index.ts`, which default-exports the Express app. The web project's `API_URL` points at the deployed API. Migrations and the seed are run once against Neon.

## 6. Decisions and trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| Cookies, not tokens in localStorage | Not readable by scripts, so safer against XSS | Needs the same-origin proxy |
| Short access token plus rotating refresh token | A stolen access token expires quickly; reuse of a refresh token is detected | One more request when the access token expires |
| Server-side video link protection | Only enrolled learners receive a lesson's video URL | Links are still shareable once received |
| Actions instead of mutations everywhere | Simple, readable code | Cache updates are done by hand where needed |
| Admin as two pages with modals | Concise, everything in context | Lessons keep their creation order (the API supports reordering, the UI does not yet) |

**Known limitations:** the sign-in rate limit is counted in memory per server instance, and the sample lessons use short public test videos.