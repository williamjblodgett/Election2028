const test=require('node:test'),assert=require('node:assert/strict');
require('./load-game.cjs');
const start=(seed=72011)=>GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','realistic',seed);
const zero=()=>({viral:0,donors:0,press:0,authenticity:0,policy:0,base:0,suburban:0});
function debateContext(gs) {
  return {questions:EventSystem.DebateSystem.generateDebateQuestions(5),idx:0,answered:false,playerScores:zero(),opponentScores:zero(),questionWins:{player:0,opponent:0,tie:0},primaryMode:true,debateOpponent:gs.opponentCandidate,opponentStrategy:'republican_moderate'};
}
test('initialization seed reproduces the entire campaign before the first move',()=>{
  const first=JSON.stringify(start(770));assert.equal(JSON.stringify(start(770)),first);
  assert.notEqual(JSON.stringify(start(771)),first);
});
test('published polls and electoral map never expose a hidden electorate change',()=>{
  const gs=start(),before=GameEngine.getObservedPolling(),map=GameEngine.calculateElectoralMap();
  for(const p of Object.values(gs.statePolling)) {p.player=90;p.opponent=5;p.undecided=5;}
  assert.deepEqual(GameEngine.calculateElectoralMap(),map);
  for(const [id,p] of Object.entries(GameEngine.getObservedPolling())) {
    assert.equal(p.player,before[id].player);assert.equal(p.opponent,before[id].opponent);
    assert.ok(Math.abs(p.player+p.opponent+p.undecided-100)<1e-8);
  }
  assert.equal(ElectionSystem.finalize().playerEV,538);
});
test('event decisions apply once and career events do not get cosmetic sequel titles',()=>{
  const gs=start(),event={id:'unique_fixture',title:'A unique dilemma',choices:[{effects:{cash:100000,approval:2}}]};
  assert.equal(GameEngine.filterFreshEvents([event]).length,1);
  assert.equal(GameEngine.filterFreshEvents([event]).length,0);
  GameEngine.applyEventChoice(event.id,0,[event]);const before=JSON.stringify(gs);
  GameEngine.applyEventChoice(event.id,0,[event]);assert.equal(JSON.stringify(gs),before);
});
test('answered and completed debate checkpoints do not reroll or rescore',()=>{
  const gs=start(),ctx=debateContext(gs);
  DebateRound.answer(ctx,0);const checkpoint=JSON.parse(JSON.stringify(ctx)),before=JSON.stringify(gs);
  assert.equal(DebateRound.answer(checkpoint,0),null);assert.equal(JSON.stringify(gs),before);
  for(ctx.idx=1;ctx.idx<ctx.questions.length;ctx.idx++) {ctx.answered=false;DebateRound.answer(ctx,0);}
  const first=DebateRound.complete(ctx),after=JSON.stringify(gs);
  assert.deepEqual(DebateRound.complete(JSON.parse(JSON.stringify(ctx))),first);assert.equal(JSON.stringify(gs),after);
  assert.ok(ctx.questions.length<=7);assert.ok((ctx.followUps||0)<=2);
});
test('incumbents with a good record still face two fresh record questions per debate',()=>{
  const gs=start();gs.isIncumbentRun=true;gs.phase='general';
  gs.accountability.docket=CareerSystem.buildDocket({debt:95,deficit:-1,approval:62,gdp:3,inflation:2,signatureDone:true,signatureName:'Infrastructure'},gs.career);
  const ids=[];
  for(let i=0;i<3;i++) {const q=EventSystem.DebateSystem.generateDebateQuestions(5);assert.equal(q.filter(x=>x.isRecordQuestion).length,2);ids.push(...q.map(x=>x.id));}
  assert.equal(new Set(ids).size,15);
});

test('costly scenario follow-ups have distinct constraints and spoken answers, not topic swaps',()=>{
  start();const all=[...EventSystem.DebateSystem.primaryQuestions,...EventSystem.DebateSystem.questions];
  const costly=all.filter(q=>['Debt & Taxes','Housing','Healthcare','Climate & Energy'].includes(q.topic));
  const followups=costly.map(q=>DebateRound.followUp(q,q.responses[1],{followUps:0}));
  assert.equal(followups.length,24);assert.ok(followups.every(Boolean));
  assert.equal(new Set(followups.map(q=>q.question)).size,24);
  assert.equal(new Set(followups.flatMap(q=>q.responses.map(r=>r.text))).size,96);
  assert.ok(followups.every(q=>q.responses.every(r=>r.text.length>80)));
});

