const {test,expect}=require('@playwright/test');

test('governing controls are keyboard accessible and all metrics remain available on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.evaluate(()=>{
    GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','arcade',1928);
    PresidencySystem.begin();GameUI.startPresidency();
  });
  const signature=page.getByRole('button',{name:'Choose Balance the Budget',exact:true});
  await signature.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByText('All national indicators',{exact:true}).click();
  await expect(page.locator('.national-metrics-grid')).toContainText('Unemployment');
  await expect(page.locator('.national-metrics-grid')).toContainText('Debt:');
  await expect(page.locator('#breaking-news-ticker')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const advance=await page.locator('.pres-end-quarter').boundingBox();expect(advance.y+advance.height).toBeLessThanOrEqual(844);
  await page.screenshot({path:'test-results/monthly-mobile.png',fullPage:true});
  await page.screenshot({path:'test-results/monthly-mobile-viewport.png'});
});

test('nuclear exchange has a 2D reduced-motion map and a playable aftermath',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.evaluate(()=>{
    GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','arcade',921);
    const p=PresidencySystem.begin();Simulation.ensure(p);p.world.defcon=2;GameUI.openSituationRoom();
  });
  await page.getByLabel('Country',{exact:true}).selectOption('russia');
  await page.getByRole('button',{name:/NUCLEAR/}).click();
  // The real confirmation remains a separate, intentional player decision.
  await page.getByRole('button',{name:'AUTHENTICATE AND LAUNCH',exact:true}).click();
  await expect(page.locator('.exchange-map')).toBeVisible();
  expect(await page.locator('.exchange-path').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  await page.screenshot({path:'test-results/nuclear-exchange-2d.png',fullPage:true});
  await page.getByRole('button',{name:/AFTERMATH/}).click();
  await expect(page.locator('#screen-presidency')).toContainText('CONTINUITY CRISIS');
});

test('an early second-term ending does not claim eight completed years',async({page})=>{
  await page.goto('/');await page.evaluate(()=>{
    GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','arcade',1932);
    const p=PresidencySystem.begin();p.term=2;p.month=8;p.removedFromOffice=true;p.over=true;
    GameUI.openGoverning();
  });
  await expect(page.locator('#screen-presidency')).toContainText('AUGUST 2033');
  await expect(page.locator('#screen-presidency')).toContainText('SECOND TERM ENDED EARLY');
  await expect(page.locator('#screen-presidency')).not.toContainText('TWO TERMS SERVED');
});

test('world map zoom, pan and country selection are read-only and keyboard usable',async({page})=>{
  await page.goto('/');const before=await page.evaluate(()=>{
    GameEngine.initGame(CandidateData.democrats[0],CandidateData.republicans[0],'campaign','arcade',2128);
    PresidencySystem.begin();GameUI.openSituationRoom();return JSON.stringify(GameEngine.state);
  });
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await page.getByRole('button',{name:'Pan east',exact:true}).click();
  await expect(page.locator('.world-map')).not.toHaveAttribute('viewBox','0 0 100 42');
  await page.getByLabel('Country',{exact:true}).selectOption('uk');
  await page.getByRole('button',{name:'France',exact:true}).focus();await page.keyboard.press('Enter');
  await expect(page.locator('.nation-dossier h3')).toHaveText('France');
  expect(await page.evaluate(()=>JSON.stringify(GameEngine.state))).toBe(before);
});

test('cabinet role identities reuse the same politician portrait without missing-image requests',async({page})=>{
  await page.goto('/');const result=await page.evaluate(()=>{
    const pools=Object.values(CabinetData.OPTIONS).flatMap(p=>Object.values(p).flat());
    const role={...pools.find(p=>p.name==='Marco Rubio'),id:'transition_role_rubio'};
    return {id:Portraits.resolveId(role),html:Portraits.html(role),unknown:Portraits.resolveId({id:'unknown_cabinet',name:'Unpictured official'})};
  });
  expect(result.id).toBe('rubio');expect(result.html).toContain('images/portraits/rubio.jpg');expect(result.unknown).toBe('');
});

test.describe('published offline artifact',()=>{
  test.use({serviceWorkers:'allow'});
  test('the complete release, fonts, maps and 44 portraits load with the network disabled',async({page,context})=>{
    await page.goto('/dist/');
    await page.evaluate(async()=>{
      await navigator.serviceWorker.register('/dist/service-worker.js');
      await navigator.serviceWorker.ready;
    });
    await page.reload();await context.setOffline(true);await page.reload();
    await expect(page.getByRole('button',{name:'NEW CAMPAIGN',exact:true})).toBeVisible();
    const decoded=await page.evaluate(async()=>{
      const all=[...CandidateData.democrats,...CandidateData.republicans,...LegendData.democrats,...LegendData.republicans];
      const portraits=await Promise.all(all.map(c=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth===512);image.onerror=()=>resolve(false);image.src=Portraits.url(c.id);})));
      await Promise.all([document.fonts.load('16px "Space Grotesk"'),document.fonts.load('16px "IBM Plex Mono"')]);
      return {portraits,polygons:WorldSystem.LAND_PATHS.length,fonts:document.fonts.check('16px "Space Grotesk"')&&document.fonts.check('16px "IBM Plex Mono"')};
    });
    expect(decoded.portraits).toHaveLength(44);expect(decoded.portraits.every(Boolean)).toBe(true);
    expect(decoded.polygons).toBeGreaterThan(170);expect(decoded.fonts).toBe(true);
    await page.getByRole('button',{name:'NEW CAMPAIGN',exact:true}).click();
    await expect(page.getByRole('button',{name:'NEXT',exact:true})).toBeVisible();
    await context.setOffline(false);
  });
});
