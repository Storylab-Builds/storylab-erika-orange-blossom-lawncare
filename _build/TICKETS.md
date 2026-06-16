# Orange Blossom — Full-Stack Build Tickets

**Goal:** Full login + users, **local Postgres** DB, persistence for all writes, build green, app fully working E2E.

**Stack:** custom **local JWT auth** (Postgres `users` + bcrypt), **Express + Prisma + local Postgres**, single root `package.json`, Vite proxy `/api` → `:4000`.
**Local DB:** `postgresql://obs:obs_local_dev@localhost:5432/orange_blossom?schema=public`
**Default logins** (password `Password123!`): owner@orangeblossom.com (OWNER) · admin@orangeblossom.com (ADMIN) · crew@orangeblossom.com (CREW)

Status: ⬜ todo · 🔧 in progress · ✅ done · 🚫 blocked (external account/keys)

---

## EPIC A — Build green ✅ DONE
- A1 ✅ Add `@testing-library/dom`
- A2 ✅ Fix strict-null bug `CustomerDetail.tsx` (openMessageModal guard)
- A3 ✅ 404/catch-all route (`NotFound`) + redirect
- A4 ✅ `npm run build` exits 0; `npm test` 8 suites / **71 tests pass** (was 34)
- A5 ✅ Scripts: server, db:*, typecheck, test:cov, concurrent dev
- A6 ✅ `.gitignore`, branch `feat/full-stack-build`

## EPIC B — Backend foundation ✅ DONE
- B1 ✅ DB role `obs` + database `orange_blossom`
- B2 ✅ Express + tsx scaffold, CORS, error handler, health
- B3 ✅ Prisma schema (domain + User/Role + relations)
- B4 ✅ `prisma migrate dev` applied clean (migration `init`)
- B5 ✅ Deterministic seed (3 users,15 customers,3 crews,24 jobs,18 notif,24 act,30 metrics) — NO Math.random
- B6 ✅ Prisma client singleton + zod validation

## EPIC C — Auth ✅ DONE
- C1 ✅ `User` model: email, passwordHash, name, role (OWNER/ADMIN/CREW)
- C2 ✅ register/login/me (bcrypt + JWT) — verified via curl + browser
- C3 ✅ Auth middleware + `requireRole` (settings gated OWNER/ADMIN)
- C4 ✅ Frontend AuthContext + token storage + auth header
- C5 ✅ Login + Register pages (branded, dark-aware)
- C6 ✅ `ProtectedRoute`; unauthenticated → /login (verified in browser)
- C7 ✅ AppLayout shows real user (Erika/Owner) + logout; default users seeded

## EPIC D — Data layer wiring
- D1 ✅ Customers CRUD API + `useCustomers`/`useCustomer` (+create/update/delete mutations)
- D2 ✅ Jobs/Schedule read API + `useJobs`/`useTodayJobs`/`useJob` (+`useUpdateJob`)
- D3 ⬜ Crews + members: wire Crews page to API (currently Zustand-only writes)
- D4 ✅ Reports/metrics server-computed deterministic + `useMetrics` (STABLE across refresh)
- D5 ✅ Weather served from DB + `useWeather`
- D6 ⬜ CustomerDetail send-message → POST /api/notifications
- D7 ⬜ Settings page Save → PUT /api/settings/:key
- D8 ✅ Dashboard stats endpoint + `useDashboardStats` (verified in browser)
- D9 ✅ Mock fetchers removed from all hooks (verified: dashboard uses only /api/*)
- D10 ⬜ FieldOps clock-in/out + job-complete → API (`useUpdateJob`)

## EPIC E — Frontend fixes from audit
- E1 ⬜ Fix Landing hero count-up (stuck at "0+")
- E2 ⬜ Fix Reports charts: `useMemo` data, stop re-animation/flicker (also Dashboard "Jobs This Week")
- E3 ⬜ Mobile-responsive `AppLayout` (hamburger + drawer)
- E4 🔧 Dark mode: `darkMode:'class'` + toggle (login/register/404 already dark-aware)
- E5 ⬜ Remove 8 dead components OR reconcile divergent types
- E6 ⬜ Empty/error/loading states (Dashboard, Weather, Customers, Reports)

## EPIC F — Quality / validation
- F1 ⬜ Tests: auth (hash/JWT), CRUD endpoints, key components (beyond current 71)
- F2 ⬜ A11y pass on top 5 routes
- F3 🔧 E2E validation swarm (5) + browser: login→dashboard→CRUD persists across refresh
- F4 ✅ `npm run build` green (frontend tsc+vite) AND server typechecks
- F5 🔧 Clean E2E run: `npm i && db:migrate && db:seed && dev` → login works, data persists (core verified)

## BLOCKED — external accounts/keys (flag for Erika's team)
- X1 🚫 Twilio SMS · X2 🚫 Stripe · X3 🚫 Mapbox · X4 🚫 Resend/Postmark email · X5 🚫 Google Calendar · X6 🚫 Sentry · X7 🚫 prod deploy/domain

---

## Progress log
- 2026-06-16 iter1: Backend (Express+Prisma+Postgres) + JWT auth + all read APIs + customers CRUD built & curl-verified; frontend auth (login/protected/logout) + hooks rewired to API; build+tests GREEN (71 tests); browser-verified login→dashboard renders real DB data over /api. Remaining: D3/D6/D7/D10 write-persistence, E1–E6 polish, F1–F3 validation.
