import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const BASE=process.env.BASE||'http://localhost:8767';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--proxy-server='+process.env.HTTPS_PROXY,'--proxy-bypass-list=localhost;127.0.0.1']});
const VP=[['phone',390,844,3],['phoneS',360,740,2],['ipadP',820,1180,2],['ipadL',1180,820,2],['desk',1440,900,1]];
const PAGES=['/','/play/','/library/','/edge/','/parents/'];
let bad=0;
for(const [name,w,h,dpr] of VP){
 for(const path of PAGES){
  const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:w<900,hasTouch:w<900,serviceWorkers:'block'});const p=await ctx.newPage();
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,80)));
  if(path==='/play/'){await p.goto(BASE+'/privacy/');await p.evaluate(()=>{localStorage.setItem('starsteps.v2',JSON.stringify({name:'Maya',grade:2,stars:120,onboarded:true,themeSet:1}));});}
  await p.goto(BASE+path,{waitUntil:'commit'});
  if(path==='/edge/')await p.waitForFunction(()=>document.querySelector('.fb'),null,{timeout:90000,polling:500}).catch(()=>{});
  await p.waitForTimeout(path==='/edge/'?1500:2000);
  const r=await p.evaluate(()=>{
   const vw=innerWidth;const over=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>vw+2&&getComputedStyle(e).position!=='fixed'&&!e.closest('[style*="overflow"],.rail,.chips,.edge-books,.ss-doors-links,.jump,.reel,.books,pre')}).slice(0,5).map(e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''));
   const small=[...document.querySelectorAll('body *')].filter(e=>{if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return false;const r=e.getBoundingClientRect();if(r.width===0||r.height===0)return false;return parseFloat(getComputedStyle(e).fontSize)<11;}).slice(0,5).map(e=>e.tagName.toLowerCase()+'.'+(e.className&&typeof e.className==='string'?e.className.split(' ')[0]:'')+'='+getComputedStyle(e).fontSize);
   const taps=[...document.querySelectorAll('button,a[href],select,input')].filter(e=>{const r=e.getBoundingClientRect();if(r.width===0||r.height===0||r.bottom<0||r.top>innerHeight*4)return false;return Math.min(r.width,r.height)<32;}).slice(0,6).map(e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+'.'+(e.className&&typeof e.className==='string'?e.className.split(' ')[0]:'')+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
   return {hs:document.documentElement.scrollWidth>vw+1,over,small,taps,h:document.documentElement.scrollHeight};});
  const ok=!r.hs&&r.over.length===0&&r.small.length===0&&errs.length===0;if(!ok)bad++;
  console.log((ok?'PASS ':'WARN ')+name+' '+path+' h='+r.h+(r.hs?' HSCROLL':'')+(r.over.length?' over:'+r.over.join(','):'')+(r.small.length?' small:'+r.small.join(','):'')+(r.taps.length?' taps<32:'+r.taps.join(','):'')+(errs.length?' errs:'+errs.join('|'):''));
  if(name==='ipadP'||name==='ipadL')try{await p.screenshot({path:`libtest/resp_${name}_${path.replace(/\//g,'')||'home'}.png`,fullPage:false,timeout:60000,animations:'disabled'});}catch(e){}
  await ctx.close();
 }}
console.log('pages with warnings:',bad);await b.close();
