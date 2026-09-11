const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

global.window = globalThis;
const root = path.resolve(__dirname, '..');
for (const file of ['js/random.js', 'js/constants.js', 'js/candidates.js', 'js/states.js', 'js/vp-data.js', 'js/events.js', 'js/debate-content.js', 'js/debate-expanded.js', 'js/engine.js', 'js/game-commands.js', 'js/save-store.js', 'js/career-system.js', 'js/campaign-depth.js', 'js/world.js', 'js/war.js', 'js/presidency.js', 'js/cabinet.js', 'js/politicians-expanded.js', 'js/legends.js']) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), 'utf8'), { filename:file });
}

function presidency(seed = 1234) {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.setSeed(seed);
  GameEngine.state.playerCandidate = { name:'Test President', party:'Democrat' };
  GameEngine.state.transition = { senateSeats:52, capital:6, posts:{} };
  return PresidencySystem.begin();
}

test('seeded random streams are reproducible', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.setSeed(42);
  const first = Array.from({ length:6 }, () => GameEngine.random());
  GameEngine.setSeed(42);
  const second = Array.from({ length:6 }, () => GameEngine.random());
  assert.deepEqual(first, second);
});

test('both parties expose sixteen complete presidential candidates', () => {
  for (const candidates of [CandidateData.democrats, CandidateData.republicans]) {
    assert.equal(candidates.length, 16);
    candidates.forEach(candidate => {
      for (const key of ['charisma','debate','fundraising','discipline','mediaHandling','baseEnthusiasm','crossoverAppeal','scandalResistance']) {
        assert.equal(Number.isFinite(candidate[key]), true, `${candidate.name} missing ${key}`);
      }
    });
  }
});

test('every modern candidate has an optimized portrait asset', () => {
  for (const candidate of [...CandidateData.democrats, ...CandidateData.republicans]) {
    const portrait = path.join(root, 'images', 'portraits', `${candidate.id}.jpg`);
    assert.equal(fs.existsSync(portrait), true, `${candidate.name} portrait missing`);
    const bytes = fs.statSync(portrait).size;
    assert.ok(bytes > 20000 && bytes < 100000, `${candidate.name} portrait is not optimized`);
  }
  for (const plate of ['debate-stage.jpg','election-night-studio.jpg','special-report-studio.jpg']) {
    assert.ok(fs.statSync(path.join(root, 'images', 'broadcast', plate)).size > 100000, `${plate} missing`);
  }
});

test('every historical candidate has an optimized portrait asset', () => {
  for (const candidate of [...LegendData.democrats, ...LegendData.republicans]) {
    const portrait = path.join(root, 'images', 'portraits', `${candidate.id}.jpg`);
    assert.equal(fs.existsSync(portrait), true, `${candidate.name} portrait missing`);
    const bytes = fs.statSync(portrait).size;
    assert.ok(bytes > 20000 && bytes < 100000, `${candidate.name} portrait is not optimized`);
  }
});

test('debates cycle through fifteen substantive topics before repeating', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.setSeed(2028);
  const seen = [];
  for (let debate = 0; debate < 3; debate++) {
    seen.push(...EventSystem.DebateSystem.generateDebateQuestions().map(question => question.topic));
  }
  assert.equal(new Set(seen).size, 15);
  for (const question of EventSystem.DebateSystem.questions) {
    assert.equal(question.responses.length, 4, `${question.topic} needs four answers`);
    assert.ok(question.responses.every(response => response.text.length > 60), `${question.topic} answers need depth`);
  }
});

test('the debate director exposes sixty unique questions and spoken answers', () => {
  assert.equal(EventSystem.DebateSystem.questions.length, 60);
  assert.equal(new Set(EventSystem.DebateSystem.questions.map(q => q.question)).size, 60);
  const answers = EventSystem.DebateSystem.questions.flatMap(q => q.responses.map(r => r.text));
  assert.equal(new Set(answers).size, 240);
});

