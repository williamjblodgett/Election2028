/**
 * Election 2028 — The First Term (presidency mode, phase 1)
 * Sixteen quarters in the Oval Office: push an agenda through Congress,
 * sign executive orders the courts may claw back, absorb crises, survive
 * the midterms, and walk out with a legacy history will grade.
 */
window.PresidencySystem = {

    BILLS: [
        { id: 'rebuild',   name: 'American Rebuild Act',            issue: 'Infrastructure', cost: 3, spend: 8, legacy: 12, bipartisan: true,  effects: { approval: 4, gdp: 0.3 },  desc: 'Roads, bridges, grid, broadband. Shovels photograph well.' },
        { id: 'care',      name: 'Affordable Care Expansion',       issue: 'Healthcare',     cost: 4, spend: 7, legacy: 14, bipartisan: false, effects: { approval: 3 },            desc: 'The fight of a generation, again. Passing it is legacy-grade.' },
        { id: 'taxrelief', name: 'Middle-Class Tax Relief Act',     issue: 'Taxes',          cost: 3, spend: 6, legacy: 10, bipartisan: false, effects: { approval: 4, gdp: 0.2, inflation: 0.3 }, desc: 'Everyone loves a cut. The bond market has questions.' },
        { id: 'border',    name: 'Border Security & Citizenship Act', issue: 'Immigration',  cost: 5, spend: 5, legacy: 16, bipartisan: false, effects: { approval: 2 },            desc: 'The white whale of modern politics. Enormous if it lands.' },
        { id: 'energy',    name: 'Clean Energy Moonshot',           issue: 'Climate',        cost: 4, spend: 6, legacy: 14, bipartisan: false, effects: { approval: 2, gdp: 0.1 }, desc: 'A decade-defining industrial bet.' },
        { id: 'streets',   name: 'Safe Streets Act',                issue: 'Crime',          cost: 2, spend: 3, legacy: 8,  bipartisan: true,  effects: { approval: 3 },            desc: 'Cops, courts, and community programs. Broadly popular.' },
        { id: 'schools',   name: 'Public Education Modernization',  issue: 'Education',      cost: 3, spend: 4, legacy: 10, bipartisan: false, effects: { approval: 2 },            desc: 'Teachers, tutoring, and trade tracks.' },
        { id: 'ai',        name: 'AI & Digital Rights Act',         issue: 'Technology',     cost: 2, spend: 2, legacy: 9,  bipartisan: true,  effects: { approval: 1 },            desc: 'First real rules of the road for the machines.' },
        { id: 'housing',   name: 'Housing Affordability Act',       issue: 'Housing',        cost: 3, spend: 4, legacy: 10, bipartisan: false, effects: { approval: 3, inflation: -0.2 }, desc: 'Build, baby, build. Renters notice fast.' },
        { id: 'vets',      name: 'Veterans Promise Act',            issue: 'Veterans',       cost: 1, spend: 2, legacy: 7,  bipartisan: true,  effects: { approval: 3 },            desc: 'The easiest yes in Washington. Bank it early.' },
        { id: 'austerity', name: 'Deficit Reduction Act',          issue: 'Taxes',          cost: 4, spend: -14, legacy: 11, bipartisan: false, effects: { approval: -3, gdp: -0.2 }, desc: 'Spending cuts and closed loopholes. Nobody thanks you now — the bond market does.' },
    ],

    EOS: [
        { id: 'eo_drugs',   name: 'Prescription Price Caps',   effects: { approval: 3 }, legacy: 4, desc: 'Popular with everyone except the lobby that matters.' },
        { id: 'eo_debt',    name: 'Student Debt Relief',       effects: { approval: 2 }, legacy: 4, desc: 'The base cheers. The courts sharpen their pencils.' },
        { id: 'eo_border',  name: 'Emergency Border Measures', effects: { approval: 2 }, legacy: 4, desc: 'Action without Congress — and litigation without end.' },
        { id: 'eo_energy',  name: 'Energy Production Order',   effects: { approval: 2, gdp: 0.1 }, legacy: 3, desc: 'Leases, permits, throughput. Immediate and reversible.' },
    ],

    CRISES: [
        { id: 'hurricane', title: '🌀 Category 5 Landfall', text: 'A monster hurricane flattens the Gulf Coast. Cameras are on the tarmac waiting for you.',
          choices: [
            { text: 'Fly in immediately — own the response', good: { approval: 4 }, bad: { approval: -3 }, odds: 0.75, tag: 'FEMA surge + presidential visit' },
            { text: 'Run it from the Situation Room', good: { approval: 2 }, bad: { approval: -1 }, odds: 0.9, tag: 'Competent, low-drama' },
            { text: 'Delegate to the VP and stay on agenda', good: { capital: 1 }, bad: { approval: -4 }, odds: 0.45, tag: 'Risky optics' } ] },
        { id: 'market',    title: '📉 Market Convulsion', text: 'The market drops 9% in three days on a credit scare. Your Treasury Secretary is on every screen.',
          choices: [
            { text: 'Massive intervention — backstop everything', good: { approval: 3, gdp: 0.2 }, bad: { inflation: 0.5, approval: -2 }, odds: 0.6, tag: 'Bazooka' },
            { text: 'Targeted support, steady message', good: { approval: 2 }, bad: { gdp: -0.3, approval: -2 }, odds: 0.7, tag: 'Measured' },
            { text: 'Let the market clear itself', good: { capital: 1, gdp: 0.1 }, bad: { gdp: -0.5, approval: -4 }, odds: 0.4, tag: 'Ideological gamble' } ] },
        { id: 'standoff',  title: '🚢 Pacific Standoff', text: 'A rival power blockades a shipping strait. Allies are calling. The Pentagon has options on your desk.',
          choices: [
            { text: 'Sail the carrier group through', good: { approval: 5 }, bad: { approval: -5 }, odds: 0.6, tag: 'Show of force' },
            { text: 'Back-channel diplomacy + sanctions', good: { approval: 3 }, bad: { approval: -2 }, odds: 0.75, tag: 'Coalition play' },
            { text: 'Publicly de-escalate', good: { approval: 1 }, bad: { approval: -3 }, odds: 0.65, tag: 'Doves cheer, hawks howl' } ] },
        { id: 'cyber',     title: '💻 Grid Cyberattack', text: 'A ransomware wave hits three regional power grids. Attribution points overseas.',
          choices: [
            { text: 'Name the attacker and strike back in kind', good: { approval: 4 }, bad: { approval: -3 }, odds: 0.6, tag: 'Offensive cyber' },
            { text: 'Quietly patch, publicly reassure', good: { approval: 2 }, bad: { approval: -2 }, odds: 0.8, tag: 'Contain' },
            { text: 'Emergency infrastructure order', good: { approval: 2, capital: -1 }, bad: { approval: -1 }, odds: 0.85, tag: 'Spend to harden' } ] },
        { id: 'pandemic',  title: '🦠 Outbreak Flare', text: 'A novel flu strain jumps borders. Hospitals in two states are filling. Memories of the last one are raw.',
          choices: [
            { text: 'Aggressive early response — vaccines + travel screens', good: { approval: 4 }, bad: { approval: -3 }, odds: 0.7, tag: 'Act fast' },
            { text: 'Guidance without mandates', good: { approval: 2 }, bad: { approval: -3 }, odds: 0.6, tag: 'Thread the needle' },
            { text: 'Leave it to the states', good: { capital: 1 }, bad: { approval: -5 }, odds: 0.4, tag: 'Federalism gamble' } ] },
        { id: 'strike',    title: '🚂 National Rail Strike', text: 'Freight rail workers walk out. Supply chains have 72 hours before shelves feel it.',
          choices: [
            { text: 'Force a deal in the White House', good: { approval: 3 }, bad: { approval: -2 }, odds: 0.7, tag: 'Jawbone both sides' },
            { text: 'Back the workers publicly', good: { approval: 3 }, bad: { gdp: -0.2, approval: -2 }, odds: 0.55, tag: 'Base play' },
            { text: 'Order them back to work', good: { gdp: 0.1, approval: 1 }, bad: { approval: -4 }, odds: 0.6, tag: 'Business first' } ] },
        { id: 'embassy',   title: '🏛️ Embassy Under Siege', text: 'Protesters storm the walls of a U.S. embassy abroad. Marines are inside. The next hour is yours to call.',
          choices: [
            { text: 'Immediate extraction operation', good: { approval: 5 }, bad: { approval: -6 }, odds: 0.65, tag: 'High stakes' },
            { text: 'Negotiate with the host government', good: { approval: 2 }, bad: { approval: -3 }, odds: 0.7, tag: 'Pressure play' },
            { text: 'Shelter in place and wait it out', good: { approval: 1 }, bad: { approval: -4 }, odds: 0.55, tag: 'Patience' } ] },
        { id: 'wildfire',  title: '🔥 Megafire Season', text: 'Three states are burning at once. Smoke has reached the capital — literally.',
          choices: [
            { text: 'Federalize the response', good: { approval: 3 }, bad: { approval: -2, capital: -1 }, odds: 0.75, tag: 'Big footprint' },
            { text: 'Fund the states, stay out of the way', good: { approval: 2 }, bad: { approval: -2 }, odds: 0.7, tag: 'Support role' },
            { text: 'Use it to push your climate agenda', good: { approval: 3, capital: 1 }, bad: { approval: -3 }, odds: 0.55, tag: 'Never waste a crisis' } ] },
        { id: 'surge',     title: '🧭 Border Surge', text: 'Crossings triple in a month. Governors are chartering buses. The images are everywhere.',
          choices: [
            { text: 'Emergency processing surge + National Guard', good: { approval: 3 }, bad: { approval: -2 }, odds: 0.65, tag: 'Both tools' },
            { text: 'Push Congress for the big deal', good: { approval: 2, capital: 1 }, bad: { approval: -3 }, odds: 0.5, tag: 'Legislative bet' },
            { text: 'Tighten asylum rules by order', good: { approval: 2 }, bad: { approval: -3 }, odds: 0.6, tag: 'Courts incoming' } ] },
        { id: 'hostage',   title: '🎗️ Americans Taken', text: 'Four American aid workers are seized by a militia. Their families are on the morning shows.',
          choices: [
            { text: 'Special operations rescue', good: { approval: 6 }, bad: { approval: -6 }, odds: 0.55, tag: 'All or nothing' },
            { text: 'Quiet ransom through intermediaries', good: { approval: 2 }, bad: { approval: -3 }, odds: 0.75, tag: 'Deniable' },
            { text: 'Public ultimatum + sanctions', good: { approval: 3 }, bad: { approval: -2 }, odds: 0.6, tag: 'Pressure' } ] },
        { id: 'leaks',     title: '🕳️ West Wing Leaks', text: 'Your own cabinet is talking. A devastating tell-all excerpt quotes three "senior administration officials" mocking your decision-making. (A more loyal cabinet would never have let this fire start.)',
          choices: [
            { text: 'Hunt the leakers — polygraphs and firings', good: { approval: 2, capital: 1 }, bad: { approval: -4 }, odds: 0.55, tag: 'Purge' },
            { text: 'Laugh it off in public, tighten the circle in private', good: { approval: 3 }, bad: { approval: -2 }, odds: 0.7, tag: 'Above the fray' },
            { text: 'Reshuffle the cabinet on your own terms', good: { approval: 2, capital: -1 }, bad: { approval: -3, capital: -1 }, odds: 0.6, tag: 'Shake-up' } ] },
    ],

    OPPORTUNITIES: [
        { id: 'jobs',   title: '📈 Blowout Jobs Report', text: 'The economy adds a monster month of jobs. Take the lap?', effects: { approval: 3, gdp: 0.2 } },
        { id: 'peace',  title: '🕊️ Peace Summit Opening', text: 'Two old adversaries want you to broker the handshake.', effects: { approval: 4 } },
        { id: 'boom',   title: '🚀 Tech Investment Wave', text: 'Three trillion-dollar companies announce U.S. mega-factories.', effects: { approval: 2, gdp: 0.3 } },
        { id: 'anthem', title: '🏅 A National Moment', text: 'An Olympic sweep and a returning space crew put the country in a rare good mood.', effects: { approval: 2 } },
    ],

    // Domestic scandals that can fester into impeachment. "heat" is severity
    // (0–100). Responses trade short-term approval against long-term heat, and a
    // failed denial becomes a cover-up that escalates.
    PRES_SCANDALS: [
        { id: 'trust',    type: 'FINANCIAL',      title: 'The Blind Trust Wasn\'t Blind', base: 62,
          text: 'Reporting shows your "blind" trust traded on decisions you personally made. The paper trail is ugly.' },
        { id: 'pardon',   type: 'ABUSE OF POWER', title: 'The Pardon-for-Cash Story', base: 74,
          text: 'A donor who wired millions to your library fund walked out of prison the next week. Prosecutors are circling.' },
        { id: 'affair',   type: 'PERSONAL',       title: 'The Hush-Money Allegation', base: 55,
          text: 'A tabloid has receipts alleging a payment to bury a personal indiscretion before the election.' },
        { id: 'records',  type: 'ABUSE OF POWER', title: 'Classified Docs in the Residence', base: 68,
          text: 'Boxes of classified material turn up in a private study. A special counsel is appointed within days.' },
        { id: 'cronyism', type: 'FINANCIAL',      title: 'The No-Bid Contract', base: 58,
          text: 'A billion-dollar federal contract went to a firm run by your college roommate. Inspectors general are asking why.' },
        { id: 'election', type: 'ABUSE OF POWER', title: 'The Pressure Call Leaks', base: 80,
          text: 'A recording surfaces of you leaning on a state official to "find the votes." The clip plays on a loop.' },
    ],

    SCANDAL_RESPONSES: [
        { id: 'deny',         label: 'Deny it flatly — "fake news"',              tag: 'HIGH VARIANCE · COVER-UP RISK' },
        { id: 'apologize',    label: 'Apologize and turn the page',               tag: 'APPROVAL −3 · CAPS THE DAMAGE' },
        { id: 'cooperate',    label: 'Cooperate fully with investigators',        tag: 'LOOKS WEAK NOW · LOWEST HEAT' },
        { id: 'counterattack',label: 'Counterattack the press and prosecutors',   tag: 'RALLIES THE BASE · HEAT LINGERS' },
    ],

    // A defining goal chosen at inauguration and chased across the whole term.
    // Progress comes from the "Advance the Initiative" action and thematically
    // matched bills; completing it is legacy-defining.
    SIGNATURES: [
        { id: 'moonshot', name: 'The Cancer Moonshot', icon: '🔬', target: 100,
          blurb: 'Deliver a health law, sustain research funding for 18 months, and maintain health-system capacity of at least 65.',
          boostIssues: ['Healthcare', 'Technology'], legacyTitle: 'THE CANCER RESEARCH BREAKTHROUGH' },
        { id: 'peacedeal', name: 'A Grand Peace', icon: '🕊️', target: 100,
          blurb: 'Build diplomatic standing to 80, end active combat, and bring a fully developed peace initiative to signature.',
          boostIssues: [], legacyTitle: 'THE GREAT PEACEMAKER' },
        { id: 'balance', name: 'Balance the Budget', icon: '⚖️', target: 100,
          blurb: 'Erase the deficit and hand your successor a surplus. The hardest arithmetic in Washington.',
          boostIssues: ['Taxes'], legacyTitle: 'THE PRESIDENT WHO BALANCED THE BOOKS' },
        { id: 'frontier', name: 'Return to the Moon', icon: '🚀', target: 100,
          blurb: 'Deliver a technology or infrastructure law, fund the program for 18 months, and maintain infrastructure capacity of 65.',
          boostIssues: ['Technology', 'Infrastructure'], legacyTitle: 'THE PRESIDENT WHO REACHED THE STARS' },
    ],

    // Your cabinet is not set dressing: who you hired changes the odds
    cabinetEffects() {
        const gs = window.GameEngine.state;
        const posts = gs.presidency?.administration
            ? Object.fromEntries(Object.entries(gs.presidency.administration.members).filter(([,m]) => m.status === 'ACTIVE'))
            : (gs.transition && gs.transition.posts) || {};
        const avg = (ids, key) => {
            const vals = ids.map(id => posts[id] && posts[id][key]).filter(v => typeof v === 'number');
            return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
        };
        const security = avg(['state', 'defense', 'cia', 'homeland', 'nsa'], 'competence');
        const treasury = posts.treasury ? posts.treasury.competence : null;
        const chief = posts.chief ? posts.chief.competence : null;
        const loyalty = avg(Object.keys(posts), 'loyalty');
        return {
            // Security team competence shifts crisis success odds (up to +10%)
            crisisBonus: security !== null ? Math.max(0, Math.min(0.10, (security - 70) / 200)) : 0,
            // Treasury competence biases the economy's drift (±0.05 GDP/qtr)
            econBias: treasury !== null ? Math.max(-0.05, Math.min(0.05, (treasury - 75) / 400)) : 0,
            // A top-tier chief of staff runs a cleaner whip operation
            billBonus: chief !== null && chief >= 85 ? 5 : 0,
            // A disloyal cabinet leaks
            leakRisk: loyalty !== null && loyalty < 65,
            security: security && Math.round(security),
            loyalty: loyalty && Math.round(loyalty),
        };
    },

    // ── Signature initiative ───────────────────────
    chooseSignature(id) {
        const p = window.GameEngine.state.presidency;
        const sig = this.SIGNATURES.find(s => s.id === id);
        const career = window.CareerSystem && window.CareerSystem.ensure(window.GameEngine.state);
        const alreadyUsed = career && [...career.completedSignatures, ...career.failedSignatures].includes(id);
        if (!p || !sig || p.signature || alreadyUsed) return null;
        p.signature = { id: sig.id, name: sig.name, icon: sig.icon, target: sig.target,
                        boostIssues: sig.boostIssues, legacyTitle: sig.legacyTitle, progress: 0, done: false };
        if (career) career.promises.push({ id:sig.id, name:sig.name, term:p.term, status:'ACTIVE' });
        p.log.push(`Signature initiative set: ${sig.name}.`);
        return p.signature;
    },

    _addInitiative(amount, sourceLabel) {
        const p = window.GameEngine.state.presidency;
        if (!p.signature || p.signature.done) return false;
        p.signature.progress = Math.min(p.signature.target, p.signature.progress + amount);
        const outcomeReady = this.signatureOutcomeReady(p);
        if (p.signature.progress >= p.signature.target && outcomeReady) {
            p.signature.done = true;
            p.signature.doneQuarter = p.quarter;
            p.legacyPoints += 28;
            p.approval = Math.min(80, p.approval + 5);
            p.log.push(`🏆 ${p.signature.name} — ACHIEVED. A defining accomplishment.`);
            if (window.CareerSystem) {
                const career = window.CareerSystem.ensure(window.GameEngine.state);
                const promise = career.promises.find(x => x.id === p.signature.id && x.term === p.term);
                if (promise) promise.status = 'DELIVERED';
            }
        } else if (sourceLabel) {
            p.log.push(`${p.signature.name}: progress through ${sourceLabel} (${p.signature.progress}/${p.signature.target}).`);
        }
        return p.signature.done;
    },

    signatureOutcomeReady(p) {
        const s=p.signature;if(!s) return false;
        if(s.id==='balance') return (p.fiscal.balancedMonths||0)>=12;
        if(s.id==='peacedeal') return !this.atWar() && p.diplomaticStanding>=80;
        const delivered=(p.policies||[]).some(x=>x.effectsApplied && (s.id==='moonshot'?x.issue==='Healthcare':['Technology','Infrastructure'].includes(x.issue)));
        return delivered && (s.fundedMonths||0)>=18 && (s.id==='moonshot'?p.institutions.health:p.institutions.infrastructure)>=65;
    },

    // ── State of the Union ─────────────────────────
    SOTU_THEMES: [
        { id: 'economy',  label: 'The Economy',        desc: 'Jobs, growth, the cost of living.' },
        { id: 'security', label: 'National Security',   desc: 'Strength abroad, safety at home.' },
        { id: 'domestic', label: 'The Domestic Agenda', desc: 'Your laws and what comes next.' },
        { id: 'unity',    label: 'National Unity',      desc: 'One country, above the noise.' },
    ],
    SOTU_TONES: [
        { id: 'optimistic', label: 'Optimistic', desc: 'Sell the morning-in-America story.' },
        { id: 'combative',  label: 'Combative',  desc: 'Name the enemies, rally the base.' },
        { id: 'sober',      label: 'Sober',      desc: 'Level with the country. Low risk.' },
    ],

    // How well does a theme match reality right now? 0..1
    _sotuThemeFit(theme) {
        const p = window.GameEngine.state.presidency;
        const e = p.economy;
        if (theme === 'economy') return (e.gdp >= 2.5 ? 0.7 : e.gdp >= 1.5 ? 0.4 : 0.15) + (e.inflation <= 3 ? 0.2 : 0) + (e.unemployment <= 4.5 ? 0.1 : 0);
        if (theme === 'security') {
            if (this.atWar()) { const w = p.war; return w.momentum >= 60 ? 0.85 : w.momentum <= 40 ? 0.15 : 0.4; }
            const wonWars = (p.warLog || []).filter(w => w.outcome === 'victory').length;
            return 0.55 + Math.min(0.3, wonWars * 0.15);
        }
        if (theme === 'domestic') return Math.min(0.95, 0.25 + p.enacted.length * 0.14);
        if (theme === 'unity') return p.approval >= 46 && p.approval <= 58 ? 0.8 : 0.4; // reaching across lands when you're near the middle
        return 0.4;
    },

    deliverSotu(theme, tone) {
        const p = window.GameEngine.state.presidency;
        if(!p || p.pendingEvent?.kind!=='sotu' || !this.SOTU_THEMES.some(t=>t.id===theme) || !this.SOTU_TONES.some(t=>t.id===tone)) return null;
        const prior=p.sotuHistory.find(s=>(s.month||((s.quarter||1)*3))===(p.month||p.quarter*3));
        if(prior) return prior;
        const fit = this._sotuThemeFit(theme);
        let score = 40 + fit * 45 + (window.GameEngine.random() - 0.5) * 16;
        if (tone === 'optimistic') score += (fit - 0.5) * 30;   // amplifies: great when true, hollow when not
        else if (tone === 'combative') score = Math.max(score, 52) - (fit > 0.6 ? 8 : 0); // base floor, caps a genuine win
        // 'sober' is the steady middle — no modifier
        score = Math.max(5, Math.min(98, Math.round(score)));
        const tier = score >= 75 ? 'A TRIUMPH' : score >= 58 ? 'WELL RECEIVED' : score >= 42 ? 'FORGETTABLE' : 'A MISFIRE';
        const approvalDelta = score >= 75 ? 4 : score >= 58 ? 2 : score >= 42 ? 0 : -3;
        p.approval = Math.max(15, Math.min(80, p.approval + approvalDelta));
        if (score >= 58) p.capital = Math.min(12, p.capital + 1);
        // Touting your initiative on the biggest stage nudges it forward
        if (p.signature && !p.signature.done && (theme === 'domestic' || (theme === 'economy' && p.signature.id === 'balance'))) {
            this._addInitiative(6, 'the State of the Union');
        }
        p.sotuHistory.push({ quarter: p.quarter,month:p.month, theme, tone, score, tier,approvalDelta });
        p.log.push(`State of the Union (${this.SOTU_THEMES.find(t => t.id === theme).label}, ${tone}): ${tier}.`);
        return { score, tier, approvalDelta, theme, tone };
    },

    // ── Lifecycle ──────────────────────────────────

    begin() {
        const gs = window.GameEngine.state;
        if (gs.presidency) return gs.presidency;
        const career = window.CareerSystem ? window.CareerSystem.ensure(gs) : null;
        if (!gs.transition && gs.incumbentSeed && career?.countrySnapshot?.transition) {
            gs.transition = window.CareerSystem.clone(career.countrySnapshot.transition);
        }
        const results = (window.GameUI && window.GameUI._lastResults) || { nationalPopularVote: { player: 51, opponent: 47 }, playerEV: 290 };
        const margin = results.nationalPopularVote.player - results.nationalPopularVote.opponent;
        const t = gs.transition || { senateSeats: 51, capital: 5 };
        const term = gs.incumbentSeed ? (gs.incumbentSeed.term || 1) + 1 : 1;
        gs.presidency = {
            term,
            quarter: 1,
            population: 335,
            stability: { score: 76, tier: 'STABLE' },
            institutions: { trust:52, infrastructure:88, health:82, justice:70, continuity:92 },
            coalitions: { base:72, independents:48, opposition:18, labor:52, business:51, youth:55 },
            calendar: { monthsElapsed:0, monthlyBriefings:[] },
            policies: [], timeline: [],
            collapse: { active:false, seasons:0, recovery:0, events:[] },
            world: window.WorldSystem ? window.WorldSystem.createState() : null,
            administration: {
                members: Object.fromEntries(Object.entries(t.posts || {}).map(([id, member]) => [id, {
                    id, name:member.name, competence:member.competence, loyalty:member.loyalty,
                    relationship:Math.round(((member.loyalty || 60) + 50) / 2), influence:50, status:'ACTIVE',
                }])),
                unity:70, resignations:[],
            },
            approval: Math.max(44, Math.min(60, Math.round(50 + margin))),
            economy: { gdp: 2.2, unemployment: 4.1, inflation: 2.6 },
            congress: {
                senateSeats: t.senateSeats, houseMajority: margin >= 1,
                houseSeats: margin >= 1 ? 224 : 211,
                factions: { progressives:42, moderates:46, conservatives:45, populists:38, institutionalists:54 },
            },
            capital: Math.min(12, (t.capital || 5) + 3),
            diplomaticStanding: 55,
            enacted: [], eos: [], scotus: [],
            crisisLog: [],
            war: null, warLog: [], surpriseWarDone: false,
            signature: null, sotuHistory: [],
            fiscal: {
                debt:100, deficit:4, shutdown:false, shutdownQuarters:0, ledger:[],
                budget:{ revenue:18.5, mandatory:14.5, domestic:5.5, defense:3.4, debtService:2.5, emergency:0, balance:-7.4 },
            },
            scandals: [], impeached: false,
            acted: false,
            pendingEvent: null,
            midtermsDone: false,
            legacyPoints: 0,
            log: [`Sworn in with ${Math.round(results.nationalPopularVote.player)}% of the vote.`],
            over: false,
        };
        if (term >= 2 && career && career.countrySnapshot) {
            window.CareerSystem.restoreCountry(gs.presidency, career.countrySnapshot);
            gs.presidency.capital = Math.min(12, Math.max(5, gs.presidency.capital || 0) + 3);
            gs.presidency.acted = false;
            gs.presidency.pendingEvent = null;
            gs.presidency.midtermsDone = false;
            gs.presidency.over = false;
            gs.presidency.quarter = 1;
            gs.presidency.sotuHistory = [];
            gs.presidency.budgetYears = [];
            gs.presidency.surpriseWarDone = false;
            gs.presidency.signature = null;
        }
        return gs.presidency;
    },

    quarterLabel(q) {
        const p = window.GameEngine.state.presidency;
        const baseYear = 2029 + ((p && p.term ? p.term : 1) - 1) * 4;
        const year = baseYear + Math.floor((q - 1) / 4);
        const season = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][(q - 1) % 4];
        return `YEAR ${Math.floor((q - 1) / 4) + 1} · ${season} ${year}`;
    },

    availableBills() {
        const p = window.GameEngine.state.presidency;
        const done = new Set(p.enacted.map(b => b.id));
        return this.BILLS.filter(b => !done.has(b.id) && (!p.billAttempts?.[b.id] ||
            (p.month || (p.quarter-1)*3+1)-p.billAttempts[b.id].month>=3 ||
            p.congress.senateSeats!==p.billAttempts[b.id].senate));
    },

    availableEOs() {
        const p = window.GameEngine.state.presidency;
        const used = new Set(p.eos.map(e => e.id));
        return this.EOS.filter(e => !used.has(e.id));
    },

    _billSupport(bill, extraCapital) {
        const p = window.GameEngine.state.presidency;
        let odds = 40 + (p.congress.senateSeats - 50) * 4 + (p.congress.houseMajority ? 15 : -20)
            + (extraCapital || 0) * 8 + (bill.bipartisan ? 15 : 0)
            + (p.approval >= 55 ? 8 : p.approval < 45 ? -8 : 0)
            + this.cabinetEffects().billBonus;
        return Math.max(5, Math.min(95, Math.round(odds)));
    },

    whipCount(bill, extraCapital) {
        const p = window.GameEngine.state.presidency;
        const odds = this._billSupport(bill, extraCapital || 0);
        // Displayed ranges and the roll share a correlated whip model.
        const houseCenter = Math.round(218 + (odds/100-.5)*30);
        const senateCenter = Math.round(51 + (odds/100-.5)*12);
        return {
            house: { low:Math.max(0, houseCenter - 15), high:Math.min(435, houseCenter + 15), needed:218 },
            senate: { low:Math.max(0, senateCenter - 6), high:Math.min(100, senateCenter + 6), needed:51 },
        };
    },

    billOdds(bill,extraCapital) {
        const whip=this.whipCount(bill,extraCapital);
        const required=chamber=>(chamber.needed-.5-chamber.low)/(chamber.high-chamber.low);
        return Math.round(Math.max(0,Math.min(1,1-Math.max(required(whip.house),required(whip.senate))))*100);
    },

    // One optional major action per month.
    act(type, payload={}) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        if (!p || p.acted || p.over || p.pendingEvent) return null;
        let result = null;

        if (type === 'bill') {
            const bill = this.BILLS.find(b => b.id === payload.billId);
            if (!bill || !this.availableBills().some(b=>b.id===bill.id)) return null;
            const extra = payload.extraCapital ?? 0;
            if(!Number.isInteger(extra)||extra<0||extra>3) return null;
            if (p.capital < bill.cost+extra) return null;
            p.capital -= bill.cost+extra;
            const odds = this.billOdds(bill, extra);
            const whip=this.whipCount(bill,extra);
            const draw=window.GameEngine.random();
            const house=Math.round(whip.house.low+draw*(whip.house.high-whip.house.low));
            const senate=Math.round(whip.senate.low+draw*(whip.senate.high-whip.senate.low));
            const passed=house>=218 && senate>=51;
            result = { type, bill, odds, passed, house, senate };
            if (passed) {
                p.enacted.push({ id: bill.id, name: bill.name, legacy: bill.legacy, quarter: p.quarter });
                p.policies = p.policies || [];
                p.policies.push({ id:bill.id, name:bill.name, issue:bill.issue, term:p.term, implementation:15, target:100, status:'ROLLING OUT', effectsApplied:false });
                p.legacyPoints += bill.legacy;
                this._applyEffects(bill.effects);
                // Bills cost money — the spend lands on the national debt
                if (p.fiscal && typeof bill.spend === 'number') {
                    p.fiscal.policyAnnual=(p.fiscal.policyAnnual||0)+bill.spend*.1;
                    p.fiscal.debt = Math.max(40, p.fiscal.debt + bill.spend);
                    if (window.CareerSystem) window.CareerSystem.fiscalEntry(`Law: ${bill.name}`, bill.spend, bill.desc);
                    if (bill.spend < 0 && p.signature && !p.signature.done && p.signature.id === 'balance') {
                        this._addInitiative(16, 'deficit reduction');
                    }
                }
                p.log.push(`Signed the ${bill.name}.`);
                // Thematically matched bills push your signature initiative along
                if (p.signature && !p.signature.done && (p.signature.boostIssues || []).includes(bill.issue)) {
                    this._addInitiative(12, `the ${bill.name}`);
                    result.initiativeBoost = true;
                }
            } else {
                p.failedBills = p.failedBills || [];
                p.failedBills.push(bill.id);
                p.billAttempts=p.billAttempts || {};
                p.billAttempts[bill.id]={month:p.month || (p.quarter-1)*3+1,senate:p.congress.senateSeats};
                p.approval = Math.max(20, p.approval - 2);
                p.log.push(`The ${bill.name} dies on the floor.`);
            }
        } else if (type === 'eo') {
            const eo = this.EOS.find(e => e.id === payload.eoId);
            if (!eo || !this.availableEOs().some(e=>e.id===eo.id)) return null;
            p.eos.push({ id: eo.id, name: eo.name, quarter: p.quarter, struck: false });
            p.legacyPoints += eo.legacy;
            this._applyEffects(eo.effects);
            p.log.push(`Signed executive order: ${eo.name}.`);
            if (window.CareerSystem) window.CareerSystem.record('executive_order', { id:eo.id, name:eo.name, effects:eo.effects });
            result = { type, eo };
        } else if (type === 'barnstorm') {
            const gain = 2 + Math.floor(window.GameEngine.random() * 3);
            p.approval = Math.min(75, p.approval + gain);
            p.capital = Math.min(12, p.capital + 1);
            p.log.push(`Barnstormed the country — approval +${gain}.`);
            result = { type, gain };
        } else if (type === 'diplomacy') {
            const gain = 1 + Math.floor(window.GameEngine.random() * 3);
            p.approval = Math.min(75, p.approval + gain);
            p.crisisShield = true;
            p.diplomaticStanding = Math.min(100, (p.diplomaticStanding || 55) + 8);
            p.log.push(`World tour — approval +${gain}, standing with allies up.`);
            result = { type, gain };
        } else if (type === 'declarewar') {
            const war = window.WarSystem.declare(payload.adversaryId, false, payload.authorization);
            if (!war) return null;
            p.log.push(`War declared on ${war.adversary.name}.`);
            result = { type, war };
        } else if (type === 'initiative') {
            if (!p.signature || p.signature.done || p.capital<1) return null;
            if(!p.signature.funded && ['moonshot','frontier'].includes(p.signature.id)) {
                p.signature.funded=true;p.signature.fundedMonths=0;
                p.fiscal.policyAnnual=(p.fiscal.policyAnnual||0)+.5;
                p.log.push(`${p.signature.name}: recurring funding of 0.5% GDP added to the annual budget.`);
            }
            const gain = 18 + Math.floor(window.GameEngine.random() * 8);
            p.capital = Math.max(0, p.capital - 1);
            const done = this._addInitiative(gain, 'a dedicated national push');
            result = { type, gain, done, signature: p.signature };
        } else if (type === 'reopen') {
            if (!p.fiscal || !p.fiscal.shutdown || p.capital<2) return null;
            p.fiscal.shutdown = false;
            p.capital = Math.max(0, p.capital - 2);
            p.approval = Math.min(80, p.approval + 2);
            p.fiscal.debt = Math.max(40, p.fiscal.debt + 3); // the deal to reopen isn't free
            if (window.CareerSystem) window.CareerSystem.fiscalEntry('Shutdown agreement', 3, 'Concessions required to reopen the government');
            p.log.push('Government reopened. The standoff ends — at a price.');
            result = { type };
        } else if (type === 'warposture') {
            if(!this.atWar() || !['hold','escalate','withdraw','negotiate'].includes(payload?.posture)) return null;
            // Handled through endQuarter's battle round; just stash intent
            p.pendingPosture = payload.posture;
            result = { type, posture: payload.posture };
        } else if (type === 'relief' || type === 'continuity' || type === 'rebuild') {
            if (!p.collapse || !p.collapse.active) return null;
            const table = {
                relief: { recovery:8, stability:5, infrastructure:1, health:8, text:'A national relief surge reaches the hardest-hit regions.' },
                continuity: { recovery:6, stability:8, infrastructure:0, health:1, text:'Continuity teams restore federal authority and communications.' },
                rebuild: { recovery:10, stability:4, infrastructure:8, health:3, text:'Reconstruction crews reconnect power, water, and transport.' },
            };
            const move = table[type];
            p.collapse.recovery = Math.min(100, p.collapse.recovery + move.recovery);
            p.stability.score = Math.min(100, p.stability.score + move.stability);
            p.institutions.infrastructure = Math.min(100, p.institutions.infrastructure + move.infrastructure);
            p.institutions.health = Math.min(100, p.institutions.health + move.health);
            p.log.push(move.text);
            result = { type, move };
        }
        if(!result) return null;
        p.acted = true;
        if (window.CareerSystem) window.CareerSystem.record('governing_action',{action:type,month:p.month,payload:payload || {},result});
        if (window.SaveStore) window.SaveStore.save();
        return result;
    },

    /** Close the quarter: stage the event (crisis/opportunity/SCOTUS) or advance. */
    endQuarter() {
        const p = window.GameEngine.state.presidency;
        if (!p || !p.acted || p.over || p.pendingEvent) return null;

        // Active war dominates the quarter — fight a round or seal the peace
        if (p.war && !p.war.resolved) {
            const posture = p.pendingPosture || 'hold';
            p.pendingPosture = null;
            const res = posture === 'negotiate'
                ? window.WarSystem.negotiate()
                : window.WarSystem.fightRound(posture);
            p.pendingEvent = { kind: 'warbattle', result: res };
            return p.pendingEvent;
        }

        // Impeachment: House lost + a festering scandal → the trial comes first
        if (!p.impeached && p.congress && !p.congress.houseMajority && this._impeachmentTriggered()) {
            p.pendingEvent = { kind: 'impeachment' };
            return p.pendingEvent;
        }

        // SCOTUS vacancies land in fixed windows
        if ((p.quarter === 5 || p.quarter === 11) && p.scotus.length < 2) {
            p.pendingEvent = { kind: 'scotus' };
            return p.pendingEvent;
        }

        // Annual State of the Union addresses (year-in-review)
        if ((p.quarter === 4 || p.quarter === 8 || p.quarter === 12) && !p.sotuHistory.some(s => s.quarter === p.quarter)) {
            p.pendingEvent = { kind: 'sotu' };
            return p.pendingEvent;
        }

        // Appropriations / debt-ceiling fights (only when not already shut down)
        if (p.fiscal && !p.fiscal.shutdown && [2, 6, 10, 14].includes(p.quarter) && !(p.budgetYears || []).includes(p.quarter)) {
            p.budgetYears = (p.budgetYears || []).concat(p.quarter);
            p.pendingEvent = { kind: 'budget' };
            return p.pendingEvent;
        }

        // Surprise attack: once per term, an adversary may declare war on YOU
        if (!p.surpriseWarDone && !p.war && p.quarter >= 3 && p.quarter <= 13 && window.GameEngine.random() < 0.14) {
            p.surpriseWarDone = true;
            const pool = window.WarSystem.ADVERSARIES.filter(a => a.strength <= 40);
            const foe = pool[Math.floor(window.GameEngine.random() * pool.length)];
            window.WarSystem.declare(foe.id, true);
            p.pendingEvent = { kind: 'surprisewar', adversaryId: foe.id };
            return p.pendingEvent;
        }

        // A scandal may break — how loyal your cabinet is and how you've governed
        // drive the odds
        const scandalPool = this.PRES_SCANDALS.filter(s => !(p.scandals || []).some(x => x.id === s.id));
        if (scandalPool.length && window.GameEngine.random() < this._scandalRisk()) {
            const s = scandalPool[Math.floor(window.GameEngine.random() * scandalPool.length)];
            p.pendingEvent = { kind: 'scandal', id: s.id };
            return p.pendingEvent;
        }

        const roll = window.GameEngine.random();
        if (roll < 0.5) {
            const eff = this.cabinetEffects();
            const pool = this.CRISES.filter(c => !p.crisisLog.some(l => l.id === c.id))
                .filter(c => c.id !== 'leaks' || eff.leakRisk);
            const crisis = pool[Math.floor(window.GameEngine.random() * pool.length)] || this.CRISES[Math.floor(window.GameEngine.random() * this.CRISES.length)];
            const prior = p.crisisLog.filter(l => l.id === crisis.id);
            p.pendingEvent = {
                kind:'crisis', id:crisis.id, recurrence:prior.length,
                sequelText:prior.length ? `This is a sequel to the ${crisis.title.replace(/^[^ ]+ /, '')} your administration faced before. Voters will compare this response with the last one.` : null,
            };
            return p.pendingEvent;
        }
        if (roll < 0.75) {
            const opp = this.OPPORTUNITIES[Math.floor(window.GameEngine.random() * this.OPPORTUNITIES.length)];
            this._applyEffects(opp.effects);
            p.legacyPoints += 2;
            p.log.push(opp.title.replace(/^[^ ]+ /, '') + ' — a good week.');
            p.pendingEvent = { kind: 'opportunity', id: opp.id };
            return p.pendingEvent;
        }
        p.pendingEvent = { kind: 'quiet' };
        return p.pendingEvent;
    },

    resolveCrisis(choiceIndex) {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || p.pendingEvent.kind !== 'crisis') return null;
        const crisis = this.CRISES.find(c => c.id === p.pendingEvent.id);
        const choice = crisis.choices[choiceIndex];
        let odds = choice.odds + (p.crisisShield ? 0.12 : 0) + this.cabinetEffects().crisisBonus;
        p.crisisShield = false;
        const success = window.GameEngine.random() < odds;
        this._applyEffects(success ? choice.good : choice.bad);
        p.legacyPoints += success ? 4 : -4;
        p.crisisLog.push({ id: crisis.id, title: crisis.title, success, quarter: p.quarter });
        if (window.CareerSystem) {
            const career = window.CareerSystem.ensure(window.GameEngine.state);
            career.crises.push({ id:crisis.id, term:p.term, quarter:p.quarter, success, choice:choice.text, recurrence:p.crisisLog.filter(x => x.id === crisis.id).length });
            window.CareerSystem.record('crisis_response', { crisisId:crisis.id, title:crisis.title, choice:choice.text, success });
        }
        p.log.push(`${crisis.title}: ${success ? 'handled' : 'botched'} (${choice.tag}).`);
        p.pendingEvent = null;
        this._advance();
        return { crisis, choice, success };
    },

    appointJustice(pickIndex) {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || p.pendingEvent.kind !== 'scotus') return null;
        const picks = [
            { name: 'the young ideologue', desc: 'A 44-year-old movement favorite. The base is euphoric; the hearing is a war.', controversy: 70, legacy: 10 },
            { name: 'the consensus moderate', desc: 'A respected appellate veteran. Confirmed comfortably, remembered mildly.', controversy: 25, legacy: 6 },
            { name: 'the historic first', desc: 'A barrier-breaking nominee the country will remember. Moderate fight.', controversy: 45, legacy: 9 },
        ];
        const pick = picks[pickIndex];
        const defections = Math.max(0, Math.round((pick.controversy - 40) / 12)) + Math.floor(window.GameEngine.random() * 3);
        const votesFor = Math.max(0, Math.min(100, p.congress.senateSeats - defections + Math.max(0, Math.round((60 - pick.controversy) / 15))));
        const confirmed = votesFor >= 50;
        if (confirmed) {
            p.scotus.push({ pick: pick.name, quarter: p.quarter, votesFor });
            p.legacyPoints += pick.legacy;
            p.approval = Math.min(75, p.approval + 1);
            p.log.push(`Supreme Court seat filled (${pick.name}), ${votesFor}–${100 - votesFor}.`);
        } else {
            p.approval = Math.max(20, p.approval - 3);
            p.legacyPoints -= 3;
            p.log.push(`Supreme Court nominee rejected, ${votesFor}–${100 - votesFor}.`);
        }
        p.pendingEvent = null;
        this._advance();
        return { pick, confirmed, votesFor, votesAgainst: 100 - votesFor };
    },

    BUDGET_CHOICES: [
        { id:'reform', label:'Negotiate a funded fiscal reform', tag:'−2⭐ · REVENUE +2 / SPENDING −2', desc:'Raise recurring revenue and trim domestic spending. Approval falls three points; each annual deal improves the balance by four GDP points.' },
        { id: 'clean', label: 'Pass a clean budget', tag: 'NEEDS THE HOUSE', desc: 'Fund the government on time. Easy with your majority — a coin flip without it.' },
        { id: 'concede', label: 'Raise the ceiling with concessions', tag: '−2⭐ · DEBT +6', desc: 'Cut the deal, avoid the cliff. Safe, but the other side extracts its pound of flesh.' },
        { id: 'brink', label: 'Brinkmanship — refuse to blink', tag: 'HIGH RISK / HIGH REWARD', desc: 'Dare them to shut it down. Win the staredown for a boost — or trigger the shutdown yourself.' },
    ],

    resolveBudget(choiceIndex) {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || p.pendingEvent.kind !== 'budget') return null;
        const choice = this.BUDGET_CHOICES[choiceIndex];
        if (!choice) return null;
        if (['reform','concede'].includes(choice.id) && p.capital<2) return {ok:false,label:'NOT ENOUGH CAPITAL — NEED 2'};
        let outcome;
        if (choice.id==='reform') {
            p.capital-=2; p.approval-=3;
            p.fiscal.revenueAdjustment=(p.fiscal.revenueAdjustment||0)+2;
            p.fiscal.spendingAdjustment=Math.max(-4,(p.fiscal.spendingAdjustment||0)-2);
            p.fiscal.shutdown=false;
            outcome={label:'RECURRING REVENUE AND SPENDING REFORM',good:true,shutdown:false};
        } else if (choice.id === 'clean') {
            const base = (p.congress.houseMajority ? 0.85 : 0.4) + (p.congress.senateSeats - 50) * 0.01;
            if (window.GameEngine.random() < base) { p.approval = Math.min(80, p.approval + 1); p.fiscal.debt += 2; outcome = { label: 'CLEAN BUDGET PASSED', shutdown: false, good: true, debtDelta:2 }; }
            else { p.fiscal.shutdown = true; p.approval = Math.max(15, p.approval - 3); outcome = { label: 'THE BUDGET FAILS — GOVERNMENT SHUTS DOWN', shutdown: true, good: false }; }
        } else if (choice.id === 'concede') {
            p.capital = Math.max(0, p.capital - 2); p.approval = Math.max(15, p.approval - 2); p.fiscal.debt += 6;
            outcome = { label: 'CEILING RAISED — WITH CONCESSIONS', shutdown: false, good: true, debtDelta:6 };
        } else {
            if (window.GameEngine.random() < 0.55) { p.approval = Math.min(80, p.approval + 4); p.capital = Math.min(12, p.capital + 1); p.fiscal.debt = Math.max(40, p.fiscal.debt - 2); outcome = { label: 'YOU WON THE STAREDOWN', shutdown: false, good: true, debtDelta:-2 }; }
            else { p.fiscal.shutdown = true; p.approval = Math.max(15, p.approval - 4); outcome = { label: 'BRINKMANSHIP BACKFIRES — GOVERNMENT SHUTS DOWN', shutdown: true, good: false }; }
        }
        if (window.CareerSystem && outcome.debtDelta) window.CareerSystem.fiscalEntry(`Budget: ${outcome.label}`, outcome.debtDelta, choice.desc);
        p.log.push(`Budget fight: ${outcome.label}.`);
        p.pendingEvent = null;
        this._advance();
        return outcome;
    },

    // ── Scandal & impeachment ──────────────────────
    _scandalRisk() {
        const p = window.GameEngine.state.presidency;
        let risk = 0.09;
        if (this.cabinetEffects().leakRisk) risk += 0.10;      // a disloyal cabinet talks
        risk += Math.min(0.10, p.eos.length * 0.02);           // aggressive executive action draws fire
        if (p.approval < 40) risk += 0.08;                     // weakness invites the knives
        if (p.war && p.war.resolved && p.war.outcome === 'quagmire') risk += 0.06;
        return Math.min(0.42, risk);
    },

    _liveScandals() {
        const p = window.GameEngine.state.presidency;
        return (p.scandals || []).filter(s => s.heat > 12);
    },

    _impeachmentTriggered() {
        const live = this._liveScandals();
        return live.some(s => s.heat >= 70) || live.length >= 2;
    },

    resolveScandal(responseIndex) {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || p.pendingEvent.kind !== 'scandal') return null;
        const def = this.PRES_SCANDALS.find(s => s.id === p.pendingEvent.id);
        const resp = this.SCANDAL_RESPONSES[responseIndex];
        let heat = def.base, coverup = false, note;
        if (resp.id === 'deny') {
            if (window.GameEngine.random() < 0.5) { heat = Math.round(def.base * 0.4); note = 'The denial holds — the story dies for now.'; }
            else { heat = Math.min(100, Math.round(def.base * 1.6)); coverup = true; note = 'The denial unravels. Now it\'s a cover-up, and it grows.'; p.approval = Math.max(15, p.approval - 3); }
        } else if (resp.id === 'apologize') {
            heat = Math.round(def.base * 0.7); p.approval = Math.max(15, p.approval - 3);
            note = 'You take the hit and move on. It caps the damage.';
        } else if (resp.id === 'cooperate') {
            heat = Math.round(def.base * 0.55); p.approval = Math.max(15, p.approval - 2);
            note = 'Full cooperation looks weak today but starves the story of oxygen.';
        } else {
            heat = Math.round(def.base * 0.95); p.approval = Math.min(80, p.approval + 2);
            note = 'The base roars, but the heat lingers and the middle recoils.';
        }
        p.scandals.push({ id: def.id, type: def.type, title: def.title, heat, coverup, quarter: p.quarter });
        if (window.CareerSystem) {
            const career = window.CareerSystem.ensure(window.GameEngine.state);
            career.scandals.push({ id:def.id, term:p.term, quarter:p.quarter, response:resp.id, heat, coverup });
            window.CareerSystem.record('scandal_response', { scandalId:def.id, title:def.title, response:resp.id, heat, coverup });
        }
        p.legacyPoints -= Math.round(heat / 12);
        p.log.push(`Scandal: ${def.title} — ${resp.label.split(' —')[0]} (heat ${heat}).`);
        p.pendingEvent = null;
        this._advance();
        return { def, resp, heat, coverup, note };
    },

    resolveImpeachment(defend) {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || p.pendingEvent.kind !== 'impeachment') return null;
        p.impeached = true;
        const maxHeat = Math.max(...this._liveScandals().map(s => s.heat), 40);
        const oppSeats = 100 - p.congress.senateSeats;
        // A mounted legal defense peels back a few would-be defectors
        const defenseShield = defend ? 4 : 0;
        const defectors = Math.max(0, Math.round((maxHeat - 60) / 3) + Math.floor(window.GameEngine.random() * 5) - defenseShield);
        const convict = Math.max(0, Math.min(100, oppSeats + defectors));
        const removed = convict >= 67;
        if (removed) {
            p.over = true;
            p.approval = Math.max(10, p.approval - 10);
            p.legacyPoints -= 40;
            p.removedFromOffice = true;
            p.log.push(`Convicted by the Senate, ${convict}–${100 - convict}. Removed from office.`);
            p.legacy = this.computeLegacy();
        } else {
            p.approval = Math.max(15, p.approval - 4);
            p.legacyPoints -= 8;
            // Surviving lances the boil — heat drops
            this._liveScandals().forEach(s => s.heat = Math.round(s.heat * 0.5));
            p.log.push(`Acquitted by the Senate, ${convict}–${100 - convict}. You survive — scarred.`);
        }
        p.pendingEvent = null;
        if (!removed) this._advance();
        return { convict, acquit: 100 - convict, removed, threshold: 67 };
    },

    acknowledgeEvent() {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || !['opportunity', 'quiet', 'sotu'].includes(p.pendingEvent.kind)) return null;
        p.pendingEvent = null;
        this._advance();
        return true;
    },

    // Clear a war-battle or surprise-attack event and move the term forward.
    // A nuclear apocalypse ends the term; _advance() no-ops once p.over is set.
    resolveWarEvent() {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || (p.pendingEvent.kind !== 'warbattle' && p.pendingEvent.kind !== 'surprisewar')) return null;
        p.pendingEvent = null;
        this._advance();
        return true;
    },

    atWar() {
        const p = window.GameEngine.state.presidency;
        return !!(p && p.war && !p.war.resolved);
    },

    _advance() {
        const p = window.GameEngine.state.presidency;
        if (p.over) { if (window.GameUI) window.GameUI.autoSave(); return; }

        this._ensureLivingState(p);
        this._runMonthlyPulses(p);

        // EO court challenges: each standing order has a small strike chance per quarter
        for (const eo of p.eos) {
            if (!eo.struck && window.GameEngine.random() < 0.08) {
                eo.struck = true;
                p.approval = Math.max(20, p.approval - 2);
                p.legacyPoints -= 3;
                p.log.push(`Courts strike down ${eo.name}.`);
            }
        }

        // Economy random walk (a strong Treasury secretary tilts the drift)
        const e = p.economy;
        e.gdp = Math.round((e.gdp + (window.GameEngine.random() - 0.48) * 0.6 + this.cabinetEffects().econBias) * 10) / 10;
        e.unemployment = Math.max(2.5, Math.round((e.unemployment + (window.GameEngine.random() - 0.5) * 0.4 - (e.gdp > 2.5 ? 0.1 : -0.1)) * 10) / 10);
        e.inflation = Math.max(0.5, Math.round((e.inflation + (window.GameEngine.random() - 0.5) * 0.5) * 10) / 10);

        // Debt servicing: strong growth shrinks the debt, weak growth grows it,
        // and a big debt load feeds inflation and drags output. A shutdown bleeds
        // approval every quarter until it is reopened.
        if (p.fiscal) {
            const drift = 1.2 - (e.gdp - 2) * 0.5;
            p.fiscal.debt = Math.max(40, Math.round((p.fiscal.debt + drift) * 10) / 10);
            p.fiscal.deficit = Math.round(drift * 10) / 10;
            const enactedSpend = p.enacted.reduce((sum, law) => {
                const def = this.BILLS.find(b => b.id === law.id);
                return sum + (def && def.spend > 0 ? def.spend * .025 : 0);
            }, 0);
            const budget = {
                revenue:Math.round((18 + Math.max(-1, e.gdp) * .45) * 10) / 10,
                mandatory:14.5,
                domestic:Math.round((5.5 + enactedSpend) * 10) / 10,
                defense:Math.round((3.4 + (this.atWar() ? 1.2 : 0)) * 10) / 10,
                debtService:Math.round((p.fiscal.debt * .026) * 10) / 10,
                emergency:Math.round(((p.fiscal.shutdown ? .4 : 0) + (p.collapse.active ? 1.5 : 0)) * 10) / 10,
            };
            budget.balance = Math.round((budget.revenue - budget.mandatory - budget.domestic - budget.defense - budget.debtService - budget.emergency) * 10) / 10;
            p.fiscal.budget = budget;
            if (window.CareerSystem) window.CareerSystem.fiscalEntry('Quarterly operations and debt service', drift, `Growth ${e.gdp.toFixed(1)}%; debt service and automatic spending`);
            if (p.fiscal.debt > 125) e.inflation = Math.round((e.inflation + 0.15) * 10) / 10;
            if (p.fiscal.debt > 150) e.gdp = Math.round((e.gdp - 0.15) * 10) / 10;
            if (p.fiscal.shutdown) { p.approval = Math.max(15, p.approval - 3); p.fiscal.shutdownQuarters = (p.fiscal.shutdownQuarters || 0) + 1; }
        }

        // Scandal heat cools over time — unless it's a cover-up, which grows.
        // Hot scandals drag approval every quarter they stay in the headlines.
        for (const s of (p.scandals || [])) {
            if (s.coverup && s.heat > 12) s.heat = Math.min(100, s.heat + 8);
            else s.heat = Math.max(0, s.heat - 14);
            if (s.heat >= 50) p.approval = Math.max(15, p.approval - 2);
        }

        // Approval gravitates toward economy-driven fundamentals
        const target = 47 + e.gdp * 3 - Math.max(0, e.inflation - 2.5) * 3 - Math.max(0, e.unemployment - 4) * 2;
        p.approval = Math.round(Math.max(20, Math.min(75, p.approval + (target - p.approval) * 0.25)));

        // Capital regenerates slowly when popular
        if (p.approval >= 52 && p.capital < 12) p.capital += 1;

        p.quarter += 1;
        p.acted = false;

        // Midterms close out year two
        if (p.quarter === 9 && !p.midtermsDone) {
            p.midtermsDone = true;
            let verdict;
            if (p.approval >= 52) {
                p.congress.senateSeats = Math.min(60, p.congress.senateSeats + 1);
                verdict = { tier: 'HELD THE LINE', text: 'You defied midterm gravity. Both chambers hold; the agenda lives.', seats: '+1 Senate' };
            } else if (p.approval >= 45) {
                p.congress.senateSeats = Math.max(42, p.congress.senateSeats - 2);
                p.congress.houseMajority = false;
                verdict = { tier: 'A ROUGH NIGHT', text: 'The House flips and the Senate tightens. Everything gets harder now.', seats: '−2 Senate, House lost' };
            } else {
                p.congress.senateSeats = Math.max(40, p.congress.senateSeats - 4);
                p.congress.houseMajority = false;
                p.capital = Math.max(0, p.capital - 2);
                verdict = { tier: 'SHELLACKING', text: 'A wave election against you. The second half of the term is survival.', seats: '−4 Senate, House lost' };
            }
            p.midtermVerdict = verdict;
            p.log.push(`Midterms: ${verdict.tier} (${verdict.seats}).`);
            if (p.term >= 2) {
                p.timeline.push({ season:p.quarter, kind:'succession', text:'The vice president and senior cabinet figures begin positioning for the 2036 succession.' });
                p.log.push('Lame-duck politics begin: allies weigh your legacy against their own 2036 ambitions.');
            }
        }
        if (p.term >= 2 && p.quarter === 13) {
            p.timeline.push({ season:p.quarter, kind:'legacy', text:'The administration pivots from reelection politics to succession and legacy.' });
            p.capital = Math.max(0, p.capital - 1);
            p.log.push('Final-year leverage fades as Congress and the cabinet look beyond your presidency.');
        }

        if (p.quarter > 16) {
            p.over = true;
            if (window.CareerSystem) window.CareerSystem.closeTerm(p);
            p.legacy = this.computeLegacy();
        }
        if (window.GameUI) window.GameUI.autoSave();
    },

    _ensureLivingState(p) {
        p.population = typeof p.population === 'number' ? p.population : 335;
        p.stability = p.stability || { score:76, tier:'STABLE' };
        p.institutions = p.institutions || { trust:52, infrastructure:88, health:82, justice:70, continuity:92 };
        p.coalitions = p.coalitions || { base:72, independents:48, opposition:18, labor:52, business:51, youth:55 };
        p.calendar = p.calendar || { monthsElapsed:Math.max(0, (p.quarter - 1) * 3), monthlyBriefings:[] };
        p.policies = p.policies || [];
        p.timeline = p.timeline || [];
        p.collapse = p.collapse || { active:false, seasons:0, recovery:0, events:[] };
        p.fiscal = p.fiscal || { debt:100, deficit:4, shutdown:false, shutdownQuarters:0 };
        p.fiscal.ledger = p.fiscal.ledger || [];
        p.fiscal.budget = p.fiscal.budget || { revenue:18.5, mandatory:14.5, domestic:5.5, defense:3.4, debtService:2.5, emergency:0, balance:-7.4 };
        p.administration = p.administration || { members:{}, unity:70, resignations:[] };
        p.congress.houseSeats = p.congress.houseSeats || (p.congress.houseMajority ? 224 : 211);
        p.congress.factions = p.congress.factions || { progressives:42, moderates:46, conservatives:45, populists:38, institutionalists:54 };
        if (!p.world && window.WorldSystem) p.world = window.WorldSystem.createState();
    },

    _runMonthlyPulses(p, count=3) {
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const briefings = [];
        for (let i = 0; i < count; i++) {
            const absoluteMonth = ((p.term || 1) - 1) * 48 + p.calendar.monthsElapsed;
            const monthName = monthNames[absoluteMonth % 12];
            const year = 2029 + Math.floor(absoluteMonth / 12);
            p.calendar.monthsElapsed += 1;

            // Laws take time to become real. Competent departments accelerate
            // delivery while damaged institutions slow every promise down.
            for (const policy of p.policies) {
                if (policy.implementation >= policy.target) continue;
                const capacity = (p.institutions.infrastructure + p.institutions.trust) / 200;
                policy.implementation = Math.min(policy.target, Math.round(policy.implementation + 4 + capacity * 5));
                if (policy.implementation >= policy.target && !policy.effectsApplied) {
                    policy.effectsApplied = true; policy.status = 'DELIVERED';
                    p.approval = Math.min(80, p.approval + 2);
                    p.legacyPoints += 3;
                    p.timeline.push({ season:p.quarter, kind:'policy', text:`${policy.name} reaches full implementation.` });
                }
            }

            // Coalition movement is gradual and tied to lived conditions.
            const econMood = p.economy.gdp - Math.max(0, p.economy.inflation - 2.5);
            p.coalitions.independents = Math.max(5, Math.min(90, p.coalitions.independents + (econMood > 0 ? 0.4 : -0.6)));
            p.coalitions.business = Math.max(5, Math.min(90, p.coalitions.business + (p.economy.gdp >= 2 ? 0.5 : -0.5)));
            p.coalitions.youth = Math.max(5, Math.min(90, p.coalitions.youth + (p.stability.score >= 55 ? 0.2 : -0.8)));

            const members = Object.values(p.administration.members || {}).filter(m => m.status === 'ACTIVE');
            for (const member of members) {
                const pressure = (p.approval < 40 ? -0.8 : 0.25) + ((p.scandals || []).some(s => s.heat >= 60) ? -1 : 0);
                member.relationship = Math.max(0, Math.min(100, member.relationship + pressure));
                if (member.relationship < 18 && window.GameEngine.random() < 0.035) {
                    member.status = 'RESIGNED';
                    p.administration.resignations.push({ id:member.id, name:member.name, season:p.quarter });
                    p.timeline.push({ season:p.quarter, kind:'cabinet', text:`${member.name} resigns from the administration.` });
                    p.log.push(`${member.name} resigns, citing a loss of confidence.`);
                }
            }
            const active = Object.values(p.administration.members || {}).filter(m => m.status === 'ACTIVE');
            p.administration.unity = active.length ? Math.round(active.reduce((sum,m) => sum + m.relationship, 0) / active.length) : 35;

            const worldPulse = window.WorldSystem ? window.WorldSystem.monthlyPulse(`${monthName} ${year}`) : null;
            briefings.push({ month:`${monthName} ${year}`, headline:worldPulse ? worldPulse.headline : 'Routine domestic business.', defcon:worldPulse ? worldPulse.defcon : 5 });
        }
        p.calendar.monthlyBriefings.push(...briefings);
        if (p.calendar.monthlyBriefings.length > 18) p.calendar.monthlyBriefings = p.calendar.monthlyBriefings.slice(-18);

        // Stability is systemic: weak institutions, recession, high inflation,
        // shutdowns and war compound; ordinary bad luck alone cannot collapse it.
        let stabilityDrift = 0.4;
        if (p.economy.gdp < 0) stabilityDrift -= 2;
        if (p.economy.inflation > 6) stabilityDrift -= 1.5;
        if (p.fiscal && p.fiscal.shutdown) stabilityDrift -= 2;
        if (p.war && !p.war.resolved) stabilityDrift -= 1.5;
        if (p.institutions.trust < 30) stabilityDrift -= 1;
        p.stability.score = Math.max(0, Math.min(100, Math.round((p.stability.score + stabilityDrift*count/3) * 10) / 10));
        this._updateStabilityTier(p);

        if (p.collapse.active) {
            p.collapse.seasons += count/3;
            p.stability.score = Math.max(0, p.stability.score - 2*count/3);
            if (p.collapse.recovery >= 60 && p.stability.score >= 35 && p.institutions.infrastructure >= 45) {
                p.collapse.active = false;
                p.legacyPoints += 18;
                p.log.push('The continuity crisis ends; constitutional government holds.');
            }
        } else if (p.stability.score < 18 && p.institutions.continuity < 45) {
            p.collapse.active = true;
            p.log.push('Federal continuity fails across multiple regions. The collapse phase begins.');
        }
    },

    _updateStabilityTier(p) {
        const s = p.stability.score;
        p.stability.tier = s >= 70 ? 'STABLE' : s >= 50 ? 'STRAINED' : s >= 30 ? 'UNREST' : s >= 15 ? 'ANARCHY' : 'FRAGMENTED';
    },

    _applyEffects(fx) {
        const p = window.GameEngine.state.presidency;
        if (!fx) return;
        if (fx.approval) p.approval = Math.max(20, Math.min(75, p.approval + fx.approval));
        if (fx.gdp) p.economy.gdp = Math.round((p.economy.gdp + fx.gdp) * 10) / 10;
        if (fx.inflation) p.economy.inflation = Math.max(0.5, Math.round((p.economy.inflation + fx.inflation) * 10) / 10);
        if (fx.capital) p.capital = Math.max(0, Math.min(12, p.capital + fx.capital));
    },

    computeLegacy() {
        const p = window.GameEngine.state.presidency;
        const crisesWon = p.crisisLog.filter(c => c.success).length;
        const crisesLost = p.crisisLog.length - crisesWon;
        const wars = p.warLog || [];
        const warsWon = wars.filter(w => w.outcome === 'victory').length;
        const warsLost = wars.filter(w => w.outcome === 'defeat').length;
        const nuked = (p.war && p.war.outcome === 'nuclear') || (p.world && p.world.nuclearExchanges > 0);
        const population = typeof p.population === 'number' ? p.population : 335;
        const collapse = p.collapse || { active:false, recovery:0 };
        const debt = p.fiscal ? p.fiscal.debt : 100;
        const score = Math.round(
            p.legacyPoints
            + (p.approval - 45) * 0.8
            + p.economy.gdp * 3
            - Math.max(0, p.economy.inflation - 3) * 2
            - Math.max(0, debt - 110) * 0.25   // ballooning debt drags the legacy
            + Math.max(0, 110 - debt) * 0.2    // fiscal discipline burnishes it
        );
        const sigDone = p.signature && p.signature.done;
        let tier;
        if (p.removedFromOffice) tier = { grade: 'F', title: 'REMOVED FROM OFFICE' };
        else if (population <= 0) tier = { grade: 'F', title: 'EXTINCTION' };
        else if (nuked && !collapse.active && collapse.recovery >= 60) tier = { grade: 'D', title: 'THE REBUILDER' };
        else if (nuked && collapse.active) tier = { grade: 'F', title: 'A NATION IN RUINS' };
        else if (sigDone && score >= 40) tier = { grade: 'A', title: p.signature.legacyTitle };
        else tier = score >= 60 ? { grade: 'A', title: 'TRANSFORMATIONAL' }
            : score >= 42 ? { grade: 'B', title: 'CONSEQUENTIAL' }
            : score >= 26 ? { grade: 'C', title: 'STEADY HAND' }
            : score >= 12 ? { grade: 'D', title: 'EMBATTLED' }
            : { grade: 'F', title: 'FAILED PRESIDENCY' };
        const outlook = p.removedFromOffice || population<=0 ? 'THIS PRESIDENCY HAS ENDED'
            : p.term>=2 && p.month>=49 ? 'TWO-TERM LIMIT REACHED — THE SUCCESSION BEGINS'
            : p.term>=2 ? 'SECOND-TERM LEGACY — NO FURTHER RE-ELECTION'
            : window.GameEngine.state.isIncumbentRun && window.GameEngine.state.electionResult ? (window.GameEngine.state.electionResult.winner==='player'?'RE-ELECTED FOR A SECOND TERM':'THE VOTERS CHOSE A SUCCESSOR')
            : p.approval >= 53 ? 'STRONG FAVORITE for re-election'
            : p.approval >= 47 ? 'TOSS-UP re-election fight ahead'
            : 'UNDERDOG heading into re-election';
        return { score, grade: tier.grade, title: tier.title, outlook, crisesWon, crisesLost,
                 warsWon, warsLost, wars: wars.length,
                 laws: p.enacted.length, eos: p.eos.length, scotus: p.scotus.length, approval: p.approval,
                 signatureDone: sigDone, signatureName: p.signature ? p.signature.name : null,
                 sotus: (p.sotuHistory || []).length,
                 population, stability:p.stability ? p.stability.tier : 'STABLE',
                 collapse:collapse.active, recovery:collapse.recovery || 0,
                 scandals: (p.scandals || []).length, impeached: p.impeached, removed: p.removedFromOffice };
    },
};
