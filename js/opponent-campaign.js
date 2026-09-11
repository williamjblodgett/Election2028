/** The rival uses the same quotes, weekly slots, affordability and ad saturation. */
window.OpponentCampaign = {
    context(gs=window.GameEngine.state) {
        const ai=gs.aiCampaign || (gs.aiCampaign={
            finances:{cashOnHand:gs.opponent.cash,totalRaised:gs.opponent.cash,totalSpent:0,ledger:[],
                weeklySmallDollar:200000,weeklyHighDollar:500000,fundraisingFatigue:0,burnRate:300000},
            adMarkets:{},commandState:null,visitedStates:{},
        });
        const ctx={...gs,playerCandidate:gs.opponentCandidate,campaign:gs.opponent,finances:ai.finances,
            commandState:ai.commandState,adMarkets:ai.adMarkets,visitedStates:ai.visitedStates||(ai.visitedStates={})};
        if(gs.phase==='general' && !ai.nomineeNetwork) {
            ai.finances.weeklySmallDollar*=1.5;ai.finances.weeklyHighDollar*=2;
            ctx.campaign.enthusiasm+=10;ctx.campaign.momentum+=15;ctx.campaign.donorConfidence+=10;
            ai.nomineeNetwork=true;
        }
        // Running-mate donations are also reflected in the rival's cash ledger.
        const extra=gs.opponent.cash-ai.finances.cashOnHand;
        if(extra) window.CampaignFinance.post(extra,'ticket_support',{}, {gs:ctx,mandatory:true});
        window.GameCommands.ensure(ctx); ai.commandState=ctx.commandState;
        return ctx;
    },
    execute(type,payload,ctx=this.context()) {
        const gs=window.GameEngine.state, q=window.GameCommands.preview(type,payload,ctx);
        if(!q.ok) return q;
        const commands=window.GameCommands.ensure(ctx), poll=gs.statePolling[payload.stateId];
        window.CampaignFinance.post(-q.cost,`opponent_${type}`,payload,{gs:ctx});
        commands.used+=q.slots;
        if(type==='visit') {
            const boost=(.15+(ctx.playerCandidate.charisma||50)/100*.2)/Math.sqrt(1+(ctx.visitedStates[payload.stateId]||0)*.7);
            ctx.visitedStates[payload.stateId]=(ctx.visitedStates[payload.stateId]||0)+1;
            poll.opponent+=boost;poll.player-=boost*.3;poll.undecided-=boost*.5;
            poll.lastOpponentVisitWeek=gs.week;
            ctx.campaign.enthusiasm+=.3+(ctx.playerCandidate.charisma||50)/100*.7;
            ctx.campaign.groundGame+=.5;commands.visits.push(payload.stateId);
        } else if(type==='ad') {
            const st=window.StateData.find(s=>s.id===payload.stateId);
            const m=ctx.adMarkets[st.id]||(ctx.adMarkets[st.id]={exposure:0,weekSpent:0});
            const old=m.exposure;m.exposure+=q.cost/(st.adCostMultiplier||1);m.weekSpent+=q.cost;
            if(payload.tone==='negative') {poll.player-=q.impact*1.3;poll.opponent+=q.impact*.3;ctx.campaign.scandalVulnerability+=q.cost/1e6*2;window.GameEngine.bumpAnger(q.cost/1e6*1.5);}
            else if(payload.tone==='contrast') {poll.opponent+=q.impact*.7;poll.player-=q.impact*.5;window.GameEngine.bumpAnger(q.cost/1e6*.5);}
            else poll.opponent+=q.impact;
            const broad=Math.log10(1+m.exposure/1e5)-Math.log10(1+old/1e5);
            ctx.campaign[payload.channel==='tv'?'mediaScore':'onlineInfluence']+=broad*(payload.channel==='tv'?.9:1.1);
        } else if(type==='activity') {
            if(payload.activity==='fundraisingBlitz') {
                const amount=1000000+ctx.campaign.donorConfidence*15000;
                window.CampaignFinance.post(amount,'opponent_fundraising_blitz',{}, {gs:ctx});
                ctx.finances.fundraisingFatigue+=18;ctx.campaign.enthusiasm-=2;
            } else if(payload.activity==='debatePrep') ctx.campaign.debateSkill+=3;
            else if(payload.activity==='townhall') {ctx.campaign.approval+=2;ctx.campaign.persuadableSupport+=2;}
            else if(payload.activity==='fieldOffice') {ctx.campaign.groundGame+=5;ctx.campaign.baseTurnout+=2;}
            else if(payload.activity==='podcast') {ctx.campaign.onlineInfluence+=4;ctx.campaign.enthusiasm+=1;ctx.campaign.mediaScore+=2;}
            else if(payload.activity==='gotv') {
                ctx.campaign.baseTurnout+=2;
                const published=window.GameEngine.getObservedPolling();
                const targets=window.StateData.filter(s=>s.isBattleground).sort((a,b)=>Math.abs(published[a.id].player-published[a.id].opponent)-Math.abs(published[b.id].player-published[b.id].opponent)).slice(0,window.GameConstants.EARLY_VOTE.GOTV_TARGET_STATES);
                for(const t of targets) {
                    const ev=gs.earlyVote[t.id]||(gs.earlyVote[t.id]={playerBanked:0,opponentBanked:0,pctBanked:0});
                    const add=Math.max(0,Math.min(.02+ctx.campaign.groundGame/100*.03,window.GameConstants.EARLY_VOTE.MAX_BANKED_PCT-ev.pctBanked));
                    ev.opponentBanked+=add;ev.pctBanked+=add;
                }
            }
            else {ctx.campaign.enthusiasm+=3;ctx.campaign.baseTurnout+=2;ctx.campaign.mediaScore+=1;}
        }
        gs.opponent.cash=ctx.finances.cashOnHand;
        return q;
    },
    process() {
        const E=window.GameEngine,gs=E.state,ctx=this.context(),actions=[];
        if(gs.phase==='general' && gs.week>=20 && !gs.aiCampaign.conventionDone) {
            const bounce=3+Math.floor(E.random()*5);
            ctx.campaign.enthusiasm+=8;ctx.campaign.momentum+=20;ctx.campaign.approval+=bounce;ctx.campaign.baseTurnout+=5;
            for(const poll of Object.values(gs.statePolling)) poll.opponent+=bounce*.3;
            gs.aiCampaign.conventionDone=true;actions.push('Held the rival party convention');
        }
        ctx.campaign.approval+=1;ctx.campaign.persuadableSupport+=1;ctx.campaign.donorConfidence+=1; // same positive message posture
        const Eview={...E,state:ctx};
        window.CampaignFinance.post(E.calculateFundraising.call(Eview),'opponent_weekly_fundraising',{}, {gs:ctx});
        window.CampaignFinance.settleArrears(ctx);
        const overhead=300000+(gs.phase==='general'?450000:150000)+Math.min(350000,gs.week*9000);
        window.CampaignFinance.post(-overhead,'opponent_overhead',{}, {gs:ctx,mandatory:true});
        ctx.finances.fundraisingFatigue=Math.max(0,ctx.finances.fundraisingFatigue-3);
        const ranked=window.StateData.filter(s=>gs.statePolling[s.id]).map(s=>{
            const p=window.CampaignDepth?.getPoll(s.id)||gs.statePolling[s.id],margin=p.player-p.opponent;
            return {s,margin,score:s.electoralVotes/(2+Math.abs(margin))};
        }).sort((a,b)=>b.score-a.score);
        const arcade=gs.difficulty==='arcade', targets=ranked.slice(0,arcade?5:8);
        const map=E.calculateElectoralMap(),posture=map.opponentEV<240?'offense':map.opponentEV>290?'defense':'balanced';
        const tone=posture==='offense'?'contrast':'positive';
        if(ctx.finances.cashOnHand<900000) {
            this.execute('activity',{activity:'fundraisingBlitz'},ctx);actions.push('Dedicated the week to fundraising');
        } else {
            const prep=window.GameConstants.DEBATE_WEEKS.includes(gs.week+1);
            const visits=1;
            for(let i=0;i<visits && i<targets.length;i++) {
                const t=targets[arcade?(i+gs.week)%targets.length:i];
                if(this.execute('visit',{stateId:t.s.id},ctx).ok) actions.push(`Campaigned in ${t.s.name} ($80K)`);
            }
            if(prep||(!arcade && gs.week>=32)) {
                const activity=prep?'debatePrep':'gotv';
                if(this.execute('activity',{activity},ctx).ok) actions.push(prep?'Prepared for the debate':'Funded a turnout operation ($250K)');
            }
            const rotation=['townhall','fieldOffice','podcast','rally'];
            for(let i=0;ctx.commandState.used<(arcade?2:3) && i<3;i++) {
                const activity=rotation[(gs.week+i)%rotation.length];
                if(this.execute('activity',{activity},ctx).ok) actions.push(`Ran ${activity} outreach`);
            }
        }
        const budget=Math.max(0,Math.min(arcade?1500000:2000000,(ctx.finances.cashOnHand-1500000)*(arcade?.15:.4)));
        const perBuy=Math.floor(budget/3/50000)*50000;
        if(perBuy>=50000) for(const t of targets.slice(0,3)) {
            if(this.execute('ad',{stateId:t.s.id,channel:'tv',tone,amount:perBuy},ctx).ok) actions.push(`${tone} ads in ${t.s.name} ($${perBuy/1000}K)`);
        }
        gs.opponent.cash=ctx.finances.cashOnHand;
        gs.opponentPlaybook={posture,tone,targets:targets.map(t=>t.s.id),week:gs.week,actionsUsed:ctx.commandState.used,cash:gs.opponent.cash};
        return actions;
    },
};
window.GameEngine.processOpponentTurn=()=>window.OpponentCampaign.process();
