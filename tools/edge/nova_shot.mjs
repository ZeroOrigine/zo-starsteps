import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-webgl','--disable-3d-apis','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const res=[];
for(const [name,url,w,h] of [['web','/edge/',1200,800],['store','/edge/?src=ios',390,844]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2});const p=await ctx.newPage();
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto('http://localhost:8767'+url,{waitUntil:'load'}); await p.waitForTimeout(1500);
 await p.evaluate(()=>document.getElementById('novaBtn').click()); await p.waitForTimeout(600);
 await p.evaluate(()=>{document.getElementById('novaIn').value=(location.search?'how do magnets work in my fridge':'what is dark matter made of');document.getElementById('novaForm').requestSubmit();}); await p.waitForTimeout(800);
 const info=await p.evaluate(()=>({up:!!document.getElementById('novaUp'),href:document.getElementById('novaUp').href,target:document.getElementById('novaUp').target,store:document.documentElement.classList.contains('ss-store'),last:[...document.querySelectorAll('#novaLog .msg')].pop().textContent}));
 let gate=null;
 if(name==='store'){
   const popup=ctx.waitForEvent('page',{timeout:1500}).catch(()=>null);
   await p.evaluate(()=>document.getElementById('novaUp').click()); await p.waitForTimeout(400);
   gate=await p.evaluate(()=>{const g=document.getElementById('novaGate');return {shown:!!g,text:g&&g.textContent.slice(0,120)}});
   const pg=await popup; gate.openedWithoutAnswer=!!pg;
   // wrong answer then right answer
   await p.evaluate(()=>{const g=document.getElementById('novaGate');g.querySelector('input').value='1';g.querySelector('form').requestSubmit();}); await p.waitForTimeout(200);
   gate.afterWrong=await p.evaluate(()=>!!document.getElementById('novaGate')&&document.getElementById('novaGate').querySelector('input').placeholder);
   await p.screenshot({path:'edge/nova_store.png',animations:'disabled'});
   const popup2=ctx.waitForEvent('page',{timeout:2500}).catch(()=>null);
   await p.evaluate(()=>{const g=document.getElementById('novaGate');const m=/what is (\d+) × (\d+)/.exec(g.textContent);g.querySelector('input').value=String(m[1]*m[2]);g.querySelector('form').requestSubmit();});
   const pg2=await popup2; gate.openedAfterRight=pg2?pg2.url():null; gate.gateGone=await p.evaluate(()=>!document.getElementById('novaGate'));
 } else {
   await p.screenshot({path:'edge/nova_web.png',animations:'disabled',clip:{x:w-420,y:h-620,width:420,height:620}});
 }
 console.log(name,JSON.stringify(info),JSON.stringify(gate)); await ctx.close();
}
await b.close();
