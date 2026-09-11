const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
require('./load-game.cjs');
function campaign() { GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','realistic'); GameEngine.setSeed(2109); return GameEngine.state; }
test('geography uses detailed real country polygons and common marker coordinates',()=>{
    assert.equal(WorldGeometry.features.length,176);
    assert.ok(WorldSystem.LAND_PATHS.join('').length>80000);
    for(const n of WorldSystem.NATIONS) {const f=WorldGeometry.features.find(f=>f.id===n.geoId);assert.equal(n.x,f.x);assert.equal(n.y,f.y);}
    assert.ok(WorldSystem.getNation('brazil').y>WorldSystem.getNation('canada').y);
    assert.ok(WorldSystem.getNation('japan').x>WorldSystem.getNation('china').x);
});
test('final popular vote is voter-weighted and normalized, with an actual 270 tipping point',()=>{
    const gs=campaign(), result=ElectionSystem.finalize();
    assert.equal(Object.values(ElectionSystem.votingAge).reduce((a,b)=>a+b,0),262083034);
    const totals=Object.values(result.stateResults).reduce((a,r)=>({p:a.p+r.playerVotes,o:a.o+r.opponentVotes,t:a.t+r.totalVotes}),{p:0,o:0,t:0});
    assert.equal(result.nationalPopularVote.player,Math.round(totals.p/totals.t*1000)/10);
    assert.equal(result.playerEV+result.opponentEV,538);
    const tip=ElectionSystem.tippingPoint(result);assert.ok(tip);
    const higher=Object.values(result.stateResults).filter(r=>r.winner===result.winner && r.margin>tip.margin).reduce((n,r)=>n+r.ev,0);
    assert.ok(higher<270);assert.ok(higher+tip.ev>=270);
    assert.deepEqual(ElectionSystem.normalize({player:90,opponent:90,undecided:0}),{player:50,opponent:50,other:0});
});
test('contingent elections use House delegations, not an automatic opponent victory',()=>{
    const gs=campaign();gs.houseDelegations=Object.fromEntries(StateData.filter(s=>s.id!=='DC').map((s,i)=>[s.id,i<26?gs.playerParty:'republican']));
    assert.equal(ElectionSystem.contingent(gs).winner,'player');
});
test('incumbent debates retain two record questions and check evidence rather than posture',()=>{
    const gs=campaign();gs.isIncumbentRun=true;
    gs.accountability.docket=CareerSystem.buildDocket({debt:155,scandals:2,signatureDone:false,signatureName:'Balance the Budget',warsLost:0,inflation:5,gdp:2},gs.career);
    for(let i=0;i<3;i++) {
        const questions=EventSystem.DebateSystem.generateDebateQuestions(5),record=questions.filter(q=>q.isRecordQuestion);
        assert.equal(record.length,2);
        assert.equal(CareerSystem.factCheck(record[0],record[0].responses[0]),'SUPPORTED');
        assert.equal(CareerSystem.factCheck(record[0],record[0].responses[2]),'CONTRADICTED');
        assert.equal(CareerSystem.factCheck(record[0],record[0].responses[3]),'MISLEADING');
    }
});
test('rejected commands and previews are read-only; duplicate requests charge once',()=>{
    const gs=campaign(), before=JSON.stringify(gs);
    assert.equal(GameCommands.preview('activity',{activity:'podcast'}).cost,5000);
    assert.equal(GameCommands.execute('ad',{stateId:'PA',channel:'tv',tone:'positive',amount:Infinity}).ok,false);
    assert.equal(JSON.stringify(gs),before);
    const first=GameCommands.execute('visit',{stateId:'PA'},'visit1'); assert.equal(first.ok,true);
    assert.equal(GameCommands.execute('visit',{stateId:'PA'},'visit1').replayed,true);
    assert.equal(gs.finances.totalSpent,80000); assert.equal(gs.finances.ledger.filter(x=>x.type==='visit').length,1);
    assert.equal(GameCommands.execute('visit',{stateId:'PA'}).ok,false);
    assert.equal(GameCommands.execute('activity',{activity:'fundraisingBlitz'}).ok,false);
});
test('monthly budget reconciles borrowing, GDP and debt; promises require outcomes',()=>{
    campaign(); const p=PresidencySystem.begin(); Simulation.ensure(p);
    const before=p.fiscal.debtStock;
    Simulation.fiscalMonth(p);
    const f=p.fiscal, b=f.budget;
    assert.ok(Math.abs(b.balance-(b.revenue-b.mandatory-b.domestic-b.defense-b.debtService-b.emergency))<1e-9);
    assert.ok(Math.abs(f.debtStock-before-f.ledger.at(-1).borrowing)<1e-9);
    assert.ok(Math.abs(f.debt-f.debtStock/f.nominalGDP*100)<1e-9);
    PresidencySystem.chooseSignature('balance');
    for(let i=0;i<10;i++) PresidencySystem._addInitiative(30,'publicity');
    assert.equal(p.signature.done,false);
    f.balancedMonths=12; PresidencySystem._addInitiative(0,'verified balance'); assert.equal(p.signature.done,true);
});
test('fast-forward stops for scheduled business; war cannot hide a budget',()=>{
    campaign(); const p=PresidencySystem.begin(); Simulation.ensure(p);
    p.month=4; p.calendar.monthsElapsed=3; WarSystem.declare('iran');
    const result=Simulation.advanceTo(12);
    assert.equal(result.advanced,0); assert.equal(p.pendingEvent.kind,'budget');
    p.capital=8; PresidencySystem.resolveBudget(0);
    assert.equal(p.pendingEvent.kind,'warbattle');
    PresidencySystem.resolveWarEvent();
    if(p.pendingEvent?.kind==='narrative') NarrativeDirector.resolve(p.pendingEvent.entry,0);
    assert.equal(p.month,5);
});
test('incumbent campaign shares the serving president, then blocks skipped campaign weeks',()=>{
    const gs=campaign(), p=PresidencySystem.begin(); Simulation.ensure(p); p.month=41;
    const seed={term:1,approval:52,gdp:2,inflation:3,debt:110,scandals:0,warsWon:0,warsLost:0,career:gs.career,countrySnapshot:CareerSystem.snapshotCountry(p)};
    assert.equal(Simulation.endMonth().kind,'reelection');
    GameEngine.startReelection(gs.playerCandidate,gs.opponentCandidate,'realistic',seed,null);
    assert.equal(GameEngine.state.presidency,p); assert.equal(GameEngine.state.concurrentCampaign,true);
    assert.equal(Simulation.advanceTo(12).event.kind,'campaign_due');
    assert.equal(p.month,41);
    GameEngine.state.countryMonthDue=true; p.calendar.completed.push('1:41');
    Simulation.endMonth(); assert.equal(p.month,42); assert.equal(GameEngine.state.countryMonthDue,false);
    assert.equal(Simulation.electionDate(2032).toISOString().slice(0,10),'2032-11-02');
});
test('one million dollars has identical marginal impact whether split or whole',()=>{
    let gs=campaign(), initial=gs.statePolling.PA.player;
    GameCommands.execute('ad',{stateId:'PA',channel:'tv',tone:'positive',amount:1000000});
    const whole=gs.statePolling.PA.player-initial;
    gs=campaign(); initial=gs.statePolling.PA.player;
    for(let i=0;i<10;i++) assert.equal(GameCommands.execute('ad',{stateId:'PA',channel:'tv',tone:'positive',amount:100000}).ok,true);
    assert.ok(Math.abs(gs.statePolling.PA.player-initial-whole)<1e-9);
    assert.equal(gs.finances.totalSpent,1000000);
});
test('actions, inventory and affordability share hard limits',()=>{
    const gs=campaign();
    for(let i=0;i<3;i++) assert.equal(GameEngine.applyActivityEffects('podcast').ok,true);
    const before=JSON.stringify(gs); assert.equal(GameEngine.applyActivityEffects('interview').ok,false); assert.equal(JSON.stringify(gs),before);
    gs.week++; assert.equal(GameEngine.applyActivityEffects('interview').ok,true);
    gs.finances.cashOnHand=249999; assert.equal(GameEngine.applyActivityEffects('gotv').ok,false);
});
test('election finalization and replay consume randomness once',()=>{
    const gs=campaign(); const first=GameEngine.generateElectionNight(), cursor=gs.rng.cursor;
    const second=GameEngine.generateElectionNight(); assert.deepEqual(first,second); assert.equal(gs.rng.cursor,cursor);
    assert.equal(gs.career.elections.length,1);
});
test('war previews do not consume random draws',()=>{
    const gs=campaign(); const before=JSON.stringify(gs);
    for(const a of WarSystem.ADVERSARIES) WarSystem.formCoalition(a,55,0,true);
    assert.equal(JSON.stringify(gs),before);
});
test('corrupt primary save recovers known-good backup without changing its bytes',()=>{
    const gs=campaign(); gs.flow={screen:'cabinet'}; const backup=JSON.stringify(gs);
    const storage={getItem:key=>key===SaveStore.key?'{corrupt':backup};
    const result=SaveStore.load(storage); assert.equal(result.ok,true); assert.equal(result.recovered,true);
    assert.equal(result.state.flow.screen,'cabinet'); assert.equal(storage.getItem(SaveStore.backup),backup);
});
test('active war survives term change, new ministers and Senate are not overwritten',()=>{
    let gs=campaign(); gs.transition={posts:{treasury:{name:'Old minister',competence:95,loyalty:80}},senateSeats:52,capital:6};
    const p=PresidencySystem.begin(); WarSystem.declare('iran');
    const snapshot=CareerSystem.snapshotCountry(p);
    gs.presidency=null; gs.incumbentSeed={term:1}; gs.career.countrySnapshot=snapshot;
    gs.transition={posts:{treasury:{name:'New minister',competence:90,loyalty:80}},senateSeats:56,capital:6};
    const next=PresidencySystem.begin(); assert.ok(next.war); assert.equal(next.war.adversaryId,'iran');
    assert.equal(next.congress.senateSeats,56); assert.equal(next.administration.members.treasury.name,'New minister');
    next.administration.members.treasury.status='RESIGNED'; assert.equal(PresidencySystem.cabinetEffects().econBias,0);
});
