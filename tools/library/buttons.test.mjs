import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE=process.env.BASE||'http://localhost:8767';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const res=[];const ck=(n,c,d='')=>{res.push(c);console.log((c?'PASS ':'FAIL ')+n+(c?'':' -> '+String(d).slice(0,200)));};
const vis=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const st=getComputedStyle(e);if(st.display==='none'||st.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0;},sel);
const click=async(p,sel,name,opt)=>{try{await p.click(sel,Object.assign({timeout:4000},opt||{}));return true;}catch(e){ck(name+' (clickable)',false,e.message.split('\n')[0]);return false;}};
/* ---------- LIBRARY ---------- */
{const p=await (await b.newContext({viewport:{width:1280,height:860},serviceWorkers:'block'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+'/library/',{waitUntil:'networkidle'});await p.waitForTimeout(800);
 await click(p,'#gchips .chip:nth-child(4)','grade chip');ck('grade chip filters',await p.evaluate(()=>document.querySelectorAll('.shelf').length===1));
 await click(p,'#gchips .chip:nth-child(1)','all grades chip');
 await p.selectOption('#subj','Physics');ck('subject select filters',await p.evaluate(()=>[...document.querySelectorAll('.cov .tag')].every(t=>/Physics/.test(t.textContent))));await p.selectOption('#subj','all');
 await p.fill('#q','moon');ck('search filters',await p.evaluate(()=>{const t=[...document.querySelectorAll('.book')];return t.length>=1&&t.length<4;}));await p.fill('#q','');
 await click(p,'#book-sk-my-body','book cover');await p.waitForTimeout(1200);ck('book opens',await vis(p,'.rd'));
 await click(p,'#rdNext','next');await p.waitForTimeout(900);ck('next turns page',await p.evaluate(()=>/3–4/.test(document.querySelector('.rd-cnt').textContent)));
 await click(p,'#rdPrev','prev');await p.waitForTimeout(900);ck('prev turns back',await p.evaluate(()=>/1–2/.test(document.querySelector('.rd-cnt').textContent)));
 // tap zones
 const bb=await p.evaluate(()=>{const r=document.querySelector('.bk').getBoundingClientRect();return [r.x,r.y,r.width,r.height];});
 await p.mouse.click(bb[0]+bb[2]-10,bb[1]+bb[3]/2);await p.waitForTimeout(900);ck('tap right edge turns page',await p.evaluate(()=>/3–4/.test(document.querySelector('.rd-cnt').textContent)));
 await p.mouse.click(bb[0]+10,bb[1]+bb[3]/2);await p.waitForTimeout(900);ck('tap left edge turns back',await p.evaluate(()=>/1–2/.test(document.querySelector('.rd-cnt').textContent)));
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(900);ck('arrow key turns page',await p.evaluate(()=>/3–4/.test(document.querySelector('.rd-cnt').textContent)));
 const fs0=await p.evaluate(()=>getComputedStyle(document.querySelector('.bk .in')).fontSize);await click(p,'#rdBig','A+');const fs1=await p.evaluate(()=>getComputedStyle(document.querySelector('.bk .in')).fontSize);ck('A+ grows text',parseFloat(fs1)>parseFloat(fs0),fs0+'→'+fs1);
 await click(p,'#rdSmall','A-');ck('A- shrinks text',await p.evaluate(f=>getComputedStyle(document.querySelector('.bk .in')).fontSize===f,fs0),await p.evaluate(()=>getComputedStyle(document.querySelector('.bk .in')).fontSize)+' vs '+fs0);
 await click(p,'#rdRead','read aloud');ck('read aloud toggles',await p.evaluate(()=>/Stop|No voice/.test(document.getElementById('rdRead').textContent)));await click(p,'#rdRead','stop');
 // to a quiz
 for(let k=0;k<14;k++){if(await p.evaluate(()=>!!document.querySelector('.pg .qz')))break;await click(p,'#rdNext','next');await p.waitForTimeout(820);}
 const okQ=await click(p,'.pg .qz .opts button:nth-child(2)','quiz option');if(okQ){await p.waitForTimeout(200);ck('quiz option answers',await p.evaluate(()=>document.querySelector('.pg .qz .fb').textContent.length>5&&[...document.querySelectorAll('.pg .qz .opts button')].every(b=>b.disabled)));}
 // jump to the end page
 await p.evaluate(()=>{for(let i=0;i<40;i++)document.getElementById('rdNext').click();});await p.waitForTimeout(3000);
 for(let k=0;k<20;k++){if(await p.evaluate(()=>!!document.getElementById('rdDone')))break;await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(820);}
 ck('end page reached',await p.evaluate(()=>!!document.getElementById('rdDone')));
 await click(p,'#rdDone','mark finished');ck('mark finished works',await p.evaluate(()=>document.getElementById('rdDone')?.textContent.includes('Finished')));
 const hasNext=await p.evaluate(()=>!!document.getElementById('rdNextBook'));if(hasNext){const t0=await p.evaluate(()=>document.querySelector('.rd-title').textContent);await click(p,'#rdNextBook','next book');await p.waitForTimeout(1200);ck('next book opens another book',await p.evaluate(t=>document.querySelector('.rd-title').textContent!==t,t0));}
 await click(p,'#rdClose','close ×');await p.waitForTimeout(400);ck('close hides the reader',!(await vis(p,'.rd')));
 ck('finished badge on shelf',await p.evaluate(()=>!!document.querySelector('#book-sk-my-body .done')));
 ck('stats count finished',await p.evaluate(()=>+document.getElementById('stDone').textContent>=1));
 // keep-reading row
 await click(p,'#book-g3-water','another book');await p.waitForTimeout(1000);await click(p,'#rdNext','next');await p.waitForTimeout(900);
 // backdrop click closes
 await p.mouse.click(20,430);await p.waitForTimeout(400);ck('backdrop click closes',!(await vis(p,'.rd')));
 ck('keep reading row appears',await vis(p,'#cont .cont-item'));await click(p,'#cont .cont-item','keep reading item');await p.waitForTimeout(1000);ck('keep reading reopens at the bookmark',await p.evaluate(()=>/Raindrop/.test(document.querySelector('.rd-title').textContent)&&/3–4/.test(document.querySelector('.rd-cnt').textContent)));
 await p.keyboard.press('Escape');await p.waitForTimeout(300);ck('Escape closes',!(await vis(p,'.rd')));
 ck('edge shelf links point to /edge/?book=',await p.evaluate(()=>[...document.querySelectorAll('#edgeBooks a')].every(a=>/^\/edge\/\?book=/.test(a.getAttribute('href')))));
 ck('library: no JS errors',errs.length===0,errs.join('|'));await p.close();}
/* ---------- EDGE ---------- */
{const p=await (await b.newContext({viewport:{width:1280,height:860},serviceWorkers:'block'})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+'/edge/',{waitUntil:'commit'});await p.waitForFunction(()=>document.querySelector('.fb')&&document.querySelector('.tile'),null,{timeout:90000,polling:500});await p.waitForTimeout(800);
 await p.evaluate(()=>document.getElementById('qSmooth').click());
 const E=async(sel,name,check)=>{const ok=await click(p,sel,name,{force:true});if(!ok)return;await p.waitForTimeout(500);try{ck(name,await p.evaluate(check));}catch(e){ck(name,false,e.message);}};
 await E('#quiet','gate: watch without sound',()=>document.getElementById('gate').hidden);
 await E('#play','pause/play',()=>document.getElementById('play').getAttribute('aria-label')==='Play');
 await E('#next','next film',()=>document.getElementById('title').textContent==='Our Galaxy');
 await E('#prev','previous film',()=>document.getElementById('title').textContent==='The Big Bang');
 await E('#sound','sound toggle',()=>document.getElementById('sound').getAttribute('aria-pressed')==='true');
 await E('#voice','narrator toggle',()=>document.getElementById('voice').getAttribute('aria-pressed')==='true');
 await E('#auto','auto-next toggle',()=>document.getElementById('auto').getAttribute('aria-pressed')==='false');
 await E('#film-mars','film card',()=>document.getElementById('title').textContent==='Mars'&&document.getElementById('aboutH').textContent.includes('Mars'));
 await E('#t-how','facts tab',()=>!document.getElementById('pHow').hidden&&document.getElementById('pNum').hidden);
 await E('#bookBtn','open the book',()=>!document.querySelector('.bk-ov').hidden&&document.querySelector('.bk-title').textContent==='Mars');
 await p.waitForTimeout(900);await E('#bkNext','book next page',()=>/3/.test(document.querySelector('.bk-cnt').textContent));
 await E('#bkRead','book read aloud',()=>/Stop|No voice/.test(document.getElementById('bkRead').textContent));
 await E('#bkClose','book close',()=>document.querySelector('.bk-ov').hidden&&getComputedStyle(document.querySelector('.bk-ov')).display==='none');
 await E('#cfg summary','settings drawer opens',()=>document.getElementById('cfg').open);
 await E('#q4k','quality 4K',()=>document.getElementById('q4k').getAttribute('aria-pressed')==='true');await p.evaluate(()=>document.getElementById('qSmooth').click());
 await E('#novaBtn2','Ask Nova (drawer)',()=>!document.getElementById('nova').hidden);
 await E('#novaChips button','Nova chip',()=>document.querySelectorAll('.msg.u').length>=1&&document.querySelectorAll('.msg.n').length>=2);
 await E('#dp-fast','Nova depth',()=>document.getElementById('dp-fast').getAttribute('aria-checked')==='true');
 await E('#novaX','Nova close',()=>document.getElementById('nova').hidden);
 await E('#navNova','Nova from nav',()=>!document.getElementById('nova').hidden);await p.evaluate(()=>document.getElementById('novaX').click());
 // journey
 await p.evaluate(()=>document.getElementById('journey').scrollIntoView());await p.waitForTimeout(400);
 await E('#jnext','journey next',()=>/fog/.test(document.getElementById('jera').textContent));
 await E('#jprev','journey prev',()=>/Big Bang/.test(document.getElementById('jera').textContent));
 await E('#jrail button:nth-child(5)','journey rail stop',()=>/Milky Way|galaxy/i.test(document.getElementById('jera').textContent));
 await E('.journey .paths button[data-p="space"]','journey path switch',()=>document.querySelectorAll('#jrail button').length===8);
 await E('#jplay','take the tour',()=>document.getElementById('jplay').getAttribute('aria-pressed')==='true');await p.evaluate(()=>document.getElementById('jplay').click());
 await E('#jsound','journey sound',()=>document.getElementById('jsound').getAttribute('aria-pressed')==='true');
 await E('#jbookBtn','journey book button',()=>!document.querySelector('.bk-ov').hidden);await p.evaluate(()=>document.getElementById('bkClose').click());
 await E('#book-bang','library shelf cover',()=>!document.querySelector('.bk-ov').hidden&&document.querySelector('.bk-title').textContent==='The Big Bang');await p.evaluate(()=>document.getElementById('bkClose').click());
 await E('#tile-hole','gallery tile',()=>!document.querySelector('.bk-ov').hidden&&document.querySelector('.bk-title').textContent==='Black Holes');await p.evaluate(()=>document.getElementById('bkClose').click());
 await E('#topnav a[data-s="library"]','chapter nav link',()=>Math.abs(document.getElementById('library').getBoundingClientRect().top)<200);
 ck('edge: no JS errors',errs.length===0,errs.join('|'));await p.close();}
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();
