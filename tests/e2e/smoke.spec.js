const { test, expect } = require('@playwright/test');

test('title and Situation Room render without browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('ELECTION 2028');
  await page.evaluate(() => {
    GameEngine.state = GameEngine.createFreshState();
    GameEngine.setSeed(2028);
    GameEngine.state.playerCandidate = { name:'Test President', party:'Democrat' };
    GameEngine.state.transition = { senateSeats:52, capital:6, posts:{} };
    PresidencySystem.begin();
    GameUI.showScreen('presidency');
    GameUI.renderPresidency();
  });
  await expect(page.locator('#screen-presidency')).toContainText('POPULATION');
  await page.getByText('Situation Room', { exact:true }).click();
  await expect(page.locator('#screen-situation')).toContainText('GLOBAL COMMAND AUTHORITY');
  await expect(page.locator('.world-node')).toHaveCount(33);
  await page.screenshot({ path:'test-results/situation-room.png', fullPage:true });
  expect(errors).toEqual([]);
});

test('Situation Room remains usable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => {
    GameEngine.state = GameEngine.createFreshState();
    GameEngine.state.playerCandidate = { name:'Mobile President', party:'Republican' };
    GameEngine.state.transition = { senateSeats:51, capital:5, posts:{} };
    PresidencySystem.begin();
    GameUI.openSituationRoom();
  });
  await expect(page.locator('.world-map')).toBeVisible();
  await expect(page.locator('.nation-dossier')).toBeVisible();
  await page.screenshot({ path:'test-results/situation-room-mobile.png', fullPage:true });
});

test('mobile campaign UI provides touch navigation without horizontal overflow', async ({ page }) => {
  test.setTimeout(20000);
  await page.setViewportSize({ width:390, height:844 });
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => {
    GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'campaign', 'realistic');
    GameUI.showScreen('game');
    GameUI.renderGameScreen();
  });

  await expect(page.locator('#mobile-nav')).toBeVisible();
  await expect(page.getByRole('button', { name:'Campaign map' })).toBeVisible();
  await expect(page.getByRole('button', { name:'ADVANCE →' })).toBeVisible();
  await expect(page.locator('#game-center')).toBeVisible();

  await page.getByRole('button', { name:'Campaign actions' }).click();
  await expect(page.locator('#game-left-panel')).toBeVisible();
  await expect(page.locator('#game-center')).toBeHidden();

  await page.getByRole('button', { name:'Campaign intelligence' }).click();
  await expect(page.locator('#game-right-panel')).toBeVisible();

  await page.getByRole('button', { name:'Campaign events' }).click();
  await expect(page.locator('#game-center')).toBeVisible();
  await expect(page.locator('#game-center')).toContainText('Events');

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path:'test-results/mobile-campaign-ui.png' });
});

test('Campaign HQ exposes staff, field, coalition, and polling decisions', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => {
    GameEngine.state = GameEngine.createFreshState();
    GameEngine.setSeed(2028);
    GameEngine.state.playerParty = 'democrat';
    GameEngine.state.playerCandidate = CandidateData.democrats[0];
    GameEngine.state.opponentCandidate = CandidateData.republicans[0];
    GameEngine.initStatePolling();
    CampaignDepth.initialize(GameEngine.state);
    GameUI.showScreen('game');
    GameUI.renderGameScreen();
  });

  await page.locator('.action-label', { hasText:'Campaign HQ' }).click();
  await expect(page.locator('.modal-content')).toContainText('CAMPAIGN HEADQUARTERS');
  await expect(page.locator('.modal-content')).toContainText('CAMPAIGN STAFF');
  await expect(page.locator('.modal-content')).toContainText('FIELD ORGANIZATION');
  await expect(page.locator('.modal-content')).toContainText('VOTER COALITION');
  await expect(page.locator('.modal-content')).toContainText('POLLING INTELLIGENCE');

  const beforeCash = await page.evaluate(() => GameEngine.state.finances.cashOnHand);
  await page.evaluate(() => GameUI.hireCampaignStaff('pollster', 'pollster_solid'));
  await expect(page.locator('.modal-content')).toContainText('INTERNAL');
  const campaignState = await page.evaluate(() => ({
    staffer: GameEngine.state.campaignDepth.staff.pollster.name,
    cash: GameEngine.state.finances.cashOnHand,
    legacyCash: GameEngine.state.campaign.cash,
  }));
  expect(campaignState.staffer).toBe('Samira Patel');
  expect(campaignState.cash).toBeLessThan(beforeCash);
  expect(campaignState.legacyCash).toBe(campaignState.cash);
  await page.screenshot({ path:'test-results/campaign-hq.png', fullPage:true });
  expect(errors).toEqual([]);
});

