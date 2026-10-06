/* Star Steps Library (2026-10-06): shelves by grade, a page-turning reader with living pictures,
   read-aloud, quizzes, bookmarks. Books are JSON in /library/books/. Pictures come from LART (this
   library) and ART (The Edge of Knowing). Progress lives in localStorage "ss.lib". */
(function(){
"use strict";
const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>[...(r||document).querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GRADES=['Senior Kindergarten','Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7 and up'];
const GSHORT=['SK','G1','G2','G3','G4','G5','G6','G7+'];
const AGE=['age 4–5','age 6','age 7','age 8','age 9','age 10','age 11','age 12+'];
const RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let CAT=[],PROG={};
try{PROG=JSON.parse(localStorage.getItem('ss.lib')||'{}')||{};}catch(e){PROG={};}
function saveProg(){try{localStorage.setItem('ss.lib',JSON.stringify(PROG));}catch(e){}}

/* ---------- living pictures on any canvas ---------- */
const live=new Set();let raf=0;
function sceneOf(name){if(!name)return null;if(name.startsWith('space:'))return window.ART&&ART.scenes[name.slice(6)]||null;return window.LART&&LART.scenes[name]||null;}
function seed(s){let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))|0;return h;}
function hook(root){$$('canvas[data-s]',root).forEach(cv=>{if(cv._on)return;const sc=sceneOf(cv.dataset.s);if(!sc)return;cv._on=1;cv._sc=sc;let v={};try{v=JSON.parse(cv.dataset.v||'{}');}catch(e){}cv._v=v;
 cv._st=sc.init(LART.h.rng(seed(cv.dataset.s+(cv.dataset.k||''))),v);cv._t0=performance.now()-(+cv.dataset.t||0)*1000;live.add(cv);});if(!raf)raf=requestAnimationFrame(loop);}
function loop(now){raf=0;const d=Math.min(2,window.devicePixelRatio||1);let any=false;
 for(const cv of live){if(!cv.isConnected){live.delete(cv);continue;}if(cv._paused)continue;const r=cv.getBoundingClientRect();if(r.bottom<-50||r.top>innerHeight+50||r.width===0)continue;any=true;
  let w=r.width,h=r.height;if(cv.dataset.fit==='cover'){w=Math.max(w,h*2);h=w/2;}if(cv.width!==Math.round(w*d)){cv.width=Math.round(w*d);cv.height=Math.round(h*d);}
  const c=cv.getContext('2d');c.__nl=cv.dataset.nl==='1';c.setTransform(d,0,0,d,0,0);c.save();try{cv._sc.draw(c,w,h,RM?((+cv.dataset.t||0)+3):(now-cv._t0)/1000,cv._st,cv._v);}catch(e){}c.restore();if(RM)cv._paused=1;}
 if(live.size)raf=requestAnimationFrame(loop);}
const art=(s,v,opt)=>'<canvas data-s="'+esc(s)+'" data-v="'+esc(JSON.stringify(v||{}))+'" data-k="'+esc((opt&&opt.k)||'')+'" data-t="'+((opt&&opt.t)||0)+'"'+(opt&&opt.cover?' data-fit="cover" data-nl="1"':'')+' aria-hidden="true"></canvas>';

/* ---------- sound (tiny: page flips and quiz dings, made by maths) ---------- */
const Snd=(function(){let ac=null;function get(){if(!ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ac=new AC();}if(ac.state==='suspended')ac.resume();return ac;}
 function tone(f,dur,type,vol){const a=get();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.value=f;o.connect(g);g.connect(a.destination);const t=a.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.12,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.start(t);o.stop(t+dur+.05);}
 function flip(){const a=get();if(!a)return;const n=a.sampleRate*.25,b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.8;const g=a.createGain();g.gain.value=.25;s.connect(f);f.connect(g);g.connect(a.destination);s.start();}
 return{on:true,flip(){if(this.on)flip();},good(){if(!this.on)return;tone(784,.25,'triangle');setTimeout(()=>tone(1046,.35,'triangle'),110);},bad(){if(this.on)tone(220,.3,'sine',.1);},open(){if(!this.on)return;tone(523,.2,'triangle',.08);setTimeout(()=>tone(784,.3,'triangle',.08),120);}};})();

/* ---------- voice (read aloud) ---------- */
const Voice=(function(){const ok=!!window.speechSynthesis;let voices=[],pick=null,gen=0;
 function load(){if(!ok)return;voices=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));const score=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?60:0)+(/google/i.test(v.name)?20:0)+(/^en[-_](ca|us|gb)/i.test(v.lang)?5:0)-(/compact|espeak|novelty|whisper|zarvox|bells|bad news|good news|bubbles|cellos|organ|jester|wobble|boing|bahh|albert|hysterical|superstar|trinoids/i.test(v.name)?200:0);pick=voices.slice().sort((a,b)=>score(b)-score(a))[0]||null;}
 if(ok){load();setTimeout(load,500);speechSynthesis.addEventListener&&speechSynthesis.addEventListener('voiceschanged',load);}
 function clean(t){return String(t).replace(/(\d)\s?°C/g,'$1 degrees Celsius').replace(/(\d)\s?%/g,'$1 percent').replace(/\bkm\/h\b/g,'kilometres per hour').replace(/(\d)\s?km\b/g,'$1 kilometres').replace(/(\d)\s?kg\b/g,'$1 kilograms').replace(/(\d)\s?cm\b/g,'$1 centimetres').replace(/(\d)\s?mm\b/g,'$1 millimetres').replace(/(\d)\s?m\b/g,'$1 metres').replace(/·/g,',').replace(/\s+/g,' ').trim();}
 function chunks(t){return clean(t).replace(/([.!?])\s+(?=[A-Z"'(])/g,'$1\u0002').split('\u0002').map(s=>s.trim()).filter(Boolean);}
 return{get ok(){return ok;},speak(text,onend){if(!ok)return;speechSynthesis.cancel();const my=++gen;const parts=chunks(Array.isArray(text)?text.join(' '):text);parts.forEach((p,i)=>{const u=new SpeechSynthesisUtterance(p);if(pick){u.voice=pick;u.lang=pick.lang;}else u.lang='en-CA';u.rate=.95;u.pitch=1;if(i===parts.length-1&&onend)u.onend=()=>{if(my===gen)onend();};speechSynthesis.speak(u);});},
  cancel(){gen++;if(ok)speechSynthesis.cancel();}};})();

/* ---------- shelves ---------- */
let filterG='all',filterS='all',query='';
function coverHTML(b,opt){const p=PROG[b.id]||{},pct=p.done?100:Math.round(((p.p||0)/Math.max(1,b.pages-1))*100);
 return '<span class="cov" style="background:linear-gradient(160deg,'+esc(b.cover.c[0])+','+esc(b.cover.c[1])+')">'+art(b.cover.scene,{},{k:b.id+'c',t:4,cover:1})+
  '<span class="tag">'+esc(GSHORT[b.grade])+' · '+esc(b.subject)+'</span>'+(p.done?'<span class="done" aria-label="finished">✓</span>':'')+
  '<span class="ttl"><b>'+esc(b.title)+'</b><small>'+esc(b.subtitle)+'</small></span>'+(pct>0&&!p.done?'<span class="prog"><i style="width:'+pct+'%"></i></span>':'')+'</span>';}
function renderShelves(){const host=$('#shelves');host.innerHTML='';const q=query.trim().toLowerCase();
 const list=CAT.filter(b=>(filterG==='all'||b.grade===+filterG)&&(filterS==='all'||b.subject===filterS)&&(!q||(b.title+' '+b.subtitle+' '+b.subject).toLowerCase().includes(q)));
 if(!list.length){host.innerHTML='<p class="empty">No books match. Try another grade or word.</p>';return;}
 for(let g=0;g<=7;g++){const bs=list.filter(b=>b.grade===g);if(!bs.length)continue;const sec=document.createElement('section');sec.className='shelf';sec.id='grade-'+g;
  sec.innerHTML='<div class="shelf-h"><h2>'+GRADES[g]+'</h2><small>'+AGE[g]+' · '+bs.length+' book'+(bs.length>1?'s':'')+' · '+bs.reduce((a,b)=>a+b.pages,0)+' pages</small></div><div class="books"></div>';
  const row=$('.books',sec);bs.forEach(b=>{const btn=document.createElement('button');btn.className='book';btn.id='book-'+b.id;btn.setAttribute('aria-label',b.title+', '+GRADES[b.grade]+', '+b.pages+' pages');
   btn.innerHTML=coverHTML(b)+'<span class="meta"><b>'+b.pages+' pages</b> · about '+b.minutes+' min · '+b.chapters+' chapters · '+b.quizzes+' quizzes</span>';btn.addEventListener('click',()=>openBook(b.id));row.appendChild(btn);});
  host.appendChild(sec);}
 hook(host);renderContinue();}
function renderContinue(){const host=$('#cont');const items=Object.entries(PROG).filter(([id,p])=>!p.done&&p.p>0&&CAT.find(b=>b.id===id)).sort((a,b)=>(b[1].t||0)-(a[1].t||0)).slice(0,4);
 if(!items.length){host.hidden=true;return;}host.hidden=false;host.innerHTML='<h2>Keep reading</h2>'+items.map(([id,p])=>{const b=CAT.find(x=>x.id===id);return '<button class="cont-item" data-id="'+esc(id)+'"><span class="mini" style="background:linear-gradient(160deg,'+esc(b.cover.c[0])+','+esc(b.cover.c[1])+')"></span><span><b>'+esc(b.title)+'</b><small>page '+(p.p+1)+' of '+b.pages+'</small></span></button>';}).join('');
 $$('.cont-item',host).forEach(el=>el.addEventListener('click',()=>openBook(el.dataset.id)));}
function stats(){const n=CAT.length,pg=CAT.reduce((a,b)=>a+b.pages,0),w=CAT.reduce((a,b)=>a+b.words,0),done=Object.values(PROG).filter(p=>p.done).length;
 $('#stBooks').textContent=n;$('#stPages').textContent=pg.toLocaleString('en-CA');$('#stWords').textContent=Math.round(w/1000)+'k';$('#stDone').textContent=done;}

/* ---------- reader ---------- */
let ov,bk,L,R,leaf,lf,lb,pages=[],i=0,busy=false,cur=null,reading=false,fs=16;
const single=()=>window.matchMedia('(max-width:760px)').matches;
function build(){if(ov)return;ov=document.createElement('div');ov.className='rd';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Book');
 ov.innerHTML='<div class="rd-bar"><b class="rd-title"></b><span class="rd-cnt"></span><button class="rd-btn" id="rdSmall" aria-label="Smaller text">A−</button><button class="rd-btn" id="rdBig" aria-label="Bigger text">A+</button><button class="rd-btn" id="rdRead">🔊 Read aloud</button><button class="rd-btn rd-x" id="rdClose" aria-label="Close book">×</button></div>'+
 '<div class="rd-stage"><button class="rd-nav" id="rdPrev" aria-label="Previous page">‹</button><div class="bk"><div class="pg pg-l"></div><div class="pg pg-r"></div><div class="leaf" hidden><div class="face front"></div><div class="face back"></div></div></div><button class="rd-nav" id="rdNext" aria-label="Next page">›</button></div>'+
 '<p class="hint">Tap the right side or swipe to turn the page · ← → keys · Esc closes</p>';
 document.body.appendChild(ov);bk=$('.bk',ov);L=$('.pg-l',ov);R=$('.pg-r',ov);leaf=$('.leaf',ov);lf=$('.front',ov);lb=$('.back',ov);
 $('#rdClose',ov).onclick=close;$('#rdNext',ov).onclick=()=>turn(1);$('#rdPrev',ov).onclick=()=>turn(-1);$('#rdRead',ov).onclick=read;
 $('#rdSmall',ov).onclick=()=>{fs=Math.max(13,fs-1);bk.style.setProperty('--fs',fs+'px');};$('#rdBig',ov).onclick=()=>{fs=Math.min(24,fs+1);bk.style.setProperty('--fs',fs+'px');};
 ov.addEventListener('click',e=>{if(e.target===ov)close();});
 let sx=null,sy=null;bk.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
 bk.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)turn(dx<0?1:-1);sx=sy=null;});
 bk.addEventListener('click',e=>{if(e.target.closest('button,a,select,input'))return;const r=bk.getBoundingClientRect();const x=(e.clientX-r.left)/r.width;if(single()){if(x>.66)turn(1);else if(x<.2)turn(-1);}else{if(x>.92)turn(1);else if(x<.08)turn(-1);}});
 document.addEventListener('keydown',e=>{if(ov.hidden)return;if(e.key==='ArrowRight'){e.preventDefault();turn(1);}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1);}if(e.key==='Escape')close();});
 window.addEventListener('resize',()=>{if(!ov.hidden)show();});}
