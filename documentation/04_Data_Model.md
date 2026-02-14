# Data Model – Meus Desafios (Postgres-first)

## Overview
Model around:
- Users
- Trackables (templates + user instances)
- Logs (entries)
- Computed stats (streaks, points)
- Social graph (follow requests + approvals)
- Leaderboard snapshots (privacy-safe)

---

## Entities (suggested)

### users
- id (uuid, pk)
- handle (unique)
- display_name
- created_at

### trackable_templates
Defines standard Trackables (Run/Bike/Swim/Gym/Sleep/Diet/Water).
- id (uuid, pk)
- code (unique, e.g., "WATER_DAILY")
- name
- category (enum)
- default_goal_json (jsonb)
- default_scoring_json (jsonb)

### user_trackables
A user’s activated instance of a template.
- id (uuid, pk)
- user_id (fk users)
- template_id (fk trackable_templates)
- goal_json (jsonb)          -- user override
- schedule_json (jsonb)      -- daily/weekly, timezone, active days
- scoring_json (jsonb)       -- user override (rare)
- is_active (bool)
- start_date

### trackable_logs
Authoritative input events.
- id (uuid, pk)
- user_id
- user_trackable_id
- occurred_at (timestamptz)  -- when it happened
- value_num (numeric, nullable)
- value_text (text, nullable)
- meta_json (jsonb, nullable) -- e.g., source, notes
- created_at

Examples:
- Water: value_num=500 (ml)
- Run: value_num=6.2 (km) or 35 (minutes) + meta_json unit
- Diet checklist: value_text="MET" or meta_json {items:[...]}
- Sleep: meta_json {bedtime:"22:45", duration_min:420}

### computed_daily_stats
Cache daily progress by trackable for speed.
- id (uuid)
- user_id
- user_trackable_id
- day (date)
- progress_json (jsonb)      -- totals, flags
- met_goal (bool)
- points_earned (int)
- updated_at

### streaks
- id (uuid)
- user_id
- user_trackable_id
- current_streak (int)
- best_streak (int)
- last_met_day (date)
- updated_at

### points_ledger
Immutable points events.
- id (uuid)
- user_id
- day (date)
- source (enum: trackable_goal, streak_bonus, penalty, admin)
- user_trackable_id (nullable)
- points (int)
- reason (text)
- created_at

### follow_edges
Controls visibility.
- id (uuid)
- requester_id (fk users)  -- who wants to follow
- target_id (fk users)     -- who is being followed
- status (enum: pending, accepted, denied, blocked)
- created_at
- updated_at

### leaderboard_memberships
Defines which “network leaderboard” a user participates in (accepted-only).
Option A (simpler): derive at query time from follow_edges accepted.
Option B (faster): materialize accepted graph periodically.

### leaderboard_snapshots
Privacy-safe snapshots per scope (following/followers).
- id (uuid)
- scope_user_id (uuid)     -- user for whom this snapshot is computed
- scope_type (enum: following, followers)
- day (date)
- rank (int)
- score (int)
- cohort_size (int)
- percentile (numeric, nullable)
- created_at

> Important: store only the requesting user’s rank/score in the snapshot for privacy.

---

## Indexing
- trackable_logs (user_trackable_id, occurred_at desc)
- computed_daily_stats (user_trackable_id, day)
- follow_edges (requester_id, target_id, status)
- points_ledger (user_id, day)

---

## Notes
- Keep points_ledger immutable to audit scoring.
- Use computed_daily_stats and streaks as caches; recompute from logs if needed.
