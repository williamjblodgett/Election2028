/** One country clock. Quarterly entry points remain compatibility adapters. */
window.Simulation = {
    electionDate(year) {
        const first=new Date(Date.UTC(year,10,1));
        return new Date(Date.UTC(year,10,2+(8-first.getUTCDay())%7));
    },
    campaignDate(gs=window.GameEngine.state) {
        const end=this.electionDate(gs.isIncumbentRun?2032:2028);
        end.setUTCDate(end.getUTCDate()-(gs.totalWeeks-Math.min(gs.week,gs.totalWeeks))*7);
        return end;
    },
    ensure(p) {
        window.PresidencySystem._ensureLivingState(p);
        p.month=p.month || Math.max(1,Math.min(49,p.calendar.monthsElapsed+1));
        p.encounters=p.encounters || [];
        p.calendar.completed=p.calendar.completed || [];
        p.fiscal.nominalGDP=p.fiscal.nominalGDP || 100;
        p.fiscal.debtStock=p.fiscal.debtStock ?? p.fiscal.debt*p.fiscal.nominalGDP/100;
        p.fiscal.balancedMonths=p.fiscal.balancedMonths || 0;
        p.fiscal.policyAnnual=p.fiscal.policyAnnual || 0;
        return p;
    },
    label(p=window.GameEngine.state.presidency) {
        const month=p.month || Math.max(1,(p.calendar?.monthsElapsed||0)+1);
        const date=new Date(Date.UTC(2029+(p.term-1)*4,month-1,20));
        return date.toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
    },
    endMonth() {
        const gs=window.GameEngine.state, p=gs.presidency, PS=window.PresidencySystem;
        if (!p || p.over) return null;
        this.ensure(p);
        if (p.pendingEvent) return p.pendingEvent;
        if (p.term===1 && p.month>=41 && !gs.concurrentCampaign && !gs.isIncumbentRun && !gs.legacyElectionInterlude) {
            return p.pendingEvent={kind:'reelection'};
        }
        if (gs.concurrentCampaign && !gs.electionResult && !gs.countryMonthDue) return {kind:'campaign_due'};
        const narrative=window.NarrativeDirector?.next(gs);
        if (!p.acted) window.CareerSystem.record('maintain_course',{month:p.month});
        p.acted=true;
        const key=`${p.term}:${p.month}`;
        if (!p.calendar.completed.includes(key)) {
            p.calendar.completed.push(key);
            if ([4,16,28,40].includes(p.month)) p.encounters.push({kind:'budget'});
            if ([12,24,36].includes(p.month)) p.encounters.push({kind:'sotu'});
            if ([13,31].includes(p.month)) p.encounters.push({kind:'scotus'});
            if (!p.impeached && !p.congress.houseMajority && PS._impeachmentTriggered()) p.encounters.push({kind:'impeachment'});
            if (PS.atWar()) {
                const posture=p.pendingPosture || 'hold'; p.pendingPosture=null;
                const result=posture==='negotiate'?window.WarSystem.negotiate():window.WarSystem.fightRound(posture);
                p.encounters.push({kind:'warbattle',result});
            } else {
                const unseen=PS.CRISES.filter(c=>!p.crisisLog.some(x=>x.id===c.id));
                const scandals=PS.PRES_SCANDALS.filter(s=>!p.scandals.some(x=>x.id===s.id));
                const roll=window.GameEngine.random();
                if (roll<.14 && unseen.length) p.encounters.push({kind:'crisis',id:unseen[Math.floor(window.GameEngine.random()*unseen.length)].id});
                else if (roll<.18 && scandals.length) p.encounters.push({kind:'scandal',id:scandals[Math.floor(window.GameEngine.random()*scandals.length)].id});
            }
        }
        if(narrative && narrative.phase==='presidency' && !p.encounters.some(e=>e.kind==='narrative')) p.encounters.push({kind:'narrative',entry:narrative});
        if (p.encounters.length) return p.pendingEvent=p.encounters.shift();
        this.completeMonth();
        return {kind:'advanced'};
    },
    fiscalMonth(p) {
        const f=p.fiscal, e=p.economy, previous=f.debt;
        // Every flow is an annual percentage of the current GDP, divided by 12.
        const b={revenue:18.5+Math.max(-2,e.gdp-2)*.3+(f.revenueAdjustment||0),mandatory:14.5,
            domestic:5.5+f.policyAnnual+(f.spendingAdjustment||0),defense:3.4+(window.PresidencySystem.atWar()?1.2:0),
            debtService:f.debt*.026,emergency:(f.shutdown?.4:0)+(p.collapse.active?1.5:0)};
        b.balance=b.revenue-b.mandatory-b.domestic-b.defense-b.debtService-b.emergency;
        f.budget=b; f.deficit=-b.balance;
        const borrowing=f.deficit*f.nominalGDP/1200;
        f.debtStock=Math.max(0,f.debtStock+borrowing);
        const oldGDP=f.nominalGDP;
        f.nominalGDP*=Math.pow(1+Math.max(-20,e.gdp+e.inflation)/100,1/12);
        f.debt=f.debtStock/f.nominalGDP*100;
        f.balancedMonths=f.deficit<=0?f.balancedMonths+1:0;
        window.CareerSystem.fiscalEntry('Monthly budget and GDP',f.debt-previous,
            `Annualized deficit ${f.deficit.toFixed(2)}% GDP; borrowing ${borrowing.toFixed(3)} units; GDP ${oldGDP.toFixed(3)} → ${f.nominalGDP.toFixed(3)}.`,
            {borrowing,gdp:f.nominalGDP,debtStock:f.debtStock,budget:{...b}});
    },
    completeMonth() {
        const gs=window.GameEngine.state, p=gs.presidency, PS=window.PresidencySystem;
        if (!p || p.over) return;
        this.ensure(p);
        if (p.encounters.length) { p.pendingEvent=p.encounters.shift(); return; }
        p.pendingEvent=null;
        PS._runMonthlyPulses(p,1);
        if(p.signature?.funded && !p.fiscal.shutdown) p.signature.fundedMonths=(p.signature.fundedMonths||0)+1;
        const e=p.economy;
        e.gdp=Math.max(-15,e.gdp+(window.GameEngine.random()-.48)*.2+PS.cabinetEffects().econBias/3);
        e.unemployment=Math.max(2.5,e.unemployment+(window.GameEngine.random()-.5)*.14-(e.gdp>2.5?.033:-.033));
        e.inflation=Math.max(.5,e.inflation+(window.GameEngine.random()-.5)*.17);
        for (const eo of p.eos) if (!eo.struck && window.GameEngine.random()<1-Math.pow(.92,1/3)) {eo.struck=true;p.legacyPoints-=3;p.log.push(`Court invalidates ${eo.name}.`);}
        for (const s of p.scandals) {s.heat=Math.max(0,Math.min(100,s.heat+(s.coverup?8/3:-14/3)));}
        this.fiscalMonth(p);
        const target=47+e.gdp*3-Math.max(0,e.inflation-2.5)*3-Math.max(0,e.unemployment-4)*2;
        p.approval=Math.max(15,Math.min(80,p.approval+(target-p.approval)*(1-Math.pow(.75,1/3))-(p.fiscal.shutdown?1:0)));
        if (p.approval>=52 && p.month%3===0) p.capital=Math.min(12,p.capital+1);
        if (p.signature?.id==='balance' && !p.signature.done && p.fiscal.balancedMonths>=12) {
            p.signature.progress=p.signature.target; PS._addInitiative(0,'twelve consecutive balanced months');
        }
        if(p.signature && !p.signature.done && p.signature.progress>=p.signature.target && PS.signatureOutcomeReady(p)) PS._addInitiative(0,'verified delivery');
        window.CareerSystem.updatePromises(p);
        if (p.month===23 && !p.midtermsDone) {
            p.midtermsDone=true;
            const shift=p.approval>=52?1:p.approval>=45?-2:-4;
            p.congress.senateSeats=Math.max(40,Math.min(60,p.congress.senateSeats+shift));
            p.congress.houseSeats=Math.max(170,Math.min(265,p.congress.houseSeats+shift*5));
            p.congress.houseMajority=p.congress.houseSeats>=218;
            p.log.push(`Midterms: ${shift>=0?'+':''}${shift} Senate seats; House ${p.congress.houseSeats}/435.`);
            window.CareerSystem.record('midterms',{senate:p.congress.senateSeats,house:p.congress.houseSeats});
        }
        if (p.term===2 && p.month===25) p.timeline.push({month:p.month,kind:'succession',text:'The vice president and cabinet contenders begin competing for the next nomination.'});
        if (p.term===2 && p.month===37) {p.timeline.push({month:p.month,kind:'legacy',text:'Your final year begins. Congress weighs your remaining agenda against the succession campaign.'});p.capital=Math.max(0,p.capital-1);}
        if (p.month%12===0) gs.career.annualSnapshots.push({term:p.term,year:2028+(p.term-1)*4+p.month/12,approval:p.approval,debt:p.fiscal.debt,deficit:p.fiscal.deficit,population:p.population,economy:{...e},stability:p.stability.tier,laws:p.enacted.length,wars:p.warLog.length});
        p.month++; p.quarter=Math.floor((p.month-1)/3)+1; p.acted=false;
        gs.countryMonthDue=false;
        if (gs.concurrentCampaign) {
            window.CareerSystem.snapshotCountry(p);
            gs.accountability.docket=window.CareerSystem.buildDocket({...gs.incumbentSeed,...PS.computeLegacy(),debt:p.fiscal.debt,deficit:p.fiscal.deficit,gdp:p.economy.gdp,inflation:p.economy.inflation},gs.career);
        }
        if (p.month>48) {
            p.over=true; window.CareerSystem.closeTerm(p); p.legacy=PS.computeLegacy();
            if (gs.concurrentCampaign) gs.concurrentCampaign=false;
        }
        window.SaveStore?.save();
    },
    advanceTo(months) {
        const p=window.GameEngine.state.presidency;
        if (![1,3,6,12].includes(months) || !p) return {ok:false};
        const start=p.month || 1; let event;
        for(let i=0;i<months && !p.over;i++) { event=this.endMonth(); if (event?.kind!=='advanced') break; }
        return {ok:true,advanced:(p.month||1)-start,event};
    },
};
// Compatibility entry points; all advancement now goes through the country clock.
window.PresidencySystem.endQuarter=()=>window.Simulation.endMonth();
window.PresidencySystem._advance=()=>window.Simulation.completeMonth();
window.PresidencySystem.quarterLabel=()=>window.Simulation.label();
window.GameEngine.getWeekLabel=function(){return `Week ${this.state.week} · ${window.Simulation.campaignDate().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'})}`;};
