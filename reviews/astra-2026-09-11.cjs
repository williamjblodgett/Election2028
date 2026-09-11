// Diagnostic review, not a replacement for end-to-end playtesting.
// Production modules run in a disposable process; no browser saves are touched.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
global.window = globalThis;
const root = path.resolve(__dirname, '..');
for (const file of ['random','constants','candidates','states','vp-data','events','debate-content','debate-expanded','engine','career-system','campaign-depth','world','war','presidency','cabinet','politicians-expanded','legends']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, 'js', `${file}.js`), 'utf8'), { filename:`js/${file}.js` });
}
const results = [];
function campaign(seed=2028) {
  const originalSeed=GameRandom.createSeed;
  GameRandom.createSeed=()=>seed;
  try { GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'campaign', 'arcade'); }
  finally { GameRandom.createSeed=originalSeed; }
  GameEngine.setSeed(seed);
  return GameEngine.state;
}
function president(seed=2028) {
  const gs = campaign(seed);
  gs.transition = { senateSeats:52, capital:6, posts:{} };
  return PresidencySystem.begin();
}
function seedFrom(p) {
  return { term:1, approval:p.approval, gdp:p.economy.gdp, inflation:p.economy.inflation,
    debt:p.fiscal.debt, warsLost:0, warsWon:0, scandals:p.scandals.length,
    signatureDone:false, signatureName:p.signature && p.signature.name,
    career:GameEngine.state.career, countrySnapshot:GameEngine.state.career.countrySnapshot };
}

// 1. Seed an unresolved war at the term boundary; it should survive that boundary.
let p = president();
WarSystem.declare('iran', false, 'CONGRESSIONAL AUTHORIZATION');
p.war.round=3; p.war.casualties=9; p.war.cost=7.5;
CareerSystem.closeTerm(p);
const warSeed=seedFrom(p), beforeWar=p.war.adversary.name;
GameEngine.startReelection(GameEngine.state.playerCandidate,GameEngine.state.opponentCandidate,'arcade',warSeed,null);
const warQuestions=CareerSystem.recordQuestions(GameEngine.state.accountability.docket).map(q=>q.question);
p=PresidencySystem.begin();
assert.equal(p.war,null);
assert.equal(warQuestions.some(q=>/Iran/.test(q)),false);
results.push({ finding:'Unresolved war disappears across reelection',beforeWar,afterWar:p.war,ongoingWorldConflicts:p.world.conflicts.filter(c=>!c.resolved).length,recordQuestions:warQuestions });

// 2. Split buys reset the concave spend-to-impact curve.
let gs=campaign(); gs.finances.cashOnHand=1000000;
const firstPoll=gs.statePolling.PA.player;
GameEngine.applyAdBuy('PA','tv',1000000,'positive');
const lump=gs.statePolling.PA.player-firstPoll;
gs=campaign(); gs.finances.cashOnHand=1000000;
const splitStart=gs.statePolling.PA.player;
for(let i=0;i<10;i++) GameEngine.applyAdBuy('PA','tv',100000,'positive');
const split=gs.statePolling.PA.player-splitStart;
assert.ok(split>lump*3);
results.push({ finding:'Split ad buys bypass diminishing returns',dollars:1000000,lumpPollingGain:lump,tenBuysPollingGain:split,ratio:split/lump });

// 3. Same-week repeated visits and campaign spending attribution.
gs=campaign();
const cashStart=gs.finances.cashOnHand,spentStart=gs.finances.totalSpent,visitStart=gs.statePolling.PA.player;
for(let i=0;i<10;i++) GameEngine.applyCampaignVisit('PA');
results.push({ finding:'Ten visits accepted in one week',week:gs.week,visits:gs.visitedStates.PA,pollingGain:gs.statePolling.PA.player-visitStart,cashConsumed:cashStart-gs.finances.cashOnHand,addedToTotalSpent:gs.finances.totalSpent-spentStart });

// 4. Compare the budget components with the fiscal simulation.
p=president(); const openingDebt=p.fiscal.debt;
PresidencySystem.act('barnstorm',{}); PresidencySystem._advance();
results.push({ finding:'Budget and deficit use different calculations',budget:p.fiscal.budget,displayedDeficit:p.fiscal.deficit,debtChange:p.fiscal.debt-openingDebt,ledger:p.fiscal.ledger });

// 5. Dedicated initiative actions in successive quarters, bypassing event UI only.
p=president(); PresidencySystem.chooseSignature('balance');
p.fiscal.debt=150; p.fiscal.deficit=8;
for(let i=0;i<10&&!p.signature.done;i++) { PresidencySystem.act('initiative',{}); PresidencySystem._advance(); }
assert.equal(p.signature.done,true);
results.push({ finding:'Balanced-budget achievement does not require balance',signature:p.signature,closingDebt:p.fiscal.debt,closingDeficit:p.fiscal.deficit,budget:p.fiscal.budget });

// 6. Record coverage and verbatim response repetition in a three-debate reelection.
gs=campaign(); gs.isIncumbentRun=true;
const career=CareerSystem.ensure(gs);
career.wars.push({adversaryId:'iran',adversary:'Iran',initiatedByEnemy:false,casualties:12,outcome:'peace'});
gs.accountability.docket=CareerSystem.buildDocket({debt:132,scandals:2,warsLost:0,inflation:5,signatureDone:false,signatureName:'Balance the Budget',gdp:2.1,approval:49},career);
const recordCounts=[];
for(let i=0;i<3;i++) recordCounts.push(EventSystem.DebateSystem.generateDebateQuestions(5).filter(q=>q.isRecordQuestion).length);
const recordAnswers=CareerSystem.recordQuestions(gs.accountability.docket).flatMap(q=>q.responses.map(r=>r.text));
results.push({ finding:'Reelection record coverage and repeated responses',perDebate:recordCounts,recordFraction:recordCounts.reduce((a,b)=>a+b,0)/15,missingUnfinishedPromise:!gs.accountability.docket.liabilities.some(x=>x.id==='record_promise'),totalAnswers:recordAnswers.length,uniqueAnswers:new Set(recordAnswers).size });

