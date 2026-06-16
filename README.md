# Orange Blossom Special Lawncare — Operations Platform

A full-stack field-service operations console for a lawn-care business: customers & properties, jobs & scheduling, crews & members, weather, reports, communications, and settings — with real authentication and a local PostgreSQL database.

> Built from an AI-generated UI prototype into a working full-stack app. See `_audit/` history and `_build/TICKETS.md` for what was done. Original engineering audit: `orange-blossom-AUDIT-REPORT.md`.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vite 6 · React 18 · TypeScript (strict) · Tailwind 3 (dark mode: class) · TanStack Query 5 · Zustand 5 · React Router 6 · Recharts · Framer Motion |
| Backend | Express 4 · Prisma 6 · **local PostgreSQL** · JWT (jsonwebtoken) · bcryptjs · zod |
| Tests | Vitest + Testing Library (82 tests) |

Single repo, single `package.json`. Frontend in `src/`, backend in `server/`, schema/seed in `prisma/`. The Vite dev server proxies `/api` → `http://localhost:4000`.

## Prerequisites

- Node 20+
- A local PostgreSQL instance running on `localhost:5432`

## Setup

```bash
# 1. Install
npm install --legacy-peer-deps

# 2. Create the database + role (one-time; adjust if your superuser differs)
sudo -u postgres psql -c "CREATE ROLE obs WITH LOGIN PASSWORD 'obs_local_dev' CREATEDB;"
sudo -u postgres createdb -O obs orange_blossom

# 3. Configure env (already provided as .env.example)
cp .env.example .env     # DATABASE_URL points at the db above; set a JWT_SECRET

# 4. Migrate + seed
npm run db:migrate       # applies prisma/migrations to local Postgres
npm run db:seed          # deterministic demo data (users, customers, crews, jobs, metrics)

# 5. Run (frontend :5173 + API :4000 together)
npm run dev
```

Open the printed URL and sign in.

### Demo logins (password `Password123!`)

| Email | Role |
|-------|------|
| `owner@orangeblossom.com` | OWNER |
| `admin@orangeblossom.com` | ADMIN |
| `crew@orangeblossom.com`  | CREW |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Run frontend + API concurrently |
| `npm run dev:web` | Frontend only (Vite) |
| `npm run server` | API only (tsx watch) |
| `npm run build` | Typecheck + production build (`tsc && vite build`) |
| `npm run typecheck` | Frontend typecheck |
| `npm run build:server` | Server typecheck |
| `npm test` / `npm run test:cov` | Run tests / with coverage |
| `npm run db:migrate` / `db:seed` / `db:reset` / `db:studio` | Prisma DB workflows |

## Architecture

- **Auth:** custom JWT. `POST /api/auth/register|login`, `GET /api/auth/me`; bcrypt password hashing; `requireAuth` + `requireRole` middleware. The whole console is behind `ProtectedRoute`; Settings is OWNER/ADMIN-only (client + server). Token stored in `localStorage`, attached as `Bearer`, cleared on 401.
- **Data:** every read/write goes through the Express API → Prisma → Postgres. Hooks in `src/hooks/` (`useCustomers`, `useJobs`, `useCrews`, `useWeather`, `useMetrics`, `useSettings`, `useNotifications`, `useActivities`). No mock fetchers in the app data path. Reports metrics are deterministic (seeded), stable across refreshes.
- **API routes** (`server/src/routes/`, all under `/api`, all auth-gated): `customers`, `jobs`, `crews` (+members), `reports`, `weather`, `notifications`, `activities`, `dashboard`, `settings`.
- **Schema** (`prisma/schema.prisma`): User/Role, Customer→Property→ServiceAgreement, Crew→Employee/Equipment, Job (denormalized), Notification, Activity, DailyMetric, WeatherSnapshot, Setting.
- **Theming:** Tailwind `darkMode: 'class'`; `ThemeContext` + `ThemeToggle` (persisted to `localStorage`, respects OS preference, no-flash bootstrap in `index.html`).

## Status

**Done & verified:** auth + users, local Postgres, all reads & writes persist (verified across reloads), build green, 82 tests, dark mode + mobile nav, deterministic reports.

**Out of scope (need external accounts/API keys — for the dev team to provision):**
SMS (Twilio), payments (Stripe), maps/geocoding (Mapbox), transactional email (Resend/Postmark), Google Calendar sync, error tracking (Sentry), production deploy/domain/SSL. Plug-in points are documented in `orange-blossom-AUDIT-REPORT.md` §9.

**Known minor follow-ups:** server-side unit tests for auth/CRUD (frontend has 82 tests incl. api client + auth context); broader WCAG pass on data tables/charts; remove the now-unused Zustand crew-CRUD slice in `src/store/appStore.ts`; theme-aware Recharts axis colors. None block usage.
