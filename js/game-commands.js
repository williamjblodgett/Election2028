/** Validated campaign commands. UI, simulations and legacy adapters share these rules. */
window.GameCommands = {
    ACTIVITY_COSTS: { rally:60000, townhall:30000, podcast:5000, interview:0,
        fundraisingBlitz:0, debatePrep:0, surrogateDeployment:40000, oppoResearch:150000,
        fieldOffice:200000, gotv:250000 },
    ensure(gs) {
        gs.commandState = gs.commandState || { week:gs.week, used:0, visits:[], keys:[], receipts:{} };
        gs.finances.ledger = gs.finances.ledger || [];
        gs.adMarkets = gs.adMarkets || {};
        if (gs.commandState.week !== gs.week) {
            const elapsed = Math.max(0, gs.week - gs.commandState.week);
            Object.values(gs.adMarkets).forEach(m => { m.exposure *= Math.pow(.8, elapsed); m.weekSpent=0; });
            gs.commandState = { week:gs.week, used:0, visits:[], keys:[], receipts:{} };
        }
        return gs.commandState;
    },
    preview(type, payload={}, gs=window.GameEngine.state) {
        if (!gs || !gs.playerCandidate) return { ok:false, reason:'Start a campaign first.' };
        // Preview never mutates state or consumes randomness.
        const c = gs.commandState && gs.commandState.week === gs.week ? gs.commandState : {used:0,visits:[],keys:[]};
        let cost=0, slots=0, impact=0;
        const fail=reason=>({ok:false,reason,cost,slots});
        if (gs.electionResult || gs.week > gs.totalWeeks) return fail('This campaign has ended.');
        if (type === 'visit') {
            if (!gs.statePolling[payload.stateId]) return fail('Choose a valid state.');
            cost=80000; slots=1;
            if (c.visits.includes(payload.stateId)) return fail('The candidate already visited this state this week.');
        } else if (type === 'activity') {
            if (!Object.hasOwn(this.ACTIVITY_COSTS,payload.activity)) return fail('Unknown campaign activity.');
            cost=this.ACTIVITY_COSTS[payload.activity]; slots=payload.activity==='fundraisingBlitz'?3:1;
        } else if (type === 'coalition') {
            if (!['labor','youth','suburban','rural','minority','women','veterans','evangelical'].includes(payload.coalition)) return fail('Choose a voter coalition.');
            slots=1;
        } else if (type === 'ad') {
            const st=window.StateData.find(s=>s.id===payload.stateId);
            if (!st || !gs.statePolling[payload.stateId]) return fail('Choose a valid state.');
            if (!['tv','digital'].includes(payload.channel) || !['positive','contrast','negative'].includes(payload.tone)) return fail('Choose a valid channel and tone.');
            cost=Number(payload.amount);
            if (!Number.isSafeInteger(cost) || cost<50000 || cost%50000) return fail('Ad buys use $50K increments.');
            const multiplier=st.adCostMultiplier || 1;
            const market=gs.adMarkets && gs.adMarkets[st.id] || {exposure:0,weekSpent:0};
            const elapsed=gs.commandState?Math.max(0,gs.week-gs.commandState.week):0;
            const exposure=market.exposure*Math.pow(.8,elapsed);
            const weekSpent=elapsed?0:market.weekSpent;
            if (weekSpent+cost>5000000*multiplier) return fail('This market has no more inventory for that buy this week.');
            const gain=.8*(Math.sqrt((exposure+cost/multiplier)/100000)-Math.sqrt(exposure/100000));
            impact=gain*(payload.channel==='tv'?1.2:.9*(st.educationSplit && st.educationSplit.college>35?1.1:1));
        } else return fail('Unknown command.');
        if (c.used+slots>3) return fail(`Only ${Math.max(0,3-c.used)} action slots remain this week.`);
        if (cost>gs.finances.cashOnHand) return fail('Not enough campaign cash.');
        return {ok:true,cost,slots,impact,remainingSlots:3-c.used-slots};
    },
    execute(type,payload={},requestId) {
        const E=window.GameEngine, gs=E.state;
        if (!gs) return {ok:false,reason:'Start a campaign first.'};
        const cached=gs.commandState?.week===gs.week && gs.commandState.receipts?.[requestId];
        if (requestId && cached) return {...cached,replayed:true};
        const quote=this.preview(type,payload,gs);
        if (!quote.ok) return quote;
        const state=this.ensure(gs);
        const before=gs.finances.cashOnHand, spent=gs.finances.totalSpent;
        let result;
        if (type==='visit') { result=E._applyCampaignVisit(payload.stateId); state.visits.push(payload.stateId); }
        if (type==='activity') result=E._applyActivityEffects(payload.activity);
        if (type==='coalition') result=E._applyCoalitionBuilding(payload.coalition);
        if (type==='ad') {
            const poll=gs.statePolling[payload.stateId], impact=quote.impact;
            const st=window.StateData.find(s=>s.id===payload.stateId);
            const market=gs.adMarkets[st.id] || (gs.adMarkets[st.id]={exposure:0,weekSpent:0});
            const old=market.exposure;
            market.exposure+=quote.cost/(st.adCostMultiplier||1); market.weekSpent+=quote.cost;
            if (payload.tone==='negative') { poll.opponent-=impact*1.3; poll.player+=impact*.3; gs.campaign.scandalVulnerability+=quote.cost/1000000*2; E.bumpAnger(quote.cost/1000000*1.5); }
            else if (payload.tone==='contrast') { poll.player+=impact*.7; poll.opponent-=impact*.5; E.bumpAnger(quote.cost/1000000*.5); }
            else poll.player+=impact;
            const broad=Math.log10(1+market.exposure/100000)-Math.log10(1+old/100000);
            gs.campaign[payload.channel==='tv'?'mediaScore':'onlineInfluence']+=broad*(payload.channel==='tv'?.9:1.1);
            poll.adSpend+=quote.cost; gs.finances.cashOnHand-=quote.cost;
            E.recordStateMovement(st.id,`${payload.channel.toUpperCase()} ${payload.tone}: $${quote.cost/1000}K, ${impact.toFixed(2)} marginal impact after prior exposure.`);
            result={stateId:st.id,type:payload.channel,tone:payload.tone,amount:quote.cost,impact};
        }
        state.used+=quote.slots;
        const expense=Math.max(0,before-gs.finances.cashOnHand);
        gs.finances.totalSpent=spent+expense;
        gs.campaign.cash=gs.finances.cashOnHand;
        const receipt={...result,...quote,type,week:gs.week};
        gs.finances.ledger.push({week:gs.week,type,detail:{...payload},amount:gs.finances.cashOnHand-before,balance:gs.finances.cashOnHand});
        if (requestId) state.receipts[requestId]=receipt;
        if (window.CareerSystem) window.CareerSystem.record('campaign_action',{command:type,...payload,cost:expense});
        if (window.SaveStore) window.SaveStore.save();
        return receipt;
    },
    install() {
        const E=window.GameEngine;
        if (E._applyCampaignVisit) return;
        E._applyCampaignVisit=E.applyCampaignVisit;
        E._applyActivityEffects=E.applyActivityEffects;
        E._applyCoalitionBuilding=E.applyCoalitionBuilding;
        E.applyCampaignVisit=stateId=>this.execute('visit',{stateId});
        E.applyActivityEffects=activity=>this.execute('activity',{activity});
        E.applyCoalitionBuilding=coalition=>this.execute('coalition',{coalition});
        E.applyAdBuy=(stateId,channel,amount,tone)=>this.execute('ad',{stateId,channel,amount,tone});
    },
};
window.GameCommands.install();
