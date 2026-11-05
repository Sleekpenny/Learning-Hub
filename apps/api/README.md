# LearnHub API

Express 5 · TypeScript · Prisma · PostgreSQL (Neon) · Zod · Vitest

## Prerequisites
- Node.js 20+ (`node -v`)
- A free [Neon](https://neon.tech) Postgres project

## Setup

```bash
cd apps/api
cp .env.example .env        # then fill it in (see below)
npm install                 # also runs `prisma generate`
npm run db:migrate -- --name init   # creates the tables in Neon
npm run db:seed             # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                 # http://localhost:4000/api/health
```

### Environment variables

| Variable | What it is |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`) |
| `DIRECT_URL` | Neon **direct** connection string; Prisma uses it for migrations |
| `JWT_ACCESS_SECRET` | Random string, 32+ chars. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `ACCESS_TOKEN_TTL_MINUTES` | Default 15 |
| `REFRESH_TOKEN_TTL_DAYS` | Default 7 |
| `BCRYPT_ROUNDS` | Default 12 |
| `CLIENT_ORIGIN` | URL of the Next.js app (CORS) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Used only by the seed script |

The app validates these at startup and prints exactly what is missing.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with auto-reload |
| `npm test` | Runs the test suite (no database needed) |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Create/update the admin user |
| `npm run db:studio` | Browse your data in a web UI |

## Tests

```bash
npm test
```
Tests use an in-memory repository, so they run in about a second without Postgres. They cover signup, login, validation, cookies, token rotation and reuse detection, logout, `authenticate` and role-based authorization.

## Deploying to Vercel

1. Push the repo to GitHub.
2. In Vercel: **Add New Project** → import the repo → set **Root Directory** to `apps/api`.
3. Add the environment variables above (use production values; set `CLIENT_ORIGIN` to your web URL).
4. Run migrations against the production database from your machine:
   `DIRECT_URL="…" DATABASE_URL="…" npm run db:deploy`, then `npm run db:seed`.
5. Deploy. Check `https://<your-api>.vercel.app/api/health`.

`vercel.json` routes every request to the Express app in `api/index.ts`.

## Documentation
- [`docs/API.md`](docs/API.md): endpoint reference with examples
- [`docs/AUTH.md`](docs/AUTH.md): how authentication and authorization work, and why
