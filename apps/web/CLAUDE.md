# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See the root `/CLAUDE.md` for monorepo-wide commands, domain concepts, entity descriptions, and implementation progress.

## Web App Commands

```bash
pnpm dev          # Next.js dev server at http://localhost:3000
pnpm build        # Production build (also validates TypeScript)
pnpm lint         # ESLint with next/core-web-vitals
```

E2E tests exist in `__tests__/e2e.spec.ts` (Playwright). Shared package tests are run from the monorepo root with `pnpm --filter @meusdesafios/shared test`.

## Architecture

**Next.js 14 App Router** with the `(app)` route group for the authenticated area.

```
app/
  layout.tsx          # Root layout (Inter font, metadata)
  page.tsx            # Redirects to /today
  (app)/
    layout.tsx        # Authenticated shell (sticky nav, max-w-5xl container)
    today/page.tsx    # Main dashboard (client component)
    explore/page.tsx  # Social explore (search, friend requests)
    leaderboard/page.tsx  # Privacy-safe rank display
    profile/page.tsx  # Profile editing, avatar, settings
```

Pages under `(app)/` share the navigation layout. All four pages (today, explore, leaderboard, profile) are fully implemented.

### Data Flow

The app fetches data from API routes. Each page has a corresponding client hook:

1. `use-today.ts` hook manages all state for the Today page (cards, loading, error, feedback)
2. Data is fetched from `/api/trackables/today` and logs are posted to `POST /api/trackables/log`
3. Quick actions perform optimistic UI updates
4. Feedback toast shows points/streak changes after logging

### Component Organization

- `components/ui/` — Reusable primitives (Button, Card, Badge, ProgressBar). All support variant/size props via `cn()` utility.
- `components/trackables/` — Domain components for trackable cards (TrackableCard, StreakBadge, PointsChip, QuickActionRow, TrackableProgress).
- `components/today/` — Page-level composition (TodayHeader, TrackableList, EmptyState, FeedbackToast).
- `components/onboarding/` — Onboarding modal flow.

Both `ui/` and `trackables/` have barrel `index.ts` exports.

### Key Patterns

- **`cn()` utility** (`lib/utils.ts`): Combines `clsx` + `tailwind-merge` for className composition. Use this instead of raw template literals for conditional classes.
- **`"use client"` directive**: Used on interactive components and hooks. Layouts and server components omit it.
- **`@/*` path alias**: Maps to the web app root (`./`). Import as `@/lib/utils`, `@/components/ui`, etc.
- **Dark mode**: All components use `dark:` Tailwind variants. The primary color palette is sky blue (`primary-50` through `primary-950`), defined in `tailwind.config.ts`.
- **forwardRef pattern**: UI primitives use `forwardRef` with explicit `displayName`.
- **Skeleton loading**: Components render skeleton placeholders during loading states (pulsing `animate-pulse` divs).

### Types

Web-specific types live in `lib/types/today.ts` (TodayCard, TodayResponse, LogFeedback, QuickAction). These import shared types (TrackableCategory, GoalType) from `@meusdesafios/shared`.

### Monorepo Integration

`next.config.js` transpiles `@meusdesafios/shared` and `@meusdesafios/db` so they can be imported directly. TypeScript strict mode is enabled.
