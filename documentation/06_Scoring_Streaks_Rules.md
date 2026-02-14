# Scoring & Streak Rules - Meus Desafios

## Principles

- Server-calculated only
- Deterministic from logs + config
- Explainable to users in plain language
- Idempotent under retries and duplicate submissions

---

## Day attribution

- Every log is mapped to a user-local day based on `users.timezone`.
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

### Streak milestones

- Day 3: `+5`
- Day 7: `+10`
- Day 14: `+20`
- Day 30: `+50`

Milestones are awarded once when crossing each threshold.

### Penalties

- No penalties in MVP to avoid punitive experience.

---

## Challenge evaluation rules

### Water

- Aggregate daily ml sum.
- Met when `total_ml >= target_ml`.

### Diet Control

Mode A (default): checklist compliance event (`MET` / `NOT_MET`).

Mode B (optional): one numeric metric:
- protein target (`>= target`) or
- calories range (`min <= value <= max`)

### Sleep

Config options:
- minimum duration
- latest bedtime
- both combined

Met when all configured conditions are true.

### Physical Exercise

One combined exercise challenge with modality-specific logs:
- `gym`
- `run`
- `cycling`
- `swim`

MVP behavior:
- goal can be duration, distance, or session completion
- each exercise log must carry `exercise_modality`
- met when configured daily target is reached across valid exercise logs
- detail UI can break down totals per modality, while scoring is challenge-level

---

## Computation flow

For each `(user_trackable_id, day)`:
1. Aggregate raw logs into `progress_json`.
2. Evaluate `met_goal`.
3. Upsert `computed_daily_stats`.
4. Update streak state (`current`, `best`, `last_met_day`).
5. Write base point event when transitioning to met state.
6. Write streak bonus events when milestone thresholds are hit.
7. Ensure all ledger inserts use dedupe keys.

---

## Dedupe and idempotency

- `trackable_logs.idempotency_key` prevents duplicate raw entries.
- `points_ledger.dedupe_key` prevents double-awarding points.
- Recompute is safe to run multiple times for the same day.

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
