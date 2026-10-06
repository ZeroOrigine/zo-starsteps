import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const BASE=process.env.BASE||'http://localhost:8767';
for(const w of [1440,390]){const p=await (await b.newContext({viewport:{width:w,height:w>900?900:844},deviceScaleFactor:1})).newPage();
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+'/edge/',{waitUntil:'commit'});await p.waitForFunction(()=>document.querySelector('.fb')&&document.querySelector('.tile'),null,{timeout:90000,polling:500});await p.evaluate(()=>document.getElementById('quiet').click());await p.waitForTimeout(1500);
 await p.evaluate(()=>{const e=document.querySelector('.err');if(e)e.remove();});
 const h=await p.evaluate(()=>document.documentElement.scrollHeight);console.log(w,'height',h);
 await p.screenshot({path:`edge/full_${w}.png`,fullPage:true,animations:'disabled',timeout:120000});await p.close();}
await b.close();
