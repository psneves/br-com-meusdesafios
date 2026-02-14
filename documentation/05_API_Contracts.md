# API Contracts – ChallengeOS (Privacy-first)

## Auth
Assume standard session/JWT.
All endpoints require auth unless stated.

---

## Trackables
### GET /trackables/templates
Returns standard templates.

### POST /trackables/activate
Body: { templateCode, goalOverrides?, scheduleOverrides? }
Creates user_trackable.

### GET /trackables/today
Returns the Today Cards payload for active trackables.

Response shape (example):
{
  "date": "2026-02-13",
  "cards": [
    {
      "userTrackableId": "...",
      "name": "Water",
      "goal": {"type":"target","unit":"ml","target":2500},
      "progress": {"value":1500, "unit":"ml", "met": false},
      "streak": {"current": 4, "best": 12},
      "pointsToday": 10,
      "quickActions": [{"type":"add","amount":250},{"type":"add","amount":500},{"type":"add","amount":750}]
    }
  ]
}

### POST /trackables/log
Body: { userTrackableId, occurredAt, valueNum?, valueText?, meta? }
Creates a log entry and triggers server recompute for that day/trackable.

### GET /trackables/{userTrackableId}
Detail view data + history summaries.

---

## Challenges
### GET /challenges/templates
Returns predefined challenge bundles (e.g., “Triathlon Base Week”, “Hydration + Sleep”).

### POST /challenges/join
Body: { challengeTemplateCode }
Activates multiple Trackables with default schedules.

---

## Social graph
### POST /social/follow-request
Body: { targetHandle }
Creates follow_edges status=pending.

### POST /social/follow-requests/{id}/accept
### POST /social/follow-requests/{id}/deny

### GET /social/connections
Returns:
- accepted following
- accepted followers
No private stats here.

---

## Leaderboards (privacy-safe)
### GET /leaderboards/following
Returns only the requester’s rank/score in the “following network”.

Response:
{
  "scope": "following",
  "day": "2026-02-13",
  "rank": 42,
  "score": 1880,
  "cohortSize": 315,
  "percentile": 0.87
}

### GET /leaderboards/followers
Same shape, scope="followers".

> Must NOT return lists of users, usernames, or surrounding ranks.

---

## Scoring and explanations
### GET /scoring/explanations?day=YYYY-MM-DD
Returns why points were earned (from points_ledger), safe for the user.

---

## Authorization rules (critical)
- Any endpoint that reveals stats about other users must require:
  - follow edge status=accepted AND
  - direction allowed by product rules
- Leaderboards must never reveal any other user’s data.
