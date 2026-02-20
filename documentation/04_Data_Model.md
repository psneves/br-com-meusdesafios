# Data Model - Meus Desafios (Postgres-first)

## Overview

Data model supports:
- routine tracking and daily evaluation
- deterministic points/streak computation
- optional social visibility controls
- privacy-safe leaderboard outputs

---

## Core entities

### users

- `id` (uuid, pk)
- `handle` (text, unique)
- `display_name` (text)
- `timezone` (text, default `UTC`)
- `created_at` (timestamptz)

### trackable_templates

Standard system templates map to 4 core challenges:
- `WATER`
- `DIET_CONTROL`
- `SLEEP`
- `PHYSICAL_EXERCISE`

- `id` (uuid, pk)
- `code` (text, unique)
- `name` (text)
- `category` (enum: `water`, `diet_control`, `sleep`, `physical_exercise`)
- `default_goal_json` (jsonb)
- `default_schedule_json` (jsonb)
- `default_scoring_json` (jsonb)
- `is_active` (bool)

### user_trackables

User-specific activation and overrides.

- `id` (uuid, pk)
- `user_id` (fk users)
- `template_id` (fk trackable_templates)
- `goal_json` (jsonb)
- `schedule_json` (jsonb)
- `scoring_json` (jsonb)
- `is_active` (bool)
- `start_date` (date)
- `created_at` (timestamptz)

Recommended constraints:
- one active challenge/trackable per `(user_id, template_id)`

### trackable_logs

Authoritative input events.

- `id` (uuid, pk)
- `user_id` (fk users)
- `user_trackable_id` (fk user_trackables)
- `occurred_at` (timestamptz)
- `value_num` (numeric, nullable)
- `value_text` (text, nullable)
- `meta_json` (jsonb, nullable)
- `meta_json.exercise_modality` (enum when category is physical exercise: `gym`, `run`, `cycling`, `swim`)
- `idempotency_key` (text, nullable)
- `created_at` (timestamptz)

Recommended constraints:
- unique `(user_id, idempotency_key)` when key is present

### computed_daily_stats

Daily cache for fast reads.

- `id` (uuid, pk)
- `user_id` (fk users)
- `user_trackable_id` (fk user_trackables)
- `day` (date)
- `progress_json` (jsonb)
- `met_goal` (bool)
- `points_earned` (int)
- `updated_at` (timestamptz)

Recommended constraints:
- unique `(user_trackable_id, day)`

### streaks

Current and best streak state.

- `id` (uuid, pk)
- `user_id` (fk users)
- `user_trackable_id` (fk user_trackables)
- `current_streak` (int)
- `best_streak` (int)
- `last_met_day` (date, nullable)
- `updated_at` (timestamptz)

Recommended constraints:
- unique `(user_trackable_id)`

### points_ledger

Immutable point awards.

- `id` (uuid, pk)
- `user_id` (fk users)
- `day` (date)
- `source` (enum: `trackable_goal`, `streak_bonus`, `admin_adjustment`)
- `user_trackable_id` (fk user_trackables, nullable)
- `points` (int)
- `reason` (text)
- `reason_code` (text)
- `dedupe_key` (text)
- `created_at` (timestamptz)

Recommended constraints:
- unique `(dedupe_key)`

### follow_edges

Relationship state controlling visibility.

- `id` (uuid, pk)
- `requester_id` (fk users)
- `target_id` (fk users)
- `status` (enum: `pending`, `accepted`, `denied`, `blocked`)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Recommended constraints:
- unique `(requester_id, target_id)`
- disallow self-follow (`requester_id != target_id`)

### leaderboard_snapshots

Privacy-safe rank snapshots per user and scope.

- `id` (uuid, pk)
- `scope_user_id` (fk users)
- `scope_type` (enum: `following`, `followers`)
- `day` (date)
- `rank` (int, nullable)
- `score` (int)
- `cohort_size` (int)
- `percentile` (numeric, nullable)
- `rank_status` (enum: `available`, `insufficient_cohort`)
- `created_at` (timestamptz)

Recommended constraints:
- unique `(scope_user_id, scope_type, day)`

---

## Indexing strategy

- `trackable_logs (user_trackable_id, occurred_at desc)`
- `trackable_logs (user_id, occurred_at desc)`
- `computed_daily_stats (user_trackable_id, day)`
- `points_ledger (user_id, day)`
- `follow_edges (requester_id, status)`
- `follow_edges (target_id, status)`
- `leaderboard_snapshots (scope_user_id, day)`

---

## Invariants

- `points_ledger` is immutable.
- `computed_daily_stats` and `streaks` are caches; logs are source of truth.
- Day evaluation uses `users.timezone`.
- Leaderboard snapshots never store other users' identities.