test('an eight-year debate career does not repeat exact questions', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = CandidateData.democrats[0];
  GameEngine.state.opponentCandidate = CandidateData.republicans[0];
  CareerSystem.ensure(GameEngine.state);
  GameEngine.setSeed(2032);
  const questions = [];
  for (let debate = 0; debate < 7; debate++) {
    questions.push(...EventSystem.DebateSystem.generateDebateQuestions().map(q => q.question));
  }
  assert.equal(questions.length, 35);
  assert.equal(new Set(questions).size, 35);
});

test('reelection docket turns debt, scandals, wars, and broken promises into questions', () => {
  GameEngine.state = GameEngine.createFreshState();
  const career = CareerSystem.ensure(GameEngine.state);
  career.wars.push({ adversaryId:'iran', adversary:'Iran', casualties:12, outcome:'peace', initiatedByEnemy:false });
  const docket = CareerSystem.buildDocket({
    debt:132, scandals:2, warsLost:0, inflation:3, signatureDone:false,
    signatureName:'Balance the Budget', gdp:2.1, approval:49,
  }, career);
  assert.ok(docket.liabilities.some(x => x.id === 'record_debt'));
  assert.ok(docket.liabilities.some(x => x.id.startsWith('record_war_')));
  const questions = CareerSystem.recordQuestions(docket);
  assert.ok(questions.every(q => q.isRecordQuestion && q.factCheck));
});

test('term two inherits the country, cabinet, courts, laws, debt, and crises', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = CandidateData.democrats[0];
  GameEngine.state.opponentCandidate = CandidateData.republicans[0];
  GameEngine.state.transition = { senateSeats:52, capital:6, posts:{ treasury:{ name:'Test Secretary', competence:88, loyalty:80 } } };
  const p1 = PresidencySystem.begin();
  p1.fiscal.debt = 131.9;
  p1.enacted.push({ id:'care', name:'Care Act', legacy:8, quarter:2 });
  p1.scotus.push({ pick:'the consensus moderate', quarter:5, votesFor:55 });
  p1.crisisLog.push({ id:'market', title:'Market Convulsion', success:true, quarter:3 });
  p1.policies.push({ id:'care', name:'Care Act', implementation:62, target:100, status:'ROLLING OUT' });
  p1.signature = { id:'balance', name:'Balance the Budget', done:false };
  const career = CareerSystem.ensure(GameEngine.state);
  const snapshot = CareerSystem.closeTerm(p1);
  const incumbent = GameEngine.state.playerCandidate;
  const opponent = GameEngine.state.opponentCandidate;
  GameEngine.startReelection(incumbent, opponent, 'arcade', {
    term:1, approval:52, gdp:2, inflation:3, scandals:0, warsWon:0, warsLost:0,
    debt:131.9, signatureDone:false, signatureName:'Balance the Budget',
    career, countrySnapshot:snapshot,
  }, null);
  const p2 = PresidencySystem.begin();
  assert.equal(p2.term, 2);
  assert.equal(p2.fiscal.debt, 131.9);
  assert.equal(p2.enacted[0].id, 'care');
  assert.equal(p2.scotus.length, 1);
  assert.equal(p2.crisisLog[0].id, 'market');
  assert.equal(p2.policies[0].implementation, 62);
  assert.equal(GameEngine.state.transition.posts.treasury.name, 'Test Secretary');
  assert.equal(PresidencySystem.chooseSignature('balance'), null);
});

test('war authorization and cost become permanent accountability records', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = CandidateData.democrats[0];
  GameEngine.state.transition = { senateSeats:52, capital:6, posts:{} };
  const p = PresidencySystem.begin();
  GameEngine.setSeed(88);
  const war = WarSystem.declare('caldoria', false, 'CONGRESSIONAL AUTHORIZATION');
  assert.equal(war.authorization, 'CONGRESSIONAL AUTHORIZATION');
  WarSystem.fightRound('hold');
  assert.ok(war.cost > 0);
  assert.ok(p.fiscal.ledger.some(x => x.source.includes('War with')));
  WarSystem.negotiate();
  assert.equal(GameEngine.state.career.wars[0].objective, 'COMPEL WITHDRAWAL AND RESTORE DETERRENCE');
});

