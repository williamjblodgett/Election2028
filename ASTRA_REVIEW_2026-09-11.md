# Election 2028 — Astra review

Reviewed September 11, 2026, with GPT-6 Astra at maximum reasoning effort. Source revision: `09fd9b9`.

## Verdict

The game has a compelling campaign-to-presidency premise, a recognizable 2D broadcast identity, and a substantial roster. The next release should make its rules and consequences dependable. Several apparently deep systems currently calculate different versions of the same reality: budget versus deficit, cabinet versus transition roster, active war versus world-map conflict, and displayed vote forecasts versus election results.

The biggest design opportunity is to make the player's record change what happens next—not merely the wording of the next event.

## What was checked

- Inspected the live landing page without loading or replacing its existing save.
- Completed the eight-step setup locally as Whitmer/Kelly against Youngkin/Scott, inspected desktop and 390×844 mobile layouts, purchased an ad, took a town-hall action, and advanced into the first weekly events.
- Reviewed the campaign, debate, fiscal, war, cabinet, persistence, and second-term code.
- Ran the existing 32 simulation tests: all passed.
- Ran the existing eight browser tests: all passed in 11.1 seconds using the external-server setting. The first default run completed its checks but hung during teardown and was stopped.
- Inspected the browser-test screenshots, including the mobile Situation Room. No warning/error console entries were captured in the interactive local check.
- Added 14 disposable-process diagnostic probes in `reviews/astra-2026-09-11.cjs`.

This was not a full eight-year UI playthrough or a statistically representative difficulty study. The term-boundary probes intentionally construct states to expose specific defects. No production game source was changed, and nothing was pushed or deployed.

Run the additional probes from the repository root:

```powershell
node reviews/astra-2026-09-11.cjs
```

## Priority 1 — Fix rules that undermine player trust

### 1. Preserve the actual country and the current phase

**Reproduced:** An unfinished war with Iran becomes `presidency.war = null` after reelection, while the world map still contains one unresolved conflict. That war produces no record question. The snapshot preserves completed `warLog` entries but omits the active `war`; the accountability builder reads completed career wars.

**Reproduced:** A newly selected second-term Treasury secretary is replaced by the first-term secretary. A newly elected 56-seat Senate is replaced with the old 52-seat Senate. Resigned cabinet members also continue granting bonuses through the old transition roster.

**Reproduced with the real load-routing function and stubbed rendering:** Saved cabinet formation and completed-presidency states both route to the campaign screen. `loadGame()` only distinguishes an unfinished presidency from everything else.

Fix: Keep one persistent country, one authoritative cabinet roster, and an explicit saved phase. Merge the new election mandate into that country instead of replacing the new transition with an old snapshot. Save and restore pending debates, hearings, election-night results, and legacy screens. Resume must not reroll an election or discard a pending decision.

Evidence: `js/career-system.js:71`, `:104`, `:139`; `js/presidency.js:139`, `:249`; `js/ui.js:118`.

### 2. Correct ad prices and close the repeated-action exploits

**Observed in the actual UI:** The default ad dialog displays **$250K**, but its range input has a $100K step and resolves to **$300K**. Buying without touching the slider produces a **$300K purchase confirmation**.

**Reproduced in Pennsylvania:** One $1M positive TV buy adds approximately **2.48 polling points**. Ten $100K buys add approximately **7.84 points** for the same total expenditure—**3.16× the gain**. The square-root curve resets per transaction; accumulated ad spending does not reduce the next purchase's actual impact.

**Reproduced:** Ten visits to Pennsylvania are accepted in week one, adding **16.7 raw polling points** and spending **$800K**. None of that travel expenditure is added to `totalSpent`, which later feeds the campaign autopsy.

Fix: Use one quotation function for the displayed price, preview, and transaction. Calculate marginal ad impact from cumulative market exposure, so splitting a buy cannot increase its effect. Add a visible weekly schedule, travel capacity, local fatigue, and an engine-enforced affordability check. Put every expense into a single campaign ledger.