test('expanded modern field and running-mate slate render in setup', async ({ page }) => {
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => {
    GameUI.playerParty = 'democrat';
    GameUI.setupStep = 3;
    GameUI.rosterTab = 'modern';
    GameUI.showScreen('select');
    GameUI.renderSetupStep();
  });
  await expect(page.locator('.candidate-card')).toHaveCount(16);
  await expect(page.locator('.candidate-card', { hasText:'J.B. Pritzker' })).toBeVisible();
  await expect.poll(() => page.locator('.candidate-card img').first().evaluate(img => img.naturalWidth)).toBe(512);
  await page.screenshot({ path:'test-results/expanded-candidate-field.png', fullPage:true });

  await page.evaluate(() => {
    GameUI.selectedDemocrat = CandidateData.democrats.find(candidate => candidate.id === 'pritzker');
    GameUI.setupStep = 5;
    GameUI.renderSetupStep();
  });
  await expect(page.locator('.vp-section-header').first()).toContainText('7 vetted choices');
  await expect(page.locator('.vp-grid').first().locator('.candidate-card')).toHaveCount(7);
  await expect(page.locator('.vp-grid').nth(1).locator('.candidate-card')).toHaveCount(15);
  await page.screenshot({ path:'test-results/expanded-vp-bench.png', fullPage:true });
});

test('portrait and broadcast art assets decode successfully', async ({ page }) => {
  await page.goto('/', { waitUntil:'domcontentloaded' });
  const result = await page.evaluate(async () => {
    const ids = [...CandidateData.democrats, ...CandidateData.republicans].map(candidate => candidate.id);
    const urls = [
      ...ids.map(id => `images/portraits/${id}.jpg`),
      'images/broadcast/debate-stage.jpg',
      'images/broadcast/election-night-studio.jpg',
      'images/broadcast/special-report-studio.jpg',
    ];
    const dimensions = await Promise.all(urls.map(url => new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve({ url, width:img.naturalWidth, height:img.naturalHeight });
      img.onerror = () => resolve({ url, width:0, height:0 });
      img.src = url;
    })));
    return dimensions;
  });
  expect(result.filter(asset => !asset.width || !asset.height)).toEqual([]);
  expect(result.filter(asset => asset.url.includes('/portraits/')).every(asset => asset.width === 512 && asset.height === 512)).toBe(true);
});

test('generated studios support live debate and election overlays', async ({ page }) => {
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => {
    GameEngine.initGame(CandidateData.democrats[0], CandidateData.republicans[0], 'player', 'realistic');
    GameEngine.state.phase = 'general';
    GameUI.debateCtx = {
      moderator: DebateContent.moderators[0], debateNumber:1,
      debateOpponent:GameEngine.state.opponentCandidate,
    };
    GameUI.showScreen('debate');
    GameUI.renderDebateStage();
  });
  await expect(page.locator('.debate-stage-set')).toBeVisible();
  expect(await page.locator('.debate-stage-set').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('debate-stage.jpg');
  await page.locator('.debate-stage-set').evaluate(el => Promise.all(el.getAnimations({ subtree:true }).map(animation => animation.finished)));
  await page.screenshot({ path:'test-results/broadcast-debate.png', fullPage:true });

  await page.evaluate(() => {
    GameUI.showScreen('election-night');
    GameUI.animateElectionNight(GameEngine.generateElectionNight());
    clearInterval(GameUI.enCtx.timer);
  });
  await expect(page.locator('.en-broadcast')).toBeVisible();
  expect(await page.locator('.election-night').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('election-night-studio.jpg');
  await page.screenshot({ path:'test-results/broadcast-election-night.png', fullPage:true });
});