test('foundational policy answers fit either party without mutating the question bank or scores',()=>{
  start();const question=EventSystem.DebateSystem.questions.find(q=>q.id==='general_2_plan');
  const before=JSON.stringify(question),right=DebateScenarios.forParty(question,'republican');
  assert.match(right.responses[0].text,/portable private coverage/);
  assert.match(DebateScenarios.forParty(question,'democrat').responses[0].text,/public plan/);
  assert.deepEqual(right.responses.map(r=>r.effects),question.responses.map(r=>r.effects));assert.equal(JSON.stringify(question),before);
});
test('every separate war and a recurring deficit remain in the accountability record',()=>{
  const gs=start();CareerSystem.ensure(gs).wars=[1,2,3,4].map((x)=>({id:`war_1_${x}_iran`,adversaryId:'iran',adversary:'Iran',term:1,started:x,outcome:'peace',cost:x}));
  const d=CareerSystem.buildDocket({debt:103,deficit:4,gdp:2,inflation:3},gs.career);
  assert.equal(d.liabilities.filter(x=>x.id.startsWith('record_war_')).length,4);
  assert.ok(d.liabilities.some(x=>x.id==='record_deficit'));
  assert.equal(new Set(d.liabilities.map(x=>x.id)).size,d.liabilities.length);
});
test('campaign finances reconcile mandatory bills, arrears, office payroll and recovery',()=>{
  const gs=start();CampaignFinance.post(-(gs.finances.cashOnHand-100),'fixture_spend');
  CampaignFinance.post(-1000,'mandatory_bill',{}, {mandatory:true});
  assert.equal(gs.finances.cashOnHand,0);assert.equal(gs.finances.arrears,900);
  CampaignFinance.post(2000000,'donation');CampaignFinance.settleArrears();
  assert.equal(gs.finances.arrears,0);CampaignDepth.openOffice('PA');
  CampaignDepth.processWeek({financialSummary:{},newsHeadlines:[]});
  assert.equal(gs.finances.totalRaised-gs.finances.totalSpent,gs.finances.cashOnHand);
  assert.equal(gs.finances.ledger.reduce((sum,e)=>sum+e.amount,0),gs.finances.cashOnHand);
});
test('rival nominee fundraising expands once and obeys the same action and cash limits',()=>{
  const gs=start();gs.phase='general';gs.week=20;
  const ctx=OpponentCampaign.context();assert.equal(ctx.finances.weeklyHighDollar,1000000);
  OpponentCampaign.context();assert.equal(ctx.finances.weeklyHighDollar,1000000);
  OpponentCampaign.process();assert.ok(gs.aiCampaign.commandState.used<=3);assert.ok(gs.opponent.cash>=0);
  const f=gs.aiCampaign.finances;assert.equal(f.totalRaised-f.totalSpent,f.cashOnHand);
  const before=JSON.stringify(gs);assert.equal(OpponentCampaign.execute('visit',{stateId:'invalid'}).ok,false);assert.equal(JSON.stringify(gs),before);
});
test('all six authored arcs have four distinct, persistent stages with cooldowns',()=>{
  const arcs=NarrativeDirector.arcs;assert.equal(arcs.length,6);
  for(const arc of arcs) {
    const gs=start();const p=arc.phase==='presidency'?PresidencySystem.begin():null;
    if(p) {Simulation.ensure(p);p.month=26;p.term=arc.id==='succession'?2:1;p.fiscal.deficit=8;p.collapse.active=true;p.policies.push({implementation:5,effectsApplied:false});if(arc.id==='mission_creep')WarSystem.declare('iran');}
    else gs.week=4;
    gs.narrative={arcs:Object.fromEntries(arcs.filter(a=>a.id!==arc.id).map(a=>[a.id,{stage:4,last:0}])),history:[]};
    for(let stage=0;stage<4;stage++) {
      const entry=NarrativeDirector.next();assert.equal(entry.arc,arc.id);assert.equal(entry.stage,stage);
      assert.equal(NarrativeDirector.resolve({...entry,clock:entry.clock+100},0).ok,false);
      assert.equal(NarrativeDirector.resolve(entry,0).ok,true);
      assert.equal(NarrativeDirector.resolve(entry,0).ok,false);
      assert.equal(NarrativeDirector.next(),null);
      if(p)p.month+=arc.gap;else gs.week+=arc.gap;
      gs.narrative=JSON.parse(JSON.stringify(gs.narrative));
    }
    assert.equal(gs.narrative.history.length,4);assert.equal(NarrativeDirector.next(),null);
  }
});
test('interviews save spoken answers, reject duplicate answers and reserve future debates',()=>{
  const gs=start();gs.week=4;const result=InterviewSystem.start('mainstream');assert.equal(result.questions.length,3);
  assert.ok(result.questions.every(q=>q.options.length===4 && q.options.every(o=>o.text.length>30)));
  assert.ok(InterviewSystem.answer(0,0));const before=JSON.stringify(gs);
  assert.equal(InterviewSystem.answer(0,0),null);assert.equal(JSON.stringify(gs),before);
  InterviewSystem.answer(1,1);InterviewSystem.answer(2,1);assert.ok(InterviewSystem.finish());assert.equal(InterviewSystem.finish(),null);
  gs.career.usedQuestionIds=[...EventSystem.DebateSystem.primaryQuestions,...EventSystem.DebateSystem.questions].slice(0,65).map(q=>q.id);
  gs.week=6;assert.equal(InterviewSystem.isAvailable(),false);
});
test('nuclear outcomes share the conflict and career ledgers while allowing survival',()=>{
  const gs=start(),p=PresidencySystem.begin();Simulation.ensure(p);const war=WarSystem.declare('russia');
  const result=WorldSystem.resolveNuclear('russia',true);
  assert.ok(result.continues);assert.ok(p.population>0);assert.equal(war.outcome,'nuclear');assert.equal(war.resolved,true);
  assert.equal(p.world.nuclearExchanges,1);assert.equal(p.warLog.length,1);assert.equal(gs.career.wars.length,1);
  assert.equal(gs.career.wars[0].id,war.id);assert.equal(p.collapse.active,true);
  const docket=CareerSystem.buildDocket({debt:100,deficit:5},gs.career);
  assert.ok(docket.liabilities.some(x=>x.fact.includes(`${result.killed} million American civilian deaths`)));
});

