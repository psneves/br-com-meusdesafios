# UI/UX Design System - Consistent Challenge UI

## Primary UX goal

Deliver a low-friction consistency loop for adults 25-35:
- cue: Today card shows what matters now
- action: quick log in 1-2 taps
- reward: immediate feedback (progress + points + streak)

Mental model:
"Everything I track is a challenge with a goal."

Product simplification:
- 4 core challenge cards: Water, Diet Control, Sleep, Physical Exercise
- Physical Exercise combines gym, run, cycling, and swim in one card

---

## Experience principles

- Consistency over novelty in MVP
- Clarity over dense data views
- Fast logging over perfect detail capture
- Explain rewards immediately after each action
- Keep most daily interactions under 30 seconds

---

## Core screens

### 1. Today (home)

A vertically scannable list of core challenge cards.

Each card includes:
- challenge identity (name + icon)
- goal summary with unit
- progress indicator
- streak badge
- points earned today
- quick actions

### 2. Challenge detail (not yet implemented)

Planned tabs:
- `Overview`: trends, status, and summary metrics
- `Logs`: entries list and add interaction
- `Rules`: transparent scoring logic

Currently, logging is done via modal dialogs on the Today page.

### 3. Social

- friend requests inbox (accept/deny)
- sent friend requests list
- suggested users with "Adicionar" action
- rank cards (self rank only)

### 4. Challenges (not yet implemented)

Planned:
- challenge template list (built around the 4 core challenges)
- join action
- clear list of activated challenges

Currently, challenges are auto-provisioned on first login.

---

## Interaction patterns

### Quick actions by category

- Water: `+100`, `+200`, `+250`, `+300`, `+500`, `+750`, `+1000`
- Diet Control: multi-meal checklist (per-meal compliant/non-compliant toggle)
- Sleep: duration presets and slider (hours)
- Physical Exercise: modality picker (`gym`, `run`, `cycling`, `swim`) + duration input

### Feedback states

After logging, always show:
- success confirmation
- updated progress
- point delta (if any)
- streak impact (if any)

---

## Content and copy rules

- Always display units (`ml`, `km`, `min`, `h`).
- Keep labels short and direct.
- Use plain-language rules; avoid internal jargon.
- Never use copy that reveals other users' identities in ranking contexts.

---

## Accessibility baseline

- Never rely on color alone for status.
- Keep contrast and legibility high.
- Provide clear touch targets for one-thumb usage.
- Support keyboard and screen-reader-friendly semantics for web.

---

## Empty and edge states

- No active challenges: prompt core challenge activation.
- No logs today: emphasize quickest next action.
- Rank unavailable: explain that location is required for nearby scope.
