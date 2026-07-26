# Election 2028 — Two-Term Audit and Expansion Plan

## Audit method

The current build was exercised through a complete winning lifecycle:

- Gretchen Whitmer defeated Glenn Youngkin, 319–219.
- A full first term was completed through all 16 governing quarters.
- The incumbent ran again and won, 319–219.
- A full second term was completed through all 16 governing quarters.
- Campaign questions, governing logs, fiscal state, crises, scandals, wars,
  elections, and term-to-term save data were recorded and compared.

The winning run used rotating travel, field offices, town halls, rallies,
fundraising, positive messaging, and strategy-desk ad targets. This also exposed
a sharp difficulty cliff: a less optimized positive strategy failed to win in
80 seeded Arcade attempts, while the optimized high-volume strategy won by 100
electoral votes.

## What is already working

- The campaign, election night, transition, presidency, reelection, and second
  term form a real end-to-end game.
- State targeting and campaign finances now require meaningful allocation.
- Governing has several strong foundations: political capital, legislation,
  executive orders, budgets, wars, crises, scandals, impeachment, midterms,
  institutions, population, stability, and policy implementation.
- Fifteen authored debate topics prevent repetition within the first three
  five-question sets.
- Reelection does inherit a small summary of approval, growth, inflation,
  scandals, war outcomes, signature achievement, and debt.

## Principal finding

The game has two good halves, but it does not yet have a durable political
history connecting them.

The first term in the audited run ended with:

- 59% approval
- 1.5% growth
- debt at 131.9% of GDP
- an unfinished balanced-budget promise
- three presidential scandals
- one shutdown
- two Supreme Court appointments

The 2032 campaign mentioned approval, growth, scandals, and the unfinished
signature only in its opening modal. None became a required debate answer,
opponent attack, advertisement, interview, town-hall question, endorsement
condition, voter-bloc reaction, or state-level issue.

After reelection, the second term reset debt to 100, discarded the shutdown,
scandals, laws, justices, crisis history, policy implementation, cabinet,
coalitions, world state, and institutional condition. The player could choose
the same “Balance the Budget” signature again. “Market Convulsion,” a first-term
crisis, appeared again as if it had never happened.

This is the largest missing feature: **the record must become the campaign, and
the reelection result must return to the same country.**

## Priority 0 — Create a permanent presidential record

Add `presidentialRecord`, retained outside the disposable campaign and term
objects.

It should preserve:

- fiscal snapshots: opening debt, closing debt, cumulative deficits, taxes,
  spending bills, shutdowns, credit events
- military record: authorization, stated objective, allies, cost, casualties,
  duration, outcome, public support, veterans' effects
- enacted laws, vetoes, executive orders, court reversals, implementation level
- Supreme Court appointments and ideological balance
- scandals, responses, investigations, pardons, impeachment votes
- economic record by year, not just the final GDP number
- crisis decisions and whether later evidence vindicated them
- cabinet appointments, resignations, loyalty, competence, and vacancies
- coalition promises and measured outcomes
- national stability, institutions, population, alliances, adversaries, and
  DEFCON at the end of each year
- campaign promises, signature initiative, and promise status

Every consequential action should append a structured record entry containing
the issue, decision, immediate effect, delayed effect, affected blocs, press
frame, and attack/defense tags.

Acceptance tests:

- Debt at 131.9 remains 131.9 on inauguration day of term two.
- Existing laws, justices, cabinet members, world relations, and active policy
  implementations remain visible in term two.
- No completed or failed signature can be selected again as a new promise.
- Save/load preserves the complete record across both elections and terms.

## Priority 1 — Build a record-driven reelection campaign

The reelection campaign should be generated from the incumbent's actual record,
not merely receive starting-stat modifiers.

### Accountability docket

At campaign launch, select:

- three liabilities
- two achievements
- one unresolved national emergency
- one broken or unfinished promise
- one opponent-defined referendum question

Examples:

- Debt rose 32 points: “Why should voters trust four more years of your
  spending?”
- The president initiated a war: “What was the objective, what did it cost,
  and why was Congress or the public not consulted?”
- A war ended in victory but caused heavy casualties: defend necessity,
  proportionality, and the peace.
