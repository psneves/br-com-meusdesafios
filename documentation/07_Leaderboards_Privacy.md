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

1. `following`
Compare user with accepted users they follow.
2. `followers`
Compare user with accepted users who follow them.

Both scopes are derived from accepted `follow_edges`.

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
- Minimum cohort size rule: if `< 5`, rank unavailable.
- Apply rate limiting and response caching to rank endpoints.

---

## API output rules

When cohort is sufficient:

```json
{
  "scope": "following",
  "rank": 42,
  "score": 1880,
  "cohortSize": 315,
  "percentile": 0.87,
  "rankStatus": "available"
}
```

When cohort is too small:

```json
{
  "scope": "following",
  "rank": null,
  "score": 1880,
  "cohortSize": 3,
  "percentile": null,
  "rankStatus": "insufficient_cohort"
}
```

---

## UX copy guidance

Use motivating but privacy-safe language:
- "Your position this week"
- "Rank unavailable: not enough participants yet"
- "You are in the top 15%"

Avoid language that implies named competition.