test('a complete two-term lifecycle preserves history and produces record debates', () => {
  const resolveTerm = p => {
    while (!p.over) {
      if (p.pendingEvent) {
        const kind = p.pendingEvent.kind;
        if (kind === 'crisis') PresidencySystem.resolveCrisis(1);
        else if (kind === 'budget') PresidencySystem.resolveBudget(0);
        else if (kind === 'scotus') PresidencySystem.appointJustice(1);
        else if (kind === 'scandal') PresidencySystem.resolveScandal(2);
        else if (kind === 'impeachment') PresidencySystem.resolveImpeachment(true);
        else if (kind === 'warbattle' || kind === 'surprisewar') PresidencySystem.resolveWarEvent();
        else PresidencySystem.acknowledgeEvent();
        continue;
      }
      if (PresidencySystem.atWar()) PresidencySystem.act('warposture', { posture:'negotiate' });
      else if (p.fiscal.shutdown) PresidencySystem.act('reopen', {});
      else PresidencySystem.act('barnstorm', {});
      PresidencySystem.endQuarter();
    }
  };

  GameEngine.initGame(CandidateData.democrats[2], CandidateData.republicans[2], 'campaign', 'arcade');
  GameEngine.setSeed(8828);
  GameEngine.state.transition = { senateSeats:53, capital:7, posts:{ treasury:{ name:'Continuity Treasury', competence:90, loyalty:80 } } };
  const first = PresidencySystem.begin();
  PresidencySystem.chooseSignature('balance');
  first.fiscal.debt = 125;
  first.enacted.push({ id:'first_term_law', name:'First Term Law', legacy:8, quarter:1 });
  resolveTerm(first);
  const snapshot = GameEngine.state.career.countrySnapshot;
  const career = GameEngine.state.career;
  const incumbent = GameEngine.state.playerCandidate;
  const challenger = GameEngine.state.opponentCandidate;
  GameEngine.startReelection(incumbent, challenger, 'arcade', {
    term:1, approval:first.approval, gdp:first.economy.gdp, inflation:first.economy.inflation,
    scandals:first.scandals.length, warsWon:first.legacy.warsWon, warsLost:first.legacy.warsLost,
    debt:first.fiscal.debt, signatureDone:false, signatureName:'Balance the Budget',
    career, countrySnapshot:snapshot,
  }, null);
  const debate = EventSystem.DebateSystem.generateDebateQuestions(5);
  assert.ok(debate.some(q => q.isRecordQuestion));
  assert.ok(debate.some(q => q.question.includes('national debt') || q.question.includes('defining promise')));
  const second = PresidencySystem.begin();
  assert.equal(second.term, 2);
  assert.ok(second.enacted.some(law => law.id === 'first_term_law'));
  assert.equal(PresidencySystem.chooseSignature('balance'), null);
  assert.ok(PresidencySystem.chooseSignature('moonshot'));
  resolveTerm(second);
  assert.equal(second.over, true);
  assert.equal(second.term, 2);
  assert.equal(GameEngine.state.career.closedTerms.length, 2);
  assert.ok(second.timeline.some(item => item.kind === 'succession'));
  assert.ok(second.timeline.some(item => item.kind === 'legacy'));
});

test('larger ad buys have materially larger effects with diminishing returns', () => {
  const run = amount => {
    GameEngine.state = GameEngine.createFreshState();
    GameEngine.setSeed(99);
    GameEngine.state.playerCandidate = CandidateData.democrats[0];
    GameEngine.state.finances.cashOnHand = 10000000;
    GameEngine.state.campaign.cash = 10000000;
    GameEngine.state.statePolling.PA = { player:47, opponent:48, undecided:5, adSpend:0 };
    return GameEngine.applyAdBuy('PA', 'tv', amount, 'positive').impact;
  };
  const small = run(100000);
  const large = run(5000000);
  assert.ok(large > small * 2, `large=${large}, small=${small}`);
  assert.ok(large < small * 50, 'saturation should preserve diminishing returns');
});

