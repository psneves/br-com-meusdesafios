# Product Requirements - Meus Desafios

## Product goals + audience

### Target audience

- Adults aged 25-35 seeking routine consistency with low daily friction.
- Users who value measurable progress over social exposure.

### Application goals

- Make routine logging fast enough to sustain daily use.
- Transform completed routines into transparent points and streaks.
- Keep 4 core challenges under one consistent interaction model.
- Support optional accountability via privacy-safe social features.

---

## Problem statement

Most habit and challenge apps fail because they are either too complex to log daily or too vague about progress rules.

Meus Desafios solves this by combining:
- quick, repeatable logging interactions
- explicit scoring rules
- stable day-by-day progress feedback
- optional social comparison without identity leakage

---

## Success metrics (MVP)

- Activation: users completes at least 2 core challenges in first session.
- Week-1 consistency: users log at least 4 of 7 days on one active challenge.
- Logging speed: common actions complete in under 20 seconds.
- Explainability: every points event has a readable reason.
- Privacy safety: zero endpoints expose other users' rank identity.

---

## Core concepts

### Core challenge

A challenge card shown on Today and tracked daily.

The app exposes 4 core challenges:
- Water
- Diet Control
- Sleep
- Physical Exercise

### Trackable engine

The internal rules engine still uses a unified trackable model so every challenge supports:
- goal type
- daily evaluation rules

### Challenge template

A predefined bundle of core challenges and starter configurations that accelerates onboarding.

### Day boundary

A "day" is currently evaluated using server-local date math (assumes `America/Sao_Paulo`). Per-user timezone configuration is not yet implemented.

---

## Functional requirements (MVP)

### Onboarding and setup
- Users have 4 challenges assigned once logging.
- Users can activate core challenges.
- Users can override goal/schedule defaults per challenge.
- Physical Exercise is activated once and logs modality-specific activity (gym, run, cycling, swim).

### Today experience

- Users can view the 4 core challenge cards in one list.
- Users can log common actions in 1-2 taps.
- Users can see immediate feedback: progress, points, streak impact.

### Detail experience (not yet implemented)

Each challenge detail screen will include:
- `Overview`: current week trend and status
- `Logs`: entries + add flow
- `Rules`: exact scoring and streak criteria

Currently, logging is done via modal dialogs on the Today page.

### Scoring + streaks

- Daily goal evaluation runs server-side.
- Base points and milestone bonuses are deterministic.
- Duplicate submissions do not double-award points.

### Social + privacy

- Follow request flow: request, accept, deny.
- Stats visibility requires accepted relationship.
- Leaderboards return only self rank output.

---

## Core user stories

### Tracking

- As a user, I can activate the core challenges relevant to me.
- As a user, I can log routine progress with minimal effort.
- As a user, I can quickly see if I met today's goal.

### Sleep

- As a user, I can track sleep duration.
- As a user, I can see streaks tied to sleep consistency.

### Diet Control

- As a user, I can mark per-meal diet compliance with a multi-meal checklist.

### Water

- As a user, I can quick-add water amounts with one tap.

### Physical Exercise

- As a user, I can log gym, run, cycling, or swim inside one Physical Exercise challenge.
- As a user, I can score exercise consistency without activating separate exercise cards.

### Social

- As a user, I can choose who can view my shared stats.
- As a user, I can see my rank without exposing other people.

---

## Non-functional requirements

- Privacy-controlled by default.
- Explainable scoring outputs.
- Deterministic recomputation from logs.
- API schema validation on all inputs and outputs.

---

## MVP out of scope

- Wearables auto-sync (Garmin, Strava, Apple Health)
- Rich nutrition diary/macros planner
- Messaging/comments/likes
- Public/global leaderboards
- Monetization and referrals

---

## Global acceptance criteria

- Common log actions require no more than 2 taps.
- Rules tab fully explains how scoring is computed.
- Day-based scoring remains correct across timezone boundaries.
- Leaderboards never return any other user's identity.