function pagesFor(b){const P=[{k:'cover'},{k:'toc'}];let ch=0;b.pages.forEach(p=>{const q=Object.assign({},p);if(p.k==='ch')q.n=++ch;P.push(q);});P.push({k:'end'});return P;}
function html(p,num){if(!p)return'';const b=cur;const foot=num>1&&p.k!=='big'&&p.k!=='end'?'<div class="num">'+num+'</div>':'';const F=foot;
 if(p.k==='cover')return'<div class="cover">'+art(b.cover.scene,{},{k:b.id+'cover',t:5,cover:1})+'<div class="ct"><div class="lib">STAR STEPS LIBRARY · '+esc(GRADES[b.grade].toUpperCase())+'</div><h2>'+esc(b.title)+'</h2><p class="sub">'+esc(b.subtitle)+'</p><p class="for">'+esc(b.subject)+' · '+(b.pages.length+3)+' pages · about '+b.minutes+' minutes</p></div></div>';
 if(p.k==='toc'){let n=2,ch=0;const items=[];b.pages.forEach(pg=>{n++;if(pg.k==='ch'){ch++;items.push('<li><span>'+ch+'. '+esc(pg.h)+'</span><i></i><em>'+n+'</em></li>');}else if(pg.k==='try')items.push('<li class="sub"><span>Try it: '+esc(pg.h.replace(/^Try it:?\s*/i,''))+'</span><i></i><em>'+n+'</em></li>');else if(pg.k==='words')items.push('<li class="sub"><span>Words to know</span><i></i><em>'+n+'</em></li>');else if(pg.k==='think')items.push('<li class="sub"><span>Think about it</span><i></i><em>'+n+'</em></li>');});
  return'<div class="in"><div class="eye">Contents</div><h3>What is inside</h3><ol class="toc">'+items.join('')+'</ol>'+F+'</div>';}
 if(p.k==='ch')return'<div class="in"><div class="eye">Chapter '+p.n+'</div><h3>'+esc(p.h)+'</h3>'+(p.art?'<figure class="fig">'+art(p.art.s,p.art.v,{k:b.id+num})+(p.cap?'<figcaption>'+esc(p.cap)+'</figcaption>':'')+'</figure>':'')+p.p.map((t,k)=>'<p'+(k===0?' class="drop"':'')+'>'+esc(t)+'</p>').join('')+(p.fact?'<aside class="fact"><b>Did you know?</b>'+esc(p.fact.replace(/^Did you know\?\s*/i,''))+'</aside>':'')+F+'</div>';
 if(p.k==='try')return'<div class="in"><div class="eye">Try it</div><h3>'+esc(p.h)+'</h3>'+(p.art?'<figure class="fig">'+art(p.art.s,p.art.v,{k:b.id+num})+(p.cap?'<figcaption>'+esc(p.cap)+'</figcaption>':'')+'</figure>':'')+(p.p||[]).map(t=>'<p>'+esc(t)+'</p>').join('')+'<ol class="steps">'+p.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol>'+(p.safe?'<p class="safe"><b>Safety:</b> '+esc(p.safe)+'</p>':'')+F+'</div>';
 if(p.k==='quiz')return'<div class="in"><div class="qz" data-q="'+num+'"><div class="eye">Quick quiz</div><p class="qq">'+esc(p.q)+'</p><div class="opts">'+p.opts.map((o,k)=>'<button type="button" data-k="'+k+'">'+esc(o)+'</button>').join('')+'</div><p class="fb" aria-live="polite"></p></div>'+F+'</div>';
 if(p.k==='big')return'<div class="big">'+art(p.art.s,p.art.v,{k:b.id+num,cover:1})+'<div class="bt"><h3>'+esc(p.h)+'</h3>'+(p.p||[]).map(t=>'<p>'+esc(t)+'</p>').join('')+'</div></div>';
 if(p.k==='words')return'<div class="in"><div class="eye">Glossary</div><h3>Words to know</h3><dl class="dl">'+p.items.map(w=>'<dt>'+esc(w[0])+'</dt><dd>'+esc(w[1])+'</dd>').join('')+'</dl>'+F+'</div>';
 if(p.k==='think')return'<div class="in"><div class="eye">Your turn</div><h3>Think about it</h3><ol class="qs">'+p.qs.map(q=>'<li>'+esc(q)+'</li>').join('')+'</ol><p class="note">There are no wrong answers. Talk about them with a grown-up or a friend.</p>'+F+'</div>';
 if(p.k==='end'){const nx=nextBook(b);return'<div class="endp"><div class="star">⭐</div><h2>The End</h2><p>You read all '+(b.pages.length+3)+' pages of <b>'+esc(b.title)+'</b>.</p><button class="btn" id="rdDone">Mark as finished</button>'+(nx?'<button class="btn sec" id="rdNextBook" data-id="'+esc(nx.id)+'">Next: '+esc(nx.title)+' →</button>':'')+'</div>';}
 return foot;}
