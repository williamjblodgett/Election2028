/**
 * Election 2028 — Campaign HQ, electorate, field organization and polling.
 * The existing statePolling map remains the hidden electorate. Published
 * polls are noisy observations of it, not omniscient truth.
 */
window.CampaignDepth = {
    STAFF: {
        manager: { label:'Campaign Manager', icon:'🧭', candidates:[
            { id:'manager_steady', name:'Jordan Reed', skill:72, salary:85000, hire:250000, trait:'Disciplined operator', effect:'Cuts overhead and staff burnout.' },
            { id:'manager_star', name:'Avery Grant', skill:90, salary:145000, hire:600000, trait:'National campaign veteran', effect:'Major efficiency and momentum protection.' },
        ]},
        field: { label:'Field Director', icon:'🗺️', candidates:[
            { id:'field_builder', name:'Casey Flores', skill:75, salary:78000, hire:220000, trait:'Organizer', effect:'Makes state offices more effective.' },
            { id:'field_master', name:'Morgan Price', skill:91, salary:135000, hire:560000, trait:'Turnout architect', effect:'Maximizes offices and early vote.' },
        ]},
        communications: { label:'Communications Director', icon:'🎙️', candidates:[
            { id:'comms_fast', name:'Riley Chen', skill:76, salary:80000, hire:230000, trait:'Rapid response', effect:'Improves media control and scandal defense.' },
            { id:'comms_star', name:'Taylor Brooks', skill:92, salary:140000, hire:590000, trait:'Narrative strategist', effect:'Protects the message and amplifies good weeks.' },
        ]},
        pollster: { label:'Chief Pollster', icon:'📊', candidates:[
            { id:'pollster_solid', name:'Samira Patel', skill:78, salary:82000, hire:240000, trait:'Methodologist', effect:'Unlocks tighter internal polling ranges.' },
            { id:'pollster_elite', name:'Elliot Stone', skill:94, salary:150000, hire:650000, trait:'Electorate modeler', effect:'Best samples, smallest uncertainty.' },
        ]},
        finance: { label:'Finance Chair', icon:'💵', candidates:[
            { id:'finance_network', name:'Cameron Ellis', skill:74, salary:75000, hire:210000, trait:'Bundler network', effect:'Improves weekly high-dollar fundraising.' },
            { id:'finance_power', name:'Alex Monroe', skill:90, salary:138000, hire:575000, trait:'Donor powerhouse', effect:'Large fundraising and donor-confidence boost.' },
        ]},
    },

    BLOC_DEFS: [
        { id:'labor', name:'Union Households', icon:'🛠️', weight:12, issue:'Jobs & wages' },
        { id:'youth', name:'Young Voters', icon:'🎓', weight:14, issue:'Cost of living' },
        { id:'suburban', name:'Suburban Persuadables', icon:'🏘️', weight:18, issue:'Stability & schools' },
        { id:'rural', name:'Rural Voters', icon:'🌾', weight:15, issue:'Prices & culture' },
        { id:'minority', name:'Black & Latino Voters', icon:'🗳️', weight:18, issue:'Opportunity & rights' },
        { id:'women', name:'Women Voters', icon:'♀', weight:16, issue:'Economy & rights' },
        { id:'veterans', name:'Veterans & Military Families', icon:'🎖️', weight:7, issue:'Security & benefits' },
        { id:'evangelical', name:'Evangelical Voters', icon:'⛪', weight:10, issue:'Faith & culture' },
    ],

    initialize(gs) {
        if (gs.campaignDepth) return gs.campaignDepth;
        const dem = gs.playerParty === 'democrat';
        const baselines = dem
            ? { labor:64,youth:61,suburban:52,rural:34,minority:69,women:56,veterans:43,evangelical:28 }
            : { labor:36,youth:39,suburban:48,rural:66,minority:31,women:44,veterans:57,evangelical:72 };
        gs.campaignDepth = {
            staff:{}, offices:{}, weeklyPayroll:0, operationScore:45,
            blocs:this.BLOC_DEFS.map(b => ({ ...b, support:baselines[b.id], turnout:52, contact:0 })),
            polling:{ latest:{}, history:[], lastWeek:0 },
            messages:{}, timeline:[],
        };
        this.generatePolls(gs);
        return gs.campaignDepth;
    },

    ensure(gs) { return gs.campaignDepth || this.initialize(gs); },
    money(value) { return '$' + Math.round(value / 1000) + 'K'; },
    staffSkill(hq, role) { return hq.staff[role] && hq.staff[role].status === 'ACTIVE' ? hq.staff[role].skill : 0; },

    hire(role, candidateId) {
        const gs = window.GameEngine.state;
        const hq = this.ensure(gs);
        const def = this.STAFF[role];
        const candidate = def && def.candidates.find(c => c.id === candidateId);
        if (!candidate) return { ok:false, message:'Candidate unavailable.' };
        if (gs.finances.cashOnHand < candidate.hire) return { ok:false, message:'The campaign cannot afford that hire.' };
        gs.finances.cashOnHand -= candidate.hire;
        gs.campaign.cash = gs.finances.cashOnHand;
        hq.staff[role] = { ...candidate, role, status:'ACTIVE', loyalty:72, burnout:8, hiredWeek:gs.week };
        this.recalculate(hq);
        if (role === 'pollster') this.generatePolls(gs);
        hq.timeline.push({ week:gs.week, text:`${candidate.name} hired as ${def.label}.` });
        return { ok:true, message:`${candidate.name} joins as ${def.label}.` };
    },

    openOffice(stateId) {
        const gs = window.GameEngine.state;
        const hq = this.ensure(gs);
        const state = window.StateData.find(s => s.id === stateId);
        if (!state) return { ok:false, message:'State unavailable.' };
        const current = hq.offices[stateId] || { level:0, organizers:0, contact:0 };
        if (current.level >= 3) return { ok:false, message:`${state.name} already has a full statewide organization.` };
        const costs = [300000, 475000, 700000];
        const cost = costs[current.level];
        if (gs.finances.cashOnHand < cost) return { ok:false, message:'The campaign cannot afford that office expansion.' };
        gs.finances.cashOnHand -= cost;
        gs.campaign.cash = gs.finances.cashOnHand;
        current.level += 1;
        current.organizers += 8 + current.level * 4;
        hq.offices[stateId] = current;
        this.recalculate(hq);
        hq.timeline.push({ week:gs.week, text:`Field organization in ${state.name} reaches level ${current.level}.` });
        return { ok:true, message:`${state.name} field organization upgraded to level ${current.level}.`, office:current };
    },

    applyCoalitionFocus(id) {
        const gs = window.GameEngine.state;
        const hq = this.ensure(gs);
        const bloc = hq.blocs.find(b => b.id === id);
        if (!bloc) return;
        bloc.support = Math.min(90, bloc.support + 1.4);
        bloc.turnout = Math.min(92, bloc.turnout + 2.2);
        bloc.contact = Math.min(100, bloc.contact + 8);
        hq.timeline.push({ week:gs.week, text:`Coalition program targets ${bloc.name}.` });
    },

    processWeek(summary) {
        const gs = window.GameEngine.state;
        const hq = this.ensure(gs);
        this.recalculate(hq);
        gs.finances.cashOnHand -= hq.weeklyPayroll;
        gs.finances.totalSpent += hq.weeklyPayroll;
        summary.financialSummary.payroll = hq.weeklyPayroll;

        const manager = this.staffSkill(hq, 'manager');
        const field = this.staffSkill(hq, 'field');
        const comms = this.staffSkill(hq, 'communications');
        const finance = this.staffSkill(hq, 'finance');
        if (manager) gs.campaign.momentum += (manager - 65) / 80;
        if (comms) gs.campaign.mediaScore += (comms - 65) / 100;
        if (finance) {
            const bonus = 40000 + finance * 1200;
            gs.finances.cashOnHand += bonus; gs.finances.totalRaised += bonus;
            summary.financialSummary.staffBonus = bonus;
        }

        for (const staffer of Object.values(hq.staff)) {
            staffer.burnout = Math.min(100, staffer.burnout + 1.5 - manager / 120);
            if (staffer.burnout > 78) staffer.loyalty = Math.max(0, staffer.loyalty - 1);
        }

        for (const [stateId, office] of Object.entries(hq.offices)) {
            const poll = gs.statePolling[stateId];
            if (!poll) continue;
            const effect = office.level * (0.05 + field / 1800);
            poll.player += effect; poll.trend += effect;
            office.contact = Math.min(100, office.contact + office.level * 2 + field / 50);
            gs.campaign.groundGame += office.level * 0.025;
            if (gs.week >= window.GameConstants.EARLY_VOTE.START_WEEK && gs.earlyVote[stateId]) {
                gs.earlyVote[stateId].playerBanked += office.level * 0.04;
            }
        }

        // Blocs move slowly; repeated attention primarily raises turnout.
        hq.blocs.forEach(bloc => {
            bloc.contact = Math.max(0, bloc.contact - 0.6);
            const enthusiasmPull = (gs.campaign.enthusiasm - 50) / 500;
            bloc.turnout = Math.max(20, Math.min(95, bloc.turnout + enthusiasmPull));
        });
        const electorateEdge = hq.blocs.reduce((sum,b) => sum + (b.support - 50) * b.weight * b.turnout / 100, 0) /
            hq.blocs.reduce((sum,b) => sum + b.weight, 0);
        gs.campaign.nationalPolling += electorateEdge * 0.004;

        if (gs.finances.cashOnHand < 0) {
            gs.campaign.donorConfidence -= 3;
            summary.newsHeadlines.push('CAMPAIGN CASH CRUNCH: PAYROLL AND FIELD OPERATIONS UNDER PRESSURE');
        }
        gs.campaign.cash = gs.finances.cashOnHand;
        summary.financialSummary.cashOnHand = gs.finances.cashOnHand;
        this.generatePolls(gs);
    },

    recalculate(hq) {
        hq.weeklyPayroll = Object.values(hq.staff).reduce((sum,s) => sum + (s.status === 'ACTIVE' ? s.salary : 0), 0)
            + Object.values(hq.offices).reduce((sum,o) => sum + o.level * 45000, 0);
        const staff = Object.values(hq.staff).filter(s => s.status === 'ACTIVE');
        const staffScore = staff.length ? staff.reduce((sum,s) => sum + s.skill * (1 - s.burnout / 180), 0) / staff.length : 35;
        const officeScore = Math.min(100, Object.values(hq.offices).reduce((sum,o) => sum + o.level * 7, 0));
        hq.operationScore = Math.round(staffScore * .72 + officeScore * .28);
    },

    generatePolls(gs) {
        const hq = this.ensure(gs);
        const pollsterSkill = this.staffSkill(hq, 'pollster');
        const latest = {};
        for (const state of window.StateData) {
            const truth = gs.statePolling[state.id];
            if (!truth) continue;
            const sample = Math.round(520 + window.GameEngine.random() * 880 + pollsterSkill * 3);
            const publicMoe = Math.max(2.1, 4.4 - sample / 900 + (state.swingVolatility || 30) / 100);
            const noise = (window.GameEngine.random() - .5) * publicMoe * 2;
            const trueMargin = truth.player - truth.opponent;
            const shownMargin = trueMargin + noise;
            const decided = Math.max(86, Math.min(98, truth.player + truth.opponent));
            const player = Math.max(20, Math.min(75, (decided + shownMargin) / 2));
            const opponent = Math.max(20, Math.min(75, decided - player));
            const internalMoe = pollsterSkill ? Math.max(1.3, publicMoe - pollsterSkill / 45) : null;
            latest[state.id] = { player, opponent, margin:shownMargin, moe:publicMoe, sample, week:gs.week,
                internal:pollsterSkill ? { margin:trueMargin + (window.GameEngine.random() - .5) * internalMoe, moe:internalMoe } : null };
        }
        hq.polling.latest = latest;
        hq.polling.lastWeek = gs.week;
        hq.polling.history.push({ week:gs.week, polls:latest });
        if (hq.polling.history.length > 8) hq.polling.history.shift();
    },

    getPoll(stateId) {
        const gs = window.GameEngine.state;
        const hq = this.ensure(gs);
        return hq.polling.latest[stateId] || null;
    },
};
