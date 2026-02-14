# Backlog & Roadmap – Meus Desafios

## Milestone 0: Foundations (Week 1)
- [ ] Repo setup + lint/test tooling
- [ ] DB schema + migrations
- [ ] Auth scaffolding
- [ ] Seed trackable templates (Run/Bike/Swim/Gym/Sleep/Diet/Water)

## Milestone 1: Trackables MVP (Week 1–2)
### Epic: Today screen
- [ ] GET /trackables/today
- [ ] TrackableCard UI + quick actions
- [ ] POST /trackables/log (water, diet, gym first)

### Epic: Logs + detail
- [ ] Trackable detail screen
- [ ] Log list + add/edit minimal

## Milestone 2: Scoring engine (Week 2)
- [ ] Daily aggregation job/function
- [ ] Streak updates
- [ ] Points ledger
- [ ] Scoring explanations endpoint

## Milestone 3: Social graph + approvals (Week 3)
- [ ] Follow request flow
- [ ] Accept/deny
- [ ] Connection list

## Milestone 4: Leaderboards (Week 3–4)
- [ ] Following rank endpoint (rank only)
- [ ] Followers rank endpoint (rank only)
- [ ] Privacy checks + minimum cohort size behavior
- [ ] Snapshot or cache mechanism

---

## Sprint-ready 2-week plan (example)
### Week 1
- Day 1: DB schema + template seed
- Day 2: Activate trackables + Today endpoint
- Day 3: Today UI + water quick-add
- Day 4: Diet checklist + gym quick log
- Day 5: Detail screen + logs list

### Week 2
- Day 6: Scoring aggregation + base points
- Day 7: Streak engine + milestone bonuses
- Day 8: Points explanations UI
- Day 9: Social follow request + approvals
- Day 10: Leaderboard rank-only endpoints + privacy hardening

---

## Definition of done (MVP)
- Users can log daily trackables
- Points and streaks computed server-side and shown in UI
- Follow requests and acceptance gate stats visibility
- Leaderboards show only the requester’s rank/score (no neighbors)
