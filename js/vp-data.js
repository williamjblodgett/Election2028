/**
 * Election 2028 - Running Mate Data
 * Curated VP slates, wildcard bench generation, and ticket helper utilities
 */

window.VPData = {
    curatedProfiles: {
        democrat: {
            wes_moore: {
                id: 'wes_moore',
                party: 'Democrat',
                name: 'Wes Moore',
                title: 'Governor of Maryland',
                homeState: 'Maryland',
                portraitEmoji: '🧢',
                description: 'A fresh-faced executive who can lift turnout, sharpen the message, and project generational change.',
                effects: { enthusiasm: 5, baseTurnout: 4, onlineInfluence: 2, surrogateStrength: 2 },
                regionalTargets: ['GA', 'NC', 'PA'],
                regionalBonus: 0.8,
                homeStateBonus: 1.5,
                riskScore: 1,
                announcementBias: 1,
            },
            mark_kelly: {
                id: 'mark_kelly',
                party: 'Democrat',
                name: 'Mark Kelly',
                title: 'U.S. Senator from Arizona',
                homeState: 'Arizona',
                portraitEmoji: '🚀',
                description: 'An astronaut-senator built for the suburbs and Sun Belt battlegrounds.',
                effects: { persuadableSupport: 4, debateSkill: 3, donorConfidence: 2, approval: 2 },
                regionalTargets: ['AZ', 'NV'],
                regionalBonus: 1.2,
                homeStateBonus: 3.5,
                riskScore: 1,
                announcementBias: 1,
            },
            gretchen_whitmer: {
                id: 'gretchen_whitmer',
                party: 'Democrat',
                name: 'Gretchen Whitmer',
                title: 'Governor of Michigan',
                homeState: 'Michigan',
                portraitEmoji: '🛣️',
                description: 'A battle-tested Midwestern governor who hardens the blue-wall map.',
                effects: { groundGame: 4, baseTurnout: 3, approval: 2, surrogateStrength: 2 },
                regionalTargets: ['MI', 'WI', 'PA'],
                regionalBonus: 1.1,
                homeStateBonus: 3.2,
                riskScore: 1,
                announcementBias: 1,
            },
            raphael_warnock: {
                id: 'raphael_warnock',
                party: 'Democrat',
                name: 'Raphael Warnock',
                title: 'U.S. Senator from Georgia',
                homeState: 'Georgia',
                portraitEmoji: '⛪',
                description: 'A preacher-politician who energizes the base and gives the ticket a southern edge.',
                effects: { enthusiasm: 4, surrogateStrength: 4, baseTurnout: 3, mediaScore: 1 },
                regionalTargets: ['GA', 'NC'],
                regionalBonus: 1.0,
                homeStateBonus: 3.4,
                riskScore: 2,
                announcementBias: 1,
            },
            andy_beshear: {
                id: 'andy_beshear',
                party: 'Democrat',
                name: 'Andy Beshear',
                title: 'Governor of Kentucky',
                homeState: 'Kentucky',
                portraitEmoji: '🤝',
                description: 'A red-state Democrat whose entire pitch is competence, empathy, and crossover strength.',
                effects: { approval: 3, persuadableSupport: 4, donorConfidence: 2, scandalVulnerability: -3 },
                regionalTargets: ['PA', 'WI', 'NC'],
                regionalBonus: 0.7,
                homeStateBonus: 1.8,
                riskScore: 1,
                announcementBias: 1,
            },
            amy_klobuchar: {
                id: 'amy_klobuchar',
                party: 'Democrat',
                name: 'Amy Klobuchar',
                title: 'U.S. Senator from Minnesota',
                homeState: 'Minnesota',
                portraitEmoji: '📋',
                description: 'A steady Midwestern validator who reassures donors and moderates.',
                effects: { debateSkill: 2, persuadableSupport: 3, donorConfidence: 2, mediaScore: 2 },
                regionalTargets: ['WI', 'MI'],
                regionalBonus: 0.8,
                homeStateBonus: 1.4,
                riskScore: 1,
                announcementBias: 1,
            },
            roy_cooper: {
                id: 'roy_cooper',
                party: 'Democrat',
                name: 'Roy Cooper',
                title: 'Former Governor of North Carolina',
                homeState: 'North Carolina',
                portraitEmoji: '⚖️',
                description: 'A low-drama southern executive who broadens the map without hijacking the message.',
                effects: { approval: 3, groundGame: 3, persuadableSupport: 3, surrogateStrength: 1 },
                regionalTargets: ['NC', 'GA', 'VA'],
                regionalBonus: 1.0,
                homeStateBonus: 3.0,
                riskScore: 1,
                announcementBias: 1,
            },
            tammy_duckworth: {
                id: 'tammy_duckworth',
                party: 'Democrat',
                name: 'Tammy Duckworth',
                title: 'U.S. Senator from Illinois',
                homeState: 'Illinois',
                portraitEmoji: '🎖️',
                description: 'A disciplined veteran messenger who strengthens the ticket under pressure.',
                effects: { debateSkill: 3, scandalVulnerability: -4, surrogateStrength: 3, approval: 1 },
                regionalTargets: ['MI', 'PA', 'WI'],
                regionalBonus: 0.7,
                homeStateBonus: 1.3,
                riskScore: 1,
                announcementBias: 1,
            },
        },
        republican: {
            glenn_youngkin: {
                id: 'glenn_youngkin',
                party: 'Republican',
                name: 'Glenn Youngkin',
                title: 'Governor of Virginia',
                homeState: 'Virginia',
                portraitEmoji: '💼',
                description: 'A polished executive who can talk to donors, suburbs, and business conservatives at once.',
                effects: { donorConfidence: 4, persuadableSupport: 4, groundGame: 2, approval: 1 },
                regionalTargets: ['VA', 'NC', 'GA'],
                regionalBonus: 0.9,
                homeStateBonus: 2.8,
                riskScore: 1,
                announcementBias: 1,
            },
            tim_scott: {
                id: 'tim_scott',
                party: 'Republican',
                name: 'Tim Scott',
                title: 'U.S. Senator from South Carolina',
                homeState: 'South Carolina',
                portraitEmoji: '🌞',
                description: 'An upbeat conservative who softens edges and broadens the coalition.',
                effects: { enthusiasm: 3, approval: 3, surrogateStrength: 3, persuadableSupport: 2 },
                regionalTargets: ['GA', 'NC'],
                regionalBonus: 0.9,
                homeStateBonus: 1.7,
                riskScore: 1,
                announcementBias: 1,
            },
            elise_stefanik: {
                id: 'elise_stefanik',
                party: 'Republican',
                name: 'Elise Stefanik',
                title: 'U.S. Representative from New York',
                homeState: 'New York',
                portraitEmoji: '📺',
                description: 'A sharp on-air fighter who excites conservative media and the online base.',
                effects: { mediaScore: 4, enthusiasm: 3, onlineInfluence: 3 },
                regionalTargets: ['PA', 'NH'],
                regionalBonus: 0.5,
                homeStateBonus: 1.2,
                riskScore: 3,
                announcementBias: -1,
            },
            brian_kemp: {
                id: 'brian_kemp',
                party: 'Republican',
                name: 'Brian Kemp',
                title: 'Governor of Georgia',
                homeState: 'Georgia',
                portraitEmoji: '🌾',
                description: 'A proven statewide winner in Georgia with a practical ground-game reputation.',
                effects: { groundGame: 4, persuadableSupport: 3, donorConfidence: 2, approval: 1 },
                regionalTargets: ['GA', 'NC'],
                regionalBonus: 1.0,
                homeStateBonus: 3.1,
                riskScore: 1,
                announcementBias: 1,
            },
            katie_britt: {
                id: 'katie_britt',
                party: 'Republican',
                name: 'Katie Britt',
                title: 'U.S. Senator from Alabama',
                homeState: 'Alabama',
                portraitEmoji: '📣',
                description: 'A younger messenger with fundraising appeal and cable-ready energy.',
                effects: { donorConfidence: 3, enthusiasm: 3, onlineInfluence: 3 },
                regionalTargets: ['GA', 'AZ'],
                regionalBonus: 0.5,
                homeStateBonus: 1.2,
                riskScore: 2,
                announcementBias: 0,
            },
            nikki_haley: {
                id: 'nikki_haley',
                party: 'Republican',
                name: 'Nikki Haley',
                title: 'Former Governor of South Carolina',
                homeState: 'South Carolina',
                portraitEmoji: '🌍',
                description: 'A general-election validator with debate chops and establishment credibility.',
                effects: { debateSkill: 4, persuadableSupport: 4, mediaScore: 2, donorConfidence: 2 },
                regionalTargets: ['AZ', 'GA', 'NC'],
                regionalBonus: 0.8,
                homeStateBonus: 1.6,
                riskScore: 1,
                announcementBias: 1,
            },
            sarah_huckabee: {
                id: 'sarah_huckabee',
                party: 'Republican',
                name: 'Sarah Huckabee Sanders',
                title: 'Governor of Arkansas',
                homeState: 'Arkansas',
                portraitEmoji: '📰',
                description: 'A combative communicator who can feed the base and keep the ticket on cable every night.',
                effects: { baseTurnout: 4, mediaScore: 2, surrogateStrength: 2, enthusiasm: 2 },
                regionalTargets: ['IA', 'OH'],
                regionalBonus: 0.5,
                homeStateBonus: 1.1,
                riskScore: 2,
                announcementBias: 0,
            },
            doug_burgum: {
                id: 'doug_burgum',
                party: 'Republican',
                name: 'Doug Burgum',
                title: 'Governor of North Dakota',
                homeState: 'North Dakota',
                portraitEmoji: '⛽',
                description: 'A wealthy executive who calms donors and sells competence on energy and business.',
                effects: { donorConfidence: 4, approval: 2, scandalVulnerability: -2, groundGame: 1 },
                regionalTargets: ['PA', 'AZ'],
                regionalBonus: 0.4,
                homeStateBonus: 1.0,
                riskScore: 1,
                announcementBias: 1,
            },
        },
    },

    slates: {
        newsom: ['mark_kelly', 'gretchen_whitmer', 'wes_moore', 'raphael_warnock', 'andy_beshear'],
        buttigieg: ['gretchen_whitmer', 'roy_cooper', 'amy_klobuchar', 'mark_kelly', 'tammy_duckworth'],
        aoc: ['wes_moore', 'raphael_warnock', 'tammy_duckworth', 'gretchen_whitmer', 'mark_kelly'],
        harris: ['roy_cooper', 'andy_beshear', 'gretchen_whitmer', 'mark_kelly', 'wes_moore'],
        shapiro: ['mark_kelly', 'wes_moore', 'tammy_duckworth', 'amy_klobuchar', 'roy_cooper'],
        stephensmith: ['wes_moore', 'raphael_warnock', 'mark_kelly', 'andy_beshear', 'tammy_duckworth'],
        vance: ['glenn_youngkin', 'tim_scott', 'brian_kemp', 'katie_britt', 'doug_burgum'],
        rubio: ['nikki_haley', 'glenn_youngkin', 'tim_scott', 'brian_kemp', 'katie_britt'],
        desantis: ['brian_kemp', 'tim_scott', 'doug_burgum', 'glenn_youngkin', 'katie_britt'],
        trumpjr: ['elise_stefanik', 'tim_scott', 'brian_kemp', 'glenn_youngkin', 'katie_britt'],
        ramaswamy: ['nikki_haley', 'glenn_youngkin', 'katie_britt', 'tim_scott', 'doug_burgum'],
        carlson: ['elise_stefanik', 'tim_scott', 'glenn_youngkin', 'brian_kemp', 'doug_burgum'],
    },

    cloneOption(option) {
        return JSON.parse(JSON.stringify(option));
    },

    getPartyKey(candidateOrParty) {
        if (!candidateOrParty) return 'democrat';
        if (typeof candidateOrParty === 'string') {
            return candidateOrParty.toLowerCase() === 'republican' ? 'republican' : 'democrat';
        }
        return candidateOrParty.party === 'Republican' ? 'republican' : 'democrat';
    },

    getStateIdForName(stateName) {
        if (!window.StateData) return null;
        const match = window.StateData.find((state) => state.name === stateName);
        return match ? match.id : null;
    },

    compactEffects(effects) {
        const compacted = {};
        for (const [key, value] of Object.entries(effects)) {
            if (value) compacted[key] = value;
        }
        return compacted;
    },

    createWildcardOption(candidate) {
        const rawEffects = {
            enthusiasm: Math.max(1, Math.round((candidate.baseEnthusiasm - 48) / 10)),
            mediaScore: Math.round((candidate.mediaHandling - 50) / 12),
            donorConfidence: Math.round((candidate.fundraising - 52) / 12),
            debateSkill: Math.round((candidate.debate - 54) / 15),
            persuadableSupport: Math.round((candidate.crossoverAppeal - 50) / 12),
            onlineInfluence: Math.round(((candidate.viralPotential || 50) - 50) / 12),
            scandalVulnerability: candidate.scandalResistance < 45 ? 3 : candidate.scandalResistance > 68 ? -3 : 0,
        };
        const effects = this.compactEffects(rawEffects);
        const stateId = this.getStateIdForName(candidate.homeState);
        const riskScore = candidate.isWildcard ? 4 : (candidate.meltdownRisk || 30) > 55 ? 3 : 2;
        const announcementBias = candidate.isWildcard ? -1 : candidate.scandalResistance > 65 ? 1 : 0;

        return {
            id: `bench_${candidate.id}`,
            source: 'wildcard',
            candidateId: candidate.id,
            party: candidate.party,
            name: candidate.name,
            title: candidate.title,
            homeState: candidate.homeState,
            portraitEmoji: candidate.portraitEmoji,
            description: candidate.isWildcard
                ? `A chaos pick from the bench. ${candidate.name} can dominate coverage but comes with real downside.`
                : `${candidate.name} comes off the bench as a same-party unity play with a familiar national profile.`,
            effects,
            regionalTargets: stateId ? [stateId] : [],
            regionalBonus: candidate.isWildcard ? 1.2 : 0.8,
            homeStateBonus: candidate.isWildcard ? 3.0 : 2.2,
            riskScore,
            announcementBias,
            isWildcard: true,
            wildcardLabel: candidate.isWildcard ? 'CHAOS PICK' : 'BENCH PICK',
        };
    },

    getCuratedOptionsForCandidate(candidateId, partyKey) {
        const slateIds = this.slates[candidateId] || [];
        const partyProfiles = this.curatedProfiles[partyKey] || {};
        return slateIds
            .map((id) => partyProfiles[id])
            .filter(Boolean)
            .map((option) => {
                const cloned = this.cloneOption(option);
                cloned.source = 'curated';
                cloned.isWildcard = false;
                return cloned;
            });
    },

    getWildcardOptionsForCandidate(candidate) {
        const partyCandidates = this.getPartyKey(candidate) === 'democrat'
            ? window.CandidateData.democrats
            : window.CandidateData.republicans;
        return partyCandidates
            .filter((entry) => entry.id !== candidate.id)
            .map((entry) => this.createWildcardOption(entry));
    },

    getOptionsForCandidate(candidate) {
        const partyKey = this.getPartyKey(candidate);
        return {
            curated: this.getCuratedOptionsForCandidate(candidate.id, partyKey),
            wildcard: this.getWildcardOptionsForCandidate(candidate),
        };
    },

    scoreOptionForNominee(nominee, option) {
        const effects = option.effects || {};
        let score = 0;
        score += (effects.persuadableSupport || 0) * (nominee.crossoverAppeal < 55 ? 1.6 : 1.0);
        score += (effects.enthusiasm || 0) * (nominee.baseEnthusiasm < 65 ? 1.5 : 1.0);
        score += (effects.mediaScore || 0) * (nominee.mediaHandling < 65 ? 1.4 : 1.0);
        score += (effects.donorConfidence || 0) * (nominee.fundraising < 75 ? 1.3 : 1.0);
        score += (effects.debateSkill || 0) * (nominee.debate < 70 ? 1.2 : 1.0);
        score += (effects.scandalVulnerability || 0) * -1.5;
        score += option.homeStateBonus || 0;
        score += (option.regionalBonus || 0) * ((option.regionalTargets || []).length || 0);
        score += (option.announcementBias || 0) * 2;
        score -= option.riskScore || 0;
        if (nominee.homeState === option.homeState) score -= 4;
        return score;
    },

    chooseRunningMate(candidate) {
        const options = this.getOptionsForCandidate(candidate);
        const combined = [...options.curated, ...options.wildcard];
        const ranked = combined
            .map((option) => ({ option, score: this.scoreOptionForNominee(candidate, option) }))
            .sort((left, right) => right.score - left.score);
        if (!ranked.length) return null;
        const topChoices = ranked.slice(0, Math.min(3, ranked.length));
        return this.cloneOption(topChoices[Math.floor(Math.random() * topChoices.length)].option);
    },

    optionTouchesState(option, stateId) {
        if (!option) return false;
        const homeStateId = this.getStateIdForName(option.homeState);
        if (homeStateId === stateId) return true;
        return (option.regionalTargets || []).includes(stateId);
    },
};