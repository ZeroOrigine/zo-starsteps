// Validate a Star Steps Library book JSON. Usage: node validate.mjs <file.json> [...more]
import fs from 'fs';
const SP='/tmp/claude-0/-home-claude/4b3afc06-246e-5478-b440-46a46d6cfa84/scratchpad/ssproj/public/library/';
// collect scene names by loading the art files in a fake window
const g={window:{},document:{createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>({addColorStop(){}})}),width:0,height:0})},matchMedia:()=>({matches:false})};
globalThis.window=g.window;globalThis.document=g.document;
for(const f of ['art-core.js','art-life.js','art-world.js','art-space.js'])new Function(fs.readFileSync(SP+f,'utf8'))();
const LOCAL=new Set(Object.keys(window.LART.scenes)),SPACE=new Set(Object.keys(window.ART.scenes));
const BUDGET={0:[12,40],1:[20,55],2:[35,80],3:[50,100],4:[70,130],5:[90,155],6:[110,185],7:[130,240]};
const PAGES={0:[20,28],1:[20,30],2:[22,34],3:[24,38],4:[26,42],5:[28,46],6:[30,51],7:[32,51]}; // content pages (cover, contents, end are added: total 23–54)
const words=s=>String(s).trim().split(/\s+/).filter(Boolean).length;
let allOk=true;
for(const file of process.argv.slice(2)){
 const errs=[],warn=[];let b;
 try{b=JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){console.log('FAIL',file,'not valid JSON:',e.message);allOk=false;continue;}
 const need=['id','title','subtitle','grade','subject','minutes','cover','pages'];need.forEach(k=>{if(b[k]==null)errs.push('missing '+k);});
 if(!/^(sk|g[1-7])-[a-z0-9-]+$/.test(b.id||''))errs.push('id must look like g2-magnets or sk-forces');
 const gr=+b.grade;if(!(gr>=0&&gr<=7))errs.push('grade must be 0..7');
 const pref=gr===0?'sk':'g'+gr;if(b.id&&!b.id.startsWith(pref+'-'))errs.push('id prefix must match grade ('+pref+'-)');
 const sceneOk=s=>s&&(LOCAL.has(s)||(s.startsWith('space:')&&SPACE.has(s.slice(6))));
 if(b.cover){if(!sceneOk(b.cover.scene))errs.push('cover.scene unknown: '+b.cover.scene);if(!Array.isArray(b.cover.c)||b.cover.c.length!==2)errs.push('cover.c must be two colours');}
 const P=b.pages||[];const [pmin,pmax]=PAGES[gr]||[20,51];if(P.length<pmin||P.length>pmax)errs.push('content pages '+P.length+' outside '+pmin+'–'+pmax+' for grade '+gr+' (total with cover/contents/end = '+(P.length+3)+')');
 const total=P.length+3;if(total<23||total>54)errs.push('total pages '+total+' not in 23–54');
 const kinds={};const [wmin,wmax]=BUDGET[gr]||[50,200];
 P.forEach((pg,i)=>{const at='page '+(i+1)+' ('+pg.k+')';kinds[pg.k]=(kinds[pg.k]||0)+1;
  if(!['ch','try','quiz','big','words','think'].includes(pg.k)){errs.push(at+': unknown k');return;}
  if(pg.art&&!sceneOk(pg.art.s))errs.push(at+': unknown scene '+pg.art.s);
  if(pg.k==='ch'){if(!pg.h)errs.push(at+': no heading');if(!Array.isArray(pg.p)||!pg.p.length)errs.push(at+': p must be a non-empty array');else{const n=pg.p.reduce((a,x)=>a+words(x),0);if(n<wmin||n>wmax)errs.push(at+': '+n+' words, budget '+wmin+'–'+wmax);if(pg.p.some(x=>/\n/.test(x)))errs.push(at+': no line breaks inside paragraphs');}
   if(!pg.art)warn.push(at+': no picture');if(pg.art&&!pg.cap)warn.push(at+': picture without caption');}
  if(pg.k==='try'){if(!Array.isArray(pg.steps)||pg.steps.length<2)errs.push(at+': steps needs 2+ items');if(!pg.h)errs.push(at+': no heading');}
  if(pg.k==='quiz'){if(!pg.q||!Array.isArray(pg.opts)||pg.opts.length<2||pg.opts.length>4)errs.push(at+': q and 2–4 opts');if(!(pg.a>=0&&pg.a<(pg.opts||[]).length))errs.push(at+': a must index opts');if(!pg.why)errs.push(at+': why missing');}
  if(pg.k==='big'){if(!pg.h||!pg.art)errs.push(at+': big needs h and art');if(pg.p&&pg.p.reduce((a,x)=>a+words(x),0)>60)errs.push(at+': big text over 60 words');}
  if(pg.k==='words'){if(!Array.isArray(pg.items)||pg.items.length<4||pg.items.length>12)errs.push(at+': 4–12 word pairs');else pg.items.forEach(it=>{if(!Array.isArray(it)||it.length!==2)errs.push(at+': each item is [word, meaning]');});}
  if(pg.k==='think'){if(!Array.isArray(pg.qs)||pg.qs.length<2||pg.qs.length>4)errs.push(at+': 2–4 questions');}
  const txt=JSON.stringify(pg);if(/\bClaude\b|Anthropic|ChatGPT/.test(txt))errs.push(at+': no AI product names in the book');if(/[“”‘’]/.test(txt))warn.push(at+': curly quotes; straight quotes preferred');});
 if((kinds.ch||0)<Math.ceil(P.length*.55))errs.push('chapters are '+(kinds.ch||0)+' of '+P.length+' pages; need at least 55%');
 if((kinds.quiz||0)<2||(kinds.quiz||0)>6)errs.push('need 2–6 quiz pages, have '+(kinds.quiz||0));
 if((kinds.words||0)!==1)errs.push('need exactly one words page');if((kinds.think||0)!==1)errs.push('need exactly one think page');
 if(P.length&&P[P.length-1].k!=='think')errs.push('last page must be think');if(P.length>1&&P[P.length-2].k!=='words')errs.push('second-to-last page must be words');
 if((kinds.big||0)<1)warn.push('no big picture spread');if((kinds.try||0)<1)warn.push('no try-it page');
 const scenesUsed=new Set(P.filter(p=>p.art).map(p=>p.art.s));if(scenesUsed.size<Math.min(5,Math.floor(P.length/5)))warn.push('only '+scenesUsed.size+' different scenes; vary the pictures');
 const tw=P.reduce((a,pg)=>a+words((pg.p||[]).join(' '))+words(pg.h||'')+words(pg.fact||'')+words((pg.steps||[]).join(' ')),0);
 console.log((errs.length?'FAIL ':'PASS ')+file+'  grade '+gr+' · '+total+' pages · '+tw+' words · kinds '+JSON.stringify(kinds));
 errs.forEach(e=>console.log('   ERROR '+e));warn.forEach(e=>console.log('   warn  '+e));if(errs.length)allOk=false;
}
process.exit(allOk?0:1);
