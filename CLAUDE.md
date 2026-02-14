# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChallengeOS is a privacy-first, gamified life-challenges tracking app.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Run Next.js dev server

# Build
pnpm build                  # Build for production

# Linting
pnpm lint                   # Lint all packages

# Testing
pnpm test                   # Run all tests
pnpm --filter @challengeos/shared test      # Run shared package tests
pnpm --filter @challengeos/shared test:run  # Run tests once (CI)

# Database (TypeORM)
pnpm db:migration:run       # Run migrations
pnpm db:seed                # Seed trackable templates
```

## Repository Structure

```
/apps
  /web                      # Next.js 14 App Router (UI + API routes)
/packages
  /shared                   # TypeScript types, Zod schemas, scoring engine
  /db                       # TypeORM entities, migrations, seeds
/documentation              # Product specs and requirements
```

## Key Documentation Files

Located in `/documentation/`:
- **02_System_Instructions.md** - Core system/behavior prompt
- **03_Product_Requirements.md** - Product source of truth
- **04_Data_Model.md** - Postgres data model
- **05_API_Contracts.md** - API endpoints and response shapes
- **06_Scoring_Streaks_Rules.md** - Points, streaks, gamification logic
- **07_Leaderboards_Privacy.md** - Privacy-safe leaderboard strategy

## Core Domain Concepts

### Unified Trackables
All trackable activities (Run, Bike, Swim, Gym, Sleep, Diet, Water) share:
- Goal definition (binary/target/range/time window)
- Logging (quick log + optional detailed log)
- Streak computation
- Point computation
- Standard UI components (Today Card, Detail page, Rules tab)

### Server-Authoritative Scoring
- Points, streaks, and ranks are calculated server-side only
- Base points: +10 for meeting daily goal
- Streak bonuses: +5 (day 3), +10 (day 7), +20 (day 14), +50 (day 30)
- Scoring engine is in `packages/shared/src/scoring/`

### Privacy Model (Critical)
- Follow requests require explicit acceptance to see stats
- Leaderboards return ONLY the requesting user's rank/score/cohort_size
- Never expose: usernames, user IDs, neighbor ranks, or paginated lists
- Minimum cohort size check (if < 5, hide rank)

## Key TypeORM Entities

Located in `packages/db/src/entities/`:
- `User` - basic user info
- `TrackableTemplate` - standard trackable definitions (7 types)
- `UserTrackable` - user's activated trackables with goal overrides
- `TrackableLog` - authoritative input events
- `ComputedDailyStats` - cached daily progress
- `Streak` - current/best streak per trackable
- `PointsLedger` - immutable audit trail of all point awards
- `FollowEdge` - social graph with status (pending/accepted/denied/blocked)
- `LeaderboardSnapshot` - privacy-safe rank snapshots per user

## Testing Priorities

1. **Scoring correctness** - goal types, streak transitions, no double-counting (tests in `packages/shared/tests/`)
2. **Privacy enforcement** - reject access without accepted follow, leaderboards never leak others
3. **API contracts** - validate schemas with Zod

## Edge Cases to Handle

- Timezone boundaries for late-night logs
- Sleep entries spanning midnight
- Duplicate logs and idempotency
- User deactivates/reactivates trackables
- Cohort too small for leaderboard display (< 5)

---

## Implementation Progress

### Phase 1: UI Foundation - COMPLETE
All UI components built with mock data. Run `pnpm dev` and visit http://localhost:3000

**Completed:**
- Mock data layer (`lib/mock/today-data.ts`) - 7 trackables with various states
- `useToday` hook (`lib/hooks/use-today.ts`) - manages state, has `USE_MOCK` flag
- Base UI components: Badge, Button, Card, ProgressBar
- Trackable components: StreakBadge, PointsChip, QuickActionRow, TrackableProgress, TrackableCard
- Today page: TodayHeader, TrackableList, EmptyState, FeedbackToast
- App layout with navigation

**Key files:**
- `apps/web/app/(app)/today/page.tsx` - main dashboard
- `apps/web/lib/hooks/use-today.ts` - set `USE_MOCK = false` to switch to real API

### Phase 2: Logging Modals - COMPLETE
**Completed:**
- Modal base component (`components/ui/Modal.tsx`)
- WaterLogger modal with quick-select and custom amount input
- SleepLogger modal with bedtime picker and duration slider
- ActivityLogger modal for Run/Bike/Swim/Gym with presets
- All modals wired to Today page via modal state management

### Phase 3: API Routes - IN PROGRESS
**Started:**
- API foundation: `lib/api/response.ts` (success/error helpers)
- API validation: `lib/api/validate.ts` (Zod schema validation)
- Directory structure created for endpoints

**Pending endpoints:**
- `GET /api/trackables/templates` - list templates
- `POST /api/trackables/activate` - activate a trackable
- `GET /api/trackables/today` - today's cards with progress
- `POST /api/trackables/log` - create log entry, trigger recompute
- `GET /api/trackables/[id]` - detail view

### Phase 4: Scoring Service - NOT STARTED
- Wrap `packages/shared/src/scoring/` in a service layer
- Handle transactions, idempotency, streak updates
- Connect to TypeORM entities

### Phase 5: Remaining Features - NOT STARTED
- Detail endpoint, logs history, scoring explanations
- Full test coverage

---

## Development Philosophy

**UI-First Approach:**
1. Build UI with mock data (looks real, stakeholders can see progress)
2. Define TypeScript types/contracts
3. Create API routes matching contracts
4. Connect UI to real API (swap mock → fetch)
5. Implement backend services
