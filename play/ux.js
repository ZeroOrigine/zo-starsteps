/* Star Steps website build: layout layer (2026-09-30).
   The Path shows one subject at a time. It follows the child's next step
   automatically; tapping a subject chip switches to that subject. The choice
   lasts for this visit only (sessionStorage), so every new visit opens on the
   subject of the next step. "Continue" on Today always goes to the next step. */
(function(){
  "use strict";
  if(typeof window.renderPath!=="function")return;
  var KEY="ss.ux.unit";
  function read(){try{return JSON.parse(sessionStorage.getItem(KEY))||{};}catch(e){return {};}}
  function write(o){try{sessionStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
  function hereInfo(body){
    var here=body.querySelector(".node.here");
    if(!here)return null;
    var path=here.closest(".path"), ban=path&&path.previousElementSibling;
    return {unit:ban&&ban.dataset.unit, id:here.getAttribute("aria-label")||""};
  }
  /* bring the chosen subject into view: on a phone the chip row is sticky, so aim at the top of the path */
  function scrollToSubject(jump){
    var top;
    if(getComputedStyle(jump).position==="sticky"){
      var c=document.getElementById("courses"), h=document.querySelector(".topbar");
      top=(c?c.getBoundingClientRect().bottom+scrollY:0)-(h?h.offsetHeight:0);
    } else top=jump.getBoundingClientRect().top+scrollY-80;
    if(scrollY>top)scrollTo({top:Math.max(0,top),behavior:REDUCED()?"auto":"smooth"});
  }
  /* mouse screens: arrows at both ends of the one-row subject bar */
  var FINE=window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)");
  function arrows(jump){
    if(!FINE||!FINE.matches||jump.querySelector(".ux-arr"))return;
    function mk(cls,label,dir){
      var b=document.createElement("button"); b.type="button"; b.className="ux-arr "+cls;
      b.setAttribute("aria-label",label); b.textContent=dir<0?"\u2039":"\u203A";
      b.onclick=function(){ try{SFX.tap();}catch(e){} jump.scrollBy({left:dir*Math.max(200,jump.clientWidth*.7),behavior:REDUCED()?"auto":"smooth"}); };
      return b;
    }
    var l=mk("l","Earlier subjects",-1), r=mk("r","More subjects",1);
    jump.insertBefore(l,jump.firstChild); jump.appendChild(r);
    jump._uxArr=function(){
      var over=jump.scrollWidth>jump.clientWidth+4;
      l.classList.toggle("off",!over||jump.scrollLeft<8);
      r.classList.toggle("off",!over||jump.scrollLeft+jump.clientWidth>=jump.scrollWidth-8);
    };
    if(!jump.dataset.uxArr){ jump.dataset.uxArr="1";
      jump.addEventListener("scroll",function(){ if(jump._uxArr)jump._uxArr(); },{passive:true});
      var upd=function(){ if(jump._uxArr)jump._uxArr(); };
      if(window.ResizeObserver)new ResizeObserver(upd).observe(jump); else addEventListener("resize",upd,{passive:true}); }
    jump._uxArr();
  }
  function apply(chosen){
    var body=document.getElementById("pathBody"), jump=document.getElementById("jump");
    if(!body||!jump)return;
    var banners=[].slice.call(body.querySelectorAll(".unit[data-unit]"));
    if(banners.length<2)return;
    var units=unitsFor(S.grade), store=read(), g=String(S.grade), h=hereInfo(body), key=chosen;
    if(!key){
      var saved=store[g];
      /* a new next step moves the view to it; otherwise keep the child's choice */
      if(saved&&h&&saved.here===h.id&&banners.some(function(b){return b.dataset.unit===saved.key;}))key=saved.key;
      else key=(h&&h.unit)||banners[0].dataset.unit;
    }
    store[g]={key:key,here:h?h.id:""};write(store);
    var idx=0;
    banners.forEach(function(b,i){
      var on=b.dataset.unit===key, p=b.nextElementSibling;
      b.hidden=!on; if(p&&p.classList.contains("path"))p.hidden=!on;
      if(on)idx=i;
    });
    arrows(jump);
    [].slice.call(jump.children).filter(function(b){return !b.classList.contains("ux-arr");}).forEach(function(btn,i){
      var u=units[i]; if(!u)return;
      btn.setAttribute("aria-pressed",String(u.key===key));
      btn.onclick=function(){
        try{SFX.tap();}catch(e){}
        apply(u.key);
        scrollToSubject(jump);
      };
    });
    var old=body.querySelector(".ux-next"); if(old)old.remove();
    var nextBan=banners[idx+1];
    if(nextBan){
      var nu=units.filter(function(u){return u.key===nextBan.dataset.unit;})[0];
      var btn=document.createElement("button");
      btn.className="ux-next"; btn.type="button";
      btn.style.background=(nu&&nu.color)||"var(--pick)";
      btn.textContent="Next subject: "+(nu?nu.name:"")+" →";
      btn.onclick=function(){
        try{SFX.tap();}catch(e){}
        apply(nextBan.dataset.unit);
        var c=jump.querySelector('[aria-pressed="true"]'); if(c&&c.scrollIntoView)c.scrollIntoView({inline:"center",block:"nearest"});
        scrollToSubject(jump);
      };
      var p=banners[idx].nextElementSibling;
      (p&&p.classList.contains("path")?p:banners[idx]).insertAdjacentElement("afterend",btn);
    }
    var cur=jump.querySelector('[aria-pressed="true"]');
    setTimeout(function(){ if(jump._uxArr)jump._uxArr(); },0);
    if(cur&&jump.scrollWidth>jump.clientWidth)jump.scrollLeft=Math.max(0,cur.offsetLeft-(jump.clientWidth-cur.offsetWidth)/2);
  }
  /* Continue: open the subject that holds the next step, then show that step */
  var cont=document.getElementById("contBtn");
  if(cont)cont.onclick=function(){
    var body=document.getElementById("pathBody"), h=body&&hereInfo(body);
    var here=body&&body.querySelector(".node.here");
    if(here&&!here.classList.contains("locked")){ if(h&&h.unit)apply(h.unit); here.click(); return; }
    setTab("path");
    if(h&&h.unit)apply(h.unit);
    if(here)here.scrollIntoView({behavior:REDUCED()?"auto":"smooth",block:"center"});
  };
  /* the sky's "Take me to ..." opens that subject on the path (only one subject shows at a time) */
  var skyGo=document.getElementById("skyGo");
  if(skyGo)skyGo.onclick=function(){
    var key=skyGo.dataset.unit; setTab("path"); if(key)apply(key);
    var t=document.querySelector('#pathBody [data-unit="'+key+'"]');
    if(t)t.scrollIntoView({behavior:REDUCED()?"auto":"smooth",block:"start"});
  };
  /* Your sky: keep every subject name inside the picture and stop names printing on top of each other */
  var cvs=document.createElement("canvas").getContext("2d");
  function fixSky(){
    var box=document.getElementById("skyBox"); if(!box)return;
    var texts=[].slice.call(box.querySelectorAll("text.sl")); if(!texts.length)return;
    var fam=getComputedStyle(texts[0]).fontFamily||"sans-serif";
    cvs.font="800 41px "+fam;
    var placed=[], H=4.3, VB_W=100, VB_H=84;
    function rect(x,y,w){return {l:x-w/2,r:x+w/2,t:y-3.4,b:y+0.9};}
    function hits(a){return placed.some(function(b){return a.l<b.r+1.6&&a.r>b.l-1.6&&a.t<b.b+0.2&&a.b>b.t-0.2;});}
    texts.forEach(function(t){
      var x=+t.getAttribute("x"), y=+t.getAttribute("y"), w=cvs.measureText(t.textContent).width/10;
      if(x-w/2<1)x=1+w/2; if(x+w/2>VB_W-1)x=VB_W-1-w/2;
      var tries=[[0,0],[0,H],[0,-H],[0,2*H],[0,-2*H],[-6,0],[6,0],[-6,H],[6,H],[0,3*H]], pick=null;
      for(var i=0;i<tries.length&&!pick;i++){
        var nx=Math.min(VB_W-1-w/2,Math.max(1+w/2,x+tries[i][0])), ny=y+tries[i][1];
        if(ny<5||ny>VB_H-1)continue;
        var r=rect(nx,ny,w); if(!hits(r))pick=[nx,ny,r];
      }
      if(!pick)pick=[x,y,rect(x,y,w)];
      t.setAttribute("x",pick[0].toFixed(1)); t.setAttribute("y",pick[1].toFixed(1)); placed.push(pick[2]);
    });
  }
  if(typeof window.renderSky==="function"){
    var origSky=window.renderSky;
    window.renderSky=function(){var r=origSky.apply(this,arguments);try{fixSky();}catch(e){}return r;};
    try{fixSky();}catch(e){}
  }
  /* The launch screen is a "welcome back", not a toll on every visit.
     It plays only when the child has been away for 30 minutes or more (or on the very first open).
     Away = no tap or key since then, or the page hidden since then. Coming back sooner (a tab switch,
     a reload, reopening the app) goes straight to where they were. Never in the middle of a lesson. */
  var AWAY_MS=30*60*1000, SEEN="ss.seen";
  function readSeen(){try{return +localStorage.getItem(SEEN)||0;}catch(e){return 0;}}
  var lastActive=Date.now(), wroteAt=0;
  function mark(force){ lastActive=Date.now();
    if(force||lastActive-wroteAt>10000){ wroteAt=lastActive; try{localStorage.setItem(SEEN,String(lastActive));}catch(e){} } }
  var warm=document.documentElement.classList.contains("ss-warm");
  function hideSplash(){
    var sp=document.getElementById("splash"); if(!sp||sp.classList.contains("gone"))return;
    sp.classList.add("out");
    var gone=function(){sp.classList.add("gone");try{splashUp=false;}catch(e){}};
    sp.addEventListener("animationend",gone,{once:true}); setTimeout(gone,warm?250:600);
  }
  /* first open of a visit: at least 0.7 s of launch screen; a warm open: gone as soon as the app is drawn */
  try{ clearTimeout(spHideTimer); spHideTimer=setTimeout(hideSplash,warm?0:(REDUCED()?150:700)); }catch(e){}
  if(typeof window.runSplash==="function"){
    var origRun=window.runSplash;
    window.runSplash=function(){ var r=origRun.apply(this,arguments); try{clearTimeout(spHideTimer);spHideTimer=setTimeout(hideSplash,REDUCED()?150:1100);}catch(e){} return r; };
  }
  /* the game calls comeBack() after a hidden gap or a long idle; replay only after a real absence */
  if(typeof window.comeBack==="function"){
    var origBack=window.comeBack;
    window.comeBack=function(){
      var away=Date.now()-lastActive;
      if(away>=AWAY_MS){ document.documentElement.classList.remove("ss-warm"); warm=false; origBack.apply(this,arguments); }
      mark(true);
    };
  }
  /* bubble phase, so the game's own listeners (capture phase) see the old time first */
  ["pointerdown","keydown"].forEach(function(t){document.addEventListener(t,function(){mark(false);},{passive:true});});
  document.addEventListener("visibilitychange",function(){ if(document.hidden)mark(true); });
  addEventListener("pagehide",function(){mark(true);});
  mark(true);
  /* the name box on Today only shows until the child has a name */
  function named(){ try{document.body.classList.toggle("ss-named",!!S.name&&S.name!=="Friend");}catch(e){} }
  /* You: Senior Kindergarten is grade 0; say its name instead of "Grade 0" */
  if(typeof window.renderMe==="function"){
    var origMe=window.renderMe;
    window.renderMe=function(){var r=origMe.apply(this,arguments);
      try{var m=document.getElementById("meRank");if(m)m.textContent=m.textContent.replace(/Grade 0\b/,"Senior Kindergarten");}catch(e){}return r;};
    try{renderMe();}catch(e){}
  }
  /* the sticky subject row sits right under the top bar, whatever its height */
  var tb=document.querySelector(".topbar");
  function tbh(){ if(tb)document.documentElement.style.setProperty("--tbh",tb.offsetHeight+"px"); }
  tbh(); addEventListener("resize",tbh,{passive:true});
  if(tb&&window.ResizeObserver)new ResizeObserver(tbh).observe(tb);
  /* the subject row gets its frosted background only while it is stuck under the top bar */
  var stuckTick=false;
  function stuck(){ stuckTick=false; var j=document.getElementById("jump"); if(!j||!tb)return;
    var on=getComputedStyle(j).position==="sticky"&&j.offsetParent!==null&&Math.abs(j.getBoundingClientRect().top-tb.getBoundingClientRect().bottom)<2&&scrollY>40;
    j.classList.toggle("ux-stuck",on); }
  addEventListener("scroll",function(){ if(!stuckTick){stuckTick=true;requestAnimationFrame(stuck);} },{passive:true});
  /* a first visit opens on the welcome screen: its top bar and tabs stay hidden from the first paint (no jump) */
  if(typeof window.show==="function"){
    var origShowNew=window.show;
    window.show=function(v){ if(v!=="intro")document.documentElement.classList.remove("ss-new"); return origShowNew.apply(this,arguments); };
  }
  if(document.body.dataset.view&&document.body.dataset.view!=="intro")document.documentElement.classList.remove("ss-new");
  document.documentElement.classList.add("ss-ready");
  var orig=window.renderPath;
  window.renderPath=function(){ var r=orig.apply(this,arguments); try{apply();}catch(e){} named(); return r; };
  window.SSUxApply=function(k){ try{apply(k);}catch(e){} };
  try{apply();}catch(e){} named();
})();