// 7. Result calculation is not idempotent.
gs=campaign();
const election1=GameEngine.calculateElectionResult(),election2=GameEngine.calculateElectionResult();
results.push({ finding:'Election calculation mutates results on every call',first:{ev:election1.playerEV,vote:election1.nationalPopularVote},second:{ev:election2.playerEV,vote:election2.nationalPopularVote},duplicateCareerEntries:gs.career.elections.length });

// 8. Run the exact preview calculation used by showWarRoom.
p=president(1234); const beforePreview=JSON.stringify(GameEngine.state.rng);
WarSystem.ADVERSARIES.forEach(a=>WarSystem.formCoalition(a,55,0));
results.push({ finding:'War-room preview changes RNG state',before:beforePreview,after:JSON.stringify(GameEngine.state.rng) });

// 9. Seed the newly completed second-term transition before inauguration.
p=president();
GameEngine.state.transition.posts.treasury={name:'First-term secretary',competence:70,loyalty:70};
CareerSystem.closeTerm(p); const cabinetSeed=seedFrom(p);
GameEngine.startReelection(GameEngine.state.playerCandidate,GameEngine.state.opponentCandidate,'arcade',cabinetSeed,null);
GameEngine.state.transition={senateSeats:56,capital:9,posts:{treasury:{name:'Newly confirmed secretary',competence:90,loyalty:80}}};
p=PresidencySystem.begin();
results.push({ finding:'Term-two transition overwritten',treasury:GameEngine.state.transition.posts.treasury.name,restoredSenate:p.congress.senateSeats,newlyElectedSenate:56 });

// 10. Whip-count preview is separate from the roll behind bill passage.
p=president(); const bipartisan=PresidencySystem.BILLS.find(b=>b.bipartisan);
results.push({ finding:'Whip-count preview conflicts with passage odds',bill:bipartisan.name,passageChance:PresidencySystem.billOdds(bipartisan,0),whip:PresidencySystem.whipCount(bipartisan,0) });

// 11. Old transition posts still supply bonuses after a resignation.
p=president();
GameEngine.state.transition.posts.treasury={name:'Resigned secretary',competence:95,loyalty:80};
p.administration.members.treasury={id:'treasury',name:'Resigned secretary',competence:95,loyalty:80,status:'RESIGNED'};
results.push({ finding:'Resigned cabinet bonus remains active',status:p.administration.members.treasury.status,economyBonus:PresidencySystem.cabinetEffects().econBias });

// 12. The same person can be offered as both a curated and wildcard VP.
const whitmer=CandidateData.democrats.find(c=>c.id==='whitmer'),vpOptions=VPData.getOptionsForCandidate(whitmer);
const duplicateVPs=vpOptions.curated.filter(c=>vpOptions.wildcard.some(w=>w.name===c.name)).map(c=>({name:c.name,curated:c.effects,wildcard:vpOptions.wildcard.find(w=>w.name===c.name).effects}));
results.push({ finding:'Duplicate running-mate profiles',nominees:duplicateVPs });

// 13. Build a possible 269/269 electoral map with wide state margins.
gs=campaign();
const subsets=new Map([[0,[]]]);
for(const state of StateData) {
  for(const [sum,ids] of [...subsets]) {
    const next=sum+state.electoralVotes;
    if(next<=269&&!subsets.has(next)) subsets.set(next,[...ids,state.id]);
  }
}
const tiedStates=new Set(subsets.get(269));
for(const [id,poll] of Object.entries(gs.statePolling)) {
  poll.player=tiedStates.has(id)?70:25;
  poll.opponent=tiedStates.has(id)?25:70;
  poll.undecided=5;
}
const tied=GameEngine.calculateElectionResult();
assert.equal(tied.playerEV,269); assert.equal(tied.opponentEV,269);
results.push({finding:'Electoral tie automatically awards opponent victory',playerEV:tied.playerEV,opponentEV:tied.opponentEV,winner:tied.winner});

// 14. Exercise the real save-routing logic with rendering stubbed, not a browser.
vm.runInThisContext(fs.readFileSync(path.join(root,'js/ui.js'),'utf8'),{filename:'js/ui.js'});
let saveText='',selectedScreen=null;
global.localStorage={getItem:()=>saveText};
GameUI.showScreen=screen=>{selectedScreen=screen;};
GameUI.renderGameScreen=()=>{}; GameUI.renderPresidency=()=>{}; GameUI.showToast=()=>{};
gs=campaign(); gs.week=41;
gs.transition={senateSeats:52,capital:6,posts:{},failed:[],log:[],complete:false};
saveText=GameEngine.serialize(); GameUI.loadGame();
const transitionScreen=selectedScreen;
p=PresidencySystem.begin(); p.over=true;
saveText=GameEngine.serialize(); GameUI.loadGame();
results.push({finding:'Reload routes transition and completed presidency to campaign',transitionScreen,completedPresidencyScreen:selectedScreen});
console.log(JSON.stringify(results,null,2));
