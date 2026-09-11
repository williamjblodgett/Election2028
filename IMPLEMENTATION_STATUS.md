# Astra implementation status

Approved direction: monthly presidency (96 turns), concurrent 2032 campaign and
governing, accessible strategy, tested GitHub Pages release waves. Preserve the
static PWA, 2D presentation, and all existing candidate types.

## Delivery gates

- [ ] Wave 1: command validation, action slots, ad saturation/pricing, spending
  ledger, save-v4 routing and backup, cabinet/war continuity, immutable elections,
  read-only previews, gated deployment and deployed-build verification.
- [ ] Wave 2: save-v5 monthly calendar, concurrent reelection, fiscal reconciliation,
  outcome-based promises, unified conflicts, cabinet/court/congress continuity.
- [ ] Wave 3: decision-first mobile UI, accessible controls, deduplicated politician
  identities, search/comparison/rematch, offline geographic world map, 2D polish.
- [ ] Wave 4: 30 primary + 60 substantive general questions, contextual answers,
  evidence-based follow-ups, immutable accurate elections, six four-stage arcs.
- [ ] Wave 5: 1,000 seeded balance runs, three genuine UI lifecycle playthroughs,
  eight-year legacy, final live checks and release notes.

## Verification log

Baseline audit: 32 simulation tests and eight browser smoke tests passed, but
targeted probes exposed the failures listed in ASTRA_REVIEW_2026-09-11.md.
No wave is complete solely because the old smoke tests pass.

### Reliability release 1a — 2026-09-11

Implemented shared campaign command validation, three weekly action slots,
duplicate-visit prevention, cumulative ad saturation, exact $50K budget steps,
transaction receipts, command spending records, save-v4 backup/recovery and
screen routing, iron-mode checkpoint rules, immutable election replay, active-war
continuity, new-cabinet precedence, active-minister bonuses, read-only coalition
previews, accessible modal focus, and test-gated Pages artifacts with commit checks.
Updates now offer a save-and-reload control instead of replacing code mid-session.

Verification: 39/39 Node tests; 8/8 Playwright smoke tests; artifact build and
JavaScript syntax checks pass. The three required full UI careers have NOT yet
been performed. Remaining wave-1 work includes complete financial-flow coverage
outside the command layer and all interrupted encounter types. Waves 2–5 remain.

## Compatibility

Back up previous saves before migration. Do not invent absent history. Existing
separate reelection saves retain a one-time legacy interlude; new careers use a
shared calendar. Every completed action and finalized election is applied once.
