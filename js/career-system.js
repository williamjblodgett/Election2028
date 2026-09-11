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
            termSummaries: [],
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
            month: gs.presidency?.month || null,
            week: gs.week || null,
            ...this.clone(data),
        };
        career.decisions.push(entry);
        return entry;
    },

    fiscalEntry(source, delta, detail, metrics={}) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        if (p.fiscal.nominalGDP && source !== 'Monthly budget and GDP') {
            p.fiscal.debtStock=p.fiscal.debt*p.fiscal.nominalGDP/100;
        }
        const career = this.ensure(gs);
        const entry = {
            term:p.term, quarter:p.quarter, source, delta:Math.round(delta * 10) / 10,
            debtAfter:Math.round(p.fiscal.debt * 10) / 10, detail:detail || source,
            month:p.month, ...this.clone(metrics),
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
            war:this.clone(p.war),
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
            calendar:this.clone(p.calendar),
            timeline:this.clone(p.timeline),
            legacyPoints:p.legacyPoints,
        };
        career.countrySnapshot = snapshot;
        return snapshot;
    },

    restoreCountry(p, snapshot) {
        if (!snapshot) return p;
        const gs = window.GameEngine.state;
        for (const key of ['economy','fiscal','enacted','failedBills','eos','scotus','policies',
                           'crisisLog','warLog','war','scandals','world','coalitions','institutions',
                           'stability','collapse','timeline']) {
            if (snapshot[key] !== undefined) p[key] = this.clone(snapshot[key]);
        }
        for (const key of ['population','diplomaticStanding','legacyPoints']) {
            if (snapshot[key] !== undefined) p[key] = snapshot[key];
        }
        // New election results and newly confirmed ministers take precedence.
        for (const [id, member] of Object.entries(p.administration.members)) {
            const previous = snapshot.administration?.members?.[id];
            if (previous?.name === member.name && previous.status === 'ACTIVE') {
                member.relationship = previous.relationship;
                member.influence = previous.influence;
            }
        }
        p.fiscal.ledger = p.fiscal.ledger || [];
        p.log.push(`Term two inherits the country as governed: debt ${p.fiscal.debt}% of GDP, ${p.enacted.length} laws, ${p.scotus.length} justices, and ${p.warLog.length} completed wars.`);
        return p;
    },

    closeTerm(p) {
        const career = this.ensure(window.GameEngine.state);
        if (career.closedTerms.includes(p.term)) return this.snapshotCountry(p);
        if (p.signature) {
            const bucket = p.signature.done ? career.completedSignatures : career.failedSignatures;
            if (!bucket.includes(p.signature.id)) bucket.push(p.signature.id);
            const promise = career.promises.find(x => x.id === p.signature.id && x.term === p.term);
            if (promise && !p.signature.done) promise.status = 'UNFINISHED';
        }
        career.termSummaries.push({
            term:p.term, approval:p.approval, economy:this.clone(p.economy),
            debt:p.fiscal.debt, deficit:p.fiscal.deficit, population:p.population,
            stability:p.stability.tier, laws:p.enacted.length, wars:p.warLog.length,
        });
        career.closedTerms.push(p.term);
        return this.snapshotCountry(p);
    },

    updatePromises(p) {
        const career=this.ensure(window.GameEngine.state);
        for(const promise of career.promises.filter(x=>x.term===p.term && x.metric && x.status==='ACTIVE')) {
            const delivered=promise.metric==='balance'?(p.fiscal.balancedMonths||0)>=12
                :promise.metric==='peace'?!window.PresidencySystem.atWar()
                :(p.policies||[]).some(x=>x.effectsApplied && (x.term||1)===p.term);
            if(delivered) {promise.status='DELIVERED';promise.resolvedMonth=p.month;}
            else if(p.month>=promise.dueMonth) {promise.status='BROKEN';promise.resolvedMonth=p.month;}
        }
    },

    buildDocket(seed, career) {
        career = career || this.ensure(window.GameEngine.state);
        const liabilities = [];
        const achievements = [];
        for(const promise of career.promises.filter(p=>p.metric && p.term===1 && p.status!=='DELIVERED')) {
            liabilities.push({id:`record_${promise.id}`,issue:'Presidential Power',severity:66,title:`Pledge: ${promise.name}`,
                question:`During the campaign you promised ${promise.name}. What happened to the deadline, the funding, and the result?`,
                attack:'The campaign pledge remains part of the public record.',fact:`Pledge status: ${promise.status}; deadline: term ${promise.term}, month ${promise.dueMonth}; made in campaign week ${promise.madeWeek}.`});
        }
        const debtStart = 100;
        const debtRise = Math.round(((seed.debt || debtStart) - debtStart) * 10) / 10;
        if (debtRise > 2) liabilities.push({
            id:'record_debt', issue:'Debt & Taxes', severity:Math.min(100, 45 + debtRise),
            title:`Debt rose ${debtRise.toFixed(1)} points`,
            question:`The national debt rose from ${debtStart}% to ${Number(seed.debt).toFixed(1)}% of GDP during your first term. Which of your decisions caused that increase, and why should voters trust your second-term plan?`,
            attack:`The president promised discipline and added ${debtRise.toFixed(1)} points to the debt.`,
            fact:`Debt at this campaign checkpoint: ${Number(seed.debt).toFixed(1)}% of GDP.`,
        });
        if(seed.deficit>0) liabilities.push({id:'record_deficit',issue:'Debt & Taxes',severity:60,
            title:`Annual deficit: ${Number(seed.deficit).toFixed(1)}% of GDP`,
            question:`Your government is borrowing at an annual rate of ${Number(seed.deficit).toFixed(1)}% of GDP. Defend what that borrowing funds and identify the taxes or spending you would change next term.`,
            attack:'The incumbent must account for recurring borrowing, not only the headline debt ratio.',
            fact:`Annualized deficit: ${Number(seed.deficit).toFixed(1)}% of GDP; debt stock ratio: ${Number(seed.debt||100).toFixed(1)}%.`});
        if (seed.warsLost) liabilities.push({
            id:'record_war_loss', issue:'Foreign Policy', severity:90,
            title:`Lost ${seed.warsLost} war${seed.warsLost === 1 ? '' : 's'}`,
            question:`You sent Americans to war and did not achieve victory. What was the objective, what did it cost, and why should voters accept your judgment again?`,
            attack:'The commander in chief owes the country an accounting for a failed war.',
            fact:`Wars lost: ${seed.warsLost}.`,
        });
        const active=window.GameEngine.state.presidency?.war || career.countrySnapshot?.war;
        const initiated = [...(career.wars || [])];
        if (active && !active.resolved && !initiated.some(w=>w.adversaryId===active.adversaryId && w.outcome==='unresolved')) {
            initiated.push({...active,adversary:active.adversary.name,outcome:'unresolved'});
        }
        for (const war of initiated) {
            liabilities.push({
                id:`record_${war.id||`war_${war.term||1}_${war.started||0}_${war.adversaryId}`}`, issue:'Foreign Policy', severity:70,
                title:`War with ${war.adversary}`,
                question:`You ${war.initiatedByEnemy?'led the response to':'chose'} war with ${war.adversary}. State the original objective, the authorization you relied on, the casualties and cost, and whether the result justified them.`,
                attack:`The president must account for the ${war.adversary} conflict and defend the decisions made.`,
                fact:`${war.casualties || 0} thousand military casualties; ${war.civilianDeaths?`${war.civilianDeaths} million American civilian deaths; `:''}cost ${Number(war.cost||0).toFixed(1)} GDP points; authorization: ${war.authorization || 'not recorded'}; objective: ${war.objective || 'not recorded'}; outcome: ${war.outcome || 'unresolved'}.`,
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
            title:`Inflation stands at ${seed.inflation.toFixed(1)}%`,
            question:`Inflation now stands at ${seed.inflation.toFixed(1)}%. Which policies helped, which made prices worse, and what changes now?`,
            attack:'Families paid the price for the administration’s economic choices.',
            fact:`Inflation at this campaign checkpoint: ${seed.inflation.toFixed(1)}%.`,
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
            recordContext:[
                {id:'record_economic_stewardship',issue:'Economy',severity:20,title:'The economic record',question:'Which first-term economic outcomes justify another term, and which did your administration fail to improve?',fact:`Growth ${Number(seed.gdp||0).toFixed(1)}%; inflation ${Number(seed.inflation||0).toFixed(1)}%; approval ${Math.round(seed.approval||0)}%.`},
                {id:'record_delivery_review',issue:'Presidential Power',severity:20,title:'The delivery record',question:'Distinguish the promises you delivered from announcements and unfinished work. What should voters hold you to in the next term?',fact:`Signature initiative: ${seed.signatureName||'not selected'}; delivery: ${seed.signatureDone?'verified':'not verified'}; recorded campaign pledges: ${career.promises.length}.`},
            ],
            liabilities:liabilities.sort((a,b) => b.severity - a.severity),
            achievements:achievements.slice(0, 2),
            unresolved:liabilities.find(x => x.id.includes('war')) || liabilities[0] || null,
            referendum:liabilities[0] ? liabilities[0].title : 'Whether the first term earned four more years',
        };
        career.docket = docket;
        return docket;
    },

    recordQuestions(docket) {
        if (!docket) return [];
        return [...docket.liabilities,...(docket.recordContext||[])].flatMap((item, index) => [0,1,2].map(round=>({
            id:`incumbent_${item.id}_${round}`,
            family:item.id,
            topic:`Incumbent Record: ${item.issue}`,
            question:round===0?item.question:round===1?`The record on ${item.title.toLowerCase()} is now part of this campaign: ${item.fact} Which policy will you change, and what will that correction cost?`:`Voters have heard your defense of ${item.title.toLowerCase()}. What independent benchmark should decide whether that policy continues in your second term?`,
            isRecordQuestion:true,
            factCheck:item.fact,
            responses:[
                { text:`${round===0?'Here is the record I accept':round===1?'My correction starts with an honest baseline':'Use the published record as the benchmark'}: ${item.fact} ${item.id.includes('war')?'I will submit a renewed authorization with a withdrawal timetable.':'I will publish quarterly progress against this baseline.'}`, claim:{kind:'record',text:item.fact}, effects:{press:7,policy:8,suburban:5,donors:3,base:3,viral:2,authenticity:8}, riskLevel:'safe', posture:'concede' },
                { text:`${item.id.includes('war')?'I will seek a ceasefire with verifiable withdrawal terms':item.id==='record_debt'?'I will fund every new commitment and submit a recurring revenue-and-spending package':`I will appoint an independent delivery team for ${item.title.toLowerCase()}`}. ${round===0?'Give that proposal a chance.':round===1?'The first public review will be in ninety days.':'Congress should withhold the next funding tranche if we miss the benchmark.'}`, claim:{kind:'future'}, effects:{press:5,policy:7,suburban:6,donors:3,base:5,viral:3,authenticity:6}, riskLevel:'moderate', posture:'reframe' },
                { text:`The claim about ${item.title.toLowerCase()} is false. ${round===0?'Nothing in the administration’s official record supports it.':round===1?'There was no such cost to taxpayers or families.':'There is no unfinished obligation for a second term to address.'}`, claim:{kind:'deny',text:item.fact}, effects:{press:-6,policy:-4,suburban:-3,donors:1,base:7,viral:8,authenticity:-6}, riskLevel:'risky', posture:'deny' },
                { text:`Judge ${item.title.toLowerCase()} only by ${round===0?'our intentions when the decision was made':round===1?'the strongest month in the administration’s record':'the number of announcements we made'}. By that standard the policy was a complete success; the remaining costs should not count.`, claim:{kind:'selective',omits:item.fact}, effects:{press:-2,policy:1,suburban:0,donors:4,base:6,viral:5,authenticity:-2}, riskLevel:'risky', posture:'defend' },
            ],
            order:index,
        })));
    },

    factCheck(question,response) {
        const claim=response.claim;
        if (!claim || claim.kind==='future') return 'UNVERIFIABLE';
        if (claim.kind==='record') return claim.text===question.factCheck?'SUPPORTED':'CONTRADICTED';
        if (claim.kind==='deny' && claim.text===question.factCheck) return 'CONTRADICTED';
        if (claim.kind==='selective' && claim.omits) return 'MISLEADING';
        return 'UNVERIFIABLE';
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
        const gs=window.GameEngine.state, presented=gs.accountability.presentedLiabilities||(gs.accountability.presentedLiabilities=[]);
        const item=docket.liabilities.find(x=>!presented.includes(x.id));
        if(!item || week<17 || week>40) return null;
        const slot = schedule[week] || {key:`review_${week}`,title:`Record review: ${item.title}`,category:'VOTER_FORUM'};
        presented.push(item.id);
        return {
            id:`reelection_${slot.key}_${item.id}`,
            title:slot.title,
            category:slot.category,
            isBreakingNews:true,
            isAccountability:true,
            liabilityId:item.id,
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
