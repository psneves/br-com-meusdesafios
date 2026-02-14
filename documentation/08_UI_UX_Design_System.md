# UI/UX Design System – Consistent Trackables UI

## Primary UX goal
A user-friendly app with **one mental model**:
> “Everything I track is a Trackable with a goal.”

---

## Core screens (MVP)
### 1) Today (Home)
A list of **Trackable Cards** for active trackables.

Each card shows:
- Trackable name + icon
- Goal summary (e.g., 7km, 2500ml, bedtime <= 23:00)
- Progress bar / indicator
- Streak badge
- Points earned today
- Quick actions (1 tap)

**Quick actions examples**
- Water: +250 / +500 / +750 / custom
- Diet: Mark “Met” (toggle)
- Sleep: Mark sleep entry (bedtime + duration)
- Gym: Log session (quick)
- Run/Bike/Swim: Log distance or duration

### 2) Trackable Detail
Tabs:
- Overview: weekly trend + current stats
- Log: entries list + add button
- Rules: how to earn points/streaks (explainable)

### 3) Social
- Requests: pending follower requests (accept/deny)
- Connections: accepted followers/following list (names allowed here)
- Leaderboards: following/followers rank cards (rank only)

### 4) Challenges
- Browse templates
- Join challenge
- See what trackables it activates

---

## Design principles
- Consistency > customization in MVP
- Fewer taps > perfect accuracy
- Explain rewards immediately (points + streak)

---

## Component inventory (MVP)
- TrackableCard
- ProgressIndicator (bar/ring)
- QuickActionRow
- StreakBadge
- PointsChip
- DetailHeader
- Tabs (Overview / Log / Rules)
- LeaderboardRankCard

---

## Empty states
- No active trackables → prompt to join a template challenge
- No logs today → show simplest quick action

---

## Accessibility & clarity
- Always show units (km, ml, hours)
- Use color + text (don’t rely on color alone)
- Keep copy short; “Rules” tab clarifies details
