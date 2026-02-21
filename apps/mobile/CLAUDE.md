# CLAUDE.md — Mobile App

This file provides guidance to Claude Code when working with the Expo React Native mobile app.

## Overview

Expo SDK 54 + React Native 0.81 mobile app sharing the same backend as the Next.js web app. Uses Expo Router v6 for file-based navigation, Zustand for state management, and the same API endpoints (authenticated via JWT Bearer tokens instead of iron-session cookies).

## Build & Development Commands

```bash
cd apps/mobile
npx expo start                     # Start Metro bundler
npx expo run:ios                   # Build + run on iOS simulator
npx expo run:android               # Build + run on Android emulator
npx tsc --noEmit                   # TypeScript check (no output)
eas build --platform ios           # EAS cloud build for iOS
eas build --platform android       # EAS cloud build for Android
```

After changing `packages/db` source, rebuild before mobile can use it:
```bash
cd packages/db && pnpm build
```

## Directory Structure

```
app/
├── _layout.tsx                    # Root layout: AuthGate, Sentry, ErrorBoundary
├── (auth)/
│   ├── _layout.tsx                # Auth stack layout
│   └── login.tsx                  # Google & Apple Sign-In screen
└── (tabs)/
    ├── _layout.tsx                # Bottom tab bar (4 tabs) + AppHeaderTitle
    ├── index.tsx                  # Today screen (day nav, XP bar, challenge cards)
    ├── explore.tsx                # Social: search users, friend requests
    ├── leaderboard.tsx            # Ranking: period/scope filters, participant list
    └── profile.tsx                # Profile: avatar, handle, settings, logout
src/
├── api/client.ts                  # API client with Bearer auth + token refresh
├── components/                    # Reusable UI components
│   ├── skeletons/                 # Loading skeleton screens (one per tab)
│   ├── ChallengeCard.tsx          # 3-column challenge card (icon | content | action)
│   ├── TodayHeader.tsx            # User profile + day navigator
│   ├── XpSummaryBar.tsx           # Golden-ratio XP summary (today/week/month)
│   ├── StreakBadge.tsx            # Flame + streak count pill
│   ├── PointsChip.tsx             # "+N XP" amber pill
│   ├── FeedbackModal.tsx          # Post-log celebration modal
│   ├── ChallengeSettingsSheet.tsx # Goal/active toggle bottom sheet
│   ├── WeeklySummaryCard.tsx      # Weekly progress card
│   ├── MonthlySummaryCard.tsx     # Monthly progress card
│   ├── UserAvatar.tsx             # Avatar with fallback initials
│   ├── AvatarPicker.tsx           # Image picker + upload
│   └── ...
├── hooks/                         # React hooks (mirror web hooks)
│   ├── use-today.ts               # Today data + logging + summaries
│   ├── use-profile.ts             # Profile CRUD + avatar + handle check
│   ├── use-explore.ts             # Social search + friend requests + unfriend
│   ├── use-leaderboard.ts         # Ranking with period/scope/radius/pagination
│   ├── use-location.ts            # Geolocation + geohash for nearby ranking
│   ├── use-notification-preferences.ts
│   └── use-store-review.ts        # App Store review after 7-day streak
├── stores/ (Zustand)
│   ├── auth.store.ts              # Session, JWT tokens, login/logout
│   ├── offline-queue.store.ts     # Persist failed logs for retry
│   └── settings.store.ts          # Challenge active/goal preferences
├── services/
│   ├── queue-flush.ts             # Network listener → flush offline queue
│   └── push-notifications.ts      # FCM/Expo push token registration
├── theme/
│   ├── colors.ts                  # Tailwind-inspired palette + category colors
│   ├── typography.ts              # Font scales (h1–label)
│   ├── spacing.ts                 # Golden ratio (phi1=4 … phi7=72)
│   └── category.ts               # Category → icon, color, lightBg, bg, label
└── utils/
    └── haptics.ts                 # Haptic feedback (light, medium, notification)
```

## Architecture

### Auth System (Mobile-Specific)
- **JWT Bearer tokens** (NOT iron-session) — stored in `expo-secure-store`
- Login: Google Sign-In (`@react-native-google-signin/google-signin`) or Apple Auth (`expo-apple-authentication`)
- Flow: Native sign-in → `POST /api/mobile/auth/google` (or `/apple`) with `idToken` + `deviceId` → receive `accessToken` + `refreshToken`
- Token refresh: API client auto-retries on 401 via `POST /api/mobile/auth/refresh`
- Session: `GET /api/mobile/auth/me` returns user profile
- AuthGate in root `_layout.tsx` conditionally routes to `(auth)` or `(tabs)`

### Mobile-Specific API Endpoints
The mobile app uses these additional endpoints not in the web app:
- `POST /api/mobile/auth/google` — Mobile Google sign-in (accepts iOS/web client ID tokens)
- `POST /api/mobile/auth/apple` — Mobile Apple sign-in
- `POST /api/mobile/auth/refresh` — Token refresh
- `GET /api/mobile/auth/me` — Session fetch (Bearer auth)
- `POST /api/mobile/auth/logout` — Invalidate refresh token
- `POST /api/mobile/devices/push-token` — Register push notification token
- `GET|PUT /api/notifications/preferences` — Notification settings