test('a withdrawal ends fighting once, with no extra battle draw or duplicate reward',()=>{
  const gs=start(),p=PresidencySystem.begin();Simulation.ensure(p);const war=WarSystem.declare('iran');
  const beforeRound=war.round;assert.equal(WarSystem.fightRound('withdraw').outcome,'withdrawal');
  assert.equal(war.round,beforeRound);assert.equal(war.ended,p.month);assert.equal(PresidencySystem.atWar(),false);
  const after=JSON.stringify(gs);assert.equal(WarSystem.fightRound('hold'),null);
  assert.equal(WarSystem._settle(war,p,'victory'),null);assert.equal(JSON.stringify(gs),after);
});

test('unaffordable budget choices preserve the briefing and monthly fiscal metrics survive in career history',()=>{
  const gs=start(),p=PresidencySystem.begin();Simulation.ensure(p);p.capital=0;p.pendingEvent={kind:'budget'};
  const before=JSON.stringify(gs);assert.equal(PresidencySystem.resolveBudget(0).ok,false);
  assert.equal(PresidencySystem.resolveBudget(2).ok,false);assert.equal(JSON.stringify(gs),before);
  Simulation.fiscalMonth(p);assert.deepEqual(gs.career.fiscal.at(-1),p.fiscal.ledger.at(-1));
  assert.equal(typeof gs.career.fiscal.at(-1).borrowing,'number');
});
test('each portrait variant has a distinct one-use move with a meaningful tradeoff',()=>{
  const all=[...CandidateData.democrats,...CandidateData.republicans,...LegendData.democrats,...LegendData.republicans];
  assert.equal(all.length,44);assert.ok(all.every(c=>CandidateHooks.data[c.id]));
  const gs=start(),hook=CandidateHooks.data[gs.playerCandidate.id],before=gs.campaign[hook[3]];
  assert.equal(GameCommands.execute('candidateMove').ok,true);assert.equal(gs.campaign[hook[3]],before-hook[4]);
  assert.equal(GameCommands.execute('candidateMove').ok,false);assert.equal(gs.commandState.used,1);
});
test('corrupt monthly saves cannot enter the simulation',()=>{
  const gs=start();const p=PresidencySystem.begin();p.month=Infinity;
  assert.throws(()=>SaveStore.validate(gs));p.month=1;gs.statePolling.PA.player=NaN;assert.throws(()=>SaveStore.validate(gs));
});
