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
    setTab("path");
    var body=document.getElementById("pathBody"), h=body&&hereInfo(body);
    if(h&&h.unit)apply(h.unit);
    var here=body&&body.querySelector(".node.here");
    if(here)here.scrollIntoView({behavior:REDUCED()?"auto":"smooth",block:"center"});
  };
  var orig=window.renderPath;
  window.renderPath=function(){ var r=orig.apply(this,arguments); try{apply();}catch(e){} return r; };
  try{apply();}catch(e){}
})();
