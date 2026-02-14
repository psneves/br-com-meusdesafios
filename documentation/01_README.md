# Meus Desafios – Cloud Code AI Training Pack

This folder contains 10 markdown files designed to configure and train an AI coding assistant to build **Meus Desafios**: a privacy-first, gamified life-challenges tracking app.

## How to use (recommended workflow)

1. Start with **02_System_Instructions.md** as the core system/behavior prompt for your AI.
2. Keep **03_Product_Requirements.md** as the product source of truth.
3. Use **04_Data_Model.md** + **05_API_Contracts.md** when coding backend and DB migrations.
4. Use **06_Scoring_Streaks_Rules.md** + **07_Leaderboards_Privacy.md** to implement gamification safely.
5. Use **08_UI_UX_Design_System.md** to keep UI consistent across trackables.
6. Use **09_Backlog_Roadmap.md** to plan sprints and incremental delivery.
7. Use **10_Testing_Quality_Guardrails.md** to enforce correctness, fairness, and privacy.

## Guiding principles

- **Unified Trackables:** Run, Bike, Swim, Gym, Sleep, Diet, Water all behave consistently.
- **Server authoritative:** points, streaks, and ranks are calculated on the server.
- **Privacy first:** follower approvals gate access to stats; leaderboards never leak neighbors.
- **MVP first:** ship quickly, then iterate.

## Suggested repo structure (example)

- `/apps/web` (Next.js UI)
- `/apps/api` (Node/Next API or separate service)
- `/packages/shared` (types, validation, scoring helpers)
- `/infra` (db, migrations, CI)

> Tip: Keep these markdown files in your repo under `/docs/ai/` and reference them in prompts.
