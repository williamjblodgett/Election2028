const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

global.window = globalThis;
const root = path.resolve(__dirname, '..');
for (const file of ['js/random.js', 'js/constants.js', 'js/candidates.js', 'js/states.js', 'js/vp-data.js', 'js/engine.js', 'js/campaign-depth.js', 'js/world.js', 'js/presidency.js', 'js/cabinet.js', 'js/politicians-expanded.js']) {
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

test('every modern nominee has a deep curated and wildcard running-mate bench', () => {
  for (const nominee of [...CandidateData.democrats, ...CandidateData.republicans]) {
    const options = VPData.getOptionsForCandidate(nominee);
    assert.equal(options.curated.length, 7, `${nominee.name} curated slate`);
    assert.equal(options.wildcard.length, 15, `${nominee.name} wildcard bench`);
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

test('version 1 saves migrate into the living presidency schema', () => {
  const legacy = { week:20, presidency:{ quarter:5, term:1 } };
  const restored = GameEngine.deserialize(JSON.stringify(legacy));
  assert.equal(restored.saveVersion, 3);
  assert.equal(restored.presidency.population, 335);
  assert.equal(restored.presidency.calendar.monthsElapsed, 12);
  assert.equal(Object.keys(restored.presidency.world.nations).length, 28);
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
