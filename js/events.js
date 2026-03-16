/**
 * Election 2028 — Event & Scenario System
 * Dynamic campaign events, debate system, and breaking news
 */

window.EventSystem = {

    // ═══════════════════════════════════════════════
    // EVENT DATABASE
    // ═══════════════════════════════════════════════
    EVENTS: {
        NATIONAL_CRISIS: [
            {
                id: "border_crisis", title: "Border Crisis Dominates Headlines",
                description: "A surge of migrants at the southern border triggers wall-to-wall cable news coverage. Both parties scramble to frame the narrative.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.08,
                effects: { mediaScore: -5, scandalVulnerability: 5 },
                choices: [
                    { text: "Call for comprehensive reform with border security measures", effects: { approval: 2, crossoverAppeal: 3, baseEnthusiasm: -2 }, riskLevel: "moderate", outcomeText: "Pundits praise the nuanced stance, but activists on both sides grumble." },
                    { text: "Take a hard line matching the news cycle's energy", effects: { baseEnthusiasm: 5, crossoverAppeal: -4, mediaScore: 3 }, riskLevel: "risky", outcomeText: "The base loves it, but swing voters express concern about the rhetoric." },
                    { text: "Pivot to economic messaging and ignore the bait", effects: { approval: -1, mediaScore: -3, discipline: 5 }, riskLevel: "safe", outcomeText: "Critics accuse you of dodging the issue, but your economic message stays consistent." }
                ],
                targetParty: "both", affectedStates: ["AZ", "TX", "NV"], isBreakingNews: true, duration: 2
            },
            {
                id: "inflation_spike", title: "Inflation Report Shocks Markets",
                description: "The latest CPI numbers come in hot — prices are rising faster than expected. Voters are angry about grocery bills and gas prices.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.07,
                effects: { approval: -3 },
                choices: [
                    { text: "Release a detailed economic plan targeting price gouging", effects: { approval: 3, donorConfidence: 2, mediaScore: 4 }, riskLevel: "moderate", outcomeText: "The plan gets coverage. Economists are mixed, but voters feel heard." },
                    { text: "Blame your opponent's party for the economic mess", effects: { baseEnthusiasm: 4, approval: 1, crossoverAppeal: -2 }, riskLevel: "safe", outcomeText: "The attack lands with your base but feels partisan to undecideds." },
                    { text: "Promise emergency executive action on day one", effects: { baseEnthusiasm: 6, donorConfidence: -3, mediaScore: 2 }, riskLevel: "risky", outcomeText: "The bold promise energizes supporters but spooks Wall Street donors." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            },
            {
                id: "stock_crash", title: "Markets in Freefall",
                description: "The Dow drops 1,200 points in a single day. Retirement accounts are hit. The economic anxiety narrative explodes.",
                category: "NATIONAL_CRISIS", phase: "general", probability: 0.04,
                effects: { approval: -4, donorConfidence: -5 },
                choices: [
                    { text: "Project calm and offer a steady-hand economic vision", effects: { approval: 3, donorConfidence: 4, crossoverAppeal: 3 }, riskLevel: "safe", outcomeText: "The measured response reassures suburban voters and donors alike." },
                    { text: "Hammer the incumbent party for economic mismanagement", effects: { baseEnthusiasm: 5, mediaScore: 3, approval: 1 }, riskLevel: "moderate", outcomeText: "The attack resonates with frustrated voters watching their 401(k)s shrink." },
                    { text: "Propose radical Wall Street reform to channel the anger", effects: { baseEnthusiasm: 7, donorConfidence: -8, crossoverAppeal: -2 }, riskLevel: "desperate", outcomeText: "Populist energy surges — but major donors start returning calls from your opponent." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "hurricane_response", title: "Category 4 Hurricane Slams Gulf Coast",
                description: "A devastating hurricane makes landfall. The federal response becomes a political football as communities struggle to recover.",
                category: "NATIONAL_CRISIS", phase: "general", probability: 0.05,
                effects: { mediaScore: 5 },
                choices: [
                    { text: "Visit the disaster zone and pledge federal aid expansion", effects: { approval: 4, mediaScore: 5, cash: -200000 }, riskLevel: "moderate", outcomeText: "The images of you on the ground play well. Local officials appreciate the attention." },
                    { text: "Hold a policy press conference on disaster preparedness", effects: { approval: 1, mediaScore: -1, discipline: 3 }, riskLevel: "safe", outcomeText: "Substantive but boring. Cable news cuts away after two minutes." },
                    { text: "Criticize the government response and demand accountability", effects: { baseEnthusiasm: 3, approval: -1, mediaScore: 4 }, riskLevel: "risky", outcomeText: "The attack energizes your base but some see it as politicizing a tragedy." }
                ],
                targetParty: "both", affectedStates: ["FL", "TX", "LA"], isBreakingNews: true, duration: 3
            },
            {
                id: "foreign_flashpoint", title: "Foreign Policy Crisis Erupts",
                description: "A sudden international incident forces candidates to address national security. Cable news runs 24/7 coverage. The Commander-in-Chief test arrives early.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.06,
                effects: { mediaScore: 3 },
                choices: [
                    { text: "Issue a strong but measured statement calling for diplomacy", effects: { approval: 2, crossoverAppeal: 3, debate: 2 }, riskLevel: "safe", outcomeText: "Foreign policy experts nod approvingly. Your tone reads as presidential." },
                    { text: "Take a hawkish stance and project strength", effects: { baseEnthusiasm: 4, crossoverAppeal: -2, mediaScore: 3 }, riskLevel: "moderate", outcomeText: "Hawks love it. Doves are worried. Cable news plays your clip on loop." },
                    { text: "Accuse your opponent of being weak on foreign threats", effects: { baseEnthusiasm: 3, approval: -2, mediaScore: 2 }, riskLevel: "risky", outcomeText: "The attack muddies the waters but some voters think you're exploiting the crisis." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "mass_shooting", title: "Mass Shooting Reignites Gun Debate",
                description: "A horrific shooting dominates the news cycle. Pressure mounts on both candidates to address gun violence.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.06,
                effects: { scandalVulnerability: 3 },
                choices: [
                    { text: "Call for specific gun reform legislation", effects: { baseEnthusiasm: 4, crossoverAppeal: 1, approval: 2 }, riskLevel: "moderate", outcomeText: "Gun reform advocates rally behind you. The NRA puts you on notice." },
                    { text: "Focus on mental health and community safety", effects: { crossoverAppeal: 3, baseEnthusiasm: -2, approval: 1 }, riskLevel: "safe", outcomeText: "A careful middle path. Neither side is fully satisfied, but swing voters nod." },
                    { text: "Use the moment to make an impassioned plea that goes viral", effects: { mediaScore: 8, baseEnthusiasm: 6, scandalVulnerability: 4 }, riskLevel: "risky", outcomeText: "The clip goes everywhere. It's powerful — but opponents accuse you of exploiting tragedy." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "pandemic_scare", title: "New Virus Variant Raises Alarm",
                description: "Health officials warn of a concerning new pathogen. Memories of COVID-19 haunt voters. How you respond could define your campaign.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.04,
                effects: { approval: -2, scandalVulnerability: 5 },
                choices: [
                    { text: "Call for calm preparedness and defer to medical experts", effects: { approval: 3, crossoverAppeal: 4, baseEnthusiasm: -1 }, riskLevel: "safe", outcomeText: "The steady approach polls well with moderates. Your base yawns." },
                    { text: "Demand transparency and criticize government readiness", effects: { baseEnthusiasm: 3, mediaScore: 3, approval: 1 }, riskLevel: "moderate", outcomeText: "The attack on preparedness lands. Opponents say you're fear-mongering." },
                    { text: "Make a major health freedom speech emphasizing personal choice", effects: { baseEnthusiasm: 5, crossoverAppeal: -5, mediaScore: 4 }, riskLevel: "risky", outcomeText: "The liberty message thrills your base but alienates health-conscious suburban voters." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            },
            {
                id: "cyber_attack", title: "Major Cyberattack Hits Government Systems",
                description: "Federal agencies report a massive breach. Voter data, financial records, and infrastructure systems are compromised. National security takes center stage.",
                category: "NATIONAL_CRISIS", phase: "general", probability: 0.03,
                effects: { mediaScore: 4, scandalVulnerability: 3 },
                choices: [
                    { text: "Propose a comprehensive cybersecurity overhaul", effects: { approval: 3, debate: 2, donorConfidence: 2 }, riskLevel: "safe", outcomeText: "Tech leaders praise the plan. Voters feel reassured by the specificity." },
                    { text: "Blame adversaries and call for aggressive retaliation", effects: { baseEnthusiasm: 5, crossoverAppeal: -1, mediaScore: 3 }, riskLevel: "moderate", outcomeText: "The tough talk gets airtime. Hawks approve. Doves worry about escalation." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "scotus_ruling", title: "Supreme Court Issues Blockbuster Ruling",
                description: "The Supreme Court hands down a landmark decision that reshapes the political landscape. Both sides claim vindication.",
                category: "NATIONAL_CRISIS", phase: "both", probability: 0.05,
                effects: { baseEnthusiasm: 5, scandalVulnerability: 3 },
                choices: [
                    { text: "Praise/criticize the ruling and mobilize your base", effects: { baseEnthusiasm: 6, crossoverAppeal: -2, mediaScore: 3 }, riskLevel: "safe", outcomeText: "Your base fires up. Fundraising emails pour in." },
                    { text: "Call for a constitutional response and institutional reform", effects: { approval: 2, mediaScore: 5, donorConfidence: -2 }, riskLevel: "moderate", outcomeText: "Reformers applaud. Institutionalists worry about norms." },
                    { text: "Make it the centerpiece of your entire campaign message", effects: { baseEnthusiasm: 8, crossoverAppeal: -4, mediaScore: 6 }, riskLevel: "risky", outcomeText: "It becomes your defining issue. Powerful with the base but risks looking single-issue." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            }
        ],

        MEDIA_FIRESTORM: [
            {
                id: "debate_gaffe", title: "Debate Answer Goes Viral — For All the Wrong Reasons",
                description: "A clip from a candidate forum is spreading across social media. The answer is awkward, evasive, or just plain strange. The memes are already flying.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.07,
                effects: { approval: -3, mediaScore: -5, scandalVulnerability: 5 },
                choices: [
                    { text: "Own it with humor — post a self-deprecating response", effects: { approval: 2, mediaScore: 4, authenticity: 5 }, riskLevel: "moderate", outcomeText: "The self-aware response wins respect. The news cycle moves on faster than expected." },
                    { text: "Ignore it and plow forward with policy", effects: { approval: -1, mediaScore: -2, discipline: 3 }, riskLevel: "safe", outcomeText: "You look disciplined but the clip keeps circulating without a counter-narrative." },
                    { text: "Go on a major show to give the 'real answer'", effects: { mediaScore: 3, approval: 1, scandalVulnerability: 4 }, riskLevel: "risky", outcomeText: "The interview gives you a second chance — but also keeps the story alive." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "leaked_donor_audio", title: "Leaked Audio from Private Fundraiser",
                description: "Someone recorded your private remarks at a high-dollar fundraiser. The quotes sound different from your public messaging. Cable news has the tape.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.05,
                effects: { approval: -4, donorConfidence: -3, authenticity: -5 },
                choices: [
                    { text: "Release the full unedited recording for context", effects: { approval: 2, authenticity: 4, mediaScore: 2 }, riskLevel: "moderate", outcomeText: "The full tape is less damning than the clip. Transparency helps, but the damage is real." },
                    { text: "Attack the leak as a dirty trick from the opposition", effects: { baseEnthusiasm: 3, mediaScore: -2, approval: -1 }, riskLevel: "risky", outcomeText: "Your base buys the conspiracy angle. Undecideds see deflection." },
                    { text: "Acknowledge the comments and reaffirm your public positions", effects: { approval: 1, authenticity: 2, donorConfidence: 2 }, riskLevel: "safe", outcomeText: "A measured response. Not great, not terrible. The story fades in 48 hours." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "interview_collapse", title: "Hostile Interview Goes Sideways",
                description: "An aggressive interviewer caught your candidate flat-footed. The exchange is combative, and the worst moments are already clipped for social media.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.06,
                effects: { approval: -3, mediaScore: -4, debate: -3 },
                choices: [
                    { text: "Blame the interviewer's bias and rally your base", effects: { baseEnthusiasm: 5, crossoverAppeal: -3, mediaScore: 1 }, riskLevel: "moderate", outcomeText: "The 'biased media' narrative resonates with supporters. Others see sour grapes." },
                    { text: "Schedule a friendlier interview to get your message out clean", effects: { mediaScore: 2, approval: 1, discipline: 2 }, riskLevel: "safe", outcomeText: "The softball follow-up helps, but opponents mock you for running to friendly turf." },
                    { text: "Challenge the interviewer to a one-on-one rematch", effects: { mediaScore: 6, baseEnthusiasm: 4, scandalVulnerability: 5 }, riskLevel: "desperate", outcomeText: "Bold move. If the rematch goes well you're a fighter. If not, you're done." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "social_media_backlash", title: "Social Media Backlash Erupts",
                description: "A tweet, post, or campaign ad has generated massive backlash online. The hashtag is trending. Influencers are piling on.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.08,
                effects: { onlineInfluence: -5, mediaScore: -3 },
                choices: [
                    { text: "Delete the post and issue a quick clarification", effects: { approval: -1, onlineInfluence: 1, mediaScore: 1 }, riskLevel: "safe", outcomeText: "Screenshots of the deleted post circulate, but the story dies faster." },
                    { text: "Double down and let it become a culture war moment", effects: { baseEnthusiasm: 6, crossoverAppeal: -5, onlineInfluence: 3 }, riskLevel: "risky", outcomeText: "Your base loves the defiance. But you've become the main character today — for the wrong reasons." },
                    { text: "Respond with a thoughtful long-form explanation", effects: { approval: 2, authenticity: 3, mediaScore: 2 }, riskLevel: "moderate", outcomeText: "The effort to explain wins some respect but keeps the story in the news." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "deepfake_controversy", title: "AI Deepfake of Candidate Goes Viral",
                description: "A convincing AI-generated video of your candidate saying something outrageous is spreading like wildfire. Even after debunking, the damage lingers.",
                category: "MEDIA_FIRESTORM", phase: "general", probability: 0.04,
                effects: { approval: -3, mediaScore: -2, scandalVulnerability: 4 },
                choices: [
                    { text: "Demand an FBI investigation and make it about AI threats", effects: { approval: 3, mediaScore: 4, debate: 2 }, riskLevel: "moderate", outcomeText: "The pivot to AI safety gets traction. You look like a victim and a leader." },
                    { text: "Flood social media with the debunking evidence", effects: { onlineInfluence: 3, approval: 1, mediaScore: 1 }, riskLevel: "safe", outcomeText: "Your rapid response team does good work. Most voters get the correction." },
                    { text: "Blame the opponent's campaign for orchestrating it", effects: { baseEnthusiasm: 4, approval: -2, scandalVulnerability: 3 }, riskLevel: "risky", outcomeText: "Without proof, the accusation makes you look conspiratorial." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "old_speech", title: "Old Speech Resurfaces with Damaging Quotes",
                description: "Opposition researchers unearthed a speech from years ago. The quotes, taken in or out of context, clash with your current platform.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.06,
                effects: { approval: -2, authenticity: -4, scandalVulnerability: 4 },
                choices: [
                    { text: "Explain that your views have evolved with new evidence", effects: { approval: 1, authenticity: -1, crossoverAppeal: 2 }, riskLevel: "moderate", outcomeText: "Reasonable people accept it. Opponents call it a flip-flop." },
                    { text: "Attack the opposition for playing dirty tricks", effects: { baseEnthusiasm: 3, approval: -1, mediaScore: -1 }, riskLevel: "safe", outcomeText: "Deflection partially works with your base but doesn't address the substance." },
                    { text: "Lean into it — say you still believe the core message", effects: { authenticity: 5, baseEnthusiasm: 4, crossoverAppeal: -4 }, riskLevel: "risky", outcomeText: "Authentic but potentially alienating. Your base respects the honesty." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 2
            },
            {
                id: "hot_mic", title: "Hot Mic Catches Candid Remarks",
                description: "A live microphone catches you saying something you definitely wouldn't say on stage. The clip is already on every platform.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.04,
                effects: { approval: -4, mediaScore: -4, authenticity: 3 },
                choices: [
                    { text: "Apologize immediately and directly", effects: { approval: 2, mediaScore: 1, baseEnthusiasm: -2 }, riskLevel: "safe", outcomeText: "The apology takes some air out of the story. Political reporters move on." },
                    { text: "Play it off with humor at the next public appearance", effects: { approval: 1, mediaScore: 3, scandalVulnerability: 3 }, riskLevel: "moderate", outcomeText: "The joke lands with some. Others think you're not taking it seriously." },
                    { text: "Claim the audio is distorted and out of context", effects: { approval: -2, authenticity: -3, baseEnthusiasm: 2 }, riskLevel: "desperate", outcomeText: "Nobody's buying it. The denial makes it worse." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 1
            },
            {
                id: "podcast_moment", title: "Viral Podcast Moment Explodes",
                description: "Your appearance on a major podcast produced a clip that's everywhere. Whether it helps or hurts depends on how you play it.",
                category: "MEDIA_FIRESTORM", phase: "both", probability: 0.07,
                effects: { onlineInfluence: 5, mediaScore: 3 },
                choices: [
                    { text: "Amplify the best parts and lean into the momentum", effects: { baseEnthusiasm: 4, onlineInfluence: 4, approval: 2 }, riskLevel: "safe", outcomeText: "The clip becomes your calling card. Young voters share it everywhere." },
                    { text: "Book more podcasts to build on the narrative", effects: { onlineInfluence: 6, mediaScore: 2, cash: -50000 }, riskLevel: "moderate", outcomeText: "The podcast tour builds real online momentum. Traditional media takes notice." },
                    { text: "Use it as a fundraising moment — 'they're trying to stop us'", effects: { cash: 300000, baseEnthusiasm: 3, crossoverAppeal: -1 }, riskLevel: "moderate", outcomeText: "The fundraising email breaks records. The victimhood angle is effective if tiresome." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "hacked_texts", title: "Campaign Staff Texts Hacked and Published",
                description: "Private text messages between senior campaign staff are leaked. The internal drama, strategy discussions, and unflattering assessments are now public.",
                category: "MEDIA_FIRESTORM", phase: "general", probability: 0.03,
                effects: { approval: -3, donorConfidence: -4, staffCompetence: -5 },
                choices: [
                    { text: "Fire the staff involved and project leadership", effects: { discipline: 4, donorConfidence: 2, staffCompetence: -3 }, riskLevel: "moderate", outcomeText: "The firings show decisiveness but lose institutional knowledge mid-campaign." },
                    { text: "Frame it as foreign interference and demand investigation", effects: { mediaScore: 3, approval: 1, baseEnthusiasm: 2 }, riskLevel: "safe", outcomeText: "The foreign interference angle gives cover. National security hawks sympathize." },
                    { text: "Own the chaos and joke that every campaign is messy", effects: { authenticity: 4, approval: 1, donorConfidence: -1 }, riskLevel: "risky", outcomeText: "Refreshingly honest. But donors aren't laughing at the internal dysfunction." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            }
        ],

        PARTY_DRAMA: [
            {
                id: "primary_holdout", title: "Primary Rival Refuses to Drop Out",
                description: "A defeated primary challenger is staying in the race, draining resources and preventing party unity. The delegate math is clear — but they won't quit.",
                category: "PARTY_DRAMA", phase: "primary", probability: 0.06,
                effects: { baseEnthusiasm: -4, cash: -200000 },
                choices: [
                    { text: "Offer an olive branch — a speaking slot and policy concession", effects: { baseEnthusiasm: 3, approval: 1, crossoverAppeal: -1 }, riskLevel: "moderate", outcomeText: "The rival accepts grudgingly. Unity improves but at a policy cost." },
                    { text: "Ignore them and focus on the general election", effects: { baseEnthusiasm: -2, discipline: 3, crossoverAppeal: 2 }, riskLevel: "safe", outcomeText: "You look presidential. But the holdout keeps sniping from the sidelines." },
                    { text: "Pressure donors to cut them off and force withdrawal", effects: { baseEnthusiasm: -1, donorConfidence: 3, approval: -2 }, riskLevel: "risky", outcomeText: "The hardball works but creates lasting resentment from the rival's supporters." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 3
            },
            {
                id: "party_elder_criticism", title: "Party Elder Drops Public Criticism",
                description: "A beloved senior figure in your party just went on the record questioning your campaign's direction. The quote is devastating and it's everywhere.",
                category: "PARTY_DRAMA", phase: "both", probability: 0.05,
                effects: { approval: -3, donorConfidence: -4 },
                choices: [
                    { text: "Publicly praise them but respectfully disagree", effects: { approval: 2, donorConfidence: 2, discipline: 3 }, riskLevel: "safe", outcomeText: "The high road response diffuses the tension. Donors exhale." },
                    { text: "Hit back — this is your party now", effects: { baseEnthusiasm: 4, approval: -2, donorConfidence: -3 }, riskLevel: "risky", outcomeText: "Your base loves the fight. The establishment recoils." },
                    { text: "Seek a private meeting to resolve differences", effects: { donorConfidence: 4, approval: 1, mediaScore: -1 }, riskLevel: "moderate", outcomeText: "The back-channel diplomacy works. A joint statement follows." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 2
            },
            {
                id: "activist_revolt", title: "Activist Wing Threatens Revolt",
                description: "The activist wing of your party is threatening to sit out the election unless you commit to their priority issue. Protest signs are already printed.",
                category: "PARTY_DRAMA", phase: "both", probability: 0.06,
                effects: { baseEnthusiasm: -5, groundGame: -3 },
                choices: [
                    { text: "Meet with activist leaders and negotiate a commitment", effects: { baseEnthusiasm: 5, crossoverAppeal: -3, groundGame: 2 }, riskLevel: "moderate", outcomeText: "The activists stand down — for now. Your general election pivot just got harder." },
                    { text: "Hold firm on your moderate position", effects: { crossoverAppeal: 3, baseEnthusiasm: -3, groundGame: -2 }, riskLevel: "risky", outcomeText: "Moderates respect the backbone. The activist wing starts making noise about a third party." },
                    { text: "Make a symbolic gesture without changing policy", effects: { baseEnthusiasm: 1, approval: 1, authenticity: -2 }, riskLevel: "safe", outcomeText: "The gesture buys time but everyone knows it's performative." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 2
            },
            {
                id: "vp_leak", title: "VP Shortlist Leaks to the Press",
                description: "Your closely guarded VP shortlist has been leaked. The names are generating strong reactions — some good, some very bad.",
                category: "PARTY_DRAMA", phase: "general", probability: 0.05,
                effects: { mediaScore: 4, donorConfidence: -2, scandalVulnerability: 3 },
                choices: [
                    { text: "Deny the list is final and add a surprise name", effects: { mediaScore: 3, approval: 1, donorConfidence: 1 }, riskLevel: "moderate", outcomeText: "The surprise name generates buzz and takes the heat off the leaked list." },
                    { text: "Accelerate the VP announcement to control the story", effects: { baseEnthusiasm: 4, mediaScore: 5, scandalVulnerability: -2 }, riskLevel: "risky", outcomeText: "The early announcement dominates a news cycle. Risky if the pick isn't ready." },
                    { text: "Downplay it and let the speculation run its course", effects: { mediaScore: -2, discipline: 3, approval: 0 }, riskLevel: "safe", outcomeText: "The story fades. But the leak reveals a staff discipline problem." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "endorsement_surprise", title: "Unexpected Cross-Party Endorsement",
                description: "A prominent figure from the opposing party just endorsed your campaign. It's a bombshell — but it could also alienate your own base.",
                category: "PARTY_DRAMA", phase: "general", probability: 0.04,
                effects: { mediaScore: 6, crossoverAppeal: 5 },
                choices: [
                    { text: "Enthusiastically accept and spotlight the endorsement", effects: { crossoverAppeal: 5, baseEnthusiasm: -3, mediaScore: 4 }, riskLevel: "moderate", outcomeText: "Independents love it. Party purists are furious." },
                    { text: "Accept graciously but keep your base messaging front and center", effects: { crossoverAppeal: 2, baseEnthusiasm: 1, approval: 2 }, riskLevel: "safe", outcomeText: "A balanced approach. You get the benefit without fully alienating your base." },
                    { text: "Make it a campaign centerpiece — 'Country over party'", effects: { crossoverAppeal: 7, baseEnthusiasm: -5, mediaScore: 6 }, riskLevel: "risky", outcomeText: "Massive media coverage. But your party activists feel betrayed." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "donor_revolt", title: "Major Donors Threaten to Pull Support",
                description: "A group of your biggest bundlers is threatening to redirect funds unless you moderate on a key issue. The money spigot is in jeopardy.",
                category: "PARTY_DRAMA", phase: "both", probability: 0.05,
                effects: { donorConfidence: -8, cash: -500000 },
                choices: [
                    { text: "Stand firm — you won't be bought", effects: { authenticity: 5, baseEnthusiasm: 4, donorConfidence: -3, cash: -300000 }, riskLevel: "risky", outcomeText: "Small-dollar donations surge as your base rallies. But the war chest takes a hit." },
                    { text: "Quietly adjust your language to satisfy donors", effects: { donorConfidence: 5, cash: 400000, authenticity: -4 }, riskLevel: "moderate", outcomeText: "The money flows again. But your base notices the shift in rhetoric." },
                    { text: "Propose a compromise position and hold a donor call", effects: { donorConfidence: 3, cash: 100000, approval: 1 }, riskLevel: "safe", outcomeText: "The call goes reasonably well. Most donors stay. The compromise satisfies no one completely." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 2
            },
            {
                id: "staff_mutiny", title: "Senior Staff Resignation Shakes Campaign",
                description: "Your campaign manager and a top strategist just quit in a messy public departure. Internal sources are talking to reporters.",
                category: "PARTY_DRAMA", phase: "both", probability: 0.03,
                effects: { discipline: -8, donorConfidence: -5, staffCompetence: -10, groundGame: -5 },
                choices: [
                    { text: "Bring in a heavyweight replacement and project confidence", effects: { donorConfidence: 4, discipline: 3, cash: -200000 }, riskLevel: "moderate", outcomeText: "The new hire generates a 'fresh start' narrative. But institutional memory is gone." },
                    { text: "Promote from within and spin it as addition by subtraction", effects: { staffCompetence: 2, approval: 1, discipline: 1 }, riskLevel: "safe", outcomeText: "The transition is smoother than expected. Insiders breathe easier." },
                    { text: "Go to war with the departing staff in the press", effects: { baseEnthusiasm: 2, approval: -3, mediaScore: -4 }, riskLevel: "desperate", outcomeText: "The public brawl makes your campaign look chaotic and petty." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            },
            {
                id: "surrogate_rogue", title: "Campaign Surrogate Goes Rogue on Live TV",
                description: "A high-profile surrogate just said something completely off-message on cable news. It's already the top trending topic.",
                category: "PARTY_DRAMA", phase: "both", probability: 0.07,
                effects: { mediaScore: -3, surrogateStrength: -4, scandalVulnerability: 3 },
                choices: [
                    { text: "Quickly distance yourself from the comments", effects: { approval: 1, surrogateStrength: -2, discipline: 2 }, riskLevel: "safe", outcomeText: "You contain the damage. The surrogate is quietly benched." },
                    { text: "Stand by your surrogate and ride out the storm", effects: { surrogateStrength: 2, approval: -2, baseEnthusiasm: 3 }, riskLevel: "risky", outcomeText: "Loyalty matters. But the controversial comments are now tied to your campaign." },
                    { text: "Use it as a media moment to clarify your actual position", effects: { mediaScore: 2, approval: 2, debate: 2 }, riskLevel: "moderate", outcomeText: "The pivot works — you get airtime to set the record straight." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            }
        ],

        CAMPAIGN_TRAIL: [
            {
                id: "factory_closure", title: "Major Factory Closure in Swing State",
                description: "A major employer just announced layoffs in a key battleground state. The workers are angry and looking for someone to blame.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.06,
                effects: { approval: -2 },
                choices: [
                    { text: "Rush to the factory and stand with the workers", effects: { approval: 4, baseEnthusiasm: 3, cash: -100000 }, riskLevel: "moderate", outcomeText: "The images of you with workers play well. Union leaders take notice." },
                    { text: "Release a detailed economic revitalization plan", effects: { approval: 2, debate: 2, donorConfidence: 2 }, riskLevel: "safe", outcomeText: "The plan gets coverage in policy circles. Workers wanted empathy, not a white paper." },
                    { text: "Blame trade deals your opponent supported", effects: { baseEnthusiasm: 4, approval: 1, crossoverAppeal: -1 }, riskLevel: "moderate", outcomeText: "The attack connects with blue-collar voters but fact-checkers push back." }
                ],
                targetParty: "both", affectedStates: ["PA", "MI", "WI", "OH"], isBreakingNews: false, duration: 2
            },
            {
                id: "union_battle", title: "Major Union Endorsement Up for Grabs",
                description: "A powerful union is weighing its presidential endorsement. Both campaigns are making their pitch. The endorsement brings money, ground game, and credibility.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.06,
                effects: { groundGame: 3 },
                choices: [
                    { text: "Make a bold pro-labor pledge to win the endorsement", effects: { baseEnthusiasm: 5, groundGame: 5, donorConfidence: -2, crossoverAppeal: -1 }, riskLevel: "moderate", outcomeText: "You win the endorsement! Union volunteers flood key states. Business donors grumble." },
                    { text: "Court union leaders with private meetings and moderate promises", effects: { groundGame: 2, donorConfidence: 1, approval: 1 }, riskLevel: "safe", outcomeText: "The union splits its endorsement. Not a win, but not a loss." },
                    { text: "Skip the union vote and focus on non-union working class", effects: { crossoverAppeal: 2, groundGame: -2, baseEnthusiasm: -2 }, riskLevel: "risky", outcomeText: "Bold gamble. You court working-class voters directly but lose organized labor infrastructure." }
                ],
                targetParty: "both", affectedStates: ["PA", "MI", "WI", "NV"], isBreakingNews: false, duration: 2
            },
            {
                id: "campus_protests", title: "Campus Protests Force Campaign Response",
                description: "Protests at universities are growing. Student activists demand your campaign take a stand. The media is watching to see how you handle it.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.06,
                effects: { scandalVulnerability: 4 },
                choices: [
                    { text: "Meet with student leaders and show empathy", effects: { baseEnthusiasm: 3, crossoverAppeal: -2, onlineInfluence: 3 }, riskLevel: "moderate", outcomeText: "Young voters are energized. Older voters question your judgment." },
                    { text: "Call for peaceful dialogue while staying above the fray", effects: { approval: 1, crossoverAppeal: 2, baseEnthusiasm: -2 }, riskLevel: "safe", outcomeText: "Safe play. Nobody's thrilled, nobody's furious." },
                    { text: "Use the protests as a wedge issue against your opponent", effects: { baseEnthusiasm: 5, crossoverAppeal: -4, mediaScore: 3 }, riskLevel: "risky", outcomeText: "Culture war energy. Your base feeds off the conflict, but you're playing with fire." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "viral_townhall", title: "Town Hall Moment Goes Viral",
                description: "A powerful, unscripted moment at your town hall is blowing up online. A voter asked a tough question and your answer connected.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.07,
                effects: { onlineInfluence: 5, approval: 3, authenticity: 4 },
                choices: [
                    { text: "Amplify it everywhere — this is your campaign in a nutshell", effects: { onlineInfluence: 5, baseEnthusiasm: 4, mediaScore: 4 }, riskLevel: "safe", outcomeText: "The clip becomes your de facto campaign ad. Donations spike." },
                    { text: "Book follow-up town halls to recreate the magic", effects: { approval: 2, groundGame: 2, cash: -80000 }, riskLevel: "moderate", outcomeText: "Lightning doesn't strike twice, but the format suits you. Steady gains." },
                    { text: "Use the momentum to launch a major policy push", effects: { approval: 3, debate: 3, donorConfidence: 3 }, riskLevel: "moderate", outcomeText: "The viral moment gives oxygen to your policy platform. Smart play." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "celebrity_endorsement", title: "Celebrity Endorsement Generates Buzz",
                description: "A major celebrity just publicly backed your campaign. The endorsement is generating huge media coverage — but celebrity endorsements cut both ways.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.06,
                effects: { mediaScore: 4, onlineInfluence: 4 },
                choices: [
                    { text: "Bring them to rallies and leverage their platform", effects: { baseEnthusiasm: 4, onlineInfluence: 5, crossoverAppeal: -2 }, riskLevel: "moderate", outcomeText: "Rally attendance spikes. But opponents mock the Hollywood connection." },
                    { text: "Thank them publicly but keep focus on policy", effects: { approval: 2, discipline: 2, mediaScore: 1 }, riskLevel: "safe", outcomeText: "Dignified response. You get the benefit without the cultural blowback." },
                    { text: "Launch a celebrity-driven fundraising blitz", effects: { cash: 500000, baseEnthusiasm: 2, crossoverAppeal: -3 }, riskLevel: "moderate", outcomeText: "The money rolls in. The 'out-of-touch celebrity candidate' attacks follow." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            },
            {
                id: "voter_reg_surge", title: "Voter Registration Surge in Key State",
                description: "New voter registrations are surging in a battleground state. The demographics of the new registrants could shift the race.",
                category: "CAMPAIGN_TRAIL", phase: "general", probability: 0.05,
                effects: { groundGame: 4 },
                choices: [
                    { text: "Invest heavily in contacting and mobilizing new registrants", effects: { groundGame: 5, baseTurnout: 4, cash: -200000 }, riskLevel: "moderate", outcomeText: "Your field team reaches thousands of new voters. Ground game metrics look strong." },
                    { text: "Adjust messaging to appeal to the new voter demographics", effects: { persuadableSupport: 3, approval: 1, crossoverAppeal: 2 }, riskLevel: "safe", outcomeText: "Smart targeting. Your message is reaching the right ears." },
                    { text: "Challenge voter eligibility and raise election integrity concerns", effects: { baseEnthusiasm: 3, approval: -4, crossoverAppeal: -5 }, riskLevel: "desperate", outcomeText: "The election integrity angle excites conspiracists. Everyone else is horrified." }
                ],
                targetParty: "both", affectedStates: ["PA", "GA", "AZ", "NV"], isBreakingNews: false, duration: 2
            },
            {
                id: "rally_incident", title: "Rally Disrupted by Protesters",
                description: "Your campaign rally was disrupted by organized protesters. The confrontation was caught on camera. How you handle it defines the narrative.",
                category: "CAMPAIGN_TRAIL", phase: "both", probability: 0.07,
                effects: { mediaScore: -2, scandalVulnerability: 3 },
                choices: [
                    { text: "Engage the protesters directly and try to have a dialogue", effects: { authenticity: 5, approval: 2, mediaScore: 4 }, riskLevel: "risky", outcomeText: "The clip of you facing protesters head-on goes viral. Brave or foolish? Depends who's watching." },
                    { text: "Have security remove them while continuing your speech", effects: { discipline: 3, baseEnthusiasm: 2, approval: -1 }, riskLevel: "safe", outcomeText: "You looked in control. But the removal looks heavy-handed in the clips." },
                    { text: "Use the disruption to rally the crowd and create energy", effects: { baseEnthusiasm: 6, mediaScore: 3, crossoverAppeal: -2 }, riskLevel: "moderate", outcomeText: "The crowd goes wild. Your base is energized. Opponents call it authoritarian energy." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: false, duration: 1
            }
        ],

        OCTOBER_SURPRISE: [
            {
                id: "oppo_drop", title: "Devastating Opposition Research Drops",
                description: "The opposition has released a comprehensive dossier of your candidate's past decisions, statements, and associations. It's ugly and well-sourced.",
                category: "OCTOBER_SURPRISE", phase: "general", probability: 0.06,
                effects: { approval: -5, scandalVulnerability: 8, donorConfidence: -4 },
                choices: [
                    { text: "Go line by line rebutting every claim publicly", effects: { approval: 2, mediaScore: -1, authenticity: 3 }, riskLevel: "moderate", outcomeText: "The thorough rebuttal helps, but you've spent a week talking about their attacks." },
                    { text: "Launch your own massive oppo drop as counterprogramming", effects: { mediaScore: 4, approval: -1, cash: -300000 }, riskLevel: "risky", outcomeText: "Mutually assured destruction. Both sides are covered in mud." },
                    { text: "Ignore it and flood the zone with positive messaging", effects: { approval: 0, discipline: 4, cash: -200000 }, riskLevel: "safe", outcomeText: "Some attacks stick, but you stay on message. The race tightens." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            },
            {
                id: "independent_surge", title: "Independent Candidate Surges in Polls",
                description: "A credible independent candidate is surging in battleground state polling. They're pulling voters from your coalition.",
                category: "OCTOBER_SURPRISE", phase: "general", probability: 0.04,
                effects: { approval: -3, persuadableSupport: -5 },
                choices: [
                    { text: "Make the 'wasted vote' argument aggressively", effects: { persuadableSupport: 3, approval: 1, authenticity: -2 }, riskLevel: "moderate", outcomeText: "The spoiler argument works with some voters. Others resent being told how to vote." },
                    { text: "Co-opt their best issue to win back those voters", effects: { persuadableSupport: 4, crossoverAppeal: 2, baseEnthusiasm: -2 }, riskLevel: "moderate", outcomeText: "Smart positioning. Some independent voters come home. Purists hate the opportunism." },
                    { text: "Attack the independent candidate directly", effects: { persuadableSupport: -2, mediaScore: -3, approval: -2 }, riskLevel: "desperate", outcomeText: "Punching down at a third party makes you look scared. The opposite of presidential." }
                ],
                targetParty: "both", affectedStates: ["PA", "MI", "WI", "AZ", "NV"], isBreakingNews: false, duration: 4
            },
            {
                id: "economic_bombshell", title: "Economic Bombshell Report Released",
                description: "A major economic report drops with numbers nobody expected. The economy is either much better or much worse than anyone thought.",
                category: "OCTOBER_SURPRISE", phase: "general", probability: 0.05,
                effects: { mediaScore: 5 },
                choices: [
                    { text: "Seize on the report to validate your economic message", effects: { approval: 3, mediaScore: 3, debate: 2 }, riskLevel: "safe", outcomeText: "Your economic argument gets a data-backed boost." },
                    { text: "Challenge the methodology and offer alternative data", effects: { approval: -1, debate: 1, mediaScore: -2 }, riskLevel: "risky", outcomeText: "Questioning official data looks conspiratorial to some, savvy to others." },
                    { text: "Pivot to the human impact — real families, real stories", effects: { approval: 4, authenticity: 3, baseEnthusiasm: 3 }, riskLevel: "moderate", outcomeText: "Humanizing the data works beautifully. Your numbers in swing states tick up." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 2
            },
            {
                id: "health_scare", title: "Candidate Health Scare Makes Headlines",
                description: "Your candidate had a publicly visible health incident. Age, stamina, and fitness for office are now front-page stories.",
                category: "OCTOBER_SURPRISE", phase: "general", probability: 0.03,
                effects: { approval: -4, donorConfidence: -6, mediaScore: -5 },
                choices: [
                    { text: "Release comprehensive medical records immediately", effects: { approval: 3, donorConfidence: 3, authenticity: 4 }, riskLevel: "safe", outcomeText: "The transparency helps. The records show a clean bill of health." },
                    { text: "Schedule a high-energy public event to project strength", effects: { mediaScore: 4, approval: 2, scandalVulnerability: 5 }, riskLevel: "risky", outcomeText: "The appearance goes well — but any stumble now becomes massive news." },
                    { text: "Attack the media coverage as ageist and irresponsible", effects: { baseEnthusiasm: 3, mediaScore: -3, approval: -1 }, riskLevel: "moderate", outcomeText: "Your base agrees. But the story stays alive because you're feeding it." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 3
            },
            {
                id: "last_minute_endorsement", title: "Last-Minute Blockbuster Endorsement",
                description: "A hugely influential figure just endorsed your campaign days before the election. The timing is dramatic and the impact could be enormous.",
                category: "OCTOBER_SURPRISE", phase: "general", probability: 0.04,
                effects: { mediaScore: 8, approval: 4, baseEnthusiasm: 5 },
                choices: [
                    { text: "Maximize the endorsement with a joint appearance", effects: { approval: 4, baseEnthusiasm: 5, mediaScore: 5 }, riskLevel: "safe", outcomeText: "The joint rally is electric. The endorsement dominates the final news cycle." },
                    { text: "Use it to drive a massive last-minute fundraising push", effects: { cash: 800000, onlineInfluence: 4, baseEnthusiasm: 3 }, riskLevel: "moderate", outcomeText: "Record-breaking donations in the final hours. The war chest overflows." },
                    { text: "Deploy the endorser to swing states as a closer", effects: { groundGame: 5, baseTurnout: 4, approval: 2 }, riskLevel: "moderate", outcomeText: "The endorser barnstorms key states. Turnout models shift in your favor." }
                ],
                targetParty: "both", affectedStates: null, isBreakingNews: true, duration: 1
            }
        ]
    },

    // ═══════════════════════════════════════════════
    // SCENARIO ENGINE
    // ═══════════════════════════════════════════════
    ScenarioEngine: {
        usedEvents: new Set(),

        generateWeeklyEvents(gameState) {
            const events = [];
            const allCategories = Object.keys(window.EventSystem.EVENTS);
            const maxEvents = gameState.difficulty === 'chaos' ? 3 : 2;
            const difficultyMod = { arcade: 0.7, realistic: 1.0, chaos: 1.5, iron: 1.2 };
            const mod = difficultyMod[gameState.difficulty] || 1.0;

            // Determine eligible events
            const eligible = [];
            for (const cat of allCategories) {
                for (const evt of window.EventSystem.EVENTS[cat]) {
                    if (this.usedEvents.has(evt.id)) continue;
                    if (evt.phase !== 'both' && evt.phase !== gameState.phase) continue;
                    if (evt.category === 'OCTOBER_SURPRISE' && gameState.week < gameState.totalWeeks - 6) continue;
                    eligible.push(evt);
                }
            }

            // Weight by probability and game state
            for (const evt of eligible) {
                let prob = evt.probability * mod;
                // Higher scandal vulnerability = more media firestorms
                if (evt.category === 'MEDIA_FIRESTORM') {
                    prob *= 1 + (gameState.campaign.scandalVulnerability / 200);
                }
                // Low donor confidence = more party drama
                if (evt.category === 'PARTY_DRAMA') {
                    prob *= 1 + ((100 - gameState.campaign.donorConfidence) / 300);
                }
                // Late game = more crisis events
                if (gameState.week > gameState.totalWeeks * 0.7) {
                    prob *= 1.3;
                }

                if (Math.random() < prob && events.length < maxEvents) {
                    events.push(JSON.parse(JSON.stringify(evt)));
                    this.usedEvents.add(evt.id);
                }
            }

            // Guarantee at least one event every other week in realistic+
            if (events.length === 0 && gameState.week % 2 === 0 && eligible.length > 0) {
                const forced = eligible[Math.floor(Math.random() * eligible.length)];
                events.push(JSON.parse(JSON.stringify(forced)));
                this.usedEvents.add(forced.id);
            }

            return events;
        },

        reset() {
            this.usedEvents = new Set();
        }
    },

    // ═══════════════════════════════════════════════
    // DEBATE SYSTEM
    // ═══════════════════════════════════════════════
    DebateSystem: {
        questions: [
            {
                topic: "Economy",
                question: "Millions of Americans are struggling with the cost of living. What is your plan to bring down prices and create good-paying jobs?",
                responses: [
                    { text: "Lay out a detailed 5-point economic plan with specific policy proposals", effects: { press: 8, donors: 6, suburban: 5, policy: 8, base: 3, viral: 2 }, riskLevel: "safe" },
                    { text: "Tell a powerful personal story about a struggling family you met", effects: { viral: 7, authenticity: 8, base: 6, suburban: 6, press: 4, donors: 3 }, riskLevel: "moderate" },
                    { text: "Attack your opponent's record on the economy with devastating specifics", effects: { viral: 6, base: 8, press: 5, suburban: 3, donors: 4, policy: 3 }, riskLevel: "moderate" },
                    { text: "Make a bold promise: 'No family earning under $100K will pay federal income tax'", effects: { viral: 9, base: 9, donors: -3, press: 4, suburban: 4, policy: 2 }, riskLevel: "risky" }
                ]
            },
            {
                topic: "Immigration",
                question: "Immigration remains one of the most divisive issues in America. How would your administration handle border security and immigration reform?",
                responses: [
                    { text: "Call for comprehensive reform: border security AND a path forward", effects: { press: 7, suburban: 6, policy: 7, donors: 5, base: 2, viral: 3 }, riskLevel: "safe" },
                    { text: "Pivot to the economic contributions of immigrants with hard data", effects: { press: 5, authenticity: 4, suburban: 5, donors: 4, base: -1, policy: 6 }, riskLevel: "moderate" },
                    { text: "Tell your opponent: 'You've had years to fix this. You failed.'", effects: { viral: 7, base: 7, press: 4, suburban: 2, donors: 3, policy: 1 }, riskLevel: "moderate" },
                    { text: "Take the hardest possible line to own the issue", effects: { base: 9, viral: 5, suburban: -2, press: 2, donors: 3, policy: 2 }, riskLevel: "risky" }
                ]
            },
            {
                topic: "Healthcare",
                question: "Healthcare costs continue to burden American families. What would you do differently?",
                responses: [
                    { text: "Propose expanding existing programs and negotiating drug prices", effects: { press: 6, suburban: 7, policy: 8, donors: 5, base: 4, viral: 2 }, riskLevel: "safe" },
                    { text: "Share a devastating story of a constituent denied coverage", effects: { viral: 8, authenticity: 7, base: 5, suburban: 6, press: 5, donors: 2 }, riskLevel: "moderate" },
                    { text: "Go big: 'Healthcare is a right, not a privilege, and I'll fight for it'", effects: { base: 8, viral: 7, suburban: 3, press: 5, donors: -1, policy: 4 }, riskLevel: "risky" },
                    { text: "Attack your opponent for being beholden to insurance company donors", effects: { viral: 6, base: 7, press: 3, suburban: 4, donors: 2, policy: 2 }, riskLevel: "moderate" }
                ]
            },
            {
                topic: "Democracy & Institutions",
                question: "Many Americans have lost faith in democratic institutions. How would you restore trust in our system of government?",
                responses: [
                    { text: "Propose a specific government reform package: ethics, transparency, term limits", effects: { press: 7, suburban: 6, policy: 7, donors: 3, base: 4, viral: 3 }, riskLevel: "safe" },
                    { text: "Give an impassioned defense of democratic values and norms", effects: { viral: 6, authenticity: 6, suburban: 7, base: 5, press: 6, donors: 4 }, riskLevel: "moderate" },
                    { text: "Directly accuse your opponent of undermining democratic institutions", effects: { base: 8, viral: 7, suburban: 2, press: 4, donors: 3, policy: 1 }, riskLevel: "risky" },
                    { text: "Acknowledge the system is broken and promise to be a disruptor", effects: { viral: 8, authenticity: 7, base: 6, suburban: 3, press: 3, donors: -2 }, riskLevel: "risky" }
                ]
            },
            {
                topic: "Foreign Policy",
                question: "How would you handle America's role on the world stage, including our alliances and our adversaries?",
                responses: [
                    { text: "Present a clear doctrine: strong alliances, strategic competition, diplomatic engagement", effects: { press: 8, suburban: 6, policy: 9, donors: 6, base: 3, viral: 1 }, riskLevel: "safe" },
                    { text: "Pivot to domestic impact: 'Every dollar spent abroad is a dollar not invested here'", effects: { base: 7, viral: 5, suburban: 4, press: 3, donors: 2, policy: 3 }, riskLevel: "moderate" },
                    { text: "Challenge your opponent: 'Name one foreign policy success. I'll wait.'", effects: { viral: 8, base: 6, press: 5, suburban: 3, donors: 3, policy: 2 }, riskLevel: "risky" },
                    { text: "Talk about specific threats and show deep knowledge of the issues", effects: { press: 7, policy: 8, suburban: 5, donors: 5, base: 2, viral: 2 }, riskLevel: "safe" }
                ]
            },
            {
                topic: "Climate & Energy",
                question: "How do you balance energy independence, job creation, and addressing climate change?",
                responses: [
                    { text: "Propose an 'all of the above' energy strategy with clean energy investment", effects: { press: 6, suburban: 7, policy: 7, donors: 5, base: 3, viral: 2 }, riskLevel: "safe" },
                    { text: "Go bold: 'This is the existential challenge of our time' with a sweeping plan", effects: { base: 7, viral: 6, suburban: 3, press: 5, donors: -1, policy: 6 }, riskLevel: "risky" },
                    { text: "Focus on energy jobs: 'Clean energy means American jobs'", effects: { base: 5, suburban: 6, viral: 4, press: 5, donors: 4, policy: 5 }, riskLevel: "moderate" },
                    { text: "Attack your opponent's energy record and donor connections", effects: { base: 6, viral: 5, press: 3, suburban: 3, donors: 2, policy: 2 }, riskLevel: "moderate" }
                ]
            },
            {
                topic: "Culture & Values",
                question: "America seems more divided than ever on cultural issues. How would you bring the country together?",
                responses: [
                    { text: "Give a unifying speech: 'We have more in common than what divides us'", effects: { suburban: 8, authenticity: 6, press: 6, donors: 5, base: 2, viral: 4 }, riskLevel: "safe" },
                    { text: "Lean into your base's values and draw a clear contrast", effects: { base: 8, viral: 6, suburban: -1, press: 3, donors: 3, policy: 2 }, riskLevel: "risky" },
                    { text: "Pivot to economic unity: 'Kitchen table issues unite us'", effects: { suburban: 6, base: 4, press: 5, donors: 4, viral: 3, policy: 4 }, riskLevel: "safe" },
                    { text: "Call out the media and politicians for profiting from division", effects: { viral: 8, authenticity: 7, base: 5, press: -1, suburban: 4, donors: 1 }, riskLevel: "moderate" }
                ]
            }
        ],

        generateDebateQuestions(count) {
            const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count || 5);
        },

        calculateDebateOutcome(responses) {
            const totals = { viral: 0, donors: 0, press: 0, authenticity: 0, policy: 0, base: 0, suburban: 0 };
            let riskyCount = 0;
            for (const r of responses) {
                for (const [key, val] of Object.entries(r.effects)) {
                    if (totals.hasOwnProperty(key)) totals[key] += val;
                }
                if (r.riskLevel === 'risky') riskyCount++;
                if (r.riskLevel === 'desperate') riskyCount += 2;
            }
            // Risky answers can backfire
            if (riskyCount >= 3 && Math.random() < 0.4) {
                totals.viral = Math.floor(totals.viral * 0.5);
                totals.suburban -= 5;
            }
            return totals;
        }
    },

    // ═══════════════════════════════════════════════
    // BREAKING NEWS TICKER
    // ═══════════════════════════════════════════════
    BreakingNewsTicker: {
        headlines: [
            "ELECTION 2028 — THE RACE FOR THE WHITE HOUSE",
            "POLLING SHIFTS IN KEY BATTLEGROUND STATES",
            "CAMPAIGN CASH RACE INTENSIFIES",
        ],

        generateHeadline(event) {
            const templates = [
                `BREAKING: ${event.title.toUpperCase()}`,
                `DEVELOPING: ${event.title.toUpperCase()} — CAMPAIGNS REACT`,
                `JUST IN: ${event.title.toUpperCase()}`,
                `ALERT: ${event.title.toUpperCase()} — POLLS MAY SHIFT`,
            ];
            return templates[Math.floor(Math.random() * templates.length)];
        },

        generatePollingHeadline(candidate1, candidate2, state, margin) {
            const leader = margin > 0 ? candidate1 : candidate2;
            const absMargin = Math.abs(margin);
            if (absMargin < 2) return `TOSS-UP: ${state} WITHIN MARGIN OF ERROR — ${candidate1} VS ${candidate2}`;
            if (absMargin < 5) return `${leader.toUpperCase()} LEADS BY ${absMargin} IN ${state.toUpperCase()} — RACE TIGHTENS`;
            return `${leader.toUpperCase()} OPENS ${absMargin}-POINT LEAD IN ${state.toUpperCase()}`;
        },

        getTickerHTML(headlines) {
            const items = (headlines || this.headlines).map(h => `<span>${h}</span>`).join('');
            return items + items; // Duplicate for seamless scroll
        }
    }
};