All other endpoints (`/api/trackables/*`, `/api/social/*`, `/api/leaderboards/*`, `/api/profile/*`) are shared with the web app. The mobile API client sends `Authorization: Bearer <token>` headers; the backend `authenticateMobileRequest()` middleware extracts the user.

### Request Flow
```
Hook (use-*.ts) → api.get/post/put/delete() → Backend API route → Service layer → DB
                    ↓ on 401
              Token refresh → retry original request
                    ↓ on NetworkError
              Enqueue to offline store (for POST /log only)
```

### Offline-First Pattern
- `useToday.logQuickAction()` applies optimistic UI update immediately
- On `NetworkError`: log is queued in `offline-queue.store.ts` (AsyncStorage-persisted Zustand)
- `queue-flush.ts` listens to `@react-native-community/netinfo` — flushes queue when network returns
- Retry up to 5× with sequential processing

### State Management (Zustand)
- **`auth.store.ts`** — User session, JWT tokens (SecureStore), `loginWithGoogle()`, `loginWithApple()`, `restoreSession()`, `logout()`
- **`offline-queue.store.ts`** — Queued log actions for offline retry
- **`settings.store.ts`** — Challenge active/goal preferences, synced with backend on launch

### Navigation (Expo Router v6)
File-based routing. Layout groups: `(auth)` for login, `(tabs)` for main app.
```
AuthGate (root _layout.tsx)
├── Not authenticated → (auth)/login
└── Authenticated → (tabs)/
    ├── index        → Hoje (Today)
    ├── explore      → Explorar (Social)
    ├── leaderboard  → Ranking
    └── profile      → Perfil
```

## Theme System

### Colors
- **Primary:** Sky blue `#0ea5e9` (50–950 shades)
- **Categories:** Water blue `#3b82f6`, Diet green `#10b981`, Sleep purple `#8b5cf6`, Exercise rose `#f43f5e`
- **Each category has:** `main` (icon/bar), `light` (icon bg), `bg` (card bg when met)

### Spacing (Golden Ratio)
`phi1: 4, phi2: 6, phi3: 10, phi4: 17, phi5: 27, phi6: 44, phi7: 72`

### Typography
`h1: 28/700, h2: 22/600, h3: 18/600, body: 16/400, bodySmall: 14/400, caption: 13/400, label: 12/500`

## Environment Variables (`apps/mobile/.env`)

```
API_BASE_URL=http://localhost:3000    # Backend URL
GOOGLE_WEB_CLIENT_ID=...             # Google OAuth web client ID (determines token audience)
GOOGLE_IOS_CLIENT_ID=...             # Google OAuth iOS client ID
SENTRY_DSN=...                       # Sentry error tracking
```

**Important:** `GOOGLE_WEB_CLIENT_ID` is used as `webClientId` in GoogleSignin.configure(). This determines the audience of the ID token. The backend must accept both web and iOS client IDs as valid audiences.

## Key Patterns

### Challenge Card Actions
The Today screen's `+` button triggers `onRegister(cardId)` which executes the first quick action for that card. Quick actions are defined server-side per category in `CATEGORY_QUICK_ACTIONS` (in `trackable.service.ts`). The card calls `logQuickAction(userTrackableId, actionId)` from `useToday()`.

### Category Display Order
Challenges display in this fixed order: Água (WATER), Dieta (DIET_CONTROL), Exercício Físico (PHYSICAL_EXERCISE), Sono (SLEEP). This is enforced server-side via `CATEGORY_ORDER` in `trackable.service.ts`.

### iOS Build Caveats
- **App icon:** Baked into `ios/MeusDesafios/Images.xcassets/AppIcon.appiconset/` at build time. Changing `assets/icon.png` alone may not update it — must also replace the native asset.
- **Splash screen:** Cached aggressively by iOS in `SplashScreenLegacy.imageset/`. Requires deleting the app from simulator before rebuilding to see changes.
- **Splash color:** Defined in `SplashScreenBackground.colorset/Contents.json` and `SplashScreen.storyboard`

### UI Conventions
- All user-facing text in Portuguese (pt-BR)
- Skeleton screens for every tab (shimmer loading states)
- Haptic feedback: `light()` for taps, `medium()` for milestones, `notification()` for social actions
- Pull-to-refresh on Today and Leaderboard screens
- `SafeAreaView` edges managed per-screen (Today/Leaderboard use `edges={[]}` since the native tab header handles top safe area)

## Shared Code

The mobile app imports types and schemas from `@meusdesafios/shared`:
- `TrackableCategory`, `Goal`, `ScoringConfig` — Domain types
- `Period`, `Scope`, `Radius`, `LeaderboardView` — Leaderboard types
- `ParticipantRow`, `ChallengeRank`, `LeaderboardData` — API response types
- `TodayCard`, `TodayResponse`, `WeeklySummary`, `MonthlySummary` — Today types

The mobile app does NOT import from `@meusdesafios/db` directly (except `getCategoryStyle` pattern comes from the mobile theme, not the db package).