test('campaign economy applies reserve drag, growing overhead, and donor fatigue', () => {
  GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'campaign', 'realistic');
  GameEngine.setSeed(2801);
  GameEngine.state.finances.cashOnHand = 30000000;
  const reserveRaise = GameEngine.calculateFundraising();
  GameEngine.state.finances.cashOnHand = 5000000;
  const normalRaise = GameEngine.calculateFundraising();
  assert.ok(reserveRaise < normalRaise, `reserve=${reserveRaise}, normal=${normalRaise}`);
  GameEngine.state.finances.fundraisingFatigue = 60;
  assert.ok(GameEngine.calculateFundraising() < normalRaise * .7);
  GameEngine.state.week = 30;
  GameEngine.state.phase = 'general';
  GameEngine.processFinances({});
  assert.ok(GameEngine.state.finances.lastOperatingCost >= 1000000);
});

test('strategic ad recommendations reward close, efficient electoral targets', () => {
  GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'campaign', 'realistic');
  for (const poll of Object.values(GameEngine.state.statePolling)) { poll.player = 35; poll.opponent = 60; }
  GameEngine.state.statePolling.PA.player = 48;
  GameEngine.state.statePolling.PA.opponent = 48.5;
  GameEngine.state.statePolling.PA.adSpend = 0;
  const ranked = GameEngine.getAdTargetRecommendations('digital');
  assert.ok(ranked.length > 5);
  assert.equal(ranked[0].state.id, 'PA');
  assert.ok(ranked.every((x, i) => i === 0 || ranked[i - 1].score >= x.score));
});

test('soft caps and repetition penalties stop one-action stat grinding', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = { mediaHandling:70 };
  for (let i = 0; i < 12; i++) {
    GameEngine.applyActivityEffects('townhall');
    GameEngine.applyStatMaintenance();
  }
  assert.ok(GameEngine.state.campaign.approval < 72, GameEngine.state.campaign.approval);
  assert.equal(GameEngine.state.commandState.used, 3);
  assert.equal(GameEngine.state.activityHistory.length, 3, 'only the three permitted actions can mutate stats');
});

test('campaign autopsy identifies the closest missed state and spending efficiency', () => {
  GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'campaign', 'realistic');
  GameEngine.state.finances.totalSpent = 27000000;
  const results = { winner:'opponent', playerEV:250, opponentEV:288, stateResults:{ PA:{winner:'opponent',margin:.7,ev:19}, MI:{winner:'opponent',margin:2.1,ev:15}, CA:{winner:'player',margin:20,ev:54} } };
  const report = GameEngine.buildCampaignAutopsy(results);
  assert.equal(report.tippingPoint.name, 'Pennsylvania');
  assert.equal(report.costPerEV, 108000);
});

test('three complete strategy simulations avoid runaway cash and hard-capped stats', () => {
  const strategies = ['townhall', 'fundraisingBlitz', 'fieldOffice'];
  for (const [index, activity] of strategies.entries()) {
    GameEngine.initGame(CandidateData.democrats[index], CandidateData.republicans[index], 'campaign', 'realistic');
    GameEngine.setSeed(20280 + index);
    for (let week = 0; week < 40; week++) {
      const actions = { activities:[activity], strategy:index === 0 ? 'positive' : 'contrast' };
      if (week > 15 && GameEngine.state.finances.cashOnHand > 3500000) {
        const target = GameEngine.getAdTargetRecommendations('digital')[0];
        if (target) actions.adBuys = { [target.state.id]:{ type:'digital', tone:'contrast', amount:500000 } };
      }
      GameEngine.processWeek(actions);
    }
    assert.ok(GameEngine.state.finances.cashOnHand < 40000000, `${activity} left ${GameEngine.state.finances.cashOnHand}`);
    assert.ok(GameEngine.state.campaign.approval < 99);
    assert.ok(GameEngine.state.campaign.enthusiasm < 99);
  }
});