function nextBook(b){const same=CAT.filter(x=>x.grade===b.grade&&x.id!==b.id&&!(PROG[x.id]||{}).done);if(same.length)return same[0];const up=CAT.filter(x=>x.grade>b.grade&&!(PROG[x.id]||{}).done);return up[0]||null;}
function txt(p){if(!p)return'';const b=cur;if(p.k==='cover')return b.title+'. '+b.subtitle+'.';if(p.k==='toc')return'Contents.';if(p.k==='ch')return'Chapter '+p.n+'. '+p.h+'. '+p.p.join(' ')+(p.fact?' Did you know? '+p.fact.replace(/^Did you know\?\s*/i,''):'');if(p.k==='try')return p.h+'. '+(p.p||[]).join(' ')+' '+p.steps.map((s,k)=>'Step '+(k+1)+'. '+s).join(' ')+(p.safe?' Safety: '+p.safe:'');if(p.k==='quiz')return'Quick quiz. '+p.q+' '+p.opts.map((o,k)=>String.fromCharCode(65+k)+'. '+o).join(' ');if(p.k==='big')return p.h+'. '+(p.p||[]).join(' ');if(p.k==='words')return'Words to know. '+p.items.map(w=>w[0]+': '+w[1]).join(' ');if(p.k==='think')return'Think about it. '+p.qs.join(' ');if(p.k==='end')return'The end. You read the whole book.';return'';}
function wire(root){$$('.qz',root).forEach(q=>{const pg=pages[+q.dataset.q-1];const box=$('.opts',q),fb=$('.fb',q);$$('button',box).forEach(bt=>bt.addEventListener('click',()=>{$$('button',box).forEach(x=>x.disabled=true);const k=+bt.dataset.k,ok=k===pg.a;bt.classList.add(ok?'right':'wrong');box.children[pg.a].classList.add('right');fb.textContent=(ok?'Correct! ':'Not quite. ')+pg.why;fb.style.color=ok?'#1d8a3a':'#b3261e';ok?Snd.good():Snd.bad();
  const pr=PROG[cur.id]||(PROG[cur.id]={});pr.quiz=pr.quiz||{};pr.quiz[q.dataset.q]=ok?1:0;saveProg();}));});
 const d=$('#rdDone',root);if(d)d.addEventListener('click',()=>{const pr=PROG[cur.id]||(PROG[cur.id]={});pr.done=true;pr.t=Date.now();saveProg();Snd.good();d.textContent='Finished ✓';d.disabled=true;stats();});
 const nb=$('#rdNextBook',root);if(nb)nb.addEventListener('click',()=>openBook(nb.dataset.id));}
