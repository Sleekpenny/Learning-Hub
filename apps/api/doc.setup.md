# Backend setup: step by step (no prior backend knowledge needed)

You will run everything **on your own computer**. No hosting is needed to read the docs, call the endpoints or view the database. Hosting on Vercel is only for the final submission (Day 7).

## Words you will see

| Word | Plain meaning |
| --- | --- |
| **API / backend** | A program that waits for requests from the website ("create this user", "list courses") and answers with data. Yours is in `apps/api`. |
| **Endpoint** | One URL the API answers, like `POST /api/auth/login`. |
| **Database** | Where data is stored permanently. Ours is **PostgreSQL** ("Postgres"). |
| **Neon** | A free website that hosts a Postgres database for you, so you install nothing. |
| **Prisma** | The tool our code uses to talk to the database, and to create its tables. |
| **Migration** | A saved instruction that creates or changes tables ("make a users table"). |
| **Seed** | A script that inserts starter data. Ours creates the first admin account. |
| **.env file** | A private text file with settings and passwords. It never goes to GitHub. |

## What you need installed
Only **Node.js 20 or newer** and **VS Code**. Check Node: open a terminal and run `node -v`. If it is older than v20 or not found, install the LTS version from nodejs.org.
You do **not** need to install Postgres or any database tool.

---

## Step 1: Create the database (Neon)

1. Go to **neon.tech** and sign up (GitHub or Google login is fine). It is free.
2. Click **Create project**. Name it `learnhub`. Pick the region closest to you (Europe is closest to Nigeria). Keep the defaults and create it.
3. You land on the project dashboard. Click the **Connect** button.

## Step 2: Copy the two connection strings

In the Connect window you will see a **Connection pooling** toggle and a long text starting with `postgresql://`. You need it twice:

- **Toggle ON** → click **Copy snippet** or copy the URL. This is your `DATABASE_URL`. The host contains `-pooler`.
- **Toggle OFF** → copy again. This is your `DIRECT_URL`. No `-pooler` in the host.

Paste both somewhere temporary (Notepad). Treat them like passwords.

## Step 3: Create your `.env` file

In the VS Code terminal, from the repo root:

```bash
cd apps/api
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

Open `apps/api/.env` and fill in:

```
DATABASE_URL="<paste the pooled string from step 2>"
DIRECT_URL="<paste the direct string from step 2>"
```

Keep the quotes. Leave the rest for now except the next step.

## Step 4: Make a secret for login tokens

Run this and copy its output:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

In `.env`, replace the placeholder: `JWT_ACCESS_SECRET="<paste here>"`.
Also choose your admin login in the same file: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`. This is how **you** will log in as an administrator later.

## Step 5: Install and create the tables

```bash
npm install                          # installs packages and prepares Prisma
npm run db:migrate -- --name init    # creates all tables in Neon
npm run db:seed                      # creates your admin account
```

If `db:migrate` asks for confirmation, accept. When it finishes it prints "Your database is now in sync with your schema".

## Step 6: Check that everything is correct

```bash
npm run check
```

It prints ✅ or ❌ for each part and tells you exactly how to fix any ❌. Repeat until you see **"Everything looks good"**.

## Step 7: Run the tests (they do not use your database)

```bash
npm test
```
Expect `Tests 38 passed`.

## Step 8: Start the API

```bash
npm run dev
```
Leave this terminal running. You should see: `LearnHub API listening on http://localhost:4000`.
Open http://localhost:4000/api/health in your browser. You should see `{"data":{"status":"ok",...}}`.

## Step 9: Read and try the endpoints in your browser

Open **http://localhost:4000/api/docs**.

This page lists every endpoint. Click one, click **Try it out**, edit the example, click **Execute**, and read the response below.

A good first tour:
1. `POST /api/auth/signup`: Try it out → Execute. You get `201` and a user back.
2. `GET /api/auth/me`: Execute. It returns you, because the browser kept your login cookie.
3. `POST /api/auth/login` with the admin email and password from your `.env`. The response shows `"role": "ADMIN"`.
4. `POST /api/auth/logout`, then `GET /api/auth/me` again. It now returns `401`, which is correct.

The raw machine-readable spec is at `/api/openapi.json` (you can import it into Postman).

## Step 10: See the data in your database

No SDK or extra install is needed. Two options:

**Option A: Prisma Studio** (in your own browser)
```bash
npm run db:studio
```
Opens http://localhost:5555. Click a table (`User`, `Course`, ...) to see, search, edit and delete rows. The user you created in Step 9 should be in `User`. The `passwordHash` column is scrambled text, which is correct: real passwords are never stored.

**Option B: Neon's website**
Neon dashboard → your project → **Tables** (browse rows) or **SQL Editor** (run `SELECT * FROM "User";`).

---

## When something goes wrong

| What you see | What it means | Fix |
| --- | --- | --- |
| `Invalid environment configuration: ...` | A `.env` value is missing or invalid | Open `apps/api/.env`, fix the named line |
| `Can't reach database server` | Wrong `DATABASE_URL` or no internet | Re-copy it from Neon (Connect button) |
| `password authentication failed` | Wrong password inside the URL | Re-copy from Neon. In Neon you can reset the password |
| `Tables are missing` in `npm run check` | Migration not run | `npm run db:migrate -- --name init` |
| `EADDRINUSE: address already in use :::4000` | Another copy of the API is running | Close the other terminal, or change `PORT` in `.env` |
| `Cannot find module '.prisma/client'` | Prisma client not generated | `npx prisma generate` |
| Docs page loads but looks blank | No internet to the docs CDN | Check your connection; the API itself is fine |
| `429 RATE_LIMITED` | Too many login attempts | Wait 15 minutes, or restart `npm run dev` |

If an error is not in this table, copy the **full** terminal output and send it to me.

## Daily routine

```bash
cd apps/api && npm run dev       # start the API
npm run db:studio                # (optional) look at the data
```
Stop a running program with `Ctrl + C`.