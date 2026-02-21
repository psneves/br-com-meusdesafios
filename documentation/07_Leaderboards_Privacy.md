# Leaderboards & Privacy - Meus Desafios

## Objective

Provide motivational social ranking for adults 25-35 without exposing other users' identities or detailed behavior.

---

## Privacy guarantees

Leaderboard APIs return only the requesting user's:
- rank
- score
- cohort size
- percentile
- rank availability status

Leaderboard APIs never return:
- usernames or IDs of others
- ordered participant lists
- direct neighbors above/below
- filters that isolate individuals

---

## Visibility states

### Relationship rules

- `pending`: no stats visibility
- `accepted`: aggregated stats visibility allowed
- `denied`: no visibility
- `blocked`: no visibility in either direction; remove from cohorts

### Shared data in MVP

Allowed:
- per-challenge daily totals (aggregated)
- physical exercise totals with optional modality split (gym/run/cycling/swim)
- streak counts
- total points

Not allowed:
- raw log entries
- exact timestamps for sensitive behaviors (sleep, location)
- free-text notes

---

## Leaderboard scopes

1. `friends`
Compare user with all accepted mutual friends (accepted `follow_edges` in either direction).
2. `nearby`
Compare user with nearby users within a configurable radius (50/100/500 km).

Social scope is derived from accepted `follow_edges` using a UNION query (requester OR target).

---

## Rank computation strategy

### MVP option: on-demand with cache

- Build cohort from accepted graph
- Compute score snapshot for day/week window
- Compute requester rank
- Return requester result only

### Scaling option: precomputed snapshots

- periodic rank job (hourly or daily)
- write one row per user/scope/day in `leaderboard_snapshots`
- API reads direct snapshot

This reduces timing-based inference risk and query load.

---

## Inference attack prevention

- No top-N or pagination endpoints.
- No endpoint to query rank of arbitrary user.
- Rate limiting and response caching for rank endpoints are not yet implemented.

---

## API output rules

The response contains `overall` (aggregate rank) and `challengeRanks` (per-category ranks).

`rankStatus` values: `"available"`, `"no_location"` (nearby scope without user location).

When cohort is available:

```json
{
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
```

---

## UX copy guidance

Use motivating but privacy-safe language:
- "Your position this week"
- "You are in the top 15%"

Avoid language that implies named competition.