function show(){const s=single();bk.classList.toggle('one',s);
 if(s){L.hidden=true;R.innerHTML=html(pages[i],i+1);$('.rd-cnt',ov).textContent='Page '+(i+1)+' of '+pages.length;}
 else{i=i-(i%2);L.hidden=false;L.innerHTML=html(pages[i],i+1);R.innerHTML=html(pages[i+1],i+2);$('.rd-cnt',ov).textContent='Pages '+(i+1)+'–'+Math.min(i+2,pages.length)+' of '+pages.length;}
 hook(bk);wire(bk);$('#rdPrev',ov).disabled=i<=0;$('#rdNext',ov).disabled=i>=pages.length-(s?1:2);
 const pr=PROG[cur.id]||(PROG[cur.id]={});pr.p=i;pr.t=Date.now();if(i>=pages.length-(s?1:2)){pr.done=true;}saveProg();}
function turn(d){if(busy)return;const s=single(),step=s?1:2,ni=i+d*step;if(ni<0||ni>pages.length-1)return;busy=true;stopRead();Snd.flip();
 if(RM){i=ni;show();busy=false;return;}
 leaf.hidden=false;leaf.className='leaf '+(d>0?'go-next':'go-prev')+(s?' one':'');
 if(d>0){lf.innerHTML=s?html(pages[i],i+1):html(pages[i+1],i+2);lb.innerHTML=s?'':html(pages[ni],ni+1);R.innerHTML=s?html(pages[ni],ni+1):html(pages[ni+1],ni+2);}
 else{lf.innerHTML=html(pages[i],i+1);lb.innerHTML=s?'':html(pages[ni+1],ni+2);if(s)R.innerHTML=html(pages[ni],ni+1);else L.innerHTML=html(pages[ni],ni+1);}
 hook(bk);leaf.getBoundingClientRect();leaf.classList.add('turning');
 setTimeout(()=>{i=ni;leaf.hidden=true;leaf.className='leaf';show();busy=false;},720);}
