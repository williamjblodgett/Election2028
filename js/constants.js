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
    // POLICY PLATFORM — issue positioning
    // Stances run -2 (left pole) … +2 (right pole). Keys match the
    // issueSalience keys in states.js.
    // ═══════════════════════════════════════════════
    ISSUES: [
        { key: 'economy',     label: 'Economy & Taxes',   left: 'Tax the wealthy, invest big', right: 'Cut taxes, shrink government' },
        { key: 'immigration', label: 'Immigration',       left: 'Broad pathways, humane system', right: 'Hard border, strict enforcement' },
        { key: 'healthcare',  label: 'Healthcare',        left: 'Universal public coverage', right: 'Market-driven care' },
        { key: 'abortion',    label: 'Abortion',          left: 'Federal protections', right: 'State restrictions' },
        { key: 'gunPolicy',   label: 'Guns',              left: 'Sweeping gun reform', right: 'Expand gun rights' },
        { key: 'energy',      label: 'Climate & Energy',  left: 'Aggressive green transition', right: 'Drill and deregulate' },
        { key: 'crime',       label: 'Crime & Policing',  left: 'Reform-first justice', right: 'Back the blue, tough on crime' },
        { key: 'cultureWar',  label: 'Culture',           left: 'Progressive social change', right: 'Traditional values' },
        { key: 'labor',       label: 'Labor & Unions',    left: 'Union power, worker rights', right: 'Right-to-work, pro-business' },
        { key: 'education',   label: 'Education',         left: 'Public investment, loan relief', right: 'School choice, parental control' },
    ],
    PLATFORM: {
        MAX_SHIFTS_PER_WEEK: 1,
        SHIFT_ENTHUSIASM_COST: 2,
        SHIFT_SCANDAL_COST: 2,
        DRIFT_MAX: 0.15,             // max weekly polling drift per state from platform fit
        BASE_CENTER: 1.5,            // party-base ideal distance from center (D: -1.5, R: +1.5)
    },

    // ═══════════════════════════════════════════════
    // PRIMARY SEASON — contests, delegates, thresholds
    // ═══════════════════════════════════════════════
    PRIMARY_CALENDAR: [
        { week: 3,  name: 'Iowa Caucuses',        delegates: 40,   states: ['IA'] },
        { week: 4,  name: 'New Hampshire Primary', delegates: 33,  states: ['NH'] },
        { week: 5,  name: 'Nevada Caucuses',      delegates: 36,   states: ['NV'] },
        { week: 6,  name: 'South Carolina Primary', delegates: 55, states: ['SC'] },
        { week: 8,  name: 'SUPER TUESDAY',        delegates: 1300, states: ['AL', 'AR', 'CA', 'CO', 'ME', 'MA', 'MN', 'NC', 'OK', 'TN', 'TX', 'UT', 'VT', 'VA'] },
        { week: 9,  name: 'Michigan Week',        delegates: 250,  states: ['MI', 'WA', 'MO', 'MS'] },
        { week: 10, name: 'Mid-March Contests',   delegates: 350,  states: ['GA', 'KS', 'LA'] },
        { week: 12, name: 'March Finale',         delegates: 400,  states: ['AZ', 'FL', 'IL', 'OH'] },
        { week: 14, name: 'Wisconsin Week',       delegates: 230,  states: ['WI', 'NY'] },
        { week: 16, name: 'Final Contests',       delegates: 306,  states: ['PA', 'NJ', 'MD', 'OR'] },
    ],
    PRIMARY: {
        TOTAL_DELEGATES: 3000,
        DELEGATES_TO_CLINCH: 1500,
        VIABILITY_THRESHOLD: 15,     // % support needed to win delegates in a contest
        PLAYER_START_SUPPORT: 38,    // modest frontrunner
        RIVAL_START_SUPPORT: [26, 22],
        DROPOUT_SUPPORT: 10,         // rivals below this after Super Tuesday drop out
    },

    // ═══════════════════════════════════════════════
    // ADAPTIVE OPPONENT AI
    // ═══════════════════════════════════════════════
    AI: {
        OFFENSE_EV_DEFICIT: 40,      // trailing by more → offense posture
        DEFENSE_EV_LEAD: 80,         // leading by more → defense posture
        TARGET_COUNT: 3,
    },

    // ═══════════════════════════════════════════════
    // SCANDAL LIFECYCLE
    // ═══════════════════════════════════════════════
    SCANDAL_LIFECYCLE: {
        MAX_ACTIVE: 3,
        // escalate / simmer / fade weights by last response
        WEIGHTS: {
            deny:         { escalate: 0.40, fade: 0.25 },
            apologize:    { escalate: 0.12, fade: 0.55 },
            counterattack:{ escalate: 0.25, fade: 0.35 },
            none:         { escalate: 0.30, fade: 0.30 },
        },
        OPPONENT_SPAWN_BASE: 0.0008, // × opponent scandalVulnerability per week
    },

    // ═══════════════════════════════════════════════
    // PUBLIC ANGER & CANDIDATE SECURITY
    // Aggressive campaigning heats the national mood; at high anger a
    // security threat may emerge. Fictional strategy-game mechanic.
    // ═══════════════════════════════════════════════
    ANGER: {
        THRESHOLDS: { ELEVATED: 40, HIGH: 60, SEVERE: 75 },
        ATTEMPT_MIN_ANGER: 60,           // no threat below this
        ATTEMPT_CHANCE_PER_POINT: 0.005, // (anger-60) * 0.5%/wk → 10% at 80, 20% at 100
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
