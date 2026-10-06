import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-webgl','--disable-3d-apis','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
for(const [name,w,h] of [['desk',1440,900],['ipad',820,1180],['phone',390,844]]){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2})).newPage();
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto('http://localhost:8767/edge/#'+(process.env.TAB||'films'),{waitUntil:'load'}); await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>{const n=document.getElementById('topnav');const r=n.getBoundingClientRect();return {y:r.top,h:r.height,hs:document.documentElement.scrollWidth>innerWidth}});
 console.log(name,JSON.stringify(r));
 await p.screenshot({path:`edge/bar_${name}.png`,clip:{x:0,y:Math.max(0,r.y-8),width:w,height:r.h+24},animations:'disabled'});
 await p.close();
}
await b.close();