function stopRead(){if(reading){Voice.cancel();reading=false;$('#rdRead',ov).textContent='🔊 Read aloud';}}
function read(){if(reading){stopRead();return;}if(!Voice.ok){$('#rdRead',ov).textContent='No voice on this device';return;}
 const s=single();const t=s?txt(pages[i]):txt(pages[i])+' '+txt(pages[i+1]);reading=true;$('#rdRead',ov).textContent='■ Stop';Voice.speak(t,()=>{reading=false;$('#rdRead',ov).textContent='🔊 Read aloud';});}
async function openBook(id){const meta=CAT.find(b=>b.id===id);if(!meta)return;build();let data;try{data=await (await fetch('/library/books/'+id+'.json')).json();}catch(e){alert('That book could not load. Check your connection and try again.');return;}
 cur=data;pages=pagesFor(data);bk.className='bk g'+data.grade;const pr=PROG[id]||{};i=pr.done?0:Math.min(pr.p||0,pages.length-1);if(!single())i=i-(i%2);
 $('.rd-title',ov).textContent=data.title;ov.hidden=false;document.documentElement.style.overflow='hidden';show();Snd.open();$('#rdNext',ov).focus();
 try{history.replaceState(null,'','/library/?book='+id);}catch(e){}}
function close(){stopRead();ov.hidden=true;document.documentElement.style.overflow='';renderShelves();stats();try{history.replaceState(null,'','/library/');}catch(e){}}

/* ---------- boot ---------- */
async function boot(){try{CAT=(await (await fetch('/library/catalog.json')).json()).books;}catch(e){$('#shelves').innerHTML='<p class="empty">The library could not load. Check your connection and try again.</p>';return;}
 stats();
 const gchips=$('#gchips');[['all','All grades'],...GRADES.map((g,k)=>[String(k),GSHORT[k]])].forEach(([v,n])=>{const b=document.createElement('button');b.className='chip';b.textContent=n;b.setAttribute('aria-pressed',String(v===filterG));b.addEventListener('click',()=>{filterG=v;$$('.chip',gchips).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderShelves();});gchips.appendChild(b);});
 const subs=[...new Set(CAT.map(b=>b.subject))].sort();const sel=$('#subj');subs.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;sel.appendChild(o);});sel.addEventListener('change',()=>{filterS=sel.value;renderShelves();});
 $('#q').addEventListener('input',e=>{query=e.target.value;renderShelves();});
 renderShelves();hook(document.body);
 const want=new URLSearchParams(location.search).get('book');if(want&&CAT.find(b=>b.id===want))openBook(want);
 window.SSLib={open:openBook,catalog:()=>CAT,progress:()=>PROG};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
