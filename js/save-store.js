/** Crash-safe continuity checkpoints. Iron mode has one checkpoint, no rollback UI. */
window.SaveStore = {
    key:'election2028_save', backup:'election2028_save_backup',
    validate(value) {
        if (!value || typeof value !== 'object' || !Number.isInteger(value.week) || value.week<1 || value.week>100 ||
            !value.playerCandidate || !value.opponentCandidate || !value.campaign || !value.finances ||
            !Number.isFinite(value.finances.cashOnHand) || !value.statePolling || (value.saveVersion||1)>window.GameEngine.SAVE_VERSION) {
            throw new Error('Invalid or newer save. Your original save has been preserved.');
        }
        const finite=(v)=>typeof v==='number' && Number.isFinite(v);
        if(value.finances.cashOnHand<0 || Object.values(value.statePolling).some(p=>!p || !finite(p.player) || !finite(p.opponent)) ||
            (value.presidency && (!finite(value.presidency.population??335) || (value.presidency.month!==undefined && (!Number.isInteger(value.presidency.month)||value.presidency.month<1||value.presidency.month>49))))) {
            throw new Error('Invalid simulation values. Your original save has been preserved.');
        }
        return value;
    },
    migrate(value) {
        this.validate(value);
        const gs=JSON.parse(JSON.stringify(value));
        if (gs.presidency) {
            gs.presidency.month=gs.presidency.month || (gs.presidency.calendar?.monthsElapsed ?? (gs.presidency.quarter-1)*3)+1;
        } else if (gs.isIncumbentRun && !gs.concurrentCampaign) gs.legacyElectionInterlude=true;
        gs.flow=gs.flow || {screen:gs.presidency?'presidency':gs.transition?'cabinet':gs.electionResult?'election-night':'game'};
        gs.finances.ledger=gs.finances.ledger || [];
        gs.commandState=gs.commandState || {week:gs.week,used:0,visits:[],keys:[],receipts:{}};
        gs.saveVersion=window.GameEngine.SAVE_VERSION;
        return gs;
    },
    save(manual=false) {
        const gs=window.GameEngine.state;
        if (!gs?.playerCandidate || !window.localStorage) return {ok:false,reason:'No campaign to save.'};
        if (manual && gs.difficulty==='iron') return {ok:false,reason:'Iron mode keeps an automatic continuity checkpoint only.'};
        try {
            const ui=window.GameUI;
            if (ui && !['title','select'].includes(ui.currentScreen)) {
                gs.flow={screen:gs.transition&&!gs.transition.complete?'cabinet':ui.currentScreen};
                if (ui.currentScreen==='debate' && ui.debateCtx) {
                    const {advanceTimer,...ctx}=ui.debateCtx;
                    gs.flow.debate=JSON.parse(JSON.stringify(ctx));
                }
                gs.flow.weeklyEvents=ui.weeklyEvents || [];
                gs.flow.pendingEventChoices=ui.pendingEventChoices || {};
                gs.flow.pendingWeek=ui._pendingWeek || null;
            }
            const data=window.GameEngine.serialize();
            this.validate(JSON.parse(data));
            const old=localStorage.getItem(this.key);
            if (old && gs.difficulty!=='iron') {
                try { this.validate(JSON.parse(old)); localStorage.setItem(this.backup,old); } catch (_) { /* retain known-good backup */ }
            }
            localStorage.setItem(this.key,data);
            if (gs.difficulty==='iron') localStorage.removeItem(this.backup);
            return {ok:true};
        } catch (error) { return {ok:false,reason:`Save failed: ${error.message}`}; }
    },
    load(storage=window.localStorage) {
        const E=window.GameEngine, previous=E.state;
        let firstError;
        for (const key of [this.key,this.backup]) {
            try {
                const raw=storage.getItem(key);
                if (!raw) continue;
                const parsed=this.validate(JSON.parse(raw));
                E.deserialize(JSON.stringify(parsed)); // existing v1-v3 migrations first
                E.state=this.migrate(E.state);
                E.reconcilePrimaryTicket();
                return {ok:true,state:E.state,recovered:key===this.backup};
            } catch(error) { firstError=firstError || error; E.state=previous; }
        }
        return {ok:false,reason:firstError?.message || 'No saved game found.'};
    },
};
