/**
 * Election 2028 — career continuity and accountability.
 * Keeps one political history across campaigns and presidential terms.
 */
window.CareerSystem = {
    create() {
        return {
            version: 1,
            started: 2028,
            usedQuestionIds: [],
            usedEventIds: [],
            usedHeadlineKeys: [],
            decisions: [],
            promises: [],
            fiscal: [],
            wars: [],
            crises: [],
            scandals: [],
            elections: [],
            annualSnapshots: [],
            completedSignatures: [],
            failedSignatures: [],
            closedTerms: [],
            docket: null,
            countrySnapshot: null,
        };
    },

    ensure(gs) {
        if (!gs.career) gs.career = this.create();
        const fresh = this.create();
        for (const [key, value] of Object.entries(fresh)) {
            if (gs.career[key] === undefined) gs.career[key] = Array.isArray(value) ? [] : value;
        }
        return gs.career;
    },

    clone(value) {
        return value == null ? value : JSON.parse(JSON.stringify(value));
    },

    record(type, data) {
        const gs = window.GameEngine.state;
        const career = this.ensure(gs);
        const entry = {
            id: `${type}_${career.decisions.length + 1}`,
            type,
            term: gs.presidency ? gs.presidency.term : (gs.incumbentSeed ? 1 : 0),
            quarter: gs.presidency ? gs.presidency.quarter : null,
            week: gs.week || null,
            ...this.clone(data),
        };
        career.decisions.push(entry);
        return entry;
    },

    fiscalEntry(source, delta, detail) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        const career = this.ensure(gs);
        const entry = {
            term:p.term, quarter:p.quarter, source, delta:Math.round(delta * 10) / 10,
            debtAfter:Math.round(p.fiscal.debt * 10) / 10, detail:detail || source,
        };
        p.fiscal.ledger = p.fiscal.ledger || [];
        p.fiscal.ledger.push(entry);
        career.fiscal.push(this.clone(entry));
        return entry;
    },

    snapshotCountry(p) {
        const gs = window.GameEngine.state;
        const career = this.ensure(gs);
        const snapshot = {
            term:p.term,
            economy:this.clone(p.economy),
            fiscal:this.clone(p.fiscal),
            congress:this.clone(p.congress),
            enacted:this.clone(p.enacted),
            failedBills:this.clone(p.failedBills || []),
            eos:this.clone(p.eos),
            scotus:this.clone(p.scotus),
            policies:this.clone(p.policies),
            crisisLog:this.clone(p.crisisLog),
            warLog:this.clone(p.warLog),
            scandals:this.clone(p.scandals),
            world:this.clone(p.world),
            administration:this.clone(p.administration),
            transition:this.clone(gs.transition),
            coalitions:this.clone(p.coalitions),
            institutions:this.clone(p.institutions),
            stability:this.clone(p.stability),
            population:p.population,
            collapse:this.clone(p.collapse),
            diplomaticStanding:p.diplomaticStanding,
            signature:this.clone(p.signature),
            timeline:this.clone(p.timeline),
            legacyPoints:p.legacyPoints,
        };
        career.countrySnapshot = snapshot;
        return snapshot;
    },

    restoreCountry(p, snapshot) {
        if (!snapshot) return p;
        const gs = window.GameEngine.state;
        for (const key of ['economy','fiscal','congress','enacted','failedBills','eos','scotus','policies',
                           'crisisLog','warLog','scandals','world','administration','coalitions','institutions',
                           'stability','collapse','timeline']) {
            if (snapshot[key] !== undefined) p[key] = this.clone(snapshot[key]);
        }
        for (const key of ['population','diplomaticStanding','legacyPoints']) {
            if (snapshot[key] !== undefined) p[key] = snapshot[key];
        }
        if (snapshot.transition) gs.transition = this.clone(snapshot.transition);
        p.fiscal.ledger = p.fiscal.ledger || [];
        p.log.push(`Term two inherits the country as governed: debt ${p.fiscal.debt}% of GDP, ${p.enacted.length} laws, ${p.scotus.length} justices, and ${p.warLog.length} completed wars.`);
        return p;
    },

    closeTerm(p) {
        const career = this.ensure(window.GameEngine.state);
        if (career.closedTerms.includes(p.term)) return career.countrySnapshot || this.snapshotCountry(p);
        if (p.signature) {
            const bucket = p.signature.done ? career.completedSignatures : career.failedSignatures;
            if (!bucket.includes(p.signature.id)) bucket.push(p.signature.id);
            const promise = career.promises.find(x => x.id === p.signature.id && x.term === p.term);
            if (promise && !p.signature.done) promise.status = 'UNFINISHED';
        }
        career.annualSnapshots.push({
            term:p.term, approval:p.approval, economy:this.clone(p.economy),
            debt:p.fiscal.debt, deficit:p.fiscal.deficit, population:p.population,
            stability:p.stability.tier, laws:p.enacted.length, wars:p.warLog.length,
        });
        career.closedTerms.push(p.term);
        return this.snapshotCountry(p);
    },

    buildDocket(seed, career) {
        career = career || this.ensure(window.GameEngine.state);
        const liabilities = [];
        const achievements = [];
        const debtStart = 100;
        const debtRise = Math.round(((seed.debt || debtStart) - debtStart) * 10) / 10;
        if (debtRise > 10) liabilities.push({
            id:'record_debt', issue:'Debt & Taxes', severity:Math.min(100, 45 + debtRise),
            title:`Debt rose ${debtRise.toFixed(1)} points`,
            question:`The national debt rose from ${debtStart}% to ${Number(seed.debt).toFixed(1)}% of GDP during your first term. Which of your decisions caused that increase, and why should voters trust your second-term plan?`,
            attack:`The president promised discipline and added ${debtRise.toFixed(1)} points to the debt.`,
            fact:`First-term closing debt: ${Number(seed.debt).toFixed(1)}% of GDP.`,
        });
        if (seed.warsLost) liabilities.push({
            id:'record_war_loss', issue:'Foreign Policy', severity:90,
            title:`Lost ${seed.warsLost} war${seed.warsLost === 1 ? '' : 's'}`,
            question:`You sent Americans to war and did not achieve victory. What was the objective, what did it cost, and why should voters accept your judgment again?`,
            attack:'The commander in chief owes the country an accounting for a failed war.',
            fact:`Wars lost: ${seed.warsLost}.`,
        });
        const initiated = (career.wars || []).filter(w => !w.initiatedByEnemy);
        if (initiated.length && !seed.warsLost) {
            const war = initiated[initiated.length - 1];
            liabilities.push({
                id:`record_war_${war.adversaryId}`, issue:'Foreign Policy', severity:70,
                title:`War with ${war.adversary}`,
                question:`You chose war with ${war.adversary}. State the original objective, the authorization you relied on, the casualties and cost, and whether the result justified them.`,
                attack:`The president chose war with ${war.adversary} and must defend the mission.`,
                fact:`${war.casualties || 0} thousand casualties; outcome: ${war.outcome || 'unresolved'}.`,
            });
        }
        if (seed.scandals) liabilities.push({
            id:'record_scandals', issue:'Democracy & Institutions', severity:55 + seed.scandals * 8,
            title:`${seed.scandals} White House scandal${seed.scandals === 1 ? '' : 's'}`,
            question:`Your administration faced ${seed.scandals} major scandal${seed.scandals === 1 ? '' : 's'}. What responsibility do you accept, and what safeguards would be different in a second term?`,
            attack:'The incumbent asks for four more years without accounting for the ethical record.',
            fact:`Recorded presidential scandals: ${seed.scandals}.`,
        });
        if (seed.inflation > 4) liabilities.push({
            id:'record_inflation', issue:'Economy', severity:65,
            title:`Inflation ended at ${seed.inflation.toFixed(1)}%`,
            question:`Inflation ended your term at ${seed.inflation.toFixed(1)}%. Which policies helped, which made prices worse, and what changes now?`,
            attack:'Families paid the price for the administration’s economic choices.',
            fact:`Closing inflation: ${seed.inflation.toFixed(1)}%.`,
        });
        if (!seed.signatureDone && seed.signatureName) liabilities.push({
            id:'record_promise', issue:'Presidential Power', severity:62,
            title:`Unfinished promise: ${seed.signatureName}`,
            question:`You called ${seed.signatureName} the defining promise of your presidency and did not finish it. Why should voters renew that mandate?`,
            attack:`The defining promise became the defining unfinished business.`,
            fact:`Signature initiative unfinished: ${seed.signatureName}.`,
        });
        if (seed.gdp >= 2.6) achievements.push({ id:'record_growth', title:`Growth at ${seed.gdp.toFixed(1)}%`, issue:'Economy' });
        if (seed.signatureDone) achievements.push({ id:'record_signature', title:`Delivered ${seed.signatureName}`, issue:'Presidential Power' });
        if (seed.warsWon) achievements.push({ id:'record_security', title:`Won ${seed.warsWon} war${seed.warsWon === 1 ? '' : 's'}`, issue:'Foreign Policy' });
        if (seed.approval >= 53) achievements.push({ id:'record_mandate', title:`Approval at ${seed.approval}%`, issue:'Leadership' });
        const docket = {
            liabilities:liabilities.sort((a,b) => b.severity - a.severity).slice(0, 3),
            achievements:achievements.slice(0, 2),
            unresolved:liabilities.find(x => x.id.includes('war')) || liabilities[0] || null,
            referendum:liabilities[0] ? liabilities[0].title : 'Whether the first term earned four more years',
        };
        career.docket = docket;
        return docket;
    },

    recordQuestions(docket) {
        if (!docket) return [];
        return docket.liabilities.map((item, index) => ({
            id:`incumbent_${item.id}`,
            topic:`Incumbent Record: ${item.issue}`,
            question:item.question,
            isRecordQuestion:true,
            factCheck:item.fact,
            responses:[
                { text:`I stand by the decision. The honest measure is the result and the alternative we avoided; here is the full record: ${item.fact}`, effects:{press:5,policy:8,suburban:3,donors:4,base:6,viral:3,authenticity:5}, riskLevel:'moderate', posture:'defend' },
                { text:`I accept that this did not meet the standard I set. My correction is specific, measurable, and will begin on day one of a second term.`, effects:{press:7,policy:7,suburban:7,donors:1,base:1,viral:4,authenticity:9}, riskLevel:'safe', posture:'concede' },
                { text:`Voters deserve the tradeoff, not a slogan. We chose the course that protected the larger national interest, even though it carried a real cost.`, effects:{press:6,policy:7,suburban:6,donors:4,base:4,viral:3,authenticity:6}, riskLevel:'safe', posture:'reframe' },
                { text:`My opponent attacks the outcome but refuses to say what they would have done at the decision point. Their alternative would have imposed greater costs with no accountability.`, effects:{press:4,policy:4,suburban:2,donors:5,base:8,viral:7,authenticity:3}, riskLevel:'risky', posture:'contrast' },
            ],
            order:index,
        }));
    },

    reelectionSetPiece(week, docket) {
        if (!docket || !docket.liabilities.length) return null;
        const schedule = {
            17:{ key:'announcement', title:'The Incumbent Announcement Interview', category:'MEDIA_MOMENT' },
            25:{ key:'townhall', title:'The Record Town Hall', category:'VOTER_FORUM' },
            29:{ key:'coalition', title:'The Governing Coalition Demands Answers', category:'COALITION' },
            35:{ key:'closing_ad', title:'The Opposition’s Closing Argument', category:'ATTACK_AD' },
            39:{ key:'october', title:'October Surprise: The Unfinished Record', category:'BREAKING_NEWS' },
        };
        const slot = schedule[week];
        if (!slot) return null;
        const item = docket.liabilities[(Object.keys(schedule).indexOf(String(week))) % docket.liabilities.length];
        return {
            id:`reelection_${slot.key}_${item.id}`,
            title:slot.title,
            category:slot.category,
            isBreakingNews:true,
            isAccountability:true,
            description:`${item.attack} ${item.question}`,
            choices:[
                { text:'Defend the decision and publish the complete record', effects:{ approval:1, debateSkill:2, authenticity:2, mediaScore:1 }, riskLevel:'moderate', outcomeText:`You confront the charge directly. ${item.fact}` },
                { text:'Accept responsibility and offer a measurable correction', effects:{ approval:2, persuadableSupport:3, baseTurnout:-1, authenticity:3 }, riskLevel:'safe', outcomeText:'The concession costs pride but wins credibility with undecided voters.' },
                { text:'Reframe the tradeoff and challenge the opponent’s alternative', effects:{ baseTurnout:2, mediaScore:2, persuadableSupport:1, scandalVulnerability:1 }, riskLevel:'risky', outcomeText:'The contrast rallies supporters; fact-checkers keep testing the underlying claim.' },
            ],
            factCheck:item.fact,
        };
    },

    headlineKey(text) {
        return String(text || '').toLowerCase().replace(/\d+(?:\.\d+)?/g, '#').replace(/\s+/g, ' ').trim();
    },
};
