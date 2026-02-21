# Backlog & Roadmap - Meus Desafios

## Product outcomes this roadmap targets

- Help adults 25-35 sustain routine consistency with low-friction logging.
- Make progress transparent through points, streaks, and rules clarity.
- Keep social motivation optional and privacy-safe.

---

## Phase plan

## Phase 0 - Foundations (Week 1)

Outcomes:
- baseline monorepo quality tooling and CI
- schema and migrations for core challenges + scoring + social graph
- auth scaffolding

Key tasks:
- [x] repo setup, lint, format, test scripts
- [x] DB schema + migrations
- [x] seed 4 core challenge templates (`WATER`, `DIET_CONTROL`, `SLEEP`, `PHYSICAL_EXERCISE`)
- [x] auth/session middleware baseline

Exit criteria:
- app boots locally
- migrations apply cleanly
- templates are queryable

## Phase 1 - Tracking MVP (Week 1-2)

Outcomes:
- fully usable Today flow
- quick logging for primary categories
- combined Physical Exercise experience (gym/run/cycling/swim in one card)

Key tasks:
- [x] `GET /api/trackables/today`
- [x] `POST /api/trackables/log`
- [x] Today cards + quick actions UI
- [ ] Challenge detail (`Overview | Logs | Rules`) — not yet implemented
- [x] Physical Exercise modality logging and aggregation

Exit criteria:
- common log actions in <= 2 taps
- UI reflects updated progress after log

## Phase 2 - Scoring engine (Week 2)

Outcomes:
- deterministic points and streak mechanics

Key tasks:
- [x] daily aggregation pipeline
- [x] streak evaluator
- [x] points ledger writes (delete/rewrite per trackable+day during recompute)
- [ ] `GET /api/scoring/explanations` — not yet implemented

Exit criteria:
- scoring tests pass for all goal types
- no duplicate point awards under retries

## Phase 3 - Social graph (Week 3)

Outcomes:
- friend request controls and accepted visibility gating (mutual/symmetric model)

Key tasks:
- [x] friend request endpoints (send/accept/deny/cancel)
- [x] accept/deny flows with auto-accept for mutual requests
- [x] friends list and explore page

Exit criteria:
- non-accepted relationships cannot access private stats

## Phase 4 - Leaderboards (Week 3-4)

Outcomes:
- rank-only leaderboard with inference resistance

Key tasks:
- [x] `GET /api/leaderboards/rank?scope=friends|nearby`
- [x] minimum cohort behavior
- [ ] snapshot/cache strategy — not yet implemented

Exit criteria:
- endpoints expose self-rank only
- insufficient cohort returns rank unavailable

---

## Prioritized backlog (P0/P1)

P0:
- [ ] timezone-safe day attribution (currently uses server-local time)
- [ ] idempotent logging (no idempotency key yet)
- [ ] rules tab content generation from config
- [ ] challenge detail page (`Overview | Logs | Rules`)

P1:
- [ ] challenge templates and join flow polish
- [x] weekly summary cards
- [ ] reminder scheduling hooks
- [ ] rate limiting and caching for leaderboard endpoint

---

## Risks and mitigations

- Risk: users lose trust if points look inconsistent.
Mitigation: deterministic recompute + explanation logs.

- Risk: social features create privacy concerns.
Mitigation: accepted-only visibility and rank-only leaderboard outputs.

- Risk: friction reduces logging frequency.
Mitigation: strict interaction budget and quick actions first.
