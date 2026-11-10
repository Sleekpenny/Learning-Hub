# LearnHub web

The Next.js app for LearnHub: home page, sign up and login, course catalogue, course page, lesson player, learner dashboard and the admin area. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, react-hook-form.

## Run it

This app needs the API running. From the **repo root**, follow the setup in the root `README.md`, then:

```bash
npm run dev          # web on http://localhost:3000, API on http://localhost:4000
```

To run only the web app: copy `.env.example` to `.env.local` and run `npm run dev` here.

| Variable | Meaning |
|---|---|
| `API_URL` | Address of the Express API. Local: `http://localhost:4000`. On Vercel: the API project's URL, without a trailing slash. It is read **at build time**. |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (also type checks) |
| `npm run start` | Serves the production build |
| `npm run lint` | Lints the code |

## Structure

```
src/
├── app/          pages, in route groups: public, login and signup, learner area, admin area
├── components/   reusable parts, grouped by feature (home, auth, courses, lessons, admin, layout, ui)
├── actions/      every API call, as a function that returns { success, data } or { success: false, message }
└── lib/          api request function (cookies, refresh and retry), queries, types, helpers
```

Every `/api/*` request is forwarded to the API by a rewrite in `next.config.ts`, so the browser only talks to this site. See `ARCHITECTURE.md` at the repo root for the full picture.