import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--disable-webgl','--disable-3d-apis','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const res=[];const ck=(n,ok,d)=>{res.push(ok);console.log((ok?'PASS ':'FAIL ')+n+(ok?'':' -> '+d));};
const W=s=>new Promise(r=>setTimeout(r,s));
for(const [page,url,w,h] of [['library','/library/',1200,800],['play','/play/',390,844],['edge','/edge/',1200,800]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 let calls=0;
 await p.route(/functions\/v1\/nova/,async r=>{calls++;const body=JSON.parse(r.request().postData()||'{}');
   if(process.env.LIVE)return r.continue();
   if(body.q==='fail')return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'not_configured',full:true})});
   const big=/story|essay/i.test(body.q);
   return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({answer:big?'Dinosaurs lived long ago and birds are their cousins.':'The sky is blue because air scatters blue light the most.',full:big,left:calls>=3?0:10-calls,limit:10,limited:calls>=3})});});
 await p.goto('http://localhost:8767'+url,{waitUntil:'load'}); await W(1500);
 if(page==='play'){await p.getByText("Skip: I’ve been here before").click().catch(()=>{});await W(600);}
 const has=await p.evaluate(()=>!!document.getElementById('ssnBtn')&&!!document.getElementById('ssn'));
 ck(page+': widget present',has);
 await p.evaluate(()=>document.getElementById('ssnBtn').click()); await W(300);
 const o=await p.evaluate(()=>({open:!document.getElementById('ssn').hidden,msgs:document.querySelectorAll('#ssnLog .ssn-m').length,chips:document.querySelectorAll('#ssnChips button').length,full:document.querySelector('.ssn-full').href}));
 ck(page+': opens with greeting + 3 chips + full link',o.open&&o.msgs===1&&o.chips===3&&/nova\.zeroorigine\.com/.test(o.full),JSON.stringify(o));
 await p.evaluate(()=>SSNova.ask('why is the sky blue')); await W(800);
 const a1=await p.evaluate(()=>({last:[...document.querySelectorAll('#ssnLog .ssn-m.n')].pop().textContent,left:document.getElementById('ssnLeft').textContent,cards:document.querySelectorAll('.ssn-card').length}));
 ck(page+': answer + counter',/blue/.test(a1.last)&&/9 of 10/.test(a1.left)&&a1.cards===0,JSON.stringify(a1));
 await p.evaluate(()=>SSNova.ask('write me a story about dinosaurs')); await W(800);
 const a2=await p.evaluate(()=>({cards:document.querySelectorAll('.ssn-card').length,card:document.querySelector('.ssn-card b')&&document.querySelector('.ssn-card b').textContent,nova:document.querySelectorAll('.ssn-card[data-nova]').length}));
 ck(page+': big question → full Nova card',a2.cards===1&&/full Nova AI/.test(a2.card)&&a2.nova===1,JSON.stringify(a2));
 await p.evaluate(()=>SSNova.ask('one more')); await W(800);
 const a3=await p.evaluate(()=>({dis:document.getElementById('ssnIn').disabled,left:document.getElementById('ssnLeft').textContent,cards:document.querySelectorAll('.ssn-card').length}));
 ck(page+': limit reached → input off + card',a3.dis&&/0 of 10/.test(a3.left)&&a3.cards===2,JSON.stringify(a3));
 await p.screenshot({path:`edge/nw_${page}.png`,animations:'disabled'});
 // failure path on a fresh page
 const p2=await ctx.newPage(); await p2.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p2.route(/functions\/v1\/nova/,r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'not_configured',full:true})}));
 await p2.goto('http://localhost:8767'+url,{waitUntil:'load'}); await W(1500);
 if(page==='play'){await p2.getByText("Skip: I’ve been here before").click().catch(()=>{});await W(600);}
 if(page==='edge')await p2.waitForFunction(()=>window.Nova&&Nova.answer,null,{timeout:20000}).catch(()=>{});
 await p2.evaluate(()=>{SSNova.open();SSNova.ask('what is a black hole');}); await W(900);
 const f=await p2.evaluate(()=>({txt:[...document.querySelectorAll('#ssnLog .ssn-m.n,#ssnLog .ssn-m.w')].map(x=>x.textContent).join(' | '),cards:document.querySelectorAll('.ssn-card').length}));
 ck(page+': API down → '+(page==='edge'?'offline notes':'full Nova card'),page==='edge'?/gravity|black hole/i.test(f.txt)&&/offline notes/.test(f.txt):(/waking up/.test(f.txt)&&f.cards===1),JSON.stringify(f).slice(0,200));
 ck(page+': no JS errors',errs.length===0,errs.join('|').slice(0,200));
 await ctx.close();
}
console.log(res.filter(Boolean).length+'/'+res.length); await b.close();
