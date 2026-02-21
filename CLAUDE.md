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
/apps/web                   # Next.js 14 App Router (UI + API routes)
/packages/shared            # TypeScript types, Zod schemas, scoring engine
/packages/db                # TypeORM entities, migrations, seeds
/documentation              # Product specs and requirements
```

## Architecture

### Auth System
- **iron-session** (NOT NextAuth) — encrypted HTTP-only cookie `meusdesafios-session`, 7-day expiry
- Google OAuth flow: `/api/auth/google` → Google → `/api/auth/google/callback`
- Session fields: `id`, `handle`, `firstName`, `lastName`, `displayName`, `email`, `isLoggedIn`, `provider`
- Middleware (`apps/web/middleware.ts`) protects `/today`, `/explore`, `/leaderboard`, `/profile`, `/settings`
- Auth helpers: `apps/web/lib/auth/{session,oauth,user}.ts`

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

### API Routes (21 endpoints)
**Auth:** `GET /api/auth/me`, `GET /api/auth/google`, `GET /api/auth/google/callback`, `GET /api/auth/logout`
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

Required: `DATABASE_URL` (PostgreSQL), `SECRET_COOKIE_PASSWORD` (32+ chars for iron-session), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Key Documentation Files (`/documentation/`)

- **03_Product_Requirements.md** — Product source of truth
- **04_Data_Model.md** — Postgres data model
- **05_API_Contracts.md** — API endpoints and response shapes
- **06_Scoring_Streaks_Rules.md** — Points, streaks, gamification logic
- **07_Leaderboards_Privacy.md** — Privacy-safe leaderboard strategy

## Testing

Tests live in `packages/shared/tests/`. 19 scoring tests cover goal evaluation, streak transitions, and point calculation. E2E tests exist in `apps/web/__tests__/e2e.spec.ts`. Run scoring tests with `pnpm --filter @meusdesafios/shared test:run`.

## Edge Cases to Handle

- Timezone boundaries for late-night logs (use local date, not UTC)
- Sleep entries spanning midnight
- Duplicate logs (no idempotency key yet — relies on rate limiting)
- User deactivates/reactivates challenges
- Cohort too small for leaderboard display (< 5)
- `ComputedDailyStats.day` may be a Date object or string depending on context — always normalize with `dayString()`
