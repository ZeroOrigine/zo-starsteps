import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-webgl','--disable-3d-apis','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const BASE='http://localhost:8767';
const shots=[['home_desk','/',1440,900,0],['home_ipad','/',820,1180,0],['home_phone','/',390,844,0],['home_doors','/#doors',1440,900,null],['lib_desk','/library/',1200,300,0],['lib_phone','/library/',390,300,0],['play_phone','/play/',390,844,0],['parents_desk','/parents/',1200,200,0]];
for(const [name,url,w,h,y] of shots){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1})).newPage();
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+url,{waitUntil:'load'}); await p.waitForTimeout(1200);
 if(name==='home_doors'){await p.evaluate(()=>document.getElementById('doors').scrollIntoView());await p.waitForTimeout(300);}
 if(name==='play_phone'){await p.evaluate(()=>{const b=document.querySelector('button.tab[data-tab="today"]');if(b)b.click();});await p.waitForTimeout(500);}
 const info=await p.evaluate(()=>({hs:document.documentElement.scrollWidth>innerWidth,nova:document.querySelectorAll('a[data-nova]').length,doors:document.querySelectorAll('.doorsnav a').length,topH:(document.querySelector('.top,.ss-doors')||{getBoundingClientRect:()=>({height:0})}).getBoundingClientRect().height}));
 console.log(name,JSON.stringify(info));
 await p.screenshot({path:`edge/np_${name}.png`,animations:'disabled'}); await p.close();
}
await b.close();
