import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE=process.env.BASE||'http://localhost:8767';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const shot=async(p,sel,path)=>{if(process.env.NOSHOT)return;try{const bb=await p.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y+scrollY,width:r.width,height:r.height};},sel);await p.screenshot({path,clip:{x:bb.x,y:bb.y,width:bb.width,height:Math.min(bb.height,3000)},fullPage:true,timeout:90000,animations:'disabled'});}catch(e){console.log('shot skipped',path);}};
const click=(p,sel)=>p.evaluate(s=>document.querySelector(s).click(),sel);
const res=[];const ck=(n,c,d='')=>{res.push(c);console.log((c?'PASS ':'FAIL ')+n+(c?'':' -> '+d));};
for(const w of [1440,390]){
 const p=await (await b.newContext({viewport:{width:w,height:w>900?900:844},serviceWorkers:'block'})).newPage();
 const errs=[],con=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')con.push(m.text());});
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
 await p.goto(BASE+'/edge/',{waitUntil:'commit'}); await p.waitForFunction(()=>window.THREE&&document.querySelector('.fb')&&document.querySelector('.tile'),null,{timeout:60000,polling:500}); await p.waitForTimeout(1500);
 const t=await p.evaluate(()=>({three:!!window.THREE,films:document.querySelectorAll('.fb').length,books:document.querySelectorAll('.bookc').length,tiles:document.querySelectorAll('.tile').length,
   rail:document.querySelectorAll('#jrail button').length,months:document.querySelectorAll('#jmonths div').length,era:document.getElementById('jera').textContent,cal:document.getElementById('jcalDate').textContent,
   nav:[...document.querySelectorAll('#topnav .tab b')].map(a=>a.textContent).join(','),tabs:[...document.querySelectorAll('.panel')].map(x=>x.id+':'+(getComputedStyle(x).display!=='none')).join(' '),vendor:[...document.scripts].filter(s=>/\/edge\/vendor\//.test(s.src)).length,
   err:document.querySelector('.err')?.textContent||'',doors:!!document.querySelector('.ss-doors'),hscroll:document.documentElement.scrollWidth>innerWidth}));
 ck(w+': three.js from our server, 14 films, 28 books, 20 tiles', t.three&&t.films===14&&t.books===28&&t.tiles===20&&t.vendor===8, JSON.stringify(t));
 ck(w+': journey: 13 stops, 12 months, Big Bang shown, nav has Journey', t.rail===13&&t.months===12&&/Big Bang/.test(t.era)&&t.nav==='Films,Journey,Library,Gallery'&&t.tabs==='p-films:true p-journey:false p-library:false p-gallery:false', JSON.stringify(t));
 ck(w+': no horizontal scroll, no 3D error', !t.hscroll&&!t.err, t.err);
 if(!process.env.NOSHOT)try{await p.screenshot({path:`edge/shot_top_${w}.png`,timeout:60000,animations:'disabled'});}catch(e){}
 // begin the voyage without sound
 await click(p,'#quiet'); await p.waitForTimeout(1500);
 const f=await p.evaluate(()=>({gate:document.getElementById('gate').hidden,title:document.getElementById('title').textContent,time:document.getElementById('time').textContent}));
 ck(w+': film starts', f.gate&&f.title==='The Big Bang', JSON.stringify(f));
 await shot(p,'.screen',`edge/shot_film_${w}.png`);
 // journey: switch path, step
 await click(p,'#tab-journey'); await p.waitForTimeout(600);
 const tb=await p.evaluate(()=>({j:getComputedStyle(document.getElementById('p-journey')).display,f:getComputedStyle(document.getElementById('p-films')).display,sel:document.querySelector('#topnav .tab[aria-selected="true"]').id,hash:location.hash,playing:document.getElementById('play').textContent}));
 ck(w+': Journey tab shows journey, hides films, pauses film, sets hash', tb.j!=='none'&&tb.f==='none'&&tb.sel==='tab-journey'&&tb.hash==='#journey'&&tb.playing==='▶', JSON.stringify(tb));
 await click(p,'#jnext'); await p.waitForTimeout(400);
 const j1=await p.evaluate(()=>({era:document.getElementById('jera').textContent,cal:document.getElementById('jcalDate').textContent,count:document.getElementById('jcount').textContent}));
 ck(w+': journey next stop works + calendar', /fog/.test(j1.era)&&/January/.test(j1.cal), JSON.stringify(j1));
 await click(p,'.journey .paths button[data-p="space"]'); await p.waitForTimeout(400);
 const j2=await p.evaluate(()=>({n:document.querySelectorAll('#jrail button').length,era:document.getElementById('jera').textContent,book:document.getElementById('jbookName').textContent}));
 ck(w+': Beyond Earth path has 8 stops', j2.n===8&&/monster/.test(j2.era)&&j2.book==='Black Holes', JSON.stringify(j2));
 await shot(p,'.journey',`edge/shot_journey_${w}.png`);
 // open a book from the journey
 await click(p,'#jbookBtn'); await p.waitForTimeout(900);
 const bk=await p.evaluate(()=>({open:!document.querySelector('.bk-ov').hidden,title:document.querySelector('.bk-title').textContent,cnt:document.querySelector('.bk-cnt').textContent}));
 ck(w+': book opens from journey', bk.open&&bk.title==='Black Holes', JSON.stringify(bk));
 if(!process.env.NOSHOT)try{await p.screenshot({path:`edge/shot_book_${w}.png`,timeout:60000,animations:'disabled'});}catch(e){} await p.evaluate(()=>document.getElementById('bkClose').click()); await p.waitForTimeout(300);
 // Nova offline answer
 await click(p,'#navNova'); await p.waitForTimeout(400); await p.evaluate(()=>{const i=document.getElementById('novaIn');i.value='what is a black hole';document.getElementById('novaForm').requestSubmit();}); await p.waitForTimeout(900);
 const nv=await p.evaluate(()=>({mode:document.getElementById('novaMode').textContent,last:[...document.querySelectorAll('.msg.n')].pop()?.textContent||''}));
 ck(w+': Nova answers offline, no Claude mention', /Offline/.test(nv.mode)&&nv.last.length>40&&!/Claude in the chat/.test(nv.last), JSON.stringify(nv).slice(0,200));
 ck(w+': no JS errors', errs.length===0&&con.filter(c=>!/favicon|fonts.g|net::ERR/.test(c)).length===0, errs.join('|')+con.join('|'));
 await p.close();
}
console.log(res.filter(Boolean).length+'/'+res.length); await b.close();
