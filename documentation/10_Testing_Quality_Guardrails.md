# Testing, Quality & Guardrails – ChallengeOS

## Testing priorities
### 1) Scoring correctness
- Unit tests for each goal type:
  - binary, target, range, time window
- Unit tests for streak transitions:
  - increment, reset, milestone bonus
- Ledger tests:
  - points are not double-counted

### 2) Privacy enforcement
- Tests that reject access when follow status != accepted
- Tests that leaderboard endpoints never return other users
- Inference resistance:
  - no pagination
  - no top-N endpoints
  - minimum cohort size behavior

### 3) API contract tests
- Validate request/response schemas (zod or similar)
- Backward compatibility for mobile/web clients

---

## Quality guardrails
- Server is source of truth for:
  - daily progress
  - streaks
  - points
  - rank
- Keep points_ledger immutable
- Use migrations for schema changes
- Add observability:
  - audit scoring runs
  - track recalculation errors

---

## Edge cases to test
- Late-night logs (timezone boundaries)
- Sleep spanning midnight
- Duplicate logs and idempotency
- User deactivates/reactivates a trackable
- Cohort too small for leaderboard rank
- Blocking a user (future), ensure no visibility

---

## Security checks
- Authorization middleware required on every endpoint
- Validate inputs (limits: max water per day, max distance per day)
- Rate limiting on log creation

---

## Release checklist
- [ ] All scoring tests green
- [ ] Privacy tests green
- [ ] No endpoints returning other users in leaderboards
- [ ] Data migrations applied cleanly
- [ ] Basic monitoring enabled