- Inflation rose despite strong GDP: explain the tradeoff.
- A law passed but implementation stalled: admit failure, blame capacity, or
  promise a correction.
- A scandal was denied and later substantiated: the cover-up becomes more
  damaging than the original conduct.

### Mandatory reelection encounters

- Announcement interview about the record
- One retrospective town hall
- One incumbent-specific debate
- One opposition “closing argument” ad
- One fact-check broadcast
- One governing coalition negotiation
- One October surprise drawn from unresolved record entries

The player must choose a defense posture for each liability:

- defend the decision
- concede and correct
- reframe the tradeoff
- blame Congress or external conditions
- attack the opponent's alternative
- deny or evade, with fact-check risk

Responses should be checked against the original decision. A president who
promised a short war cannot credibly claim the mission was always open-ended
without a flip-flop penalty.

Acceptance tests:

- Any debt increase above 10 GDP points creates a debt question.
- Any initiated or unresolved war creates a war-accountability question.
- Any scandal above a heat threshold creates at least one press encounter.
- At least 40% of reelection content is generated from the actual record.
- Record questions name figures, dates, choices, and outcomes from that run.

## Priority 2 — Replace the debate deck with a debate director

The current system has 15 topics. A four-debate campaign can request 20
questions, so five topics repeat in the same election. Reelection creates a
fresh state and repeats the entire topic book.

Create five question pools:

1. Fundamentals: economy, rights, security, democracy
2. Candidate biography and vulnerabilities
3. Current campaign events and contradictions
4. Incumbent record and governing tradeoffs
5. Closing/tactical questions appropriate to debate number

Give every authored question:

- a stable question ID separate from its topic
- eligibility rules
- cooldown measured across the entire career
- follow-up questions
- fact-check hooks
- opponent rebuttals
- party-specific and record-specific variants
- moderator voice and venue

Debate structure:

- Primary debates emphasize coalition and ideological distinctions.
- First general debate emphasizes domestic fundamentals.
- Second debate is town-hall driven and state/voter specific.
- Third debate emphasizes foreign policy and governing fitness.
- Incumbent debate adds at least three record-derived questions.
- No exact question or response text repeats during an eight-year career.

Acceptance tests:

- At least 60 general questions and 30 primary questions exist.
- Four debates can run without repeating a topic-question pair.
- The 2032 debate does not reuse 2028 wording.
- Opponent answers do not repeat within a debate or across adjacent debates.
- Every response is a spoken answer, includes a concrete claim, and permits a
  relevant moderator follow-up.

## Priority 3 — Preserve and evolve the country in term two

Term two should be continuation, not New Game Plus with a “2” label.

Carry forward:

- debt, deficit trajectory, taxes, and shutdown status
- economy and distributional outcomes
- enacted laws and implementation
- court composition and active litigation
- cabinet and vacancies
- congressional composition after the presidential election
- wars, occupations, treaties, sanctions, alliances, and DEFCON
- institutions, stability, population, collapse/recovery state
- scandals and investigations that remain unresolved

Add second-term-only content:

- lame-duck influence and succession politics
- vice president positioning for 2036
- cabinet members leaving to run
- legacy legislation
- oversight investigations into term-one conduct
- accumulated policy side effects
- judicial consequences of earlier appointments
- allies and adversaries reacting to eight years of doctrine
- reduced leverage after the second midterms

Acceptance tests:

- Second-term dates and legacy report say 2033–2037.
- Second-term crises use prior state and avoid resolved first-term stories.
- Cabinet and court screens show continuous eight-year history.
- The second-term ending summarizes change from January 2029 to January 2037.

## Priority 4 — Make policy tradeoffs legible and attributable

The fiscal system currently changes debt through a generic quarterly drift, so
the player can accumulate debt without seeing which choices caused it.

Add a budget ledger:

- revenue
- mandatory spending
- discretionary domestic spending
- defense and war spending
- debt service
- emergency spending
- bill-by-bill fiscal effects
- annual and cumulative deficit

Each governing decision should preview estimated ranges and later report actual
results. External shocks and player decisions must be separated. Reelection
questions should use that attribution:

