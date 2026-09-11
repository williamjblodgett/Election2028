const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'), vm=require('node:vm'), path=require('node:path');
global.window=globalThis;
for (const name of ['random','constants','candidates','states','vp-data','events','debate-content','debate-expanded','engine','game-commands','save-store','career-system','campaign-depth','world','war','presidency','cabinet','politicians-expanded']) {
    vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../js',`${name}.js`),'utf8'));
}
function campaign() { GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','realistic'); GameEngine.setSeed(2109); return GameEngine.state; }
test('rejected commands and previews are read-only; duplicate requests charge once',()=>{
    const gs=campaign(), before=JSON.stringify(gs);
    assert.equal(GameCommands.preview('activity',{activity:'podcast'}).cost,5000);
    assert.equal(GameCommands.execute('ad',{stateId:'PA',channel:'tv',tone:'positive',amount:Infinity}).ok,false);
    assert.equal(JSON.stringify(gs),before);
    const first=GameCommands.execute('visit',{stateId:'PA'},'visit1'); assert.equal(first.ok,true);
    assert.equal(GameCommands.execute('visit',{stateId:'PA'},'visit1').replayed,true);
    assert.equal(gs.finances.totalSpent,80000); assert.equal(gs.finances.ledger.length,1);
    assert.equal(GameCommands.execute('visit',{stateId:'PA'}).ok,false);
    assert.equal(GameCommands.execute('activity',{activity:'fundraisingBlitz'}).ok,false);
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
