# Election 2028

A static, offline-capable political strategy game: win a nomination, fight a
40-week presidential campaign, govern, and defend your record in a concurrent
2032 reelection race. No backend or WebGL is required.

[Play on GitHub Pages](https://williamjblodgett.github.io/Election2028/).

## The 2.1 career update

- Two 48-month terms, with one optional major decision each month. Maintaining
  course is valid; 3/6/12-month fast-forward stops for required business.
- A 24-week reelection campaign begins in month 41 while the country continues
  operating. November's result does not skip the January 20 transition.
- Recurring budgets, nominal GDP, debt stock, deficit flows, legislative
  implementation, measured promises, and a permanent eight-year career record.
- Three campaign action slots each week. Advertising uses cash instead of
  slots, with exact $50K increments, cumulative saturation, and market inventory.
  The rival pays for actions and advertising through the same quotation rules.
- 30 primary questions, 60 substantive general-election questions, and 24
  scenario-specific follow-up challenges. Every incumbent debate reserves two
  questions for the governing record; wars, borrowing, and unfinished promises
  also receive mandatory campaign scrutiny.
- Six persistent four-stage stories: fiscal credibility, mission creep,
  nomination coalition, failed delivery, succession, and recovery legitimacy.
- 32 modern nominees, 12 historical variants, custom candidates, searchable
  rosters, two-person comparison, random matchups, rematches, and distinctive
  once-per-campaign abilities with tradeoffs. Shared people keep their identity
  across presidential, running-mate, and cabinet roles.
- Real offline country boundaries, 33 interactive foreign-country dossiers and
  the United States, regional views, zoom/pan, keyboard controls, deployments,
  conventional war, a 2D nuclear exchange, and aftermath/rebuilding governance.
- Mobile navigation, visible cash/action limits, expandable national indicators,
  and a persistent mobile month-advance control. Walkouts and election night
  remain 2D; reduced-motion preferences are respected.

## Playing well

Build a geographic route to 270, not just a large national approval number.
Published polls have uncertainty. Field organizations and coalitions take time
to build, and repeated visits become less effective. Campaign money left after
the election cannot win another state: use the visible ad quotation to compare
late buys, while retaining enough for payroll and overhead.

In debates, choose a concrete answer consistent with your platform. Fact checks
distinguish supported evidence, contradicted claims, selective evidence, and
future promises that cannot yet be verified. Making a measurable pledge adds a
real obligation to your career; it is not free debate applause.

In office, passing a bill and delivering its benefits are separate milestones.
Budget reform changes recurring revenue and spending. Balance-the-budget success
requires twelve consecutive balanced months; the other signature initiatives
also have outcome conditions shown in the UI. Rejected bills become available
after three months or a change in Senate support. An exhausted cabinet shortlist
offers an acting official so a transition cannot deadlock.

Population loss alone does not automatically end aftermath play while anyone
survives. Losing an election or being removed is still a political ending.

## Saves and offline use

Version 5 stores the random stream, active screen, answered debate checkpoint,
pending weekly choices, monthly briefings, and career history. Normal games keep
a last-known-good backup. Iron mode provides one automatic continuity checkpoint,
not a manual rollback. Older quarterly saves migrate to the monthly calendar;
already separate legacy reelection saves retain an interlude. Missing history
is not invented.

Allow the first online visit to finish downloading before going offline. All
runtime code, country geometry, 44 portrait assets, broadcast plates, and fonts
are cached locally. An available update waits for the **save & reload** control
instead of switching code in the middle of an encounter. Browser storage is local
to the device and origin; clearing site data removes local saves.

## Development and verification

Node.js 22 and npm are used by CI. Install dependencies and Chromium:

```sh
npm ci
npx playwright install chromium
node tests/server.cjs
```

Open `http://127.0.0.1:4173`. Localhost disables automatic service-worker
registration to avoid stale development files. The offline regression explicitly
registers the worker against the built `/dist/` artifact.

```sh
npm test
npm run test:balance
npm run test:e2e
npm run test:careers
npm run build
```

On Windows, when using an already-running server:

```powershell
$env:ELECTION_TEST_EXTERNAL_SERVER='1'
npm run test:e2e
npm run test:careers
```

`PORT` selects the server port; `ELECTION_TEST_URL` selects the test base URL.
`test:e2e` builds the runtime artifact before checking it. `test:careers` runs
three longer UI-only campaigns: Democratic and Republican two-term careers, plus
an adverse-play loss. It does not read or inject hidden game state, force election
results, or jump calendar dates. Focused smoke tests intentionally use fixtures
and are not represented as complete careers.

`test:balance` runs 1,024 paired-seed campaigns across both parties, all modern
nominees, two difficulties, and four legal strategies. The target win-rate bands
are 65–80% Arcade and 40–60% Realistic, with no more than a ten-percentage-point
spread between the four pooled strategy results. These are regression targets,
not a promise that every matchup or party has the same odds. Detailed party and
candidate results are retained in `reviews/balance-latest.json`.

GitHub Actions gates `Main` publication on unit, balance, focused browser,
offline, and complete-career tests. It preserves verification artifacts, deploys
only `dist/`, and checks the public `build-info.json` against the deployed commit.

## Code boundaries

The existing static global-script application is retained. `game-commands.js`
owns campaign quotes and commands; `campaign-finance.js` owns cash postings;
`opponent-campaign.js` uses the same campaign constraints. `simulation.js` owns the
country clock, `career-system.js` the persistent record, `election-system.js`
final counts, and `debate-round.js` atomic answers. `save-store.js` manages
continuity. Older engine/UI entry points remain compatibility adapters; this is
not a complete framework rewrite.

## Data, artwork, and modeling limits

This is political fiction, not a forecast, polling service, military simulator,
or endorsement of a politician. Candidate abilities, future news, strategic
strength, and relationships are game abstractions.

- Map coverage means the twenty most populous countries in the source reference
  period, including the United States, plus selected allies and adversaries—not
  the twenty largest by land area. Natural Earth boundaries are public domain;
  reference populations are predominantly 2019. Boundary display does not endorse
  territorial claims. See [data/README.md](data/README.md).
- Popular votes use the Census July 2023 voting-age population with the game's
  modeled turnout. Voting-age population is not the same as citizen voting
  eligibility. Source: [Census state estimates](https://public-inspection.federalregister.gov/2024-06666.pdf).
  Electoral counting and contingent House/Senate outcomes are simplified game
  models; this release does not model every congressional district or ballot rule.
- Fiscal amounts are game GDP units. Nominal GDP begins at 100; recurring flows
  are annual percentages divided by twelve each month. They are not dollar
  forecasts. The ledger separates borrowing from GDP-denominator changes.
- The 44 candidate portraits are AI-generated editorial illustrations, not
  photographs. Other officials without an illustrated portrait use an icon.
  See [portrait disclosure](images/portraits/README.md).
- [Bundled fonts](fonts/README.md) retain their SIL Open Font License notices.
  Spectator autoplay and local multiplayer are not implemented; setup now says
  so explicitly instead of advertising a nonfunctional mode.

See [implementation status](IMPLEMENTATION_STATUS.md) and
[release verification](reviews/RELEASE_2_1.md).
