# Testing, Quality & Guardrails - Meus Desafios

## Quality goals

- Scoring and streak logic is deterministic and auditable.
- Privacy constraints are enforced at API and data-access layers.
- Logging flows remain fast and stable. Idempotency at the raw-log level is not yet implemented.

---

## Test strategy

### 1. Unit tests (logic core)

Scoring engine:
- `binary`, `target`, `range`, `time_window` evaluation
- streak transitions: increment, reset, milestones
- dedupe behavior for repeated recompute

Validation layer:
- payload schema validation
- numeric bounds per core challenge category
- physical exercise modality validation (`gym`, `run`, `cycling`, `swim`)

### 2. Integration tests (service + DB)

- log creation -> daily recompute -> ledger writes
- duplicate log handling and rate limiting
- recompute correctness after backfilled logs

### 3. API contract tests

- request/response shape validation
- error envelope consistency
- backward compatibility for mobile/web clients

### 4. Privacy/security tests

- friend request status access matrix (`pending`, `accepted`, `denied`, `blocked`)
- leaderboard endpoints return self result only
- no top-N, no pagination, no neighbor leakage

### 5. UI behavior tests

- Today quick actions update progress correctly
- Rules tab content is visible and understandable
- rank unavailable state is rendered clearly

---

## Critical edge cases

- timezone boundaries around midnight
- sleep logs spanning midnight
- duplicate log requests
- out-of-order/backfilled logs
- challenge deactivation/reactivation
- physical exercise logs across mixed modalities in the same day
- blocked users removed from social visibility

---

## Operational guardrails

- server is source of truth for points, streaks, and rank
- points ledger entries are deleted/rewritten per trackable+day during recompute (not append-only)
- all schema changes use migrations
- scoring jobs emit audit logs and error telemetry

---

## Performance and reliability checks

- P95 latency targets for Today and logging endpoints
- leaderboard endpoint caching strategy validated
- recompute jobs delete/rewrite ledger safely without double-awards

---

## Release checklist

- [ ] Scoring unit/integration tests pass
- [ ] Privacy/security tests pass
- [ ] API contracts validated against schemas
- [ ] No leaderboard response exposes other user identity
- [ ] Migration and rollback scripts verified
- [ ] Monitoring dashboards and alerts enabled
