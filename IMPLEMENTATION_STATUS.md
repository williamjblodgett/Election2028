# Astra implementation status

Approved direction: monthly presidency (96 turns), concurrent 2032 campaign and
governing, accessible strategy, tested GitHub Pages release waves. Preserve the
static PWA, 2D presentation, and all existing candidate types.

## Delivery gates

- [x] Wave 1: command validation, action slots, ad saturation/pricing, spending
  ledger, save-v4 routing and backup, cabinet/war continuity, immutable elections,
  read-only previews, gated deployment and deployed-build verification.
- [x] Wave 2: save-v5 monthly calendar, concurrent reelection, fiscal reconciliation,
  outcome-based promises, unified conflicts, cabinet/court/congress continuity.
- [x] Wave 3: decision-first mobile UI, accessible controls, deduplicated politician
  identities, search/comparison/rematch, offline geographic world map, 2D polish.
- [x] Wave 4: 30 primary + 60 substantive general questions, contextual answers,
  evidence-based follow-ups, immutable accurate elections, six four-stage arcs.
- [x] Wave 5: 1,024 seeded balance runs, three genuine UI lifecycle playthroughs,
  eight-year legacy, automated live-build verification, and release notes.

These checkboxes track implemented and locally verified work. Publication is
separately gated by GitHub Actions and its **Verify deployed commit** step; the
live `build-info.json` is the authoritative deployed revision.

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

## Career release 2.1 — 2026-09-11

The remaining waves now share one version-5 country state and are packaged as a
coherent release. Implemented monthly two-term governance, concurrent reelection,
annualized fiscal accounting, actual delivery requirements, unique scenario and
record debates, six four-stage narratives, shared politician identities, roster
comparison/rematch, real offline geography, keyboard/touch navigation, and a
2D nuclear aftermath. Campaign, cabinet, and broadcast views reuse canonical
portraits; fonts are bundled under their original open licenses.

Verification: 68 Node regressions, eighteen focused browser/offline checks, and
1,024 balanced seeded campaign simulations. Genuine UI careers have now completed:
Whitmer won 287 then 303 EV and served 96 months; Rubio's first successful run won
333 then 343 EV and served 96 months; an adverse Harris campaign reached a loss.
Earlier losses and their autopsies are retained rather than labeled successful.
Full-career tests assert actual displayed question uniqueness and reload an
answered debate without rescoring.

See [release verification](reviews/RELEASE_2_1.md), the JSON/screenshot records in
`reviews/ui-careers/`, and [the player/developer guide](README.md). CI reruns these
gates before Pages deployment and retains an independent verification artifact.
