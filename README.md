# LearnHub: online learning platform

Full-stack assessment project: a course platform with video lessons, progress tracking, and learner and admin dashboards.

## Structure

```
learnhub/
├── apps/
│   ├── api/   Express + TypeScript + Prisma + Postgres  (REST API)
│   └── web/   Next.js + TypeScript + Tailwind           (UI)
├── learnhub.code-workspace   open this in VS Code
├── package.json              root scripts that run both apps
└── README.md
```

Each app is its own Vercel project (set the **Root Directory** to `apps/api` or `apps/web`).

## Quick start

```bash
npm run setup                      # installs root, api and web dependencies

# API: see apps/api/README.md for the Neon database steps
cp apps/api/.env.example apps/api/.env      # fill it in
cp apps/web/.env.example apps/web/.env.local

npm run dev                        # api on :4000, web on :3000
```

Open `learnhub.code-workspace` in VS Code (File → Open Workspace from File) to get both apps as separate folders and the recommended extensions.

| Command (from the repo root) | Does |
| --- | --- |
| `npm run dev` | Starts API and web together |
| `npm run dev:api` / `npm run dev:web` | Starts one of them |
| `npm test` | API test suite (no database needed) |
| `npm run typecheck` | Typechecks API and web |
| `npm run build:web` | Production build of the web app |

## Architecture in one paragraph

The browser talks only to the Next.js site. Next.js rewrites `/api/*` to the Express API (`apps/web/next.config.ts`), so the browser sees a single origin and httpOnly auth cookies just work. The API is layered as routes → controllers → services → repositories → Prisma, with Zod validation at the edge and a single error format. Data lives in Neon Postgres.

## Status

| Area | Status |
| --- | --- |
| API foundation, error handling, validation | ✅ |
| Database schema (users, courses, lessons, enrollments, progress) | ✅ |
| Authentication, token rotation, role guards | ✅ |
| Next.js app scaffolded, API proxy wired | ✅ |
| Courses & lessons CRUD (admin) | ⏳ Day 2 |
| Enrollment, video progress, dashboards | ⏳ Day 3 |
| Next.js UI | ⏳ Days 4–6 |
| Deploy, final docs | ⏳ Day 7 |

Details: [`apps/api/README.md`](apps/api/README.md) · [`apps/api/docs/AUTH.md`](apps/api/docs/AUTH.md)
