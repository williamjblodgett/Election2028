/** Real commands, fixed initialization seeds, no poll/stat injections or forced wins. */
require('./load-game.cjs');
const fs=require('node:fs'),path=require('node:path');
const E=GameEngine;
const strategies=['field','advertising','coalition','balanced'];
const zero=()=>({viral:0,donors:0,press:0,authenticity:0,policy:0,base:0,suburban:0});
function debate() {
  const gs=E.state,primaryMode=gs.phase==='primary';
  const rival=primaryMode?gs.primary.rivals.filter(r=>!r.droppedOut).sort((a,b)=>b.support-a.support)[0]:gs.opponentCandidate;
  const ctx={questions:EventSystem.DebateSystem.generateDebateQuestions(5),idx:0,answered:false,playerScores:zero(),opponentScores:zero(),questionWins:{player:0,opponent:0,tie:0},primaryMode,debateOpponent:rival||gs.opponentCandidate,opponentStrategy:gs.playerParty==='democrat'?'republican_moderate':'democrat_moderate'};
  for(;ctx.idx<ctx.questions.length;ctx.idx++) {
    ctx.answered=false;
    const q=ctx.questions[ctx.idx];
    const scores=q.responses.map((r,i)=>({i,score:Object.values(r.effects).reduce((a,b)=>a+b,0)+(q.issueKey&&r.stance!==undefined?(Math.abs((gs.platform[q.issueKey]||0)-r.stance)<=1?3:-4):0)}));
    DebateRound.answer(ctx,scores.sort((a,b)=>b.score-a.score)[0].i);
  }
  DebateRound.complete(ctx);
}
function run(seed,party,difficulty,strategy,index=0) {
  const players=party==='democrat'?CandidateData.democrats:CandidateData.republicans;
  const opponents=party==='democrat'?CandidateData.republicans:CandidateData.democrats;
  const gs=E.initGame(players[index%16],opponents[(index*7+3)%16],'campaign',difficulty,seed);
  E.assignRunningMates(VPData.chooseRunningMate(gs.playerCandidate),VPData.chooseRunningMate(gs.opponentCandidate));
  // Same eight-point setup available to every UI player.
  CampaignFinance.post(3000000,'party_launch_support');gs.campaign.enthusiasm+=10;gs.campaign.baseTurnout+=6;
  gs.campaign.mediaScore+=8;gs.campaign.groundGame+=10;gs.campaign.surrogateStrength+=10;gs.campaign.onlineInfluence+=8;
  let ending=null;
  while(gs.week<=gs.totalWeeks) {
    const arc=NarrativeDirector.next(gs);if(arc && arc.phase!=='presidency') NarrativeDirector.resolve(arc,0);
    if(gs.week===2) E.activateSecurityDetail();
    if(gs.week===20 && !gs.conventionDone) E.processConvention();
    const ranked=StateData.map(s=>({s,p:CampaignDepth.getPoll(s.id)})).filter(x=>x.p).sort((a,b)=>b.s.electoralVotes/(2+Math.abs(b.p.margin))-a.s.electoralVotes/(2+Math.abs(a.p.margin)));
    const cmd=(type,p)=>GameCommands.execute(type,p);
    if(gs.finances.cashOnHand<900000) cmd('activity',{activity:'fundraisingBlitz'});
    else {
      if(gs.week===1) cmd('candidateMove');
      if(gs.phase==='primary') {
        // A competent primary campaign still builds a general-election strategy.
        cmd('activity',{activity:'rally'});cmd('coalition',{coalition:gs.playerParty==='democrat'?'labor':'rural'});cmd('activity',{activity:'townhall'});
      } else if(strategy==='field') {
        for(const x of ranked.slice(0,2)) cmd('visit',{stateId:x.s.id});
        cmd('activity',{activity:gs.week>=32?'gotv':'fieldOffice'});
        if(gs.week%6===0 && gs.finances.cashOnHand>3500000) CampaignDepth.openOffice(ranked[0].s.id);
      } else if(strategy==='advertising') {
        cmd('activity',{activity:'rally'});cmd('activity',{activity:'townhall'});cmd('activity',{activity:gs.week%3===0?'debatePrep':'podcast'});
      } else if(strategy==='coalition') {
        for(const id of (gs.playerParty==='democrat'?['labor','suburban','women']:['rural','suburban','veterans'])) cmd('coalition',{coalition:id});
      } else {
        cmd('visit',{stateId:ranked[0].s.id});cmd('activity',{activity:'townhall'});cmd('coalition',{coalition:gs.week%2?'suburban':'youth'});
      }
    }
    const budget=Math.max(0,Math.min(strategy==='advertising'?4000000:2000000,(gs.finances.cashOnHand-2200000)*(strategy==='advertising'?.45:.25)));
    const buy=Math.floor(budget/3/50000)*50000;
    if(buy>=50000) for(const x of E.getAdTargetRecommendations('tv').slice(0,3)) cmd('ad',{stateId:x.state.id,channel:'tv',tone:'contrast',amount:buy});
    const result=E.processWeek({strategy:'positive'});
    for(const evt of result.events) {
      const choices=evt.choices.map((c,i)=>({i,score:Object.values(c.effects||{}).reduce((a,b)=>a+b,0)-(c.riskLevel==='desperate'?10:0)}));
      E.applyEventChoice(evt.id,choices.sort((a,b)=>b.score-a.score)[0].i,result.events);
    }
    if(result.gameOver==='lostNomination'||result.gameOver==='assassinated') {ending=result.gameOver;break;}
    if(result.isDebateWeek) debate();
  }
  const result=ending?null:E.calculateElectionResult();
  if(gs.finances.cashOnHand<0 || (gs.commandState?.used||0)>3 || (gs.aiCampaign?.commandState?.used||0)>3) throw Error('Command invariant failed');
  if(Math.abs(gs.finances.totalRaised-gs.finances.totalSpent-gs.finances.cashOnHand)>1) throw Error('Cash reconciliation failed');
  return {seed,party,difficulty,strategy,candidate:gs.playerCandidate.id,opponent:gs.opponentCandidate.id,winner:ending?'opponent':result.winner,ending:ending||'election',ev:result?.playerEV||0,endingCash:gs.finances.cashOnHand};
}
if(require.main===module) {
  const samples=Number(process.env.BALANCE_SAMPLES||64),runs=[];
  for(const difficulty of ['arcade','realistic']) for(const party of ['democrat','republican']) for(const strategy of strategies) {
    for(let i=0;i<samples;i++) runs.push(run(740001+i,party,difficulty,strategy,i));
    const subset=runs.filter(r=>r.difficulty===difficulty&&r.party===party&&r.strategy===strategy);
    console.log(`${difficulty} ${party} ${strategy}: ${subset.filter(r=>r.winner==='player').length}/${samples}`);
  }
  const groups=['arcade','realistic'].map(difficulty=>{
    const subset=runs.filter(r=>r.difficulty===difficulty),winRate=subset.filter(r=>r.winner==='player').length/subset.length*100;
    const rates=strategies.map(strategy=>{const set=subset.filter(r=>r.strategy===strategy);return {strategy,winRate:set.filter(r=>r.winner==='player').length/set.length*100};});
    const spread=Math.max(...rates.map(x=>x.winRate))-Math.min(...rates.map(x=>x.winRate));
    const target=difficulty==='arcade'?[65,80]:[40,60];
    return {difficulty,winRate,strategies:rates,spread,target,passed:winRate>=target[0]&&winRate<=target[1]&&spread<=10};
  });
  const report={generated:new Date().toISOString(),runs:runs.length,method:'Paired seeds; all 32 modern nominees; four legal command strategies; eight setup points; primary losses count; actual event and debate resolution; no forced winners.',groups,details:runs};
  fs.mkdirSync(path.join(__dirname,'../reviews'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'../reviews/balance-latest.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(groups,null,2));
  if(samples>=64&&!groups.every(g=>g.passed)) process.exitCode=1;
}
module.exports={run,debate};
