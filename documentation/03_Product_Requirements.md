# Product Requirements – Meus Desafios

## Goal
Build a gamified app to track life challenges with **standard Trackables**:
- Run, Bike, Swim, Gym, Sleep, Diet, Water

Users earn points and streaks, compete in private social rankings, and progress through challenges.

---

## Key concepts
### Trackable
A single unit of behavior to track, each with:
- goal type
- schedule (daily/weekly)
- logging method
- scoring and streak rules
- visibility rules

### Challenge template
A predefined bundle of Trackables + schedule + default scoring.

---

## Core user stories (MVP)
### Tracking
- As a user, I can activate Trackables from standard templates.
- As a user, I can log progress quickly today.
- As a user, I can see my current streaks, points, and progress.

### Sleep
- As a user, I can track sleep consistency (bedtime and/or hours).
- As a user, I can see streaks for sleep compliance.

### Diet
- As a user, I can track diet via checklists (met/not met).
- As a user, I can optionally log a single numeric (protein or calories).

### Water
- As a user, I can quickly log water with one tap (250/500/750 ml + custom).

### Social + privacy
- As a user, I can request to follow someone.
- As a user, I can accept/deny follow requests.
- As a user, I can see a leaderboard for my “accepted network” without seeing who is around me.

---

## Non-functional requirements
- **Privacy-first**: no stats visibility without acceptance.
- **Anti-leak**: leaderboard endpoints cannot be used to infer other users.
- **Server authoritative**: scoring, streaks, ranks computed on server.
- **Explainable scoring**: UI can show “why you earned points”.

---

## MVP out of scope (defer)
- Wearables integrations (Garmin/Strava/Apple Health)
- Full nutrition/macros diary
- Messaging, comments, likes
- Public leaderboards (outside accepted network)
- Paid plans, referrals, badges marketplace

---

## UX principles
- “Daily cockpit” **Today screen** with Trackable cards.
- One consistent interaction model:
  - view progress → quick log → feedback (streak + points)
- Minimal friction (few taps) and clarity on rules.

---

## Acceptance criteria (global)
- Logging must not require more than **2 taps** for common actions (water add, checklist complete).
- Streak rules must be consistent and shown in **Rules tab**.
- Leaderboards must never reveal neighbors’ identities or ranking order.
