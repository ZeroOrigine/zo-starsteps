import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
// screenshots of the four tabs at desktop, iPad and phone widths (software WebGL, so the film shows)
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox',...(process.env.NOGL?['--disable-webgl','--disable-3d-apis']:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']),'--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const BASE=process.env.BASE||'http://localhost:8767';
const VP=Object.fromEntries(Object.entries({desk:[1440,900],ipad:[820,1180],phone:[390,844]}).filter(([k])=>!process.env.ONLY||process.env.ONLY.split(',').includes(k)));
for(const [name,[w,h]] of Object.entries(VP)){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1})).newPage();
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+'/edge/',{waitUntil:'commit'});
 await p.waitForFunction(()=>document.querySelector('.tile')&&document.querySelector('.bookc'),null,{timeout:90000,polling:500});
 await p.evaluate(()=>{const q=document.getElementById('quiet');if(q)q.click();}); await p.waitForTimeout(1500);
 for(const t of ['films','journey','library','gallery']){
  await p.evaluate(t=>{EdgeTabs.set(t,{scroll:true});scrollTo(0,0);},t); await p.waitForTimeout(700);
  const info=await p.evaluate(()=>({h:document.documentElement.scrollHeight,hs:document.documentElement.scrollWidth>innerWidth,navH:document.getElementById('topnav').getBoundingClientRect().height}));
  console.log(name,t,JSON.stringify(info));
  await p.screenshot({path:`edge/tab_${name}_${t}.png`,fullPage:t!=='films',animations:'disabled',timeout:120000});
 }
 // sticky bar mid-page on the library tab
 await p.evaluate(()=>{EdgeTabs.set('library');scrollTo(0,700);}); await p.waitForTimeout(400);
 await p.screenshot({path:`edge/tab_${name}_sticky.png`,animations:'disabled',timeout:120000});
 await p.close();
}
await b.close();
