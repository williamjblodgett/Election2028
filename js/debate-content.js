/**
 * Election 2028 — Debate Broadcast Content
 * Opponent answers per topic/strategy, moderators, pundit reactions.
 * Complements the frozen window.DebateSystem (debate-system.js) — never mutates it.
 */

window.DebateContent = {

    // ═══════════════════════════════════════════════
    // OPPONENT RESPONSES
    // Keyed by events.js DebateSystem question topic, then by strategy.
    // Scores use the same 7-dimension scale as player response effects (~-3..9).
    // ═══════════════════════════════════════════════
    opponentResponses: {
        "Economy": {
            democrat_progressive: {
                text: "Wages have been flat for decades while corporate profits shattered records. I'll raise the minimum wage, break up the monopolies driving up your grocery bill, and make the billionaires finally pay what they owe.",
                scores: { policy: 6, base: 8, authenticity: 7, suburban: 3, viral: 6, donors: -1, press: 5 }
            },
            democrat_moderate: {
                text: "Families need relief now, not slogans. My plan cuts middle-class taxes, expands the child credit, and invests in American manufacturing — paid for, line by line.",
                scores: { policy: 8, base: 5, authenticity: 6, suburban: 7, viral: 2, donors: 6, press: 7 }
            },
            republican_conservative: {
                text: "Washington caused this inflation by printing money we didn't have. I'll cut spending, cut taxes, unleash American energy, and get government out of the way of small business.",
                scores: { policy: 6, base: 9, authenticity: 7, suburban: 4, viral: 5, donors: 7, press: 4 }
            },
            republican_moderate: {
                text: "We don't need a revolution — we need competence. Balanced budgets, targeted tax relief for working families, and trade deals that put American workers first.",
                scores: { policy: 7, base: 5, authenticity: 7, suburban: 8, viral: 2, donors: 7, press: 7 }
            },
        },
        "Immigration": {
            democrat_progressive: {
                text: "We can secure the border without abandoning our values. I'll fund smart enforcement, but I will not tear families apart — we are better than that, and history is watching.",
                scores: { policy: 5, base: 8, authenticity: 7, suburban: 3, viral: 5, donors: 2, press: 5 }
            },
            democrat_moderate: {
                text: "Both parties have failed here. I'll hire more border agents, speed up the courts, and create a real legal pathway — order and compassion aren't opposites.",
                scores: { policy: 8, base: 4, authenticity: 7, suburban: 8, viral: 2, donors: 5, press: 7 }
            },
            republican_conservative: {
                text: "On day one, I finish the wall, end catch-and-release, and deport the criminals. A country without a border isn't a country — period.",
                scores: { policy: 4, base: 9, authenticity: 8, suburban: 2, viral: 8, donors: 4, press: 3 }
            },
            republican_moderate: {
                text: "Enforce the law, secure the border, and fix the legal system so people come the right way. We can be a nation of laws and a nation of immigrants at the same time.",
                scores: { policy: 7, base: 6, authenticity: 7, suburban: 7, viral: 2, donors: 6, press: 6 }
            },
        },
        "Healthcare": {
            democrat_progressive: {
                text: "No one in the richest nation on earth should go bankrupt because they got sick. I'll fight for a strong public option and take on the insurance companies bankrolling my opponent's campaign.",
                scores: { policy: 7, base: 9, authenticity: 7, suburban: 4, viral: 6, donors: -2, press: 5 }
            },
            democrat_moderate: {
                text: "Let's build on what works: cap drug prices like insulin, let Medicare negotiate, and close the coverage gaps. Practical steps families feel in their first bill.",
                scores: { policy: 8, base: 5, authenticity: 6, suburban: 8, viral: 2, donors: 5, press: 7 }
            },
            republican_conservative: {
                text: "A government takeover means longer lines and fewer choices. I'll expand health savings accounts, force real price transparency, and let competition drive costs down.",
                scores: { policy: 6, base: 8, authenticity: 6, suburban: 4, viral: 3, donors: 7, press: 4 }
            },
            republican_moderate: {
                text: "Protect people with pre-existing conditions, cap out-of-pocket drug costs, and give states flexibility to innovate. Fix what's broken without breaking what works.",
                scores: { policy: 7, base: 5, authenticity: 7, suburban: 8, viral: 2, donors: 6, press: 7 }
            },
        },
        "Democracy & Institutions": {
            democrat_progressive: {
                text: "Democracy doesn't die in one dramatic moment — it erodes while good people stay quiet. I'll ban congressional stock trading, end dark money, and protect every American's right to vote.",
                scores: { policy: 6, base: 8, authenticity: 8, suburban: 5, viral: 6, donors: 1, press: 6 }
            },
            democrat_moderate: {
                text: "Trust is earned with results. I'll sign the toughest ethics package in a generation and work with anyone, from either party, who puts country over party.",
                scores: { policy: 7, base: 4, authenticity: 8, suburban: 8, viral: 2, donors: 5, press: 7 }
            },
            republican_conservative: {
                text: "You want to restore trust? Shrink the unelected bureaucracy that answers to no one. I'll cut the administrative state down to size and return power to the people.",
                scores: { policy: 5, base: 9, authenticity: 7, suburban: 3, viral: 6, donors: 6, press: 3 }
            },
            republican_moderate: {
                text: "Term limits, ethics reform, and a government that does a few things well instead of everything badly. Respect is earned through competence, not speeches.",
                scores: { policy: 7, base: 5, authenticity: 8, suburban: 8, viral: 2, donors: 5, press: 7 }
            },
        },
        "Foreign Policy": {
            democrat_progressive: {
                text: "Endless wars cost us trillions that should have been invested at home. I'll lead with diplomacy, stand by our democratic allies, and never send troops to fight without leveling with the American people first.",
                scores: { policy: 6, base: 7, authenticity: 7, suburban: 5, viral: 3, donors: 3, press: 5 }
            },
            democrat_moderate: {
                text: "America is strongest when our alliances are strong. I'll rebuild them, compete with our adversaries from a position of strength, and keep our commitments to the troops.",
                scores: { policy: 8, base: 4, authenticity: 6, suburban: 7, viral: 1, donors: 7, press: 8 }
            },
            republican_conservative: {
                text: "Peace through strength — it's that simple. Our enemies fear a strong America, and our allies need to start paying their fair share for their own defense.",
                scores: { policy: 5, base: 9, authenticity: 7, suburban: 5, viral: 5, donors: 6, press: 4 }
            },
            republican_moderate: {
                text: "Deterrence works when it's credible. I'll rebuild the military, hold our alliances together, and make sure no adversary ever doubts American resolve.",
                scores: { policy: 8, base: 6, authenticity: 6, suburban: 7, viral: 1, donors: 7, press: 7 }
            },
        },
        "Climate & Energy": {
            democrat_progressive: {
                text: "The scientists aren't guessing — this is the fight of our lifetime. I'll launch a clean energy build-out that creates millions of union jobs, because saving the planet and saving the middle class are the same project.",
                scores: { policy: 6, base: 9, authenticity: 7, suburban: 3, viral: 6, donors: -1, press: 5 }
            },
            democrat_moderate: {
                text: "Clean energy is the biggest economic opportunity of this century, and other countries want to eat our lunch. I'll cut emissions while keeping your power bill down — both, not one or the other.",
                scores: { policy: 8, base: 5, authenticity: 6, suburban: 7, viral: 2, donors: 6, press: 7 }
            },
            republican_conservative: {
                text: "I won't sacrifice American jobs to a climate agenda written by people who fly private. Drill here, build nuclear, and let American innovation — not regulation — lead the way.",
                scores: { policy: 5, base: 9, authenticity: 7, suburban: 3, viral: 6, donors: 7, press: 3 }
            },
            republican_moderate: {
                text: "All of the above: natural gas, nuclear, renewables — whatever keeps energy cheap, reliable, and American-made. Innovation beats mandates every time.",
                scores: { policy: 7, base: 6, authenticity: 6, suburban: 7, viral: 2, donors: 7, press: 6 }
            },
        },
        "Culture & Values": {
            democrat_progressive: {
                text: "Unity doesn't mean silence in the face of injustice. I'll defend every American's freedom to be who they are — and I'll never let politicians divide us to distract from picking our pockets.",
                scores: { policy: 3, base: 9, authenticity: 8, suburban: 3, viral: 7, donors: 1, press: 5 }
            },
            democrat_moderate: {
                text: "Most Americans aren't at war with their neighbors — they're worried about the mortgage and their kids' school. Let's turn down the volume and get back to solving real problems together.",
                scores: { policy: 4, base: 4, authenticity: 8, suburban: 9, viral: 3, donors: 5, press: 7 }
            },
            republican_conservative: {
                text: "I'll say what millions are thinking: parents, not bureaucrats, should decide what their kids are taught. Faith, family, and freedom aren't relics — they're the foundation.",
                scores: { policy: 3, base: 9, authenticity: 8, suburban: 2, viral: 8, donors: 4, press: 3 }
            },
            republican_moderate: {
                text: "Our disagreements are real, but so is what binds us — we're neighbors before we're partisans. I'll be a president for the people who voted against me too.",
                scores: { policy: 4, base: 4, authenticity: 8, suburban: 9, viral: 3, donors: 5, press: 7 }
            },
        },
    },

    // Fallback if a topic key is ever missing
    genericResponses: {
        democrat_progressive: { text: "The old approaches haven't worked. We need bold, structural change, and I'm the only one on this stage willing to fight for it.", scores: { policy: 5, base: 8, authenticity: 6, suburban: 3, viral: 5, donors: 2, press: 5 } },
        democrat_moderate: { text: "I have a serious, costed plan on this — and unlike my opponent, I'll work with both parties to actually get it done.", scores: { policy: 7, base: 5, authenticity: 7, suburban: 7, viral: 2, donors: 6, press: 7 } },
        republican_conservative: { text: "The answer isn't more government — it never is. Freedom works, and I'll get Washington out of your way.", scores: { policy: 5, base: 9, authenticity: 7, suburban: 4, viral: 5, donors: 6, press: 4 } },
        republican_moderate: { text: "Common sense isn't complicated: solve the problem, respect the taxpayer, and tell people the truth.", scores: { policy: 6, base: 5, authenticity: 8, suburban: 8, viral: 2, donors: 6, press: 7 } },
    },

    // ═══════════════════════════════════════════════
    // BROADCAST DRESSING
    // ═══════════════════════════════════════════════
    moderators: [
        { name: "Dana Whitfield", network: "GNN" },
        { name: "Marcus Cole", network: "NBS News" },
        { name: "Priya Raman", network: "American Public Broadcasting" },
        { name: "Jack Delaney", network: "Constitution News Network" },
    ],

    moderatorIntros: [
        "Good evening from the debate hall. Tonight, the candidates face off on the issues that will decide this election.",
        "Welcome to tonight's presidential debate. The rules are simple: direct answers, no interruptions, and the American people are watching.",
        "Tonight could reshape this race. Candidates, your podiums await — let's begin.",
    ],

    punditQuotes: {
        playerWin: [
            "\"{WINNER} came in with a plan and executed it. {LOSER} never found footing tonight.\"",
            "\"That was {WINNER}'s best night of the campaign. The clips will run all week.\"",
            "\"{LOSER}'s team will call it a draw. It wasn't. {WINNER} controlled every exchange that mattered.\"",
            "\"Undecided voters in our focus group broke hard for {WINNER} after the second question.\"",
            "\"{WINNER} looked presidential tonight. That word gets overused — tonight it applies.\"",
        ],
        opponentWin: [
            "\"{WINNER} took the fight to {LOSER} and never let up. A clear night for the challenger of every exchange.\"",
            "\"{LOSER} seemed rattled from the opening statement. {WINNER}'s team is celebrating tonight.\"",
            "\"Our focus group dials went flat every time {LOSER} spoke. That's a problem with three weeks of coverage ahead.\"",
            "\"The story tomorrow isn't the policy — it's that {WINNER} won the room and knew it.\"",
            "\"{LOSER} needed a moment tonight and never found one. {WINNER} found three.\"",
        ],
        tie: [
            "\"Both candidates landed punches, neither landed a knockout. The race stays where it was.\"",
            "\"A draw on points — which means the ground game decides this one.\"",
            "\"Partisans on both sides will claim victory. Swing voters saw two candidates fighting to a standstill.\"",
            "\"No viral moment, no disaster on either side. Campaigns will take it and move on.\"",
        ],
    },

    audienceReactions: {
        strong: [
            "The hall erupts in applause.",
            "Sustained applause — even the moderator pauses.",
            "That line lands. The clip is already circulating online.",
            "Audible cheers from the audience despite the no-applause rule.",
        ],
        weak: [
            "Scattered applause fades quickly.",
            "A murmur runs through the hall.",
            "The audience is quiet. The moment passes.",
            "Some in the crowd exchange glances.",
        ],
        neutral: [
            "Polite applause from both sides of the hall.",
            "The hall stays measured — voters taking notes.",
            "A split crowd reacts along party lines.",
        ],
    },

    snapPollOutlets: ["GNN Instant Poll", "NBS Flash Survey", "Beacon Analytics Snap Poll"],
};