> “Debt rose 31.9 points. Your four budgets account for 14, the shutdown deal
> for 3, and weak growth for 6. What should voters believe will change?”

Add distributional results by coalition and region so “good GDP” can coexist
with angry renters, workers, or rural voters.

## Priority 5 — Deepen war authorization, execution, and accountability

War needs a documented political theory:

- intelligence confidence
- congressional authorization
- objective and red lines
- coalition commitments
- force and budget requested
- projected casualties and duration
- rules of engagement
- exit conditions
- veteran, refugee, alliance, and domestic effects

During reelection, questions should compare the original case with outcomes.
False certainty, mission creep, unilateral action, casualties, costs, and
unfinished combat should each generate different attacks. A justified,
authorized, successful defense should provide credibility rather than being
treated identically to an elective quagmire.

## Priority 6 — Add a narrative memory and uniqueness service

Maintain career-wide registries for:

- question IDs and response IDs
- event IDs and variants
- crisis IDs and outcomes
- headlines and broadcast packages
- opponent attack lines
- interview prompts
- State of the Union themes
- signature initiatives
- Supreme Court candidate archetypes

Use three levels:

- **Never repeat:** exact questions, response copy, named one-off crises
- **May recur with continuity:** inflation, strikes, cyberattacks, budget fights
  when prior history is explicitly referenced
- **Seasonal templates:** polls and fundraising reports, requiring varied
  wording, numbers, speakers, and consequences

When a recurring class returns, generate a sequel:

- “A second market shock tests reforms enacted after the 2030 crash.”
- “The rail unions say the settlement you brokered four years ago failed.”

Acceptance tests:

- No exact authored question repeats across two campaigns.
- No one-off crisis repeats across two terms.
- Recurrent crises reference the prior occurrence and changed conditions.
- Headline normalized-duplicate rate stays below 5% across eight years.

## Priority 7 — Improve strategic balance and explainability

The audit found a large strategy cliff: a moderate rotating strategy failed 80
seeded Arcade campaigns, while adding three visits every week plus large,
strategy-ranked ads produced a 319–219 win.

Add:

- a pre-election map forecast with credible paths to 270
- explanations for state movement after every week
- explicit action capacity so three visits have visible opportunity cost
- opponent spending and travel shown on the same terms as player actions
- difficulty-specific fairness simulations
- viable archetypes: persuasion, base turnout, field, earned media, and
  fundraising
- warnings when a strategy has no plausible path, without solving it for the
  player

Balance targets:

- Competent Arcade strategy wins roughly 65–80% of seeded games.
- Competent Realistic strategy wins roughly 40–60%.
- At least four distinct strategy archetypes fall within ten percentage points
  of one another.
- No single repeated weekly action is optimal for more than six consecutive
  weeks.

## Recommended delivery sequence

### Wave 1 — Continuity foundation

- Permanent presidential record
- Term-two state carryover
- Career-wide uniqueness registry
- Save migration and deterministic tests

### Wave 2 — The record becomes the campaign

- Accountability docket
- Record-driven interviews, attacks, ads, and debate questions
- Fact checks, concessions, and consistency scoring
- Reelection campaign retrospective screen

### Wave 3 — Debate and media expansion

- Debate director and 90+ question bank
- Follow-ups and rebuttals
- Career-wide no-repeat enforcement
- Broadcast packages tied to the record

### Wave 4 — Fiscal and war accountability

- Budget ledger and decision attribution
- War authorization/mission/cost history
- Coalition and regional consequences
- Incumbent defense mechanics

### Wave 5 — Second-term politics and balance

- Lame-duck and succession systems
- Eight-year cabinet, court, and world arcs
- Strategy viability tuning using thousands of seeded simulations
- Expanded two-term legacy report

## Definition of done

A two-term run is complete only when:

- the second election is recognizably about the player's first term;
- the second term begins in the exact country the first term produced;
- debates, crises, headlines, and responses remain fresh across eight years;
- the player can explain why every major statistic changed;
- war and deficit decisions create specific, unavoidable accountability;
- multiple campaign and governing strategies can plausibly succeed;
- the final report tells one continuous political history from 2028 through
  2037.
