# Leaderboards & Privacy – Meus Desafios

## Problem statement
Users want a social rank, but must not see:
- who is directly above/below them
- ordered lists of others
- any stats of non-accepted relationships

Also: leaderboards must not leak identities via endpoints.

---

## Privacy-safe leaderboard strategy (recommended)
Return **only the requesting user’s**:
- rank number
- score
- cohort size
- optional percentile band

Never return:
- usernames
- user IDs of others
- neighbor ranks
- paginated lists

---

## Scopes (two ranks)
1) **Following rank**: compare user vs accepted users they follow
2) **Followers rank**: compare user vs accepted users who follow them

> Both scopes are derived from follow_edges where status=accepted.

---

## Computing rank without leaking data
### Option A (MVP, simplest)
Compute rank server-side on request:
- Determine cohort user IDs (accepted graph)
- Compute scores for cohort (pre-aggregated daily totals recommended)
- Determine user rank among cohort
- Return only the user’s rank fields

Security:
- Ensure the request is authenticated
- Do not return cohort IDs
- Add query result caps and caching

### Option B (recommended as scaling grows)
Nightly (or hourly) job:
- Precompute each user’s rank for each scope
- Store only that user’s rank in leaderboard_snapshots
- API reads from snapshot

This prevents timing attacks and heavy queries.

---

## Preventing inference attacks
- Do not provide “rank of a specific other user”.
- Do not provide endpoints like “top N”.
- Avoid letting users vary cohort filters that could isolate individuals.
- Consider minimum cohort size: if cohort_size < 5, return only score and “rank unavailable”.

---

## Visibility model
### Accepted relationship
If A requests to follow B and B accepts:
- A can see B’s shared “numbers” (as allowed)
- B can choose what is shared (MVP: share all core stats)

MVP simplification:
- Acceptance grants visibility to core aggregated stats only (not raw logs).

---

## What is safe to share (MVP)
- daily totals and streak counts per trackable
- total points
- challenge participation (optional)
Not safe:
- exact timestamps of sleep
- raw logs, notes, location (future)

---

## API response examples
See `05_API_Contracts.md` for exact response shape.

---

## UX copy suggestion
Leaderboard screen:
- “Your position this week”
- “You are #42 out of 315”
- “Top 15%”
No names displayed.
