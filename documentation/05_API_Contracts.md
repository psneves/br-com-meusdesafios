# API Contracts - Meus Desafios

## API conventions

- Base path: `/api`
- Authentication: required for all endpoints unless explicitly marked public
- Content type: `application/json`
- Dates: ISO 8601 (`YYYY-MM-DD` for day fields, full timestamp for events)
- Day calculations use authenticated user's timezone

---

## Response envelopes

### Success envelope

```json
{
  "ok": true,
  "data": {}
}
```

### Error envelope

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": []
  }
}
```

Common error codes:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `CONFLICT`
- `RATE_LIMITED`

---

## Core challenges (trackables API)

### `GET /api/trackables/templates`

Returns active template definitions.

### `POST /api/trackables/activate`

Request body:

```json
{
  "templateCode": "PHYSICAL_EXERCISE",
  "goalOverrides": {},
  "scheduleOverrides": {}
}
```

Behavior:
- creates or reactivates `user_trackable`
- returns activated challenge config

### `GET /api/trackables/today`

Returns Today cards for active challenges.

For the simplified product, Today should primarily show 4 challenge cards:
- Water
- Diet Control
- Sleep
- Physical Exercise

Example:

```json
{
  "ok": true,
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

Creates log entry and triggers recomputation for the affected day.

Request body:

```json
{
  "userTrackableId": "ut_exercise_1",
  "occurredAt": "2026-02-14T13:00:00Z",
  "valueNum": 45,
  "valueText": null,
  "meta": {"unit": "min", "exerciseModality": "cycling"},
  "idempotencyKey": "client-uuid-123"
}
```

Rules:
- reject impossible values (per challenge limits)
- dedupe by `idempotencyKey` when provided

### `GET /api/trackables/{userTrackableId}`

Returns detail payload for one challenge card:
- overview summary
- recent logs
- rules explanation

For Physical Exercise, detail includes modality breakdown (gym/run/cycling/swim).

---

## Challenges

### `GET /api/challenges/templates`

Returns challenge templates with the 4 core challenges and default schedules.

### `POST /api/challenges/join`

Request body:

```json
{
  "challengeTemplateCode": "CORE_4_BALANCE"
}
```

Behavior:
- activates related challenge cards with defaults
- returns activated challenges summary

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

Returns only the requester's rank result. Scopes: `friends` (mutual friends cohort) and `nearby` (geolocation-based).

Example:

```json
{
  "ok": true,
  "data": {
    "scope": "friends",
    "day": "2026-02-14",
    "rank": 42,
    "score": 1880,
    "cohortSize": 315,
    "percentile": 0.87,
    "rankStatus": "available"
  }
}
```

If `cohortSize < 5`, return:
- `rank = null`
- `rankStatus = "insufficient_cohort"`

Never return:
- usernames of others
- ordered lists
- neighboring ranks

---

## Scoring explanations

### `GET /api/scoring/explanations?day=YYYY-MM-DD`

Returns the user's point events for the selected day.

Example item:

```json
{
  "source": "trackable_goal",
  "points": 10,
  "reason": "Water goal met: 2500/2500 ml",
  "reasonCode": "WATER_TARGET_MET"
}
```

---

## Authorization rules

- Any access to another user's stats requires accepted relationship.
- Blocked relationships deny both stat visibility and leaderboard inclusion.
- Authorization must execute before controller logic.
