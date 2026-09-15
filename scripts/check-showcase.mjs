import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '../.tools/node_modules/playwright/index.mjs';
const root=process.cwd();
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))throw Error();const data=await fs.readFile(file);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.gif':'image/gif'})[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(4174,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
const ready=page=>page.waitForFunction(()=>!document.querySelector('#showcase-play').disabled);
const touch=async(page,dx)=>page.locator('.scrapbook-stage').evaluate((el,dx)=>{el.dispatchEvent(new TouchEvent('touchstart',{touches:[new Touch({identifier:0,target:el,clientX:220,clientY:180})]}));el.dispatchEvent(new TouchEvent('touchend',{changedTouches:[new Touch({identifier:0,target:el,clientX:220+dx,clientY:180})]}));},dx);
try{
 for(const width of [1440,390,320]){
  const page=await browser.newPage({viewport:{width,height:width===1440?1000:844},hasTouch:width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4174');await page.waitForTimeout(3300);
  await page.locator('#archive [data-open-scrapbook]').click();await ready(page);
  const scroll=await page.evaluate(()=>scrollY);
  assert.equal(await page.locator('#showcase-download').evaluate(el=>getComputedStyle(el).cursor),'pointer');
  assert.equal(await page.locator('[data-story-preset] small').first().evaluate(el=>getComputedStyle(el).cursor),'pointer');
  assert.equal(await page.locator('#custom-cursor').evaluate(el=>getComputedStyle(el).visibility),'hidden');
  assert.match(await page.locator('#scrapbook-counter').innerText(),/PAGE 01/);
  for(const [id,pages,duration] of [['highlights',[1,3,8,10,11],20],['all',[1,2,3,4,5,6,7,8,9,10,11],66]]){
   await page.locator(`[data-story-preset='${id}']`).click();await ready(page);
   assert.equal(await page.locator('#story-progress button').count(),pages.length);
   assert.equal(await page.locator(`[data-story-preset='${id}']`).getAttribute('aria-pressed'),'true');
   assert.match(await page.locator('#showcase-play').innerText(),/Play story/);
   for(const [i,n] of pages.entries()){
    await page.locator('#story-progress button').nth(i).click();
    assert.match(await page.locator('#scrapbook-counter').innerText(),new RegExp(`PAGE ${String(n).padStart(2,'0')}`));
    if([1,8,10,11].includes(n)&&width!==320){await page.waitForTimeout(100);await page.screenshot({path:`artifacts/art-${width}-${id}-${n}.png`});}
   }
   assert.equal(await page.locator('[data-scrapbook-next]').isDisabled(),true);
   await page.locator('#showcase-restart').click();
   assert.match(await page.locator('#story-time').innerText(),new RegExp(`0:00 / ${duration===66?'1:06':'0:20'}`));
   const downloadEvent=page.waitForEvent('download');await page.locator('#showcase-download').click();const download=await downloadEvent;
   assert.equal(await download.failure(),null);assert.match(await page.locator('#showcase-download').innerText(),/MB/);
  }
  await page.locator('#story-progress button').nth(7).click();const savedTime=await page.locator('#story-time').innerText();
  await page.locator('#story-read').click();
  await page.waitForFunction(()=>!document.querySelector('#scrapbook-zoom').disabled);
  assert.ok((await page.locator('#scrapbook-page').getAttribute('src')).endsWith('page-08.png'));
  await page.locator('#scrapbook-zoom').click();
  assert.ok(await page.locator('#scrapbook-viewport').evaluate(el=>el.scrollWidth>=el.clientWidth*1.99&&el.scrollHeight>=el.clientHeight*1.99));
  await page.locator('#scrapbook-zoom').click();
  assert.equal(await page.locator('#scrapbook-zoom').getAttribute('aria-pressed'),'false');
  await page.locator('#showcase-return').click();assert.equal(await page.locator('#story-time').innerText(),savedTime);
  await page.keyboard.press('ArrowRight');assert.match(await page.locator('#scrapbook-counter').innerText(),/PAGE 09/);
  await touch(page,-100);assert.match(await page.locator('#scrapbook-counter').innerText(),/PAGE 10/);
  await touch(page,0);assert.equal(await page.locator('#showcase-play').innerText(),'Pause story');
  await touch(page,0);assert.match(await page.locator('#showcase-play').innerText(),/Resume/);
  await page.locator('#showcase-play').click();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.match(await page.locator('#showcase-play').innerText(),/Resume/);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  const frozen=await page.locator('#showcase-canvas').evaluate(el=>el.toDataURL());await page.waitForTimeout(300);
  assert.equal(await page.locator('#showcase-canvas').evaluate(el=>el.toDataURL()),frozen);
  for(let i=0;i<22;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.querySelector('#scrapbook-modal').contains(document.activeElement)),true);}
  assert.ok(await page.locator('.scrapbook-reader').evaluate(el=>el.scrollWidth<=innerWidth));
  await page.keyboard.press('Escape');assert.equal(await page.locator('#scrapbook-modal').evaluate(el=>el.open),false);
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-scroll)<3);assert.equal(await page.locator('#archive [data-open-scrapbook]').evaluate(el=>el===document.activeElement),true);
  assert.deepEqual(errors,[]);console.log(`PASS ${width}px: both presets, every segment, downloads/pointers, zoom, story restore, swipe/tap, visibility, focus, scroll`);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 let release;const gate=new Promise(r=>release=r);
 await page.route('**/page-02.png',async route=>{await gate;await route.continue();});
 await page.goto('http://127.0.0.1:4174');await page.waitForTimeout(3300);await page.locator('#archive [data-open-scrapbook]').click();await ready(page);
 await page.locator("[data-story-preset='all']").click();await page.locator("[data-story-preset='highlights']").click();await ready(page);release();await page.waitForTimeout(300);
 assert.equal(await page.locator('#story-progress button').count(),5);assert.match(await page.locator('#scrapbook-counter').innerText(),/PAGE 01/);
 await page.reload();await page.waitForTimeout(3300);await page.locator('#archive [data-open-scrapbook]').click();await ready(page);
 await page.locator('#story-read').click();await page.waitForFunction(()=>!document.querySelector('#scrapbook-zoom').disabled);
 let releasePage;const pageGate=new Promise(r=>releasePage=r);await page.route('**/page-05.png',async route=>{await pageGate;await route.continue();});
 await page.locator('#scrapbook-thumbnails button').nth(4).click();await page.locator('#scrapbook-thumbnails button').nth(6).click();
 await page.waitForFunction(()=>document.querySelector('#scrapbook-page').src.endsWith('page-07.png'));releasePage();await page.waitForTimeout(200);
 assert.ok((await page.locator('#scrapbook-page').getAttribute('src')).endsWith('page-07.png'));
 await page.route('**/page-06.png',route=>route.abort());await page.locator('#scrapbook-thumbnails button').nth(5).click();
 await page.waitForFunction(()=>!document.querySelector('#scrapbook-error').hidden);
 await page.unroute('**/page-06.png');await page.locator('#scrapbook-thumbnails button').nth(5).click();
 await page.waitForFunction(()=>document.querySelector('#scrapbook-page').src.endsWith('page-06.png')&&!document.querySelector('#scrapbook-page').hidden);
 assert.equal(await page.locator('#scrapbook-modal').evaluate(el=>el.getAnimations({subtree:true}).length),0);
 await page.locator('#showcase-return').click();await ready(page);
 await page.evaluate(()=>window.filmGrain?.pause());await page.clock.install();await page.clock.pauseAt(new Date());
 await page.locator('#showcase-restart').click();await page.locator('#showcase-play').click();
 for(let i=0;i<5;i++){await page.clock.runFor(i===0?4100:4000);assert.match(await page.locator('#scrapbook-counter').innerText(),new RegExp(`PAGE ${['03','08','10','11','01'][i]}`));}
 await page.locator("[data-story-preset='all']").click();await ready(page);assert.match(await page.locator('#showcase-play').innerText(),/Play story/);
 await page.locator('#showcase-play').click();for(let i=0;i<11;i++){await page.clock.runFor(i===0?6100:6000);assert.match(await page.locator('#scrapbook-counter').innerText(),new RegExp(`PAGE ${String((i+1)%11+1).padStart(2,'0')}`));}
 await page.keyboard.press('Escape');assert.equal(await page.locator('#scrapbook-modal').evaluate(el=>el.getAnimations({subtree:true}).length),0);
 console.log('PASS races, image error/retry, reduced motion and complete 20/66-second playback loops');await page.close();
}finally{await browser.close();server.close();}
