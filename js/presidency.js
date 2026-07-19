/**
 * Election 2028 — The First Term (presidency mode, phase 1)
 * Sixteen quarters in the Oval Office: push an agenda through Congress,
 * sign executive orders the courts may claw back, absorb crises, survive
 * the midterms, and walk out with a legacy history will grade.
 */
window.PresidencySystem = {

    BILLS: [
        { id: 'rebuild',   name: 'American Rebuild Act',            issue: 'Infrastructure', cost: 3, legacy: 12, bipartisan: true,  effects: { approval: 4, gdp: 0.3 },  desc: 'Roads, bridges, grid, broadband. Shovels photograph well.' },
        { id: 'care',      name: 'Affordable Care Expansion',       issue: 'Healthcare',     cost: 4, legacy: 14, bipartisan: false, effects: { approval: 3 },            desc: 'The fight of a generation, again. Passing it is legacy-grade.' },
        { id: 'taxrelief', name: 'Middle-Class Tax Relief Act',     issue: 'Taxes',          cost: 3, legacy: 10, bipartisan: false, effects: { approval: 4, gdp: 0.2, inflation: 0.3 }, desc: 'Everyone loves a cut. The bond market has questions.' },
        { id: 'border',    name: 'Border Security & Citizenship Act', issue: 'Immigration',  cost: 5, legacy: 16, bipartisan: false, effects: { approval: 2 },            desc: 'The white whale of modern politics. Enormous if it lands.' },
        { id: 'energy',    name: 'Clean Energy Moonshot',           issue: 'Climate',        cost: 4, legacy: 14, bipartisan: false, effects: { approval: 2, gdp: 0.1 }, desc: 'A decade-defining industrial bet.' },
        { id: 'streets',   name: 'Safe Streets Act',                issue: 'Crime',          cost: 2, legacy: 8,  bipartisan: true,  effects: { approval: 3 },            desc: 'Cops, courts, and community programs. Broadly popular.' },
        { id: 'schools',   name: 'Public Education Modernization',  issue: 'Education',      cost: 3, legacy: 10, bipartisan: false, effects: { approval: 2 },            desc: 'Teachers, tutoring, and trade tracks.' },
        { id: 'ai',        name: 'AI & Digital Rights Act',         issue: 'Technology',     cost: 2, legacy: 9,  bipartisan: true,  effects: { approval: 1 },            desc: 'First real rules of the road for the machines.' },
        { id: 'housing',   name: 'Housing Affordability Act',       issue: 'Housing',        cost: 3, legacy: 10, bipartisan: false, effects: { approval: 3, inflation: -0.2 }, desc: 'Build, baby, build. Renters notice fast.' },
        { id: 'vets',      name: 'Veterans Promise Act',            issue: 'Veterans',       cost: 1, legacy: 7,  bipartisan: true,  effects: { approval: 3 },            desc: 'The easiest yes in Washington. Bank it early.' },
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
    ],

    OPPORTUNITIES: [
        { id: 'jobs',   title: '📈 Blowout Jobs Report', text: 'The economy adds a monster month of jobs. Take the lap?', effects: { approval: 3, gdp: 0.2 } },
        { id: 'peace',  title: '🕊️ Peace Summit Opening', text: 'Two old adversaries want you to broker the handshake.', effects: { approval: 4 } },
        { id: 'boom',   title: '🚀 Tech Investment Wave', text: 'Three trillion-dollar companies announce U.S. mega-factories.', effects: { approval: 2, gdp: 0.3 } },
        { id: 'anthem', title: '🏅 A National Moment', text: 'An Olympic sweep and a returning space crew put the country in a rare good mood.', effects: { approval: 2 } },
    ],

    // ── Lifecycle ──────────────────────────────────

    begin() {
        const gs = window.GameEngine.state;
        if (gs.presidency) return gs.presidency;
        const results = (window.GameUI && window.GameUI._lastResults) || { nationalPopularVote: { player: 51, opponent: 47 }, playerEV: 290 };
        const margin = results.nationalPopularVote.player - results.nationalPopularVote.opponent;
        const t = gs.transition || { senateSeats: 51, capital: 5 };
        gs.presidency = {
            quarter: 1,
            approval: Math.max(44, Math.min(60, Math.round(50 + margin))),
            economy: { gdp: 2.2, unemployment: 4.1, inflation: 2.6 },
            congress: { senateSeats: t.senateSeats, houseMajority: margin >= 1 },
            capital: Math.min(12, (t.capital || 5) + 3),
            enacted: [], eos: [], scotus: [],
            crisisLog: [],
            acted: false,
            pendingEvent: null,
            midtermsDone: false,
            legacyPoints: 0,
            log: [`Sworn in with ${Math.round(results.nationalPopularVote.player)}% of the vote.`],
            over: false,
        };
        return gs.presidency;
    },

    quarterLabel(q) {
        const year = 2029 + Math.floor((q - 1) / 4);
        const season = ['WINTER', 'SPRING', 'SUMMER', 'FALL'][(q - 1) % 4];
        return `YEAR ${Math.floor((q - 1) / 4) + 1} · ${season} ${year}`;
    },

    availableBills() {
        const p = window.GameEngine.state.presidency;
        const done = new Set(p.enacted.map(b => b.id));
        return this.BILLS.filter(b => !done.has(b.id) && !(p.failedBills || []).includes(b.id));
    },

    availableEOs() {
        const p = window.GameEngine.state.presidency;
        const used = new Set(p.eos.map(e => e.id));
        return this.EOS.filter(e => !used.has(e.id));
    },

    billOdds(bill, extraCapital) {
        const p = window.GameEngine.state.presidency;
        let odds = 40 + (p.congress.senateSeats - 50) * 4 + (p.congress.houseMajority ? 15 : -20)
            + (extraCapital || 0) * 8 + (bill.bipartisan ? 15 : 0)
            + (p.approval >= 55 ? 8 : p.approval < 45 ? -8 : 0);
        return Math.max(5, Math.min(95, Math.round(odds)));
    },

    // One major action per quarter
    act(type, payload) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        if (!p || p.acted || p.over || p.pendingEvent) return null;
        let result = { type };

        if (type === 'bill') {
            const bill = this.BILLS.find(b => b.id === payload.billId);
            const extra = Math.min(payload.extraCapital || 0, p.capital, 3);
            p.capital -= extra;
            const odds = this.billOdds(bill, extra);
            const passed = Math.random() * 100 < odds;
            result = { type, bill, odds, passed };
            if (passed) {
                p.enacted.push({ id: bill.id, name: bill.name, legacy: bill.legacy, quarter: p.quarter });
                p.legacyPoints += bill.legacy;
                this._applyEffects(bill.effects);
                p.log.push(`Signed the ${bill.name}.`);
            } else {
                p.failedBills = p.failedBills || [];
                p.failedBills.push(bill.id);
                p.approval = Math.max(20, p.approval - 2);
                p.log.push(`The ${bill.name} dies on the floor.`);
            }
        } else if (type === 'eo') {
            const eo = this.EOS.find(e => e.id === payload.eoId);
            p.eos.push({ id: eo.id, name: eo.name, quarter: p.quarter, struck: false });
            p.legacyPoints += eo.legacy;
            this._applyEffects(eo.effects);
            p.log.push(`Signed executive order: ${eo.name}.`);
            result = { type, eo };
        } else if (type === 'barnstorm') {
            const gain = 2 + Math.floor(Math.random() * 3);
            p.approval = Math.min(75, p.approval + gain);
            p.capital = Math.min(12, p.capital + 1);
            p.log.push(`Barnstormed the country — approval +${gain}.`);
            result = { type, gain };
        } else if (type === 'diplomacy') {
            const gain = 1 + Math.floor(Math.random() * 3);
            p.approval = Math.min(75, p.approval + gain);
            p.crisisShield = true;
            p.log.push(`World tour — approval +${gain}, alliances warmed.`);
            result = { type, gain };
        }
        p.acted = true;
        return result;
    },

    /** Close the quarter: stage the event (crisis/opportunity/SCOTUS) or advance. */
    endQuarter() {
        const p = window.GameEngine.state.presidency;
        if (!p || !p.acted || p.over || p.pendingEvent) return null;

        // SCOTUS vacancies land in fixed windows
        if ((p.quarter === 5 || p.quarter === 11) && p.scotus.length < 2) {
            p.pendingEvent = { kind: 'scotus' };
            return p.pendingEvent;
        }
        const roll = Math.random();
        if (roll < 0.5) {
            const pool = this.CRISES.filter(c => !p.crisisLog.some(l => l.id === c.id));
            const crisis = pool[Math.floor(Math.random() * pool.length)] || this.CRISES[Math.floor(Math.random() * this.CRISES.length)];
            p.pendingEvent = { kind: 'crisis', id: crisis.id };
            return p.pendingEvent;
        }
        if (roll < 0.75) {
            const opp = this.OPPORTUNITIES[Math.floor(Math.random() * this.OPPORTUNITIES.length)];
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
        let odds = choice.odds + (p.crisisShield ? 0.12 : 0);
        p.crisisShield = false;
        const success = Math.random() < odds;
        this._applyEffects(success ? choice.good : choice.bad);
        p.legacyPoints += success ? 4 : -4;
        p.crisisLog.push({ id: crisis.id, title: crisis.title, success, quarter: p.quarter });
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
        const defections = Math.max(0, Math.round((pick.controversy - 40) / 12)) + Math.floor(Math.random() * 3);
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

    acknowledgeEvent() {
        const p = window.GameEngine.state.presidency;
        if (!p.pendingEvent || (p.pendingEvent.kind !== 'opportunity' && p.pendingEvent.kind !== 'quiet')) return null;
        p.pendingEvent = null;
        this._advance();
        return true;
    },

    _advance() {
        const p = window.GameEngine.state.presidency;

        // EO court challenges: each standing order has a small strike chance per quarter
        for (const eo of p.eos) {
            if (!eo.struck && Math.random() < 0.08) {
                eo.struck = true;
                p.approval = Math.max(20, p.approval - 2);
                p.legacyPoints -= 3;
                p.log.push(`Courts strike down ${eo.name}.`);
            }
        }

        // Economy random walk
        const e = p.economy;
        e.gdp = Math.round((e.gdp + (Math.random() - 0.48) * 0.6) * 10) / 10;
        e.unemployment = Math.max(2.5, Math.round((e.unemployment + (Math.random() - 0.5) * 0.4 - (e.gdp > 2.5 ? 0.1 : -0.1)) * 10) / 10);
        e.inflation = Math.max(0.5, Math.round((e.inflation + (Math.random() - 0.5) * 0.5) * 10) / 10);

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
        }

        if (p.quarter > 16) {
            p.over = true;
            p.legacy = this.computeLegacy();
        }
        if (window.GameUI) window.GameUI.autoSave();
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
        const score = Math.round(
            p.legacyPoints
            + (p.approval - 45) * 0.8
            + p.economy.gdp * 3
            - Math.max(0, p.economy.inflation - 3) * 2
        );
        const tier = score >= 60 ? { grade: 'A', title: 'TRANSFORMATIONAL' }
            : score >= 42 ? { grade: 'B', title: 'CONSEQUENTIAL' }
            : score >= 26 ? { grade: 'C', title: 'STEADY HAND' }
            : score >= 12 ? { grade: 'D', title: 'EMBATTLED' }
            : { grade: 'F', title: 'FAILED PRESIDENCY' };
        const outlook = p.approval >= 53 ? 'STRONG FAVORITE for re-election'
            : p.approval >= 47 ? 'TOSS-UP re-election fight ahead'
            : 'UNDERDOG heading into re-election';
        return { score, grade: tier.grade, title: tier.title, outlook, crisesWon, crisesLost,
                 laws: p.enacted.length, eos: p.eos.length, scotus: p.scotus.length, approval: p.approval };
    },
};