Acceptance: A split purchase has the same effect as its combined equivalent under identical timing and market conditions; a rejected action changes neither money nor polling; every dollar spent reconciles.

Evidence: `js/ui.js:2417`, `:2440`, `:2493`; `js/engine.js:669`, `:701`, `:2280`.

### 3. Make the budget, debt, and promises share one calculation

**Reproduced:** After one ordinary quarter, the budget components sum to a **7.0% deficit**, while `fiscal.deficit` reports **1.1** and debt increases **1.1 points**. The UI calls the component table a quarterly ledger, so there is no explained period conversion. The component balance does not drive the simulation's debt calculation.

**Reproduced:** Five successive quarterly initiative pushes complete “Balance the Budget” while debt rises from **150 to 155.3% of GDP** and the displayed budget balance remains **−8.5%**. Completion checks the progress bar, not the promised outcome.

Fix: Define fiscal units and periods explicitly; derive revenue, spending, deficit, debt service, and debt changes from the same model. Track growth/denominator effects separately from borrowing. Record fiscal effects for aid, wars, bills, and emergency deals. Require measurable outcome conditions for each signature, with implementation progress distinct from success.

Acceptance: Revenue minus expenditure reconciles to the deficit; debt movement has an attributable explanation; a deficit cannot count as a delivered balanced-budget promise.

Evidence: `js/presidency.js:178`, `:732`, `:760`; `js/ui.js:3375`; `js/world.js:119`.

### 4. Replace template uniqueness with genuine debate variety

The “60-question” book is **15 substantive prompts × four framing templates**. The base answers are reused with four appended sentences. Primary and general debates draw from the same book, and the player's policy answers are not selected by party or platform direction.

**Reproduced in a three-debate reelection:** Record-question counts are **3, 0, 0**—20% of those 15 questions. Twelve record-answer slots contain only **six distinct answer texts**. In the tested debt/war/scandal/inflation case, the unfinished signature promise falls outside the top-three liability cutoff.

The “SUPPORTED” fact-check verdict is assigned automatically to concessions and reframing; other postures receive “CONTESTED.” It does not compare the answer with the original decision. Opponent lines are fixed by topic and strategy, with generic responses for unrecognized record topics.

Fix: Author distinct questions with different decisions, not interchangeable introductions. Separate primary, general, biography, current-event, and incumbent pools. Reserve encounters for every major initiated/unresolved war and every defining unfulfilled promise. Track claims, dates, quantities, prior promises, rebuttals, and follow-ups. Check consistency independently of rhetorical posture.

Acceptance: A truthful defense can be supported; a false concession or misleading reframe cannot pass automatically. Opponents respond to what was said. Each reelection debate contains fresh record material, and mandatory liabilities cannot be silently dropped by ranking.

Evidence: `js/debate-expanded.js:95`, `:101`, `:129`; `js/career-system.js:139`, `:205`; `js/ui.js:2666`, `:2820`.

### 5. Reconcile forecasts with actual outcomes

**Reproduced:** The American Rebuild Act shows a **78% passage chance**, but its whip forecast tops out at **190/218 House votes** and **49/51 Senate votes**. The displayed vote ranges and actual passage roll are separate models.

