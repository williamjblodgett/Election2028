/** End-to-end careers: UI controls only. No game-state reads, writes or fixture wins. */
const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const visible=async loc=>await loc.isVisible().catch(()=>false);
const click=async(page,name)=>page.getByRole('button',{name,exact:typeof name==='string'}).first().click();
async function setup(page,config) {
  await page.goto('/');await click(page,'NEW CAMPAIGN');await click(page,'NEXT');
  await click(page,config.party==='democrat'?/🔵 Democrat/:/🔴 Republican/);await click(page,'NEXT');
  await page.getByLabel(`Select ${config.nominee}`,{exact:true}).click();await click(page,'NEXT');
  await page.getByLabel(`Select ${config.opponent}`,{exact:true}).click();await click(page,'NEXT');
  await page.locator('.vp-card').filter({hasText:config.vp}).first().click();await click(page,'NEXT');
  await click(page,config.adverse?/Chaos/:/Arcade/);await page.getByLabel('Optional scenario seed').fill(String(config.seed));await click(page,'NEXT');
  if(!config.adverse) for(const name of ['War Chest','War Chest','Ground Swell','Ground Swell','Media Darling','Party Machine','Party Machine','Digital Army']) await click(page,`Increase ${name}`);
  await click(page,'NEXT');await click(page,'START CAMPAIGN');
}
async function buyAds(page,count=2,amount=500000) {
  for(let i=0;i<count;i++) {
    await click(page,/📡 Run Ads/);await click(page,/TV · broad persuasion/);await click(page,/⚖️ Contrast/);
    const slider=page.getByRole('slider',{name:'Ad budget'});await slider.press('Home');
    for(let step=0;step<amount/50000-1;step++)await slider.press('ArrowRight'); // exact visible budget, using the keyboard
    await expect(slider).toHaveValue(String(amount));
    if(await page.getByRole('button',{name:'LAUNCH AD CAMPAIGN'}).isEnabled())await click(page,'LAUNCH AD CAMPAIGN');
    else {await click(page,'Close dialog');break;}
  }
}
async function answerEvents(page,record) {
  if(!await visible(page.locator('.event-card').first()))return;
  for(let n=0;n<12 && await visible(page.locator('.event-card').first());n++) {
    const card=page.locator('.event-card').first();
    const title=await card.locator('.event-title').innerText();
    const options=await card.locator('button').allTextContents();
    const choice=options.findIndex(t=>/safe/i.test(t));
    record.events.push(title);await card.locator('button').nth(choice>=0?choice:0).click();
  }
}
async function modal(page,record) {
  const dialog=page.getByRole('dialog');if(!await visible(dialog))return false;
  const title=await dialog.locator('#modal-title').innerText();record.encounters.push(title);
  if(/SIGNATURE INITIATIVE/.test(title)) {
    const options=dialog.locator('.signature-option');
    const balance=options.filter({hasText:'Balance the Budget'});
    const peace=options.filter({hasText:/Peace/});
    await (await balance.count()?balance:await peace.count()?peace.first():options.first()).click();
  } else if(await visible(dialog.locator('.cabinet-option').first())) {
    const cards=dialog.locator('.cabinet-option'),texts=await cards.allTextContents();
    let index=texts.findIndex(t=>/SMOOTH SAILING/.test(t));if(index<0)index=texts.findIndex(t=>/SOME FRICTION/.test(t));if(index<0)index=0;
    await cards.nth(index).getByRole('button').click();
  } else if(/Hearing Strategy/.test(title))await click(page,/Straight to the floor/);
  else if(/THE SENATE VOTES/.test(title))await dialog.getByRole('button',{name:'CONTINUE',exact:true}).click({timeout:10000});
  else if(await visible(dialog.getByRole('button',{name:/LAUNCH RE-ELECTION/})))await click(page,/LAUNCH RE-ELECTION/);
  else if(await visible(dialog.getByRole('button',{name:'TO THE WAR ROOM',exact:true})))await click(page,'TO THE WAR ROOM');
  else if(/THE BUDGET DEADLINE/.test(title)) {
    const reform=dialog.getByRole('button',{name:/Negotiate a funded fiscal reform/});
    await (await reform.isEnabled()?reform:dialog.getByRole('button',{name:/Pass a clean budget/})).click();
  }
  else if(/STATE OF THE UNION/.test(title))await click(page,/National Unity —/);
  else if(/STRIKE THE TONE/.test(title))await click(page,/Sober —/);
  else if(/SUPREME COURT/.test(title))await click(page,/The consensus moderate/);
  else if(/SCANDAL:/.test(title)) {
    const cooperate=dialog.getByRole('button').filter({hasText:/Cooperate|cooperate/});
    await (await cooperate.count()?cooperate.first():dialog.locator('.interview-answer').first()).click();
  } else if(await visible(dialog.locator('.bill-card').first())) {
    const affordable=dialog.locator('.bill-actions button:not([disabled])');
    if(await affordable.count())await affordable.first().click();else await click(page,'Close dialog');
  } else if(await visible(dialog.locator('.interview-answer').first()))await dialog.locator('.interview-answer:not([disabled])').first().click();
  else {
    const buttons=dialog.getByRole('button').filter({hasNotText:'Close dialog'});
    const actionable=dialog.locator('#modal-body button:not([disabled])');
    if(await actionable.count())await actionable.first().click();else await click(page,'Close dialog');
  }
  return true;
}
async function play(page,config,testInfo) {
  page.setDefaultTimeout(8000);
  const record={...config,method:'Visible UI controls only; no hidden state access, injected fixtures, forced results, or calendar jumps.',events:[],encounters:[],questions:[],elections:[],months:[]};
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});await setup(page,config);
  const weeksDone=new Set(),monthsDone=new Set();let security=false,reloadChecked=false,legacy='';
  let failure;
  try {
  for(let iteration=0;iteration<1600;iteration++) {
    if(iteration%25===0)fs.writeFileSync(testInfo.outputPath('career-progress.json'),JSON.stringify(record,null,2));
    if(errors.length)throw Error(errors.join('\n'));
    if(await modal(page,record))continue;
    if(await visible(page.locator('#walkout-2d-skip'))) {await page.locator('#walkout-2d-skip').click();continue;}
    if(await visible(page.locator('.debate-response-card').first())) {
      const text=await page.locator('#debate-transcript .transcript-line.moderator .transcript-text').last().innerText();
      expect(record.questions).not.toContain(text);record.questions.push(text);
      const answers=page.locator('.debate-response-card');
      const topic=await page.locator('.chyron-topic').innerText();
      const substantive=/Give voters a concrete governing plan/.test(text)||topic.startsWith('INCUMBENT RECORD');
      await answers.nth(config.adverse?3:substantive?0:1).click();
      if(!reloadChecked) {
        const tally=await page.locator('#debate-tally').innerText();
        await page.reload();await click(page,/^CONTINUE/);
        await expect(page.locator('#debate-tally')).toHaveText(tally);reloadChecked=true;
      }
      continue;
    }
    if(await visible(page.locator('#debate-continue-btn'))) {await page.locator('#debate-continue-btn').click();continue;}
    if(await visible(page.getByRole('button',{name:'RETURN TO CAMPAIGN',exact:true})) && await visible(page.locator('#screen-debate'))) {await click(page,'RETURN TO CAMPAIGN');continue;}
    if(await visible(page.locator('#en-skip-btn'))) {await page.locator('#en-skip-btn').click();continue;}
    if(await visible(page.getByRole('button',{name:/NEGOTIATE A CROSS-PARTY GOVERNING AGREEMENT/}))) {await click(page,/NEGOTIATE A CROSS-PARTY GOVERNING AGREEMENT/);continue;}
    if(await visible(page.locator('.winner-banner'))) {
      const banner=await page.locator('.winner-banner').innerText();
      if(!record.elections.includes(banner)) {record.elections.push(banner);await page.screenshot({path:testInfo.outputPath(`election-${record.elections.length}.png`),fullPage:true});}
      if(await visible(page.getByRole('button',{name:'FINISH THE TERM →',exact:true}))) {await click(page,'FINISH THE TERM →');continue;}
      if(await visible(page.getByRole('button',{name:/FORM YOUR GOVERNMENT/}))) {await click(page,/FORM YOUR GOVERNMENT/);continue;}
      legacy=banner;break;
    }
    if(await visible(page.getByRole('button',{name:/BEGIN YOUR PRESIDENCY/}))) {await click(page,/BEGIN YOUR PRESIDENCY/);continue;}
    if(await visible(page.locator('.cabinet-card.open').first())) {await page.locator('.cabinet-card.open').first().click();continue;}
    if(await visible(page.getByRole('button',{name:'BEGIN SECOND-TERM TRANSITION',exact:true}))) {await click(page,'BEGIN SECOND-TERM TRANSITION');continue;}
    if(await visible(page.locator('.career-archive'))) {legacy=await page.locator('#presidency-content').innerText();break;}
    if(await visible(page.locator('#screen-presidency'))) {
      const label=await page.locator('.pres-kicker').innerText();
      const month=Number(label.match(/MONTH (\d+)/)?.[1]),term=Number(label.match(/TERM (\d+)/)?.[1]);
      if(!monthsDone.has(label)) {
        record.months.push(label);monthsDone.add(label);
        if(month%6===1 && await page.getByRole('button',{name:/Push Legislation/}).isEnabled())await click(page,/Push Legislation/);
        else if(month%6===2 && await page.getByRole('button',{name:/Foreign Tour/}).isEnabled())await click(page,/Foreign Tour/);
        else if(month%6===3 && await visible(page.getByRole('button',{name:/Advance:/})) && await page.getByRole('button',{name:/Advance:/}).isEnabled())await click(page,/Advance:/);
        else if(await visible(page.getByRole('button',{name:/Barnstorm the Country/})) && await page.getByRole('button',{name:/Barnstorm the Country/}).isEnabled())await click(page,/Barnstorm the Country/);
        if(await visible(page.getByRole('dialog')))continue;
      }
      if(await visible(page.getByRole('button',{name:'RETURN TO CAMPAIGN',exact:true})) && /RESOLVE BRIEFING/.test(await page.locator('.pres-end-quarter').innerText())===false && !await page.getByRole('button',{name:/Barnstorm the Country/}).isEnabled()) {
        // The month still advances through its normal briefing control before return.
      }
      await page.locator('.pres-end-quarter').click();continue;
    }
    if(await visible(page.locator('#screen-game'))) {
      const top=await page.locator('#game-top-bar').innerText(),week=Number(top.match(/Week (\d+)/i)?.[1]);
      const year=top.includes('2032')?2032:2028,key=`${year}:${week}`;
      await answerEvents(page,record);
      if(!weeksDone.has(key)) {
        weeksDone.add(key);console.log(`${config.party} UI ${key}`);
        if(!security&&!config.adverse) {await click(page,/🛡️ Security Detail/);security=true;}
        if(!config.adverse) {
          if(week>16 && week%2===0) {
            await click(page,/Visit State/);
            await page.getByRole('dialog').locator('.action-btn').first().click();
          } else await click(page,/📢 Hold Rally/);
          if(await visible(page.getByRole('button',{name:/GOTV Push/})))await click(page,/GOTV Push/);else await click(page,/🏛️ Town Hall Win/);
          await click(page,/🤝 Build Coalition/);await click(page,week<=16?/⚒️ Labor & Unions Boost/:/🏡 Suburban Voters/);
          if(week===17) {
            await click(page,/Campaign HQ/);
            for(const state of ['Nevada','Arizona','Pennsylvania']) {
              const office=page.locator('.hq-office').filter({hasText:state});
              if(await office.count()) for(let level=0;level<2;level++) {
                const upgrade=office.getByRole('button');if(await upgrade.isEnabled())await upgrade.click();
              }
            }
            await click(page,'Close dialog');
          }
          const cash=top.match(/\$([\d.]+)([MK])/),funds=cash?Number(cash[1])*(cash[2]==='M'?1e6:1e3):0;
          if(funds>3500000)await buyAds(page,week<=16?2:3,week>=38&&funds>6500000?2000000:week>=32&&funds>10000000?2000000:week>16&&funds>6500000?1000000:500000);
        }
      }
      await click(page,'ADVANCE →');continue;
    }
    if(await visible(page.locator('.tragedy-screen'))) {legacy=await page.locator('.tragedy-screen').innerText();break;}
    // Wait only for ordinary authored transitions, never mutate app state.
    await page.waitForTimeout(250);
  }
  } catch(error) {failure=error;record.failure=error.message;}
  record.legacy=legacy;record.errors=errors;record.reloadChecked=reloadChecked;
  fs.writeFileSync(testInfo.outputPath('career.json'),JSON.stringify(record,null,2));
  await page.screenshot({path:testInfo.outputPath('legacy.png'),fullPage:true});
  if(failure)throw failure;
  expect(errors).toEqual([]);expect(legacy).not.toBe('');
  if(!config.adverse) {
    expect(record.elections).toHaveLength(2);expect(record.elections.every(x=>x.includes('VICTORY!'))).toBe(true);
    expect(legacy).toContain('TWO TERMS SERVED');expect(legacy).toContain('2036');
    expect(record.months).toHaveLength(96);expect(reloadChecked).toBe(true);
  } else expect(legacy).not.toContain('TWO TERMS SERVED');
}
for(const config of [
  {party:'democrat',nominee:'Gretchen Whitmer',opponent:'J.D. Vance',vp:'Josh Shapiro',seed:2028},
  {party:'republican',nominee:'Marco Rubio',opponent:'Gavin Newsom',vp:'Tim Scott',seed:2032},
  {party:'democrat',nominee:'Kamala Harris',opponent:'Ron DeSantis',vp:'Wes Moore',seed:2033,adverse:true},
])test(`@career ${config.party} ${config.adverse?'adverse':'two-term'} visible-controls playthrough`,async({page},testInfo)=>{
  test.setTimeout(900000);await play(page,config,testInfo);
});
