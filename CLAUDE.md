# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meus Desafios – Consistency becomes results.
A habit-tracking app for adults aged 25-35 who want to build routines with simple gamification (points, streaks). Focuses on 4 challenges: Water, Diet Control, Sleep, and Physical Exercise (Gym/Running/Cycling/Swimming modalities). All user-facing text is in Portuguese (pt-BR).

## Build & Development Commands

```bash
pnpm install                # Install dependencies
pnpm dev                    # Next.js dev server (http://localhost:3000)
pnpm build                  # Production build
pnpm lint                   # Lint all packages
pnpm test                   # Run all tests
pnpm --filter @meusdesafios/shared test:run  # Run scoring tests once (CI)
pnpm db:migration:run       # Run TypeORM migrations
pnpm db:seed                # Seed trackable templates
```

## Repository Structure

```
/apps/web                   # Next.js 14 App Router (UI + API routes + backend)
/apps/mobile                # Expo SDK 54 React Native app (iOS + Android)
/packages/shared            # TypeScript types, Zod schemas, scoring engine
/packages/db                # TypeORM entities, migrations, seeds
/documentation              # Product specs and requirements
```

## Architecture

### Dual-Platform Auth
- **Web:** iron-session (NOT NextAuth) — encrypted HTTP-only cookie `meusdesafios-session`, 7-day expiry
- **Mobile:** JWT Bearer tokens — stored in expo-secure-store, auto-refresh on 401
- **Web auth flow:** `/api/auth/google` → Google → `/api/auth/google/callback`
- **Mobile auth flow:** Google/Apple native sign-in → `POST /api/mobile/auth/google` (or `/apple`) with idToken → receive accessToken + refreshToken
- **Backend accepts both:** cookie-based (web) and Bearer token (mobile) via `authenticateMobileRequest()` middleware
- **Google OAuth audience:** Backend accepts both web and iOS client IDs as valid audiences in `verifyGoogleToken()`
- Session fields: `id`, `handle`, `firstName`, `lastName`, `displayName`, `email`, `isLoggedIn`, `provider`, `friendsCount`
- Web middleware (`apps/web/middleware.ts`) protects `/today`, `/explore`, `/leaderboard`, `/profile`, `/settings`
- Auth helpers: `apps/web/lib/auth/{session,oauth,user,mobile-token}.ts`

### Request Flow
```
Client hook (use-*.ts) → API route → Service layer → TypeORM/DB
```

- **API responses**: `successResponse(data)` → `{ success: true, data }`, `errors.unauthorized()/.badRequest()/.serverError()` → `{ success: false, error: { code, message } }`
- **Validation**: `validateBody(req, zodSchema)` and `validateQuery(params, zodSchema)` in `lib/api/validate.ts`
- **Session check**: Every protected route starts with `const session = await getSession(); if (!session.isLoggedIn) return errors.unauthorized();`

### Services Layer (`apps/web/lib/services/`)
- **trackable.service.ts** (857 lines) — Core service: `buildTodayResponse()`, `createLog()` (log + recompute pipeline), `updateGoal()`, `toggleActive()`, `buildWeeklySummary()`, `buildMonthlySummary()`
- **user.service.ts** — Profile CRUD, handle availability, avatar upload, location
- **social.service.ts** — User search, friend requests (send/accept/deny/cancel), suggested users, friend count
- **leaderboard.service.ts** — Privacy-safe rank computation by scope (friends/nearby) and period (week/month)

### Client Hooks (`apps/web/lib/hooks/`)
- **use-session.ts** — Auth state from `/api/auth/me`
- **use-today.ts** — Today page data, logging actions, week/month summaries
- **use-profile.ts** — Profile editing, avatar upload, debounced handle check
- **use-leaderboard.ts** — Leaderboard data with scope/period/radius controls
- **use-explore.ts** — Social explore, search, friend request management
- **use-challenge-settings.ts** — Challenge settings dialog

### Mobile Client Hooks (`apps/mobile/src/hooks/`)
Mirror the web hooks but use JWT Bearer auth via `api.get/post/put/delete()`:
- **use-today.ts** — Today data + logging + optimistic updates + offline queue
- **use-profile.ts** — Profile CRUD + avatar upload + handle availability
- **use-explore.ts** — Social search + friend requests + unfriend
- **use-leaderboard.ts** — Ranking with period/scope/radius/pagination
- **use-location.ts** — Geolocation + geohash for nearby ranking

