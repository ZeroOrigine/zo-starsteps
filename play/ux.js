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
    [].slice.call(jump.children).forEach(function(btn,i){
      var u=units[i]; if(!u)return;
      btn.setAttribute("aria-pressed",String(u.key===key));
      btn.onclick=function(){
        try{SFX.tap();}catch(e){}
        apply(u.key);
        var top=jump.getBoundingClientRect().top+scrollY-80;
        if(scrollY>top)scrollTo({top:top,behavior:"smooth"});
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
        scrollTo({top:jump.getBoundingClientRect().top+scrollY-80,behavior:"smooth"});
      };
      var p=banners[idx].nextElementSibling;
      (p&&p.classList.contains("path")?p:banners[idx]).insertAdjacentElement("afterend",btn);
    }
    var cur=jump.querySelector('[aria-pressed="true"]');
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
  /* opening: the launch screen stays only while the app draws (at least 0.7 s), and
     comebacks replay a short version, so learning starts sooner */
  function hideSplash(){
    var sp=document.getElementById("splash"); if(!sp||sp.classList.contains("gone"))return;
    sp.classList.add("out");
    var gone=function(){sp.classList.add("gone");try{splashUp=false;}catch(e){}};
    sp.addEventListener("animationend",gone,{once:true}); setTimeout(gone,600);
  }
  try{ clearTimeout(spHideTimer); spHideTimer=setTimeout(hideSplash,REDUCED()?150:700); }catch(e){}
  if(typeof window.runSplash==="function"){
    var origRun=window.runSplash;
    window.runSplash=function(){ var r=origRun.apply(this,arguments); try{clearTimeout(spHideTimer);spHideTimer=setTimeout(hideSplash,REDUCED()?150:1100);}catch(e){} return r; };
  }
  /* the name box on Today only shows until the child has a name */
  function named(){ try{document.body.classList.toggle("ss-named",!!S.name&&S.name!=="Friend");}catch(e){} }
  /* You: Senior Kindergarten is grade 0; say its name instead of "Grade 0" */
  if(typeof window.renderMe==="function"){
    var origMe=window.renderMe;
    window.renderMe=function(){var r=origMe.apply(this,arguments);
      try{var m=document.getElementById("meRank");if(m)m.textContent=m.textContent.replace(/Grade 0\b/,"Senior Kindergarten");}catch(e){}return r;};
    try{renderMe();}catch(e){}
  }
  var orig=window.renderPath;
  window.renderPath=function(){ var r=orig.apply(this,arguments); try{apply();}catch(e){} named(); return r; };
  try{apply();}catch(e){} named();
})();
