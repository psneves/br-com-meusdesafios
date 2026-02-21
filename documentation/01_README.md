# Meus Desafios - Documentation Hub

This folder is the source of truth for building Meus Desafios, a gamified routine-tracking app for adults aged 25-35.

## Product thesis

Meus Desafios helps busy adults turn daily consistency into measurable results.

- Log routines quickly (most actions in 1-2 taps).
- Make progress visible through deterministic points and streaks.
- Keep one unified tracking model across 4 core challenges: Water, Diet Control, Sleep, and Physical Exercise.
- Keep social accountability optional and privacy-safe.

## Who this is for

Primary audience:
- Adults 25-35 balancing work, health, and personal goals.

Core jobs-to-be-done:
- "Help me stay consistent without adding friction to my day."
- "Show me clear progress so I keep going."
- "Let me share progress only when I choose."

## Documentation map

1. `02_System_Instructions.md`
Core operating prompt for PM/Architect decisions.
2. `03_Product_Requirements.md`
PRD: scope, goals, user stories, acceptance criteria.
3. `04_Data_Model.md`
Entity model, constraints, and persistence rules.
4. `05_API_Contracts.md`
HTTP contracts, auth, validation, and error envelopes.
5. `06_Scoring_Streaks_Rules.md`
Deterministic scoring/streak logic and anti-abuse rules.
6. `07_Leaderboards_Privacy.md`
Privacy model, threat controls, and leaderboard behavior.
7. `08_UI_UX_Design_System.md`
Interaction model and UI consistency standards.
8. `09_Backlog_Roadmap.md`
Phased delivery plan with release outcomes.
9. `10_Testing_Quality_Guardrails.md`
Quality gates, test matrix, and release checklist.

## Working order

- Start planning with `02_System_Instructions.md`.
- Validate feature intent in `03_Product_Requirements.md`.
- Implement persistence and APIs using `04_Data_Model.md` and `05_API_Contracts.md`.
- Implement game mechanics with `06_Scoring_Streaks_Rules.md`.
- Validate social/privacy behavior with `07_Leaderboards_Privacy.md`.
- Align UX with `08_UI_UX_Design_System.md`.
- Sequence work via `09_Backlog_Roadmap.md`.
- Block release unless `10_Testing_Quality_Guardrails.md` gates pass.

## Cross-document rules

- API examples use `/api/*` routes.
- Scoring, streaks, and ranks are server-authoritative.
- "Day" is determined using server-local date math (currently assumes `America/Sao_Paulo`). Per-user timezone configuration is not yet implemented.
- Social visibility is opt-in via accepted relationships only.
- Physical Exercise is one combined challenge with modalities: gym, run, cycling, and swim.
