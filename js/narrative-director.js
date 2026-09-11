/** Stateful, authored scenario chains. Stages never replay within a career. */
window.NarrativeDirector = {
    arcs:[
        {id:'bond_market',title:'The cost of borrowing',phase:'presidency',gap:5,eligible:(gs,p)=>p.month>=6 && p.fiscal.deficit>6,nodes:[
            ['Bond auctions weaken','Investors demand a credible response to the recurring deficit.', ['Publish a funded revenue package','revenue',1],['Preserve the agenda and accept higher debt service','borrowing',1]],
            ['The coalition objects','Members who supported your budget now oppose its revenue provisions.', ['Negotiate targeted spending offsets','cuts',1],['Protect every program and dilute the package','revenue',-1]],
            ['The first implementation review','The fiscal office finds that promised savings are arriving slowly.', ['Fund independent implementation audits','trust',4],['Accelerate reductions before the audit is complete','cuts',1]],
            ['The market verdict','Your financing choices have become a defining election issue.', ['Publish the complete borrowing and service-cost record','trust',5],['Promise a new tax cut to change the subject','revenue',-1]],
        ]},
        {id:'mission_creep',title:'A mission without an ending',phase:'presidency',gap:2,eligible:(gs,p)=>!!p.war&&!p.war.resolved,nodes:[
            ['The objective expands','Commanders request authority beyond the original mission.', ['Keep the authorized objective and request a public review','trust',3],['Expand the mission and accept the added burden','war_expand',1]],
            ['The coalition fractures','An ally demands a withdrawal benchmark before renewing support.', ['Offer a verifiable withdrawal timetable','diplomacy',5],['Keep the timetable open and reinforce the deployment','war_expand',1]],
            ['The casualty hearing','Congress calls families and commanders to testify about the mission.', ['Release the cost and casualty ledger and attend the hearing','trust',4],['Seek a closed hearing and protect operational flexibility','trust',-3]],
            ['The exit decision','The country needs a decision on whether the mission continues.', ['Authorize negotiations using the existing battlefield position','peace',1],['Continue the mission under a renewed cost review','war_expand',1]],
        ]},
        {id:'coalition_bargain',title:'The nomination bargain',phase:'primary',gap:2,eligible:gs=>gs.week>=4,nodes:[
            ['Organizers ask for a seat','A coalition can provide volunteers, but wants influence over your platform.', ['Publish a policy agreement with measurable commitments','base',4],['Accept volunteers without promising a policy change','persuasion',2]],
            ['Donors question the bargain','A donor group worries that your coalition agreement will raise costs.', ['Defend the agreement and accept a smaller fundraising haul','cash',-100000],['Narrow the promise and face an organizer backlash','base',-3]],
            ['A rival offers an endorsement','The endorsement comes with a request for convention influence.', ['Offer a transparent platform committee role','base',3],['Decline the bargain and make a direct appeal to voters','persuasion',3]],
            ['The convention test','Volunteers compare your final platform with the original agreement.', ['Publish the negotiated commitments and who will implement them','base',4],['Prioritize message unity over a detailed public agreement','persuasion',2]],
        ]},
        {id:'delivery_failure',title:'A law is not a delivered result',phase:'presidency',gap:3,eligible:(gs,p)=>p.policies.some(x=>!x.effectsApplied),nodes:[
            ['Procurement falls behind','A signature program has legal authority but too few contracts in operation.', ['Assign an accountable delivery team and publish milestones','delivery',12],['Launch the announcement campaign before contracts are ready','approval',2]],
            ['The inspector finds weak controls','A review identifies procurement shortcuts and uneven access.', ['Slow the rollout to repair the controls','trust',4],['Keep the rollout moving and accept additional audit risk','trust',-3]],
            ['Governors demand flexibility','States say federal requirements are delaying implementation.', ['Allow measured waivers with shared reporting standards','delivery',10],['Retain uniform rules and add federal delivery staff','delivery',6]],
            ['The household outcome review','Officials must distinguish spending money from delivering the service.', ['Publish completion rates and unfinished obligations','trust',5],['Claim victory from the appropriations total alone','trust',-5]],
        ]},
        {id:'succession',title:'Who inherits the coalition?',phase:'presidency',gap:4,eligible:(gs,p)=>p.term===2&&p.month>=25,nodes:[
            ['The first exploratory committee','A senior ally starts preparing to succeed you.', ['Set a public separation between government and campaign work','trust',3],['Use your influence to discourage an early challenge','approval',2]],
            ['The vice president asks for your backing','Other cabinet figures want a neutral nomination contest.', ['Stay neutral and insist on continued governing duties','trust',3],['Endorse the vice president and accept factional resistance','approval',-2]],
            ['A cabinet contender misses delivery targets','Their campaign travel is interfering with department work.', ['Require a resignation or a return to full-time governing','trust',4],['Delegate their portfolio and retain a political ally','delivery',-8]],
            ['The successor’s platform diverges','Your party nominee proposes reversing part of your legacy.', ['Defend the record while preparing an orderly handoff','trust',5],['Demand a public promise to preserve every initiative','approval',-3]],
        ]},
        {id:'recovery_legitimacy',title:'Rebuild the country and its consent',phase:'presidency',gap:3,eligible:(gs,p)=>p.collapse.active || p.world.nuclearExchanges>0,nodes:[
            ['The emergency distribution dispute','Governors accuse the center of favoring loyal regions.', ['Publish an aid formula based on need and access','recovery',7],['Concentrate aid where federal logistics are strongest','recovery',4]],
            ['Local authorities defy an order','A damaged region no longer trusts the national chain of command.', ['Negotiate a constitutional continuity compact','trust',6],['Expand emergency enforcement to restore compliance','trust',-5]],
            ['Displaced voters need representation','Election workers cannot reach many temporary communities.', ['Fund secure registration and accessible voting locations','trust',7],['Prioritize infrastructure while requesting narrowly limited delays','recovery',5]],
            ['The legitimacy review','Recovery must end in accountable civilian government, not permanent emergency rule.', ['Publish a sunset plan and independent recovery audit','recovery',8],['Retain exceptional authority until every target is met','trust',-6]],
        ]},
    ],
    next(gs=window.GameEngine.state) {
        if (!gs) return null;
        if (gs.narrative?.pending) return gs.narrative.pending;
        const p=gs.presidency, phase=p&&!p.over && (!gs.concurrentCampaign || window.GameUI?.currentScreen==='presidency')?'presidency':gs.phase;
        const clock=phase==='presidency'?(p.term-1)*48+(p.month||1):gs.week;
        for(const arc of this.arcs) {
            if (arc.phase!==phase) continue;
            const progress=gs.narrative?.arcs?.[arc.id] || {stage:0,last:-100};
            if(progress.stage>=arc.nodes.length || clock-progress.last<arc.gap) continue;
            if(progress.stage===0 && !arc.eligible(gs,p)) continue;
            return {arc:arc.id,stage:progress.stage,clock,phase};
        }
        return null;
    },
    resolve(entry,choiceIndex) {
        const gs=window.GameEngine.state, p=gs.presidency;
        const arc=this.arcs.find(a=>a.id===entry?.arc), node=arc?.nodes[entry.stage], choice=node?.[2+choiceIndex];
        if(!choice || ![0,1].includes(choiceIndex)) return {ok:false};
        const expected=this.next(gs);
        if(!expected || ['arc','stage','clock','phase'].some(k=>expected[k]!==entry[k])) return {ok:false};
        if(arc.phase==='presidency' && (!p || p.over)) return {ok:false};
        gs.narrative=gs.narrative || {arcs:{},history:[]};
        const old=gs.narrative.arcs[arc.id] || {stage:0};
        if(old.stage!==entry.stage) return {ok:false};
        const [,effect,value]=choice;
        if(effect==='revenue') p.fiscal.revenueAdjustment=(p.fiscal.revenueAdjustment||0)+value;
        if(effect==='cuts') p.fiscal.spendingAdjustment=Math.max(-4,(p.fiscal.spendingAdjustment||0)-value);
        if(effect==='borrowing') {p.fiscal.debt+=value;window.CareerSystem.fiscalEntry('Financing concession',value,node[0]);}
        if(effect==='trust') p.institutions.trust=Math.max(0,Math.min(100,p.institutions.trust+value));
        if(effect==='diplomacy') p.diplomaticStanding=Math.min(100,p.diplomaticStanding+value);
        if(effect==='approval') p.approval=Math.max(15,Math.min(80,p.approval+value));
        if(effect==='recovery') p.collapse.recovery=Math.min(100,p.collapse.recovery+value);
        if(effect==='war_expand' && p.war&&!p.war.resolved) {p.war.objective+='; expanded stabilization mission';p.war.escalations++;p.fiscal.debt+=.8;window.CareerSystem.fiscalEntry('Mission expansion',.8,node[0]);}
        if(effect==='peace' && p.war&&!p.war.resolved) window.WarSystem.negotiate();
        if(effect==='delivery') {const policy=p.policies.find(x=>!x.effectsApplied);if(policy)policy.implementation=Math.max(0,Math.min(99,policy.implementation+value));}
        if(effect==='base') gs.campaign.enthusiasm=Math.max(0,Math.min(100,gs.campaign.enthusiasm+value));
        if(effect==='persuasion') gs.campaign.persuadableSupport=Math.max(0,Math.min(100,gs.campaign.persuadableSupport+value));
        if(effect==='cash') window.CampaignFinance.post(value,'narrative',{}, {mandatory:true});
        gs.narrative.arcs[arc.id]={stage:entry.stage+1,last:entry.clock};gs.narrative.pending=null;
        gs.narrative.history.push({...entry,choice:choice[0]});
        window.CareerSystem.record('narrative_decision',{...entry,title:node[0],choice:choice[0]});
        if(p?.pendingEvent?.kind==='narrative') {p.pendingEvent=null;window.Simulation.completeMonth();}
        window.SaveStore?.save();return{ok:true};
    },
};
