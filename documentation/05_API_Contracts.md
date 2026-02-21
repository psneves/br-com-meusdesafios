# API Contracts - Meus Desafios

## API conventions

- Base path: `/api`
- Authentication: required for all endpoints unless explicitly marked public
- Content type: `application/json`
- Dates: ISO 8601 (`YYYY-MM-DD` for day fields, full timestamp for events)
- Day calculations use server-local date math (assumes `America/Sao_Paulo`; per-user timezone not yet implemented)

---

## Response envelopes

### Success envelope

```json
{
  "success": true,
  "data": {}
}
```

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary"
  }
}
```

Common error codes:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `BAD_REQUEST`
- `VALIDATION_ERROR`
- `SERVER_ERROR`

---

## Authentication

### `GET /api/auth/me`

Returns the authenticated user's session data including profile and friend count. Public (returns `UNAUTHORIZED` if not logged in).

### `GET /api/auth/google`

Initiates the Google OAuth flow. Redirects the user to Google's consent screen.

### `GET /api/auth/google/callback`

Handles the Google OAuth callback. Creates/updates the user and establishes a session, then redirects to `/today`.

### `GET /api/auth/logout`

Destroys the session and redirects to `/`.

---

## Profile

### `GET /api/profile`

Returns the authenticated user's full profile.

### `PATCH /api/profile`

Updates the user's profile fields.

Request body:

```json
{
  "firstName": "João",
  "lastName": "Silva",
  "handle": "joaosilva"
}
```

### `POST /api/profile/avatar`

Uploads a base64-encoded avatar image (JPEG, PNG, or WebP, max 500KB decoded). Rate-limited to 5 uploads per 5 minutes.

Request body:

```json
{
  "image": "data:image/jpeg;base64,..."
}
```

### `GET /api/profile/check-handle?handle=joaosilva`

Returns whether a handle is available for the authenticated user.

### `GET /api/profile/location`

Returns the user's saved location coordinates.

### `PUT /api/profile/location`

Updates the user's geolocation for nearby leaderboards.

Request body:

```json
{
  "latitude": -23.5505,
  "longitude": -46.6333
}
```

---

## Trackables

### `GET /api/trackables/today`

Returns Today cards for active challenges.

For the simplified product, Today shows 4 challenge cards:
- Water
- Diet Control
- Sleep
- Physical Exercise

Example:

```json
{
  "success": true,
  "data": {
    "date": "2026-02-14",
    "cards": [
      {
        "userTrackableId": "ut_123",
        "name": "Water",
        "goal": {"type": "target", "unit": "ml", "target": 2500},
        "progress": {"value": 1500, "unit": "ml", "met": false},
        "streak": {"current": 4, "best": 12},
        "pointsToday": 0,
        "quickActions": [
          {"type": "add", "amount": 250},
          {"type": "add", "amount": 500},
          {"type": "add", "amount": 750}
        ]
      }
    ]
  }
}
```

### `POST /api/trackables/log`

Creates a log entry and triggers recomputation for the affected day. Rate-limited to 30 logs per minute.

Request body:

```json
{
  "userTrackableId": "uuid-here",
  "valueNum": 250,
  "date": "2026-02-14",
  "meta": {"unit": "ml"}
}
```

Fields:
- `userTrackableId` (required, UUID)
- `valueNum` (required, number)
- `date` (optional, `YYYY-MM-DD` — defaults to today)
- `meta` (optional, object)

### `PUT /api/trackables/active`

Toggles a challenge active/inactive for the user.

Request body:

```json
{
  "category": "WATER"
}
```

Valid categories: `WATER`, `DIET_CONTROL`, `PHYSICAL_EXERCISE`, `SLEEP`.

### `PUT /api/trackables/goal`

Updates the daily goal target for a challenge.

Request body:

```json
{
  "category": "WATER",
  "target": 3000
}
```

### `GET /api/trackables/settings`

Returns the user's challenge settings (active state and goal for each category).

### `GET /api/trackables/summary?date=YYYY-MM-DD`

Returns weekly and monthly summary data for the user's challenges. The `date` parameter is optional and defaults to today.

---

## Social graph (Friends — mutual/symmetric)

### `POST /api/social/follow-request`

Sends a friend request. If the target already has a pending request to the requester, auto-accepts (instant mutual friendship).

Request body:

```json
{
  "targetHandle": "joaosilva"
}
```

### `POST /api/social/follow-requests/{id}/accept`
### `POST /api/social/follow-requests/{id}/deny`
### `POST /api/social/follow-requests/{id}/cancel`

### `GET /api/social/explore`

Returns pending friend requests (incoming), sent friend requests (outgoing), and suggested users.

### `GET /api/social/search?q=query`

Returns matching users with their friendship status.

---

## Leaderboards (privacy-safe)

### `GET /api/leaderboards/rank?scope=friends|nearby&period=week|month&radius=50|100|500`

Returns the requester's overall rank and per-challenge ranks. Scopes: `friends` (mutual friends cohort) and `nearby` (geolocation-based).

Example:

```json
{
  "success": true,
  "data": {
    "overall": {
      "scope": "friends",
      "rank": 42,
      "score": 1880,
      "cohortSize": 315,
      "percentile": 0.87,
      "rankStatus": "available"
    },
    "challengeRanks": [
      {
        "category": "WATER",
        "name": "Água",
        "rank": 10,
        "score": 500,
        "cohortSize": 315,
        "percentile": 0.97
      }
    ]
  }
}
```

`rankStatus` values: `"available"`, `"insufficient_cohort"` (cohort < 5), `"no_location"` (nearby scope without user location).

If `cohortSize < 5`, return:
- `rank = null`
- `rankStatus = "insufficient_cohort"`

Never return:
- usernames of others
- ordered lists
- neighboring ranks

---

## Not yet implemented

The following endpoints are described in product requirements but have not been implemented yet:

- `GET /api/trackables/templates` — Return active template definitions
- `POST /api/trackables/activate` — Create/reactivate a user trackable with goal/schedule overrides
- `GET /api/trackables/{userTrackableId}` — Challenge detail view (overview, logs, rules)
- `GET /api/challenges/templates` — Challenge template listing
- `POST /api/challenges/join` — Join a challenge bundle
- `GET /api/scoring/explanations?day=YYYY-MM-DD` — Point events breakdown for a day

---

## Security and operational behavior

### CSRF protection
Middleware verifies the `Origin` header on all API mutation requests (`POST`, `PUT`, `PATCH`, `DELETE`). Requests with a mismatched origin are rejected with `403 FORBIDDEN`.

### Rate limiting
In-memory per-key rate limiting is applied to specific endpoints:
- `POST /api/trackables/log` — 30 requests per minute per user
- `POST /api/profile/avatar` — 5 uploads per 5 minutes per user

### Onboarding
First-login users see an onboarding modal. Completion state is persisted in `localStorage`.

### Test-only endpoints
`POST /api/auth/test-login` — Creates a session without OAuth. Only available when `TEST_LOGIN_KEY` env var is set and `NODE_ENV !== "production"`.

---

## Authorization rules

- Any access to another user's stats requires accepted relationship.
- Blocked relationships deny both stat visibility and leaderboard inclusion.
- Authorization must execute before controller logic.
