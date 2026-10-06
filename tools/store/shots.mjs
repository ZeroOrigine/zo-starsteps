import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE=process.env.BASE||'http://localhost:8767', OUT='/tmp/claude-0/-home-claude/4b3afc06-246e-5478-b440-46a46d6cfa84/scratchpad/store/shots/';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const DEV=[['play-phone',360,640,3,'android'],['play-tablet7',600,960,2,'android'],['play-tablet10',800,1280,2,'android'],['ios-iphone69',440,956,3,'ios'],['ios-ipad13',1032,1376,2,'ios']];
const today=new Date().toISOString().slice(0,10);
for(const [name,w,h,s,src] of DEV){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:s,isMobile:true,hasTouch:true,serviceWorkers:'block',userAgent:src==='ios'?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 StarStepsApp/1.0':undefined});
  const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto(BASE+'/privacy/');
  await p.evaluate(t=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('ss.seen',String(Date.now()));
    const ids=[];localStorage.setItem('starsteps.v2',JSON.stringify({name:'Maya',grade:2,stars:640,gems:85,streak:6,bestStreak:9,onboarded:true,lessonsDone:34,perfects:6,bestCombo:9,themeSet:1,theme:'light',freezeGift:1,hearts:5,lastDay:t,todayDate:t,todayCount:2}));},today);
  await p.goto(BASE+'/play/?src='+src,{waitUntil:'networkidle'}); await p.waitForTimeout(2200);
  // give some progress so the path and sky look alive
  await p.evaluate(()=>{const t=new Date().toISOString().slice(0,10);const l=nodesFor(2).filter(n=>!n.bonus);l.slice(0,14).forEach(n=>S.crown[n.id]=n.type==='skill'?2:1);
    ['math','words','science','think','world','art','nature','space'].forEach((k,i)=>{(COURSE[2][k]||[]).slice(0,2).forEach(sk=>S.skillStats[sk.id]={n:20+i*4,right:15+i*3,last:t});});save();renderPath();renderSky&&renderSky();});
  await p.waitForTimeout(600);
  const shot=async n=>{await p.waitForTimeout(700);await p.evaluate(()=>{const t=document.getElementById('toasts');if(t)t.innerHTML='';});await p.waitForTimeout(150);await p.screenshot({path:OUT+name+'-'+n+'.png'});};
  await p.click('button.tab[data-tab="today"]'); await shot('1-today');
  await p.evaluate(()=>startNode(nodesFor(0).find(n=>n.id==='sk-shapes'))); await p.waitForTimeout(500); await p.click('#mainBtn'); await p.waitForTimeout(400); await p.click('#mainBtn'); await shot('2-lesson');
  await p.evaluate(()=>show('path')); await p.click('button.tab[data-tab="path"]'); await p.evaluate(()=>scrollTo(0,0)); await shot('3-path');
  await p.click('button.tab[data-tab="rewards"]'); await p.evaluate(()=>scrollTo(0,0)); await shot('4-rewards');
  await p.click('button.tab[data-tab="me"]'); await p.locator('.sky').scrollIntoViewIfNeeded(); await p.evaluate(()=>scrollBy(0,-60)); await shot('5-sky');
  await p.click('button.tab[data-tab="games"]'); await p.click('#pipChessBtn'); await p.waitForTimeout(400);
  await p.getByRole('button',{name:"Let's play"}).click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(800);
  await p.locator('.sq[aria-label="e2"]').click().catch(()=>{}); await p.waitForTimeout(200); await p.locator('.sq[aria-label="e4"]').click().catch(()=>{}); await p.waitForTimeout(1600); await shot('6-chess');
  // v23: the Books Library and The Edge of Knowing, in store mode
  await p.goto(BASE+'/library/',{waitUntil:'networkidle'}); await p.waitForTimeout(1500); await p.evaluate(()=>scrollTo(0,0)); await shot('7-library');
  await p.evaluate(id=>SSLib.open(id),w<700?'g2-the-moon':'g4-light'); await p.waitForTimeout(1500);
  for(let k=0;k<(w<761?3:2);k++){await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(900);} await shot('8-book');
  console.log(name,'store',await p.evaluate(()=>window.SS_STORE),'errors',errs.length);
  await ctx.close();
}
await b.close();
/* the Edge journey shot: a browser without WebGL (software 3D is too slow to screenshot); the journey is 2D canvas */
const b2=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-webgl','--disable-3d-apis','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
for(const [name,w,h,s,src] of DEV){
  const ctx=await b2.newContext({viewport:{width:w,height:h},deviceScaleFactor:s,isMobile:true,hasTouch:true,serviceWorkers:'block'});const p=await ctx.newPage();
  await p.goto(BASE+'/edge/?src='+src,{waitUntil:'load'}); await p.waitForTimeout(1500);
  await p.evaluate(()=>{const e=document.querySelector('.err');if(e)e.remove();document.getElementById('jnext').click();const st=document.querySelector('.journey .stage');st.scrollIntoView();scrollBy(0,-104);}); await p.waitForTimeout(1200);
  await p.screenshot({path:OUT+name+'-9-journey.png',timeout:90000,animations:'disabled'}); await ctx.close();}
await b2.close();
