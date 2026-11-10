LearnHub: online learning platform

LearnHub is a course platform where learners sign up, browse a catalogue of courses, enroll, and watch video lessons. It saves their progress and lets them resume where they stopped. Admins manage the catalogue from a separate, locked area.

Live demo: https://learning-hub-zegj.vercel.app · API: https://learning-hub-79bs.vercel.app · API docs: https://learning-hub-79bs.vercel.app/api/docs



What it does
Learners. Anyone can browse and search the catalogue (by title or category) and open a course page. To enroll and watch lessons, a visitor must register as a learner: name, email, password, country and area of interest. After login the learner sees a dashboard with their courses and progress, and a Continue button that goes straight to the next lesson. The video player remembers the position, so closing the tab and coming back resumes where they stopped. A lesson is marked complete when it has been watched.
Admins. The login page has a Learner / Admin switch. The admin area has two pages. Overview shows totals, recent enrollments, popular courses and the learners. Courses lists every course (drafts included) as rows. Create, edit, delete and lesson management all happen in modals. A learner who opens /admin is sent back to their dashboard, and the API rejects admin requests from non-admin accounts.
Auth. Passwords are hashed with bcrypt. Login sets two httpOnly cookies: a 15-minute access token and a rotating 7-day refresh token. The web app renews the session silently when the access token expires.
Tech stack
Part	Tech
Web (apps/web)	Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, react-hook-form, sonner
API (apps/api)	Node.js, Express 5, TypeScript, Zod validation, Prisma 6
Database	PostgreSQL (Neon)
Hosting	Vercel (two projects: web and API)

The browser only talks to the Next.js site. Next.js forwards every /api/* request to the Express API (see apps/web/next.config.ts), so the auth cookies are first-party and no CORS setup is needed. The API is layered as routes, controllers, services, repositories, then Prisma.

Run it on your machine
1. Install these first
Tool	Version	Check with
Node.js	20.9 or newer (includes npm)	node -v
Git	any recent version	git --version
A PostgreSQL database	a free Neon project is the easiest	n/a

No Docker is needed.

2. Get the code and install
bash
git clone https://github.com/Sleekpenny/Learning-Hub
cd <repo-folder>
npm run setup          # installs the root, API and web dependencies
3. Create the database (Neon)
Create a free project on neon.tech.
Open Connect and copy two connection strings: the pooled one (the host contains -pooler) and the direct one (turn pooling off).
4. Add the environment files

API. Copy apps/api/.env.example to apps/api/.env (on Windows: copy apps\api\.env.example apps\api\.env) and fill it in:

Variable	What to put
DATABASE_URL	the pooled Neon string
DIRECT_URL	the direct Neon string
JWT_ACCESS_SECRET	a long random string. Generate one with node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
CLIENT_ORIGIN	http://localhost:3000
ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME	the admin account that the seed creates

The other values in the file (token lifetimes, BCRYPT_ROUNDS, PORT=4000) can stay as they are.

Web. Copy apps/web/.env.example to apps/web/.env.local. It contains API_URL=http://localhost:4000, which is correct for local use.

5. Create the tables and the starting data
bash
npm --prefix apps/api run db:deploy     # creates the tables
npm --prefix apps/api run db:seed       # creates the admin account and 15 sample courses

The seed is safe to run again. It adds missing sample courses and leaves your changes alone.

6. Start the app
bash
npm run dev

The web app runs on http://localhost:3000 and the API on http://localhost:4000. Interactive API docs are at http://localhost:4000/api/docs.

7. Try it
Open http://localhost:3000 and click Create free account. Register as a learner.
Open a course, click Enroll, then start a lesson. Leave halfway and come back to see it resume.
Log out. On the login page, switch to the Admin tab and sign in with the ADMIN_EMAIL and ADMIN_PASSWORD from your .env.
In Courses, create, edit and delete a course, and open Lessons on a row to add a lesson.
Tests and checks
bash
npm test               # API test suite (no database needed)
npm run typecheck      # TypeScript check for API and web
npm run lint           # lint the web app
npm run build:web      # production build of the web app

The API suite has 136 tests covering signup, login, validation, cookies, token rotation and reuse detection, logout, the authentication middleware, role-based access, courses, lessons, enrollment, progress and the admin endpoints. Result: Test Files 9 passed (9), Tests 136 passed (136). The tests use in-memory repositories, so they run in seconds without Postgres.

Project layout
apps/
├── api/   Express API: src/ (routes, controllers, services, repositories), prisma/ (schema, migrations, seed), docs/
└── web/   Next.js app: src/app (pages), src/components, src/actions (API calls), src/lib

More detail: apps/api/docs/SETUP.md (step-by-step API setup) · apps/api/docs/API.md (endpoint reference) · apps/api/docs/AUTH.md (how authentication works).

Deploying

Each app is its own Vercel project (root directory apps/api and apps/web). Deploy the API first, then set API_URL on the web project to the API's address (without a trailing slash) before its first build, because it is read at build time. Run db:deploy and db:seed once against the production database.

Known limitations
Lessons keep the order they were added in. The API supports reordering, but there is no reorder control in the admin yet.
The sample lessons use short public test videos, so lessons are quick to complete.
The sign-in rate limit (20 attempts per 15 minutes) is counted in memory per server instance.