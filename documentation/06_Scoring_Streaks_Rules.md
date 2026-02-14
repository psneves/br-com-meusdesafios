# Scoring & Streak Rules – Meus Desafios (Explainable + Deterministic)

## Principles
- **Server-calculated**
- Deterministic given logs
- Explainable (store reasons)
- MVP: avoid complex multipliers

---

## Goal types
1) **Binary**: met/not met (Diet checklist, Gym session done)
2) **Target amount**: reach >= target (Water ml, Run km)
3) **Range**: within min/max (Calories range)
4) **Time window**: do action within window (Sleep before 23:00)

---

## Default points (MVP)
### Base points
- Meeting daily goal: **+10**
- Partial progress: **0** (keep simple for MVP; add partial later)

### Streak bonus
- Streak day 3: **+5**
- Streak day 7: **+10**
- Streak day 14: **+20**
- Streak day 30: **+50**

> Bonus awarded once when hitting the milestone day.

### Penalties (MVP)
- None (avoid negative feelings). Consider later as optional.

---

## Trackable-specific MVP rules

### Water
- Goal: target ml/day (e.g., 2500 ml)
- Logs: add ml increments
- Met if total_ml >= target_ml
- Streak increments per day met.

### Diet
**Mode A (MVP default): checklist**
- Goal: “met” boolean per day
- Logs: one event marking met/not
- Met if checklist_met=true

**Mode B (optional): single numeric**
- Goal: protein >= target OR calories within range
- Met if numeric criteria satisfied

### Sleep
- Goal: duration >= X hours AND/OR bedtime <= target time
- Met if configured condition satisfied
- Streak per day met

### Run/Bike/Swim
- Goal: distance OR duration
- Met if totals meet target
- Optional later: intensity zones

### Gym
- Goal: sessions/week OR minutes/session
- MVP: daily met = session logged OR minutes >= target
- Weekly goals can be represented as daily placeholders or weekly evaluation.

---

## Computation flow (server)
For each (user_trackable, day):
1. Aggregate logs into a daily progress object
2. Evaluate met_goal
3. If met_goal changed from false→true, award base points (if not already awarded)
4. Update streaks (current/best/last_met_day)
5. If streak hits milestone, award bonus points
6. Write all point awards into points_ledger with reason

---

## Anti-cheat (lightweight MVP)
- Rate limits on logging
- Ignore impossible values (e.g., 50L water/day)
- Keep meta_json source=manual/import for future trust scoring