**Reproduced:** Calling election-result calculation twice changes the popular-vote figures and records the same election twice. A valid **269–269** fixture automatically declares the opponent the winner. A tie should enter a contingent-election state, not an ordinary defeat; the House and Senate have distinct selection roles. [U.S. House historical explanation](https://history.house.gov/Institution/Origins-Development/Electoral-College/).

**Observed:** The campaign map exposes raw figures such as Arizona **54%–53%**, while the polling sidebar uses a different normalized, uncertain estimate. The national popular vote is weighted by electoral votes rather than voter totals, and the autopsy calls the closest missed state the “tipping point” without determining whether its EVs change the winner.

Fix: Generate the whip forecast and vote from one legislator/faction model. Finalize each election once, persist it, and replay its broadcast without mutation. Separate electorate estimates, published polls, forecast probabilities, and counted votes. Calculate the actual tipping-point state by accumulating EVs across ordered margins.

Evidence: `js/presidency.js:346`, `:371`; `js/engine.js:2229`, `:2280`; `js/ui.js:1387`, `:3595`.

## Priority 2 — UI changes with the largest payoff

### Mobile: put the decision first

At 390×844, six large stat cards occupy most of the screen before either the map or event choices. Selecting Events changes the content but retains the whole stat wall. Cash is explicitly hidden on mobile even though spending is a core mechanic.

Use a compact persistent bar for date, phase, cash, and remaining actions. Put urgent events immediately below it. Move expanded metrics into Intel. Make the map/list the first content in Map, and preserve a clear way back from every modal. Keep the purchase button and total visible while adjusting ads.

Evidence: `css/styles.css:4487`, `:4534`; `js/ui.js:179`. Browser-test screenshots: `test-results/mobile-campaign-ui.png`, `test-results/situation-room-mobile.png`.

### Map: rebuild the geography, then layer strategy onto it

The current world is 11 hand-authored polygon silhouettes on a square coordinate system—not country geography. Phone labels are tiny and nearby country targets overlap. The map and separate War Room also communicate different conflict state.

Bundle simplified real country geometry locally, use a consistent projection and geographic coordinates, and add pan/zoom, regional views, search, and an accessible country list. Show borders, selection, alliances, deployments, and active wars as separate layers. Define whether “largest” means population or land area and date the coverage dataset.

Natural Earth's map data is public-domain and suitable for a bundled offline base map. The specific projection, simplification, and interaction design are recommendations from this review. [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/).

Evidence: `js/world.js:45`; `js/ui.js:3487`; `css/styles.css:4281`. The current geography test checks path count, not geographic accuracy: `tests/simulation.test.cjs:295`.

### Setup: a clearer shortlist, with one identity per politician

The roster is substantial, but comparing eight bars across a long grid is slow. Six people appear twice in Whitmer's VP selection, with different bonuses depending on whether their curated or wildcard entry is selected. The helper text still says five curated choices while the slate has seven.

Use one canonical person record with role-specific effects, deduplicate selections, and show three defining traits plus a unique campaign mechanic. Add search, region/ideology filters, side-by-side comparison, and a quick-rematch path. Keep the detailed dossier available without making it the default card.

Evidence: `js/vp-data.js:347`; `js/ui.js:329`, `:564`; diagnostic probe 12.

### Accessibility and broadcast polish

Observed in the accessibility tree: candidate cards are generic clickable containers; the platform has 50 buttons labeled only by a symbol or nothing; the ad modal leaves keyboard focus on the underlying Run Ads button. It has no dialog role or `aria-modal`. World-map groups lack keyboard activation handling. The moving ticker visibly crosses over its fixed “BREAKING NEWS” label on desktop, and there is no reduced-motion stylesheet rule.

Use native buttons/radio groups, meaningful accessible labels and selected states, focus trapping/restoration, Escape dismissal, readable body text, and generous touch targets. Mask the ticker under its fixed label and provide pause/reduced-motion behavior. Drive broadcast dates and election labels from the run; several strings remain hardcoded to 2028.

Evidence: `js/ui.js:455`, `:2380`, `:3500`, `:3289`; `index.html:164`; `css/styles.css:96`.

## Priority 3 — Scenario expansions worth building

These are proposed game-fiction arcs, not predictions. Each should create a different strategic problem and later remember the chosen solution.

| Arc | Initial decision | Consequence and later accountability |
| --- | --- | --- |
| The promise meets the bond market | Choose a funded tax/spending package, a slower timetable, or borrowing during a downturn. | Track who benefits, financing costs, and the original fiscal promise. A reelection question identifies the actual bill and cost instead of merely citing closing debt. |
| The limited war becomes an open-ended mission | Set objective, authorization, intelligence confidence, force level, and exit conditions. | A missed milestone triggers a choice to renegotiate, seek a renewed mandate, expand, or withdraw. The debate compares the original case with duration, costs, casualties, and outcomes. An unfinished mission survives inauguration. |
| The primary coalition bargain | A rival offers an endorsement for a platform commitment or ticket role. | Gain delegates but accept an explicit obligation. Delivery can unlock governing support; abandonment can trigger a primary challenge, resignation, or lost endorsement. |
| A law passes, but the benefits do not arrive | Choose implementation staff, state partnerships, funding speed, and oversight. | An administrative bottleneck or local dispute creates a follow-up. Voters react to delivered outcomes, and the president can correct a failed rollout rather than simply select another bill. |
| The second-term succession fight | The VP and a cabinet rival compete to inherit the party. | Endorse, stay neutral, negotiate a legacy package, or replace a departing official. Each changes legislative support, staffing, and the 2036 legacy—not just a timeline message. |
| A damaged country holds an election | Following disaster or collapse, allocate relief and election-administration resources. | Reconstruction changes turnout access, institutional trust, and the legitimacy of the eventual mandate. The ending distinguishes survival, restoration, and lasting failure. |

For debates, use a short exchange: a concrete question, an answer with a claim or commitment, a record-aware rebuttal, and a conditional follow-up. The moderator should ask “Which program pays for that?” when a spending answer has no funding—not append the same generic request to every topic.

The governing calendar currently offers 16 major decisions per term, with three automatic monthly pulses per decision. Keep that fast strategic pace, but let an active war, crisis, or implementation failure temporarily open monthly choices. Quiet periods should remain quick to advance.

## Code and test plan

No framework rewrite is necessary. Incrementally separate:

- **Campaign state:** money, schedule, market exposure, organizations, electorate, and published polls.
- **Persistent country:** budget, active wars, institutions, legislature, courts, cabinet, and policy implementation.
- **Career record:** decisions, promises, evidence, elections, and unresolved narrative threads.
- **Session flow:** current screen/phase, pending encounter, selected response, and finalized result.

Route consequential actions through a common sequence: validate capacity and resources, calculate effects, commit state, append a record, and save. UI rendering should read state without changing it. The War Room currently consumes **71 random draws just to build coalition previews**, so opening a screen changes subsequent simulation outcomes (`js/ui.js:4011`; `js/war.js:63`). Give forecasts read-only calculations and inject seeds before initialization for repeatable balance experiments.

Replace misleading test proxies with behavioral checks. The current “complete two-term lifecycle” test directly starts both presidencies and does not win either election. The question test checks unique strings, which accepts template expansion. The map test counts polygons. All can pass while the underlying user requirement is unmet.

Add release gates for:

- Every save boundary: campaign event, debate answer, election night, cabinet hearing, governing crisis, reelection, and final legacy.
- Active-war continuation, cabinet replacement/resignation, new congressional mandates, and pending investigations.
- Spending reconciliation, split-buy equivalence, action limits, valid percentages, consistent previews, and immutable election results.
- Semantic content coverage, record-specific follow-ups, repeated opponent answers, and mandatory unresolved liabilities.
- Keyboard-only setup and play; 390px portrait and phone landscape checks where the primary decision must actually be visible and usable.
- A genuine UI-driven two-election/two-term success path, plus losses, a tie, and collapse/recovery. Do not use direct state jumps as evidence of completing that journey.
- Multi-seed balance studies across both parties and several strategies after the exploit fixes. Current passing smoke tests do not establish that difficulty is fair.

## Recommended delivery order

1. **Trust patch:** ad price mismatch, cumulative ad impact, weekly capacity, spending ledger, explicit save routing, active-war/cabinet continuity, and immutable results.
2. **Consistent simulation:** reconcile fiscal arithmetic, promise completion, whip forecasts, polling displays, and election edge cases.
3. **Decision-first UI:** compact mobile header, visible cash, usable event flow, accessible dialogs/controls, deduplicated setup, and real offline world geography.
4. **Record-driven content:** distinct debate pools, meaningful fact checks, mission/implementation sequels, and second-term succession choices.
5. **Balance and release:** representative seeded studies, genuine lifecycle playthroughs, offline/update checks, and only then a separately authorized live deployment.

Definition of success: players can see why a number changed, trust that quoted choices match their effects, resume exactly where they stopped, and face fresh consequences of their own political history.
