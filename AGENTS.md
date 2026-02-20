# AGENTS.md

This repository uses `CLAUDE.md` files as the primary implementation guidance.

## Codex Bootstrapping

When Codex starts work in this repo, it should load guidance in this order:

1. `CLAUDE.md` (monorepo-wide rules, product model, architecture)
2. `apps/web/CLAUDE.md` when working in the web app
3. `documentation/*.md` as the source of truth for product and technical specs

## Working Rules

- Follow the documented 4 core challenges model:
  - Water
  - Diet Control
  - Sleep
  - Physical Exercise (gym/run/cycling/swim)
- Keep API and data-model decisions aligned with `documentation/04_Data_Model.md` and `documentation/05_API_Contracts.md`.
- Keep scoring behavior aligned with `documentation/06_Scoring_Streaks_Rules.md`.
- Treat documentation updates as required when behavior or domain rules change.
