const test = require('node:test');
const assert = require('node:assert/strict');
require('./load-game.cjs');

test('historical and older custom profiles have complete, non-mutating display data', () => {
  const stats = ['charisma', 'debate', 'fundraising', 'discipline', 'mediaHandling', 'baseEnthusiasm', 'crossoverAppeal', 'scandalResistance'];
  for (const c of [...LegendData.democrats, ...LegendData.republicans]) {
    for (const key of stats) assert.ok(Number.isFinite(c[key]) && c[key] >= 0 && c[key] <= 100, `${c.id}: ${key}`);
    assert.ok(c.slogan && c.bio);
    GameEngine.initGame(c, c.party === 'Democrat' ? CandidateData.republicans[0] : CandidateData.democrats[0], 'campaign', 'arcade', 2096);
    assert.ok(Object.values(GameEngine.state.campaign).filter(v => typeof v === 'number').every(Number.isFinite));
  }
  const oldCustom = { id: 'custom_legacy', name: 'Custom Test', isCustom: true, donorTrust: 0, scandalResistance: 50, eliteSupport: 70 };
  const original = JSON.stringify(oldCustom);
  const completed = CandidateData.completeProfile(oldCustom);
  assert.equal(completed.fundraising, 0);
  assert.equal(completed.discipline, 60);
  assert.ok(completed.bio && completed.slogan);
  assert.equal(JSON.stringify(oldCustom), original);
  assert.deepEqual(CandidateData.completeProfile(completed), completed);
  for (const c of [...CandidateData.democrats, ...CandidateData.republicans]) assert.deepEqual(CandidateData.completeProfile(c), c);
});