test('Situation Room includes real continent geometry and strategic country coverage', () => {
  assert.ok(WorldSystem.LAND_PATHS.length >= 8);
  assert.ok(WorldSystem.NATIONS.length >= 30);
  for (const id of ['china','india','indonesia','pakistan','nigeria','brazil','bangladesh','russia','mexico','japan','germany','uk','france','israel','ukraine']) {
    assert.ok(WorldSystem.NATIONS.some(nation => nation.id === id), `${id} missing from the map`);
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /three\.min\.js|election-night-3d\.js/);
});

test('every modern nominee has a deep curated and wildcard running-mate bench', () => {
  for (const nominee of [...CandidateData.democrats, ...CandidateData.republicans]) {
    const options = VPData.getOptionsForCandidate(nominee);
    assert.equal(options.curated.length, 7, `${nominee.name} curated slate`);
    assert.ok(options.wildcard.length >= 15, `${nominee.name} wildcard bench`);
    assert.ok(options.curated.every(option => option.candidateId !== nominee.id && option.name !== nominee.name), `${nominee.name} cannot run with themselves`);
  }
});

test('every transition post has an expanded, valid bench for both parties', () => {
  for (const party of ['Democrat', 'Republican']) {
    for (const post of CabinetData.POSTS) {
      const options = CabinetData.OPTIONS[party][post.id];
      assert.ok(options.length >= 4, `${party} ${post.title} lacks depth`);
      options.forEach(option => {
        for (const key of ['id','name','title','competence','loyalty','controversy']) {
          assert.notEqual(option[key], undefined, `${party} ${post.id} option missing ${key}`);
        }
      });
    }
  }
});

test('the nominee and running mate cannot also accept cabinet posts', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = CandidateData.democrats.find(candidate => candidate.id === 'pritzker');
  const vp = VPData.curatedProfiles.democrat.cory_booker;
  GameEngine.state.playerTicket = { nominee:GameEngine.state.playerCandidate, vp };
  GameEngine.state.vpChoice = { id:vp.id, candidateId:vp.candidateId, name:vp.name };
  GameEngine.state.transition = { posts:{}, failed:[] };
  assert.equal(GameEngine.getCabinetOptions('treasury').some(option => option.id === 'pritzker'), false);
  assert.equal(GameEngine.getCabinetOptions('state').some(option => option.id === 'booker'), false);
});

test('a consensus cabinet nominee can clear an opposition Senate', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.setSeed(17);
  GameEngine.state.playerCandidate = CandidateData.democrats.find(candidate => candidate.id === 'newsom');
  GameEngine.state.transition = { senateSeats:44, capital:5, posts:{}, failed:[], log:[], complete:false };
  const nominee = { id:'consensus_test', name:'Consensus Nominee', title:'Career diplomat', competence:88, loyalty:65, controversy:22 };
  const result = GameEngine.nominate('state', nominee, 'floor');
  assert.equal(result.confirmed, true);
  assert.ok(result.votesFor >= 50);
});

test('an exhausted cabinet post offers a guaranteed acting official', () => {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.state.playerCandidate = CandidateData.democrats.find(candidate => candidate.id === 'newsom');
  const pool = CabinetData.OPTIONS.Democrat.energy;
  GameEngine.state.transition = { senateSeats:44, capital:0, posts:{}, failed:pool.map(option => option.id), log:[], complete:false };
  const options = GameEngine.getCabinetOptions('energy');
  assert.equal(options.length, 1);
  assert.equal(options[0].acting, true);
  const result = GameEngine.nominate('energy', options[0], 'floor');
  assert.equal(result.confirmed, true);
  assert.equal(GameEngine.state.transition.posts.energy.acting, true);
});

test('version 1 saves migrate into the living presidency schema', () => {
  const legacy = { week:20, presidency:{ quarter:5, term:1 } };
  const restored = GameEngine.deserialize(JSON.stringify(legacy));
  assert.equal(restored.saveVersion, 3);
  assert.equal(restored.presidency.population, 335);
  assert.equal(restored.presidency.calendar.monthsElapsed, 12);
  assert.equal(Object.keys(restored.presidency.world.nations).length, 33);
});

