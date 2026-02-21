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
- [ ] repo setup, lint, format, test scripts
- [ ] DB schema + migrations
- [ ] seed 4 core challenge templates (`WATER`, `DIET_CONTROL`, `SLEEP`, `PHYSICAL_EXERCISE`)
- [ ] auth/session middleware baseline

Exit criteria:
- app boots locally
- migrations apply cleanly
- templates are queryable

## Phase 1 - Tracking MVP (Week 1-2)

Outcomes:
- fully usable Today flow
- quick logging for primary categories
- detail pages with rules visibility
- combined Physical Exercise experience (gym/run/cycling/swim in one card)

Key tasks:
- [ ] `GET /api/trackables/today`
- [ ] `POST /api/trackables/log`
- [ ] Today cards + quick actions UI
- [ ] Challenge detail (`Overview | Logs | Rules`)
- [ ] Physical Exercise modality logging and aggregation

Exit criteria:
- common log actions in <= 2 taps
- UI reflects updated progress after log

## Phase 2 - Scoring engine (Week 2)

Outcomes:
- deterministic points and streak mechanics
- explainability endpoint and UI surface

Key tasks:
- [ ] daily aggregation pipeline
- [ ] streak evaluator
- [ ] immutable points ledger writes with dedupe keys
- [ ] `GET /api/scoring/explanations`

Exit criteria:
- scoring tests pass for all goal types
- no duplicate point awards under retries

## Phase 3 - Social graph (Week 3)

Outcomes:
- friend request controls and accepted visibility gating (mutual/symmetric model)

Key tasks:
- [ ] friend request endpoints (send/accept/deny/cancel)
- [ ] accept/deny flows with auto-accept for mutual requests
- [ ] friends list and explore page

Exit criteria:
- non-accepted relationships cannot access private stats

## Phase 4 - Leaderboards (Week 3-4)

Outcomes:
- rank-only leaderboard with inference resistance

Key tasks:
- [ ] `GET /api/leaderboards/rank?scope=friends|nearby`
- [ ] minimum cohort behavior
- [ ] snapshot/cache strategy

Exit criteria:
- endpoints expose self-rank only
- insufficient cohort returns rank unavailable

---

## Prioritized backlog (P0/P1)

P0:
- [ ] timezone-safe day attribution
- [ ] idempotent logging and point awards
- [ ] rules tab content generation from config
- [ ] privacy middleware coverage on all social/rank endpoints

P1:
- [ ] challenge templates and join flow polish
- [ ] weekly summary cards
- [ ] reminder scheduling hooks

---

## Risks and mitigations

- Risk: users lose trust if points look inconsistent.
Mitigation: deterministic recompute + explanation logs.

- Risk: social features create privacy concerns.
Mitigation: accepted-only visibility and rank-only leaderboard outputs.

- Risk: friction reduces logging frequency.
Mitigation: strict interaction budget and quick actions first.
