# Election 2028 2.1 — release verification

## Implemented

The monthly country clock, concurrent reelection, reconciled fiscal model,
measurable delivery, persistent story arcs, diverse debates, shared politician
identities, real offline map, mobile controls, and crash-safe continuity build on
the already-published reliability patch `3ae33d7`.

This remains the existing GitHub Pages game, with its 2D broadcasts and illustrated
roster. It has not been moved to a framework, backend, or different hosting service.

## Evidence and honest scope

- 65 Node regression tests cover transactions, clocks, save migration, mandates,
  promises, nuclear/withdrawal continuity, and narrative/debate uniqueness.
- Sixteen focused browser checks cover mobile/keyboard operation, roster and
  cabinet identities, image decoding, 2D presentation, resume paths, geography,
  and a built artifact that loads with the network disabled.
- 1,024 complete seeded campaign simulations: Arcade **71.875%** wins and
  Realistic **59.1796875%**. Both pooled strategy spreads are **9.375 percentage
  points**. The report includes every run and exposes the substantial party and
  matchup differences; pooled bands are not proof of party parity.
- Actual UI careers use ordinary buttons, answers, budgets, cabinet nominations,
  and month advances. They neither inject wins nor jump the calendar. Two-term
  assertions require two won elections, 96 observed months, and the final 2036
  annual record. An answered debate is reloaded to check continuity.

Recorded successful Democratic career: Gretchen Whitmer / Josh Shapiro, seed
2028, **287 EV** in 2028 and **303 EV** in 2032; all 96 months completed and **41
distinct spoken moderator questions** observed.

Recorded successful Republican career: Marco Rubio / Tim Scott, seed 2032,
**333 EV** in 2028 and **343 EV** in 2032 on the first successful strategy; all 96
months completed and **46 distinct spoken moderator questions** observed. Later
regression strategies may produce different legitimate margins.

An adverse Kamala Harris campaign on Chaos also reached its loss screen. Losses
are not counted as successful two-term careers. Earlier Whitmer attempts lost at
241 and 267 EV; their records are retained. Moving from leftover cash and repeated
national activities to funded field offices, competitive-state visits, turnout
work, and larger late ad buys produced the verified win without changing the
election result directly.

Artifacts are in `reviews/ui-careers/`, with earlier attempt records beside this
document. CI independently reruns the complete suite and retains its latest
screenshots and career JSON as the `game-verification` artifact.

## Bugs found by the full UI runs

- A delayed debate transition allowed a quick second click to skip a campaign
  week. Entering the debate is now immediate and the processed week is saved.
- Different debt questions produced identical generic follow-ups. Twenty-four
  authored challenges now have different constraints and spoken answers; tests
  compare actual displayed text, not just IDs.
- Selecting a primary rival as VP left that person campaigning against the same
  ticket. Ticket formation now reconciles the primary roster.
- Withdrawal was handled as another battle; it now closes the conflict exactly
  once. Unaffordable budget deals leave the briefing available for another choice.
- Early second-term removal could falsely claim eight completed years. Legacy
  labels now use the actual date and completed-term condition.
- Old election headlines persisted into the legacy screen, and fractional approval
  printed a long decimal. Governing has its own briefing log and rounded displays.

## Release gate

Publication requires the GitHub Actions checks to pass and the live
`build-info.json` commit to match the deployment. A local build or a successful
push alone is not treated as proof that the live site has updated.

## Explicit limitations

This is a simplified fictional simulation. The House/Senate contingent-election
model is not a full legislative bargaining game. Most strategic country reference
populations are 2019 and the popular-vote weighting is Census 2023 voting-age
population, not a forecast of eligible 2028 voters. A finite authored content pool
can eventually exhaust; the director prefers a quiet period to recycling a fake
sequel. Legacy quarterly entry-point names remain as tested adapters. Spectator
autoplay and local multiplayer are not implemented.
