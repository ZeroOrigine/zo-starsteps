import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE=process.env.BASE||'http://localhost:8767';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const res=[];const ck=(n,c,d='')=>{res.push(c);console.log((c?'PASS ':'FAIL ')+n+(c?'':' -> '+d));};
for(const w of [1440,390]){
 const p=await (await b.newContext({viewport:{width:w,height:w>900?900:844},serviceWorkers:'block',deviceScaleFactor:1})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push(m.text());});
 await p.goto(BASE+'/library/',{waitUntil:'networkidle'});await p.waitForTimeout(1200);
 const t=await p.evaluate(()=>({books:document.querySelectorAll('.book').length,shelves:document.querySelectorAll('.shelf').length,edge:document.querySelectorAll('#edgeBooks a').length,stats:document.getElementById('stBooks').textContent+'/'+document.getElementById('stPages').textContent,chips:document.querySelectorAll('#gchips .chip').length,hscroll:document.documentElement.scrollWidth>innerWidth,canv:[...document.querySelectorAll('.cov canvas')].filter(c=>c.width>0).length}));
 ck(w+': 32 books on 8 shelves, 28 Edge books, covers drawn',t.books===32&&t.shelves===8&&t.edge===28&&t.canv>=16&&!t.hscroll,JSON.stringify(t));
 await p.screenshot({path:`libtest/lib_top_${w}.png`});
 // filter grade 4
 await p.evaluate(()=>[...document.querySelectorAll('#gchips .chip')].find(c=>c.textContent==='G4').click());await p.waitForTimeout(300);
 const f=await p.evaluate(()=>({books:document.querySelectorAll('.book').length,shelves:document.querySelectorAll('.shelf').length}));
 ck(w+': grade filter shows 4 books',f.books===4&&f.shelves===1,JSON.stringify(f));
 await p.evaluate(()=>{document.getElementById('q').value='light';document.getElementById('q').dispatchEvent(new Event('input'));});await p.waitForTimeout(300);
 const q=await p.evaluate(()=>[...document.querySelectorAll('.book .ttl b')].map(b=>b.textContent));
 ck(w+': search narrows',q.length>=1&&q.every(x=>/light/i.test(x)),JSON.stringify(q));
 // open a book
 await p.evaluate(()=>document.querySelector('.book').click());await p.waitForTimeout(1200);
 const o=await p.evaluate(()=>({open:!document.querySelector('.rd').hidden,title:document.querySelector('.rd-title').textContent,cnt:document.querySelector('.rd-cnt').textContent,cover:!!document.querySelector('.cover canvas'),cw:document.querySelector('.cover canvas')?.width}));
 ck(w+': book opens on the cover with a drawn picture',o.open&&/Light/.test(o.title)&&o.cover&&o.cw>0,JSON.stringify(o));
 await p.screenshot({path:`libtest/lib_cover_${w}.png`});
 // turn to chapter 1 and screenshot
 const steps=w>760?1:2;for(let k=0;k<steps;k++){await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(900);}
 const c1=await p.evaluate(()=>({cnt:document.querySelector('.rd-cnt').textContent,h:[...document.querySelectorAll('.bk .in h3')].map(h=>h.textContent),fig:document.querySelectorAll('.bk .fig canvas').length,drawn:[...document.querySelectorAll('.bk .fig canvas')].filter(c=>c.width>0).length,cap:document.querySelectorAll('.bk figcaption').length}));
 ck(w+': chapter pages render with figure + caption',c1.fig>=1&&c1.drawn===c1.fig&&c1.cap>=1,JSON.stringify(c1));
 await p.screenshot({path:`libtest/lib_ch_${w}.png`});
 // jump to a quiz page: find index
 const qi=await p.evaluate(()=>{const b=window.SSLib;return null;});
 for(let k=0;k<12;k++){const has=await p.evaluate(()=>!!document.querySelector('.bk .qz'));if(has)break;await p.evaluate(()=>document.getElementById('rdNext').click());await p.waitForTimeout(820);}
 const hasQ=await p.evaluate(()=>!!document.querySelector('.bk .qz'));
 if(hasQ){await p.evaluate(()=>document.querySelector('.bk .qz .opts button').click());await p.waitForTimeout(300);const r=await p.evaluate(()=>({fb:document.querySelector('.bk .qz .fb').textContent,right:document.querySelectorAll('.bk .qz .right').length,dis:[...document.querySelectorAll('.bk .qz .opts button')].every(b=>b.disabled)}));ck(w+': quiz answers and explains',r.fb.length>10&&r.right>=1&&r.dis,JSON.stringify(r));await p.screenshot({path:`libtest/lib_quiz_${w}.png`});}
 else ck(w+': found a quiz page',false,'none in 12 turns');
 // progress saved
 const pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('ss.lib')));ck(w+': bookmark saved',pr&&Object.values(pr)[0].p>0,JSON.stringify(pr));
 await p.evaluate(()=>document.getElementById('rdClose').click());await p.waitForTimeout(400);
 const closed=await p.evaluate(()=>getComputedStyle(document.querySelector('.rd')).display==='none');ck(w+': reader really disappears on close',closed,'still displayed');
 const cont=await p.evaluate(()=>({shown:!document.getElementById('cont').hidden,txt:document.getElementById('cont').textContent.slice(0,80),prog:document.querySelectorAll('.cov .prog').length}));
 ck(w+': Keep reading row + progress bar on cover',cont.shown&&cont.prog>=1,JSON.stringify(cont));
 // deep link
 await p.goto(BASE+'/library/?book=g7-gravity',{waitUntil:'networkidle'});await p.waitForTimeout(1200);
 const dl=await p.evaluate(()=>({open:!document.querySelector('.rd').hidden,t:document.querySelector('.rd-title').textContent}));ck(w+': ?book= deep link opens the book',dl.open&&/Apples/.test(dl.t),JSON.stringify(dl));
 ck(w+': no JS errors',errs.length===0,errs.join(' | ').slice(0,300));
 await p.close();
}
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();
