const test=require('node:test'),assert=require('node:assert/strict');
require('./load-game.cjs');
function resolve(p) {
  const e=p.pendingEvent;if(!e)return;
  if(e.kind==='budget') PresidencySystem.resolveBudget(p.capital>=2?0:1);
  else if(e.kind==='crisis') PresidencySystem.resolveCrisis(0);
  else if(e.kind==='scandal') PresidencySystem.resolveScandal(2);
  else if(e.kind==='scotus') PresidencySystem.appointJustice(1);
  else if(e.kind==='sotu') {PresidencySystem.deliverSotu('unity','sober');PresidencySystem.acknowledgeEvent();}
  else if(e.kind==='impeachment') PresidencySystem.resolveImpeachment(true);
  else if(e.kind==='warbattle') PresidencySystem.resolveWarEvent();
  else if(e.kind==='narrative') NarrativeDirector.resolve(e.entry,0);
  else throw Error(`Unhandled calendar encounter: ${e.kind}`);
}
test('calendar fixture advances 96 monthly budgets and eight annual snapshots without skipping obligations',()=>{
  const gs=GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','arcade',88731);
  // Clock fixture only: election results are tested separately and this is NOT a UI career.
  gs.legacyElectionInterlude=true;
  for(let term=1;term<=2;term++) {
    if(term===2) {gs.incumbentSeed={term:1};gs.presidency=null;}
    const p=PresidencySystem.begin();Simulation.ensure(p);
    let count=0;
    while(!p.over && count++<300) {if(p.pendingEvent)resolve(p);else Simulation.endMonth();}
    assert.ok(count<300);assert.equal(p.month,49);assert.equal(p.calendar.monthsElapsed,48);
    assert.equal(p.sotuHistory.length,3);assert.equal(p.midtermsDone,true);
  }
  assert.equal(gs.career.annualSnapshots.length,8);
  assert.deepEqual(gs.career.annualSnapshots.map(x=>x.year),[2029,2030,2031,2032,2033,2034,2035,2036]);
  assert.equal(gs.career.fiscal.filter(x=>x.source==='Monthly budget and GDP').length,96);
  assert.equal(gs.career.termSummaries.length,2);
  assert.equal(Simulation.label(),'January 2037');
});
test('the displayed bill probability exactly describes the correlated chamber vote model',()=>{
  GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','realistic',731);
  const p=PresidencySystem.begin(),bill=PresidencySystem.BILLS[0],whip=PresidencySystem.whipCount(bill,1);
  let wins=0;for(let i=0;i<10000;i++) {const draw=(i+.5)/10000;wins+=Math.round(whip.house.low+draw*(whip.house.high-whip.house.low))>=218&&Math.round(whip.senate.low+draw*(whip.senate.high-whip.senate.low))>=51?1:0;}
  assert.ok(Math.abs(wins/100-PresidencySystem.billOdds(bill,1))<=.51);
  p.billAttempts={[bill.id]:{month:1,senate:p.congress.senateSeats}};p.month=2;
  assert.equal(PresidencySystem.availableBills().some(b=>b.id===bill.id),false);
  p.month=4;assert.equal(PresidencySystem.availableBills().some(b=>b.id===bill.id),true);
});