function campaign(seed = 2028) {
  GameEngine.state = GameEngine.createFreshState();
  GameEngine.setSeed(seed);
  GameEngine.state.playerCandidate = CandidateData.democrats[0];
  GameEngine.state.opponentCandidate = CandidateData.republicans[0];
  GameEngine.state.playerParty = 'democrat';
  GameEngine.initStatePolling();
  return CampaignDepth.initialize(GameEngine.state);
}

test('Campaign HQ initializes voter blocs and uncertain state polling', () => {
  const hq = campaign(50);
  assert.equal(hq.blocs.length, 8);
  assert.equal(Object.keys(hq.polling.latest).length, StateData.length);
  const pa = hq.polling.latest.PA;
  assert.ok(pa.moe >= 2);
  assert.ok(pa.sample >= 500);
  assert.equal(pa.internal, null);
});

test('staff hiring creates payroll and unlocks internal polling', () => {
  const hq = campaign(51);
  const cash = GameEngine.state.finances.cashOnHand;
  const result = CampaignDepth.hire('pollster', 'pollster_solid');
  assert.equal(result.ok, true);
  assert.ok(GameEngine.state.finances.cashOnHand < cash);
  CampaignDepth.recalculate(hq);
  assert.ok(hq.weeklyPayroll > 0);
  CampaignDepth.generatePolls(GameEngine.state);
  assert.ok(hq.polling.latest.PA.internal.moe < hq.polling.latest.PA.moe);
});

test('field offices persist and improve their target state each week', () => {
  const hq = campaign(52);
  const result = CampaignDepth.openOffice('PA');
  assert.equal(result.ok, true);
  const before = GameEngine.state.statePolling.PA.player;
  const summary = { financialSummary:{}, newsHeadlines:[] };
  CampaignDepth.processWeek(summary);
  assert.ok(GameEngine.state.statePolling.PA.player > before);
  assert.ok(hq.offices.PA.contact > 0);
  assert.ok(summary.financialSummary.payroll > 0);
});

test('coalition work changes bloc support, turnout, and contact', () => {
  const hq = campaign(53);
  const labor = hq.blocs.find(b => b.id === 'labor');
  const before = { support:labor.support, turnout:labor.turnout, contact:labor.contact };
  CampaignDepth.applyCoalitionFocus('labor');
  assert.ok(labor.support > before.support);
  assert.ok(labor.turnout > before.turnout);
  assert.ok(labor.contact > before.contact);
});

test('one strategic season simulates exactly three monthly pulses', () => {
  const p = presidency(7);
  PresidencySystem._advance();
  assert.equal(p.quarter, 2);
  assert.equal(p.calendar.monthsElapsed, 3);
  assert.equal(p.calendar.monthlyBriefings.length, 3);
});

test('Situation Room actions consume the seasonal move and persist relations', () => {
  const p = presidency(8);
  const before = p.world.nations.india.relation;
  const result = WorldSystem.act('summit', 'india');
  assert.equal(result.ok, true);
  assert.equal(p.acted, true);
  assert.ok(p.world.nations.india.relation > before);
  assert.equal(p.timeline.at(-1).kind, 'world');
});

test('nuclear exchange continues into a collapse game while population survives', () => {
  const p = presidency(9);
  p.world.defcon = 2;
  const result = WorldSystem.launchNuclear('russia');
  assert.ok(result.killed > 0);
  assert.equal(p.over, false);
  assert.equal(p.collapse.active, true);
  assert.ok(p.population > 0 && p.population < 335);
});

test('recovery actions improve systemic collapse state', () => {
  const p = presidency(10);
  p.collapse.active = true;
  p.stability.score = 20;
  p.acted = false;
  const before = p.collapse.recovery;
  const result = PresidencySystem.act('rebuild', {});
  assert.equal(result.type, 'rebuild');
  assert.ok(p.collapse.recovery > before);
  assert.equal(p.acted, true);
});
