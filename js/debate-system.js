/**
 * Election 2028 — Immersive Debate System
 * Head-to-head debate mechanics with real-time scoring and visual feedback
 * Extends and replaces skeletal debate code from ui.js
 */

window.DebateSystem = {
    // Debate questions database
    QUESTIONS: [
        {
            id: "economy_jobs",
            topic: "Economy & Jobs",
            text: "The economy is struggling with stagnant wage growth. How do you address job creation and income inequality?",
            demContext: "Progressive coalition wants bold action",
            repContext: "Conservative base wants tax cuts",
            scoringFactors: ['policy', 'authenticity', 'base', 'suburban'],
        },
        {
            id: "healthcare",
            topic: "Healthcare",
            text: "Millions of Americans lack adequate healthcare coverage. What's your vision for the system?",
            demContext: "Base expects universal approach",
            repContext: "Base emphasizes market freedom",
            scoringFactors: ['policy', 'donors', 'suburban'],
        },
        {
            id: "border_immigration",
            topic: "Immigration & Border Security",
            text: "How do you balance border security concerns with America's tradition as a nation of immigrants?",
            demContext: "Urban base wants compassion; swing voters want order",
            repContext: "Base demands strict enforcement; swing voters want nuance",
            scoringFactors: ['base', 'policy', 'suburban', 'authenticity'],
        },
        {
            id: "climate",
            topic: "Climate & Energy",
            text: "Climate scientists warn we're running out of time. How aggressively will you act?",
            demContext: "Base demands green transition",
            repContext: "",
            scoringFactors: ['policy', 'authenticity', 'viral'],
        },
        {
            id: "democracy",
            topic: "Democracy & Governance",
            text: "Trust in government is at historic lows. How will you restore faith in democratic institutions?",
            demContext: "Base wants democracy strengthened",
            repContext: "Base wants government shrunk",
            scoringFactors: ['authenticity', 'suburban', 'policy'],
        },
        {
            id: "foreign_policy",
            topic: "Foreign Policy & Military",
            text: "America's role on the world stage is being questioned. Describe your foreign policy vision.",
            demContext: "Base wants diplomacy-first approach",
            repContext: "Base values strength and sovereignty",
            scoringFactors: ['policy', 'donors', 'suburban'],
        },
        {
            id: "gun_violence",
            topic: "Gun Violence & Rights",
            text: "Mass shootings continue. How do you protect Americans while respecting constitutional rights?",
            demContext: "Urban base demands gun control",
            repContext: "Rural base opposes restrictions",
            scoringFactors: ['base', 'policy', 'suburban', 'viral'],
        },
        {
            id: "closing_statement",
            topic: "Closing Statement",
            text: "In 90 seconds, why should Americans choose YOU to be president?",
            demContext: "Closing: inspire and unify",
            repContext: "Closing: inspire and differ",
            scoringFactors: ['viral', 'authenticity', 'base', 'suburban'],
        },
    ],

    // Response templates organized by strategy
    RESPONSE_STRATEGIES: {
        // Democratic responses
        'democrat_progressive': [
            { 
                text: "We need bold, systemic change. The old approaches haven't worked.",
                scores: { policy: 8, base: 9, authenticity: 7, suburban: 4, viral: 6, donors: 5, press: 6 },
                descriptor: "Progressive & Bold"
            },
            { 
                text: "I have a detailed plan that invests in working families while protecting the planet.",
                scores: { policy: 9, base: 7, authenticity: 8, suburban: 7, viral: 5, donors: 9, press: 8 },
                descriptor: "Detailed & Solutions-Oriented"
            },
            { 
                text: "My opponent talks about problems. I'm offering real solutions that polls show Americans support.",
                scores: { policy: 6, base: 8, authenticity: 5, suburban: 8, viral: 7, donors: 6, press: 7 },
                descriptor: "Populist & Contrast"
            },
        ],
        'democrat_moderate': [
            {
                text: "We can make progress without extreme measures. I trust the American people.",
                scores: { policy: 7, base: 5, authenticity: 8, suburban: 9, viral: 4, donors: 8, press: 7 },
                descriptor: "Unifying & Pragmatic"
            },
            {
                text: "Democrats and Republicans agree more than the media suggests. Let's find common ground.",
                scores: { policy: 6, base: 4, authenticity: 9, suburban: 10, viral: 3, donors: 7, press: 8 },
                descriptor: "Bridging & Consensus"
            },
            {
                text: "We tried that approach. The lesson from history is we need new thinking.",
                scores: { policy: 7, base: 6, authenticity: 7, suburban: 7, viral: 5, donors: 6, press: 6 },
                descriptor: "Historical & Reflective"
            },
        ],
        
        // Republican responses
        'republican_conservative': [
            {
                text: "We need to get government out of the way and let freedom ring.",
                scores: { policy: 7, base: 10, authenticity: 8, suburban: 5, viral: 6, donors: 8, press: 5 },
                descriptor: "Freedom & Limited Government"
            },
            {
                text: "The liberals' approach has failed. We need to return to what works.",
                scores: { policy: 6, base: 9, authenticity: 6, suburban: 5, viral: 7, donors: 7, press: 4 },
                descriptor: "Conservative & Contrasting"
            },
            {
                text: "My plan cuts through the bureaucracy and empowers individuals to solve problems.",
                scores: { policy: 8, base: 8, authenticity: 7, suburban: 6, viral: 5, donors: 9, press: 6 },
                descriptor: "Pro-Business & Empowering"
            },
        ],
        'republican_moderate': [
            {
                text: "We can't ignore real problems. But the solution isn't a government takeover.",
                scores: { policy: 8, base: 6, authenticity: 8, suburban: 8, viral: 4, donors: 8, press: 7 },
                descriptor: "Practical & Grounded"
            },
            {
                text: "My opponent and I both want what's best for America—we just disagree on how.",
                scores: { policy: 7, base: 5, authenticity: 9, suburban: 9, viral: 3, donors: 7, press: 8 },
                descriptor: "Respectful & Thoughtful"
            },
            {
                text: "History shows that balanced approaches work better than extremism from either side.",
                scores: { policy: 7, base: 6, authenticity: 8, suburban: 8, viral: 4, donors: 7, press: 8 },
                descriptor: "Moderate & Historic"
            },
        ],
    },

    /**
     * Generate debate responses based on candidate philosophy and player strategy
     */
    generateResponses(playerCandidate, playerStrategy) {
        const party = playerCandidate.party === 'Democrat' ? 'democrat' : 'republican';
        
        // Determine lean based on candidate stats
        const isProgressive = playerCandidate.ideologicalElasticity > 60;
        const strategy = party === 'democrat' 
            ? (isProgressive ? 'democrat_progressive' : 'democrat_moderate')
            : (isProgressive ? 'republican_conservative' : 'republican_moderate');

        return this.RESPONSE_STRATEGIES[strategy]?.slice(0, 3) || this.RESPONSE_STRATEGIES['democrat_moderate'];
    },

    /**
     * Calculate debate performance across multiple dimensions
     */
    scoreResponse(response, playerCandidate, opponentCandidate, questionTopic) {
        const baseScores = response.scores || {};
        
        // Modifier based on debate skill
        const debateSkillBonus = (playerCandidate.debate - 50) * 0.5;
        
        // Penalize responses misaligned with party expectations
        let alignmentPenalty = 0;
        // (implementation varies by response choice)

        const finalScores = {};
        for (const [key, value] of Object.entries(baseScores)) {
            finalScores[key] = Math.max(0, Math.min(100, value + debateSkillBonus + alignmentPenalty));
        }

        return finalScores;
    },

    /**
     * Calculate winner based on debate scores
     */
    calculateWinner(playerScores, opponentScores) {
        const playerAvg = Object.values(playerScores).reduce((a, b) => a + b, 0) / Object.values(playerScores).length;
        const opponentAvg = Object.values(opponentScores).reduce((a, b) => a + b, 0) / Object.values(opponentScores).length;
        
        if (playerAvg > opponentAvg + 5) return 'player';
        if (opponentAvg > playerAvg + 5) return 'opponent';
        return 'tie';
    },
};

// Freeze to prevent modifications
Object.freeze(window.DebateSystem);
