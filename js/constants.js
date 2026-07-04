/**
 * Election 2028 — Global Game Constants
 * Centralized configuration for all game mechanics, costs, and thresholds
 */

window.GameConstants = {
    // ═══════════════════════════════════════════════
    // CAMPAIGN TIMELINE
    // ═══════════════════════════════════════════════
    PRIMARY_WEEKS: 16,
    TOTAL_WEEKS: 40,
    GENERAL_WEEKS: 24,

    // Debate schedule: weeks when debates occur
    DEBATE_WEEKS: [12, 28, 34, 38],
    DEBATE_QUESTIONS_PER_ROUND: 5,

    // Convention and VP selection windows
    CONVENTION_WEEK_START: 20,
    CONVENTION_WEEK_END: 22,
    VP_SELECTION_WEEK_START: 24,
    VP_SELECTION_WEEK_END: 26,

    // ═══════════════════════════════════════════════
    // CAMPAIGN ACTIONS & COSTS
    // ═══════════════════════════════════════════════
    ACTION_COSTS: {
        CAMPAIGN_VISIT: 80000,
        RALLY: 60000,
        TOWN_HALL: 30000,
        PODCAST: 5000,
        TV_INTERVIEW: 0,
        AD_BUY_BASELINE: 100000,
        OPPO_RESEARCH: 150000,
        FIELD_OFFICE: 200000,
        SURROGATE_DEPLOYMENT: 40000,
    },

    // ═══════════════════════════════════════════════
    // POLLING THRESHOLDS (state margin percentages)
    // ═══════════════════════════════════════════════
    POLLING_THRESHOLDS: {
        SAFE_THRESHOLD: 15,        // >15% = Safe
        LEAN_THRESHOLD: 8,         // >8% = Lean  
        TILT_THRESHOLD: 2,         // >2% = Tilt
        // <-2% to 2% = Toss-up
    },

    // ═══════════════════════════════════════════════
    // STARTING FINANCES
    // ═══════════════════════════════════════════════
    STARTING_CASH: 5000000,
    WEEKLY_SMALL_DOLLAR: 200000,
    WEEKLY_HIGH_DOLLAR: 500000,
    BURN_RATE: 300000,

    // ═══════════════════════════════════════════════
    // STARTING CAMPAIGN STATS
    // ═══════════════════════════════════════════════
    STARTING_STATS: {
        APPROVAL: 45,
        ENTHUSIASM: 50,
        BASE_TURNOUT: 50,
        PERSUADABLE_SUPPORT: 30,
        MEDIA_SCORE: 50,
        SCANDAL_VULNERABILITY: 30,
        DEBATE_SKILL: 50,
        GROUND_GAME: 30,
        DONOR_CONFIDENCE: 60,
        ONLINE_INFLUENCE: 40,
        SURROGATE_STRENGTH: 30,
        NATIONAL_POLLING: 45,
    },

    // ═══════════════════════════════════════════════
    // PERK BONUSES (campaign perks allocated at start)
    // ═══════════════════════════════════════════════
    PERK_BONUSES: {
        warChest: { cash: 1500000 }, // per point
        groundSwell: { enthusiasm: 5, baseTurnout: 3 },
        mediaDarling: { mediaScore: 8 },
        partyMachine: { groundGame: 5, surrogateStrength: 5 },
        digitalArmy: { onlineInfluence: 8 },
        teflonCandidate: { scandalVulnerability: -10 }, // reduces by 10
    },
    TOTAL_PERK_POINTS: 8,
    MAX_PERK_POINTS_PER_CATEGORY: 3,

    // ═══════════════════════════════════════════════
    // DIFFICULTY MODIFIERS
    // ═══════════════════════════════════════════════
    DIFFICULTY: {
        arcade: { cashMod: 1.5, fundraisingMod: 1.3, scandalsPerWeek: 0.5, opponentSkill: 0.7 },
        realistic: { cashMod: 1.0, fundraisingMod: 1.0, scandalsPerWeek: 1.0, opponentSkill: 1.0 },
        chaos: { cashMod: 0.8, fundraisingMod: 0.9, scandalsPerWeek: 2.0, opponentSkill: 1.2 },
        iron: { cashMod: 0.9, fundraisingMod: 0.8, scandalsPerWeek: 1.5, opponentSkill: 1.3, noSaves: true },
    },

    // ═══════════════════════════════════════════════
    // DEBATE SYSTEM
    // ═══════════════════════════════════════════════
    DEBATE: {
        SCORE_CATEGORIES: ['viral', 'donors', 'press', 'authenticity', 'policy', 'base', 'suburban'],
        MIN_SCORE: 0,
        MAX_SCORE: 100,
        BASE_DIFFICULTY: 50, // Score needed to "win" a question
    },

    // ═══════════════════════════════════════════════
    // SCANDAL & RISK
    // ═══════════════════════════════════════════════
    SCANDAL: {
        VULNERABILITY_LOW: 30,      // <30 = Low risk
        VULNERABILITY_MEDIUM: 50,   // 30-50 = Medium
        VULNERABILITY_HIGH: 70,     // >70 = Critical
    },

    // ═══════════════════════════════════════════════
    // PUBLIC ANGER & CANDIDATE SECURITY
    // Aggressive campaigning heats the national mood; at high anger a
    // security threat may emerge. Fictional strategy-game mechanic.
    // ═══════════════════════════════════════════════
    ANGER: {
        THRESHOLDS: { ELEVATED: 40, HIGH: 60, SEVERE: 75 },
        ATTEMPT_MIN_ANGER: 60,           // no threat below this
        ATTEMPT_CHANCE_PER_POINT: 0.004, // (anger-60) * 0.4%/wk → 8% at 80, 16% at 100
        SECURITY_COST: 500000,           // one-time Security Detail action
        SECURITY_ATTEMPT_MULT: 0.5,      // security halves the odds of an attempt
        BASE_SURVIVAL: 0.8,              // 80% survive by default
        SECURITY_SURVIVAL_BONUS: 0.12,   // +12% survival with a detail
        WEEKLY_DECAY: 0.97,              // anger cools ~3%/week on its own
        HOSPITAL_WEEKS: 2,               // recovery period after surviving
    },

    // ═══════════════════════════════════════════════
    // ELECTORAL MATH
    // ═══════════════════════════════════════════════
    ELECTORAL_DEFAULT: 538,
    ELECTORAL_TO_WIN: 270,

    // ═══════════════════════════════════════════════
    // EARLY VOTING & GOTV (final stretch of the general)
    // ═══════════════════════════════════════════════
    EARLY_VOTE: {
        START_WEEK: 33,            // early voting opens
        WEEKLY_BANK_PCT: 6,        // % of the electorate banked per week
        MAX_BANKED_PCT: 45,        // ceiling on total early vote share
        GOTV_COST: 250000,
        GOTV_TARGET_STATES: 5,     // closest battlegrounds boosted per push
    },

    // ═══════════════════════════════════════════════
    // POLLING AVERAGES & FICTIONAL POLLSTERS
    // house: positive = overstates Republicans, negative = overstates Democrats
    // ═══════════════════════════════════════════════
    POLLSTERS: [
        { name: 'Meridian Research', house: 1.2, moe: 3.0 },
        { name: 'Beacon Analytics', house: -1.5, moe: 3.4 },
        { name: 'Heartland Polling', house: 2.1, moe: 4.1 },
        { name: 'Coastline Surveys', house: -0.8, moe: 2.8 },
        { name: 'National Opinion Desk', house: 0.3, moe: 2.5 },
    ],
    POLL_HISTORY_WEEKS: 8,

    // ═══════════════════════════════════════════════
    // ELECTION NIGHT — poll closing waves (Eastern Time)
    // ═══════════════════════════════════════════════
    POLL_CLOSE_TIMES: {
        '7:00 PM': ['GA', 'IN', 'KY', 'SC', 'VT', 'VA'],
        '7:30 PM': ['NC', 'OH', 'WV'],
        '8:00 PM': ['AL', 'CT', 'DE', 'DC', 'FL', 'IL', 'ME', 'MD', 'MA', 'MS', 'MO', 'NH', 'NJ', 'OK', 'PA', 'RI', 'TN'],
        '9:00 PM': ['AZ', 'AR', 'CO', 'KS', 'LA', 'MI', 'MN', 'NE', 'NM', 'NY', 'ND', 'SD', 'TX', 'WI', 'WY'],
        '10:00 PM': ['IA', 'MT', 'NV', 'UT'],
        '11:00 PM': ['CA', 'ID', 'OR', 'WA'],
        '1:00 AM': ['AK', 'HI'],
    },

    // ═══════════════════════════════════════════════
    // UI / UX
    // ═══════════════════════════════════════════════
    MOBILE_BREAKPOINT: 768,
    TOAST_DURATION_MS: 3000,

    // ═══════════════════════════════════════════════
    // ANIMATION TIMINGS
    // ═══════════════════════════════════════════════
    ANIMATIONS: {
        SCREEN_FADE_MS: 200,
        STATE_COLOR_CHANGE_MS: 200,
        POLLING_UPDATE_MS: 500,
        TOAST_FADE_MS: 300,
    },
};

// Freeze to prevent accidental modifications
Object.freeze(window.GameConstants);
