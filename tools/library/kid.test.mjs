import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const shots=[];
for(const [w,h,id] of [[390,844,'sk-light-shadow'],[1280,860,'g1-seeds']]){
 const p=await (await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,serviceWorkers:'block'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8767/library/?book='+id,{waitUntil:'networkidle'});await p.waitForTimeout(1500);
 await p.screenshot({path:`libtest/kid_cover_${w}.png`});
 const steps=w<761?[2,3,4]:[2,2];let n=0;for(const k of steps){for(let i=0;i<(w<761?1:1);i++){await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(850);}n++;await p.screenshot({path:`libtest/kid_p${n}_${w}.png`});}
 for(let k=0;k<14;k++){const has=await p.evaluate(()=>!!document.querySelector('.bk .qz'));if(has)break;await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(820);}
 await p.evaluate(()=>{const b=document.querySelector('.bk .qz .opts button');if(b)b.click();});await p.waitForTimeout(300);await p.screenshot({path:`libtest/kid_quiz_${w}.png`});
 console.log(w,'errors',errs.join('|'));await p.close();}
await b.close();
