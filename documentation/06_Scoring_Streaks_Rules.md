# Scoring & Streak Rules - Meus Desafios

## Principles

- Server-calculated only
- Deterministic from logs + config
- Explainable to users in plain language
- Idempotent under retries and duplicate submissions

---

## Day attribution

- Every log is mapped to a day using server-local date math (currently assumes `America/Sao_Paulo`). Per-user timezone via `users.timezone` is not yet implemented.
- Recompute can be triggered for any affected day when backfilled logs arrive.
- Cross-midnight activities (for example sleep) are evaluated using challenge-specific rules.

---

## Goal types

1. `binary`
Met/not met.
2. `target`
Met when value is `>= target`.
3. `range`
Met when value is within `[min, max]`.
4. `time_window`
Met when event occurs within configured time boundary.

---

## Points model (MVP)

### Base points

- Meeting daily goal: `+10`
- Not meeting goal: `+0`

### Streak bonuses

- Perfect day (ALL challenges met on current day): `+10`
- Weekly goal (7/7 days met for a single challenge, Mon–Sun): `+10` per challenge
- Perfect week (ALL challenges met ALL 7 days, Mon–Sun): `+10`

Weekly bonuses are evaluated at the end of the ISO week (Monday–Sunday).

### Penalties

- No penalties in MVP to avoid punitive experience.

---

## Challenge evaluation rules

### Water

- Aggregate daily ml sum.
- Met when `total_ml >= target_ml`.

### Diet Control

Multi-meal checklist: user configures number of meals per day (3-7). Each meal can be marked as compliant or non-compliant. Met when compliant meals count reaches the configured target.

### Sleep

Duration-only logging: user logs hours of sleep via presets or slider. Met when `total_hours >= target_hours`. Bedtime tracking is not yet implemented.

### Physical Exercise

One combined exercise challenge with modality-specific logs:
- `gym`
- `run`
- `cycling`
- `swim`

MVP behavior:
- goal is duration-based (minutes)
- exercise logs carry an optional `exerciseModality` field in metadata
- met when configured daily duration target is reached across valid exercise logs

---

## Computation flow

For each `(user_trackable_id, day)`:
1. Aggregate raw logs into `progress_json`.
2. Evaluate `met_goal`.
3. Upsert `computed_daily_stats`.
4. Update streak state (`current`, `best`, `last_met_day`).
5. Write base point event when transitioning to met state.
6. Write streak bonus events when milestone thresholds are hit.
7. Delete existing ledger entries for the same trackable+day+source before inserting new ones.

---

## Recompute and idempotency

- Idempotency at the raw-log level (`trackable_logs.idempotency_key`) is **not yet implemented**. Duplicate prevention relies on client-side guards and rate limiting.
- Points ledger entries for `trackable_goal` and `streak_bonus` are **deleted and rewritten** during recompute for the same trackable+day (not append-only).
- Recompute is safe to run multiple times for the same day — the delete/rewrite approach ensures consistency.

---

## Anti-abuse controls (MVP)

- Rate limit log creation per user.
- Clamp input ranges by challenge type (for example max water/day, max exercise duration/day).
- Reject future timestamps beyond configured tolerance.
- Tag source in metadata (`manual`, `import`) for auditability.

---

## Explainability contract

Each ledger event must include:
- `source`
- `points`
- `reason`
- `reason_code`

Rules tab and explanations endpoint should render these without exposing internal implementation details.