### API Routes (21+ endpoints)
**Auth (Web):** `GET /api/auth/me`, `GET /api/auth/google`, `GET /api/auth/google/callback`, `GET /api/auth/logout`
**Auth (Mobile):** `POST /api/mobile/auth/google`, `POST /api/mobile/auth/apple`, `POST /api/mobile/auth/refresh`, `GET /api/mobile/auth/me`, `POST /api/mobile/auth/logout`, `POST /api/mobile/devices/push-token`
**Profile:** `GET|PATCH /api/profile`, `POST /api/profile/avatar`, `GET /api/profile/check-handle`, `GET|PUT /api/profile/location`
**Trackables:** `GET /api/trackables/today`, `POST /api/trackables/log`, `PUT /api/trackables/active`, `PUT /api/trackables/goal`, `GET /api/trackables/settings`, `GET /api/trackables/summary`
**Social:** `GET /api/social/explore`, `POST /api/social/follow-request`, `GET /api/social/search`, `POST /api/social/follow-requests/[id]/accept`, `POST /api/social/follow-requests/[id]/deny`, `POST /api/social/follow-requests/[id]/cancel`
**Leaderboard:** `GET /api/leaderboards/rank`

## Core Domain Concepts

### Server-Authoritative Scoring
- Points, streaks, and ranks calculated server-side only
- Base points: +10 XP for meeting daily goal
- Streak bonuses: configurable per trackable via `ScoringConfig.streakBonuses` (default is empty — no milestone bonuses)
- Perfect day bonus: +10 XP when all active challenges are met on the same day
- Weekly bonuses: awarded for completed weeks
- Scoring engine: `packages/shared/src/scoring/` — `evaluateGoal()`, `updateStreak()`, `calculateStreakBonus()`, `computeDayResult()`
- Recompute pipeline in `trackable.service.ts#createLog()`: insert log → evaluate goal → update ComputedDailyStats → update Streak → delete/rewrite PointsLedger entries for that trackable+day

### Social Model (Friends — Mutual/Symmetric)
- Uses a symmetric friends model: when A sends a request and B accepts, they become mutual friends via a single edge in `follow_edges`
- Friend requests require explicit acceptance to see stats
- Leaderboard scopes: `"friends"` (all accepted edges, either direction) and `"nearby"` (geolocation)
- `getFriendCount()` returns a single `friendsCount` (accepted edges where user is either requester or target)
- Auto-accept: if A requests B while B already has a pending request to A, they become friends instantly
- Session fields: `friendsCount` (via `/api/auth/me`)

### Privacy Model (Critical)
- Leaderboards return ONLY the requesting user's rank/score/cohort_size
- Never expose: usernames, user IDs, neighbor ranks, or paginated lists

### Timezone Safety (Critical)
All date-to-string conversions MUST use local timezone getters (`getFullYear()`/`getMonth()`/`getDate()`), NOT `toISOString()` which converts to UTC. The standard pattern:
```typescript
function dayString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
```

## Key TypeORM Entities (`packages/db/src/entities/`)

`User`, `TrackableTemplate` (4 challenge types), `UserTrackable` (activated with goal overrides), `TrackableLog` (input events), `ComputedDailyStats` (cached daily progress), `Streak` (current/best per trackable), `PointsLedger` (point audit trail, delete/rewrite per trackable+day during recompute), `FollowEdge` (friends graph: pending/accepted/denied/blocked — symmetric model), `LeaderboardSnapshot`

## Environment Variables

**Web (`apps/web/.env`):** `DATABASE_URL` (PostgreSQL), `SECRET_COOKIE_PASSWORD` (32+ chars), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_IOS_CLIENT_ID`
**Mobile (`apps/mobile/.env`):** `API_BASE_URL`, `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `SENTRY_DSN`

## Key Documentation Files (`/documentation/`)

- **03_Product_Requirements.md** — Product source of truth
- **04_Data_Model.md** — Postgres data model
- **05_API_Contracts.md** — API endpoints and response shapes
- **06_Scoring_Streaks_Rules.md** — Points, streaks, gamification logic
- **07_Leaderboards_Privacy.md** — Privacy-safe leaderboard strategy

## Testing

Tests live in `packages/shared/tests/`. 19 scoring tests cover goal evaluation, streak transitions, and point calculation. E2E tests exist in `apps/web/__tests__/e2e.spec.ts`. Run scoring tests with `pnpm --filter @meusdesafios/shared test:run`.

## Category Display Order

Challenges always display in this fixed order (enforced server-side via `CATEGORY_ORDER` in `trackable.service.ts`):
1. Água (WATER)
2. Dieta (DIET_CONTROL)
3. Exercício Físico (PHYSICAL_EXERCISE)
4. Sono (SLEEP)

## Edge Cases to Handle

- Timezone boundaries for late-night logs (use local date, not UTC)
- Sleep entries spanning midnight
- Duplicate logs (no idempotency key yet — relies on rate limiting)
- User deactivates/reactivates challenges
- Cohort too small for leaderboard display (< 5)
- `ComputedDailyStats.day` may be a Date object or string depending on context — always normalize with `dayString()`
- **iOS app icon/splash caching:** Changing `assets/icon.png` may not update the native build — must also replace `ios/MeusDesafios/Images.xcassets/` assets and delete app from simulator
- **`@meusdesafios/db` rebuild:** After modifying `packages/db/src/`, run `cd packages/db && pnpm build` — mobile and web import from `dist/`
