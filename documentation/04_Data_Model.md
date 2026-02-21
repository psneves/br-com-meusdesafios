# Data Model - Meus Desafios (Current Implemented Schema)

## Overview

This document describes the schema currently implemented by TypeORM entities and migrations in `packages/db/src/`.

---

## Core entities

### users

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `handle` (varchar(50), unique, not null)
- `first_name` (varchar(50), not null, default `''`)
- `last_name` (varchar(50), not null, default `''`)
- `display_name` (varchar(100), not null)
- `email` (varchar(255), unique, not null)
- `password_hash` (varchar(255), nullable)
- `google_id` (varchar, unique, nullable)
- `provider` (varchar(20), nullable)
- `avatar_url` (varchar, nullable)
- `latitude` (double precision, nullable)
- `longitude` (double precision, nullable)
- `location_updated_at` (timestamptz, nullable)
- `is_active` (boolean, not null, default `true`)
- `last_login_at` (timestamptz, nullable)
- `created_at` (timestamp, not null, default `now()`)
- `updated_at` (timestamp, not null, default `now()`)

### trackable_templates

System templates map to the 4 core challenges:
- `WATER`
- `DIET_CONTROL`
- `SLEEP`
- `PHYSICAL_EXERCISE`

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `code` (varchar(50), unique, not null)
- `name` (varchar(100), not null)
- `category` (enum: `WATER`, `DIET_CONTROL`, `SLEEP`, `PHYSICAL_EXERCISE`)
- `default_goal` (jsonb, not null)
- `default_scoring` (jsonb, not null)
- `description` (varchar(500), nullable)
- `icon` (varchar(50), nullable)

### user_trackables

User-specific challenge activation and overrides.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `user_id` (uuid, fk `users.id`, not null)
- `template_id` (uuid, fk `trackable_templates.id`, not null)
- `goal` (jsonb, not null)
- `schedule` (jsonb, not null)
- `scoring` (jsonb, not null)
- `is_active` (boolean, not null, default `true`)
- `start_date` (date, not null)
- `created_at` (timestamp, not null, default `now()`)

### trackable_logs

Authoritative input events.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `user_id` (uuid, fk `users.id`, not null)
- `user_trackable_id` (uuid, fk `user_trackables.id`, not null)
- `occurred_at` (timestamptz, not null)
- `value_num` (numeric, nullable)
- `value_text` (text, nullable)
- `meta` (jsonb, nullable)
- `created_at` (timestamp, not null, default `now()`)

Current exercise modality values used in `meta.exerciseModality` at app level:
- `GYM`
- `RUN`
- `CYCLING`
- `SWIM`

### computed_daily_stats

Daily cache for fast reads.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `user_id` (uuid, fk `users.id`, not null)
- `user_trackable_id` (uuid, fk `user_trackables.id`, not null)
- `day` (date, not null)
- `progress` (jsonb, not null)
- `met_goal` (boolean, not null)
- `points_earned` (int, not null)
- `updated_at` (timestamp, not null, default `now()`)

Constraint:
- unique (`user_trackable_id`, `day`)

### streaks

Current and best streak state.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `user_id` (uuid, fk `users.id`, not null)
- `user_trackable_id` (uuid, fk `user_trackables.id`, not null)
- `current_streak` (int, not null, default `0`)
- `best_streak` (int, not null, default `0`)
- `last_met_day` (date, nullable)
- `updated_at` (timestamp, not null, default `now()`)

Constraint:
- unique (`user_id`, `user_trackable_id`)

### points_ledger

Point events used for weekly/monthly aggregation.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `user_id` (uuid, fk `users.id`, not null)
- `day` (date, not null)
- `source` (enum: `trackable_goal`, `streak_bonus`, `penalty`, `admin`)
- `user_trackable_id` (uuid, fk `user_trackables.id`, nullable)
- `points` (int, not null)
- `reason` (text, not null)
- `created_at` (timestamp, not null, default `now()`)

### follow_edges

Relationship state controlling visibility.

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `requester_id` (uuid, fk `users.id`, not null)
- `target_id` (uuid, fk `users.id`, not null)
- `status` (enum: `pending`, `accepted`, `denied`, `blocked`, default `pending`)
- `created_at` (timestamp, not null, default `now()`)
- `updated_at` (timestamp, not null, default `now()`)

Constraint:
- unique (`requester_id`, `target_id`)

### leaderboard_snapshots

Snapshot table available in schema (currently not used by leaderboard service logic).

- `id` (uuid, pk, default `uuid_generate_v4()`)
- `scope_user_id` (uuid, fk `users.id`, not null)
- `scope_type` (enum: `following`, `followers`)
- `day` (date, not null)
- `rank` (int, not null)
- `score` (int, not null)
- `cohort_size` (int, not null)
- `percentile` (numeric(5,2), nullable)
- `created_at` (timestamp, not null, default `now()`)

---

## Indexes (implemented)

- `trackable_logs (user_trackable_id, occurred_at)`
- `computed_daily_stats (user_trackable_id, day)`
- `points_ledger (user_id, day)`
- `follow_edges (requester_id, target_id, status)`
- `leaderboard_snapshots (scope_user_id, scope_type, day)`

---

## Current invariants and behavior

- `trackable_logs` are the source of truth for day evaluation.
- `computed_daily_stats` and `streaks` are derived/cached state.
- Day strings are computed with local date getters in service code.
- `user_trackables.schedule.timezone` is persisted (default currently set to `America/Sao_Paulo` during auto-provisioning).
- `points_ledger` entries for `trackable_goal` / `streak_bonus` can be deleted and rewritten during recompute for the same day.
