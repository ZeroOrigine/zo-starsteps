import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE='http://localhost:8767';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const res=[];const ck=(n,c,d='')=>{res.push(c);console.log((c?'PASS ':'FAIL ')+n+(c?'':' -> '+d));};
for(const w of [390,1440]){
 const p=await (await b.newContext({viewport:{width:w,height:w>900?900:844},serviceWorkers:'block'})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(BASE+'/privacy/');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('starsteps.v2',JSON.stringify({name:'Maya',grade:2,stars:120,onboarded:true,themeSet:1}));localStorage.setItem('ss.lib',JSON.stringify({'g2-the-moon':{p:7,t:Date.now()}}));});
 await p.goto(BASE+'/play/',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
 const t=await p.evaluate(()=>({tabs:[...document.querySelectorAll('#tabbar .tab')].map(x=>x.textContent.trim()),href:document.querySelector('#tabbar .tab-books')?.getAttribute('href'),card:document.querySelector('.book-card')?.textContent.trim(),cardHref:document.querySelector('.book-card')?.getAttribute('href'),visible:!!document.querySelector('.book-card')&&getComputedStyle(document.querySelector('.book-card')).display!=='none',tabW:document.querySelector('#tabbar .tab-books')?.getBoundingClientRect().width,hscroll:document.documentElement.scrollWidth>innerWidth}));
 ck(w+': Books tab in bar (7 tabs) and Today card with bookmark',t.tabs.length===7&&t.href==='/library/?from=play'&&/page 8/.test(t.card||'')&&t.cardHref==='/library/?book=g2-the-moon'&&t.visible&&!t.hscroll,JSON.stringify(t));
 await p.screenshot({path:`libtest/play_${w}.png`});
 await p.evaluate(()=>document.querySelector('#tabbar .tab[data-tab="games"]').click());await p.waitForTimeout(300);
 const cur=await p.evaluate(()=>document.querySelector('#tabbar .tab[aria-current]')?.dataset.tab);ck(w+': tabs still switch',cur==='games',cur);
 ck(w+': no JS errors',errs.length===0,errs.join('|'));
 await p.goto(BASE+'/',{waitUntil:'networkidle'});await p.waitForTimeout(800);
 const h=await p.evaluate(()=>({doors:document.querySelectorAll('.door').length,hs:document.documentElement.scrollWidth>innerWidth,nav:[...document.querySelectorAll('.nav a')].map(a=>a.textContent).join(',')}));
 ck(w+': home shows three doors',h.doors===3&&!h.hs&&/Library/.test(h.nav),JSON.stringify(h));
 await p.evaluate(()=>document.getElementById('doors').scrollIntoView());await p.waitForTimeout(300);await p.screenshot({path:`libtest/home_${w}.png`});
 await p.close();}
console.log(res.filter(Boolean).length+'/'+res.length);await b.close();
