/* Star Steps website build: Your sky, redrawn (2026-09-30, v17).
   One star per subject of the child's grade, in a tidy night-sky grid instead of names scattered
   over a dark box. A star's size and glow follow the game's own strength score (right answers,
   how much practice, how recently). Lit stars twinkle; dim ones wait. Tapping a star opens that
   subject on the Path. The "dimming" note and its button stay as the game wrote them. */
(function(){
  "use strict";
  if(typeof window.renderSky!=="function"||typeof subjectStar!=="function")return;
  var STAR="M50 6l12.4 25.1 27.7 4-20 19.6 4.7 27.6L50 69.3 25.2 82.3l4.7-27.6-20-19.6 27.7-4z";
  function openSubject(key){
    var go=document.getElementById("skyGo");
    try{SFX.tap();}catch(e){}
    if(go&&typeof go.onclick==="function"){ go.dataset.unit=key; go.onclick(); return; }
    try{setTab("path");}catch(e){}
  }
  window.renderSky=function(){
    var US=unitsFor(S.grade), stars=US.map(subjectStar), lit=stars.filter(function(x){return x.n>0;}).length;
    var cnt=document.getElementById("skyCount"); if(cnt)cnt.textContent=lit+" of "+US.length+" lit";
    var box=document.getElementById("skyBox"); if(!box)return;
    box.innerHTML="";
    box.classList.add("sky2");
    var dust=document.createElement("div"); dust.className="sky-dust"; dust.setAttribute("aria-hidden","true"); box.appendChild(dust);
    var grid=document.createElement("div"); grid.className="sky-grid";
    stars.forEach(function(st,i){
      var s=st.strength, state=st.n===0?"off":s>=.62?"hi":s>=.34?"mid":"low";
      var b=document.createElement("button"); b.type="button"; b.className="sky-star "+state;
      b.style.setProperty("--s",(0.78+s*0.42).toFixed(2)); b.style.setProperty("--d",((i*0.37)%2.4).toFixed(2)+"s");
      var pct=Math.round(s*100);
      b.setAttribute("aria-label",st.u.name+": "+(st.n===0?"not started":pct+"% bright"+(st.days>=5&&st.days<999?", "+st.days+" days since practice":""))+". Open on the path.");
      b.innerHTML='<span class="ss-glow" aria-hidden="true"></span><svg viewBox="0 0 100 90" aria-hidden="true"><path d="'+STAR+'"/></svg><span class="ss-name"></span>';
      b.querySelector(".ss-name").textContent=st.u.name;
      b.onclick=function(){openSubject(st.u.key);};
      grid.appendChild(b);
    });
    box.appendChild(grid);
    var leg=document.createElement("div"); leg.className="sky-legend";
    leg.innerHTML='<span><i class="k hi"></i>Bright</span><span><i class="k mid"></i>Growing</span><span><i class="k low"></i>Fading</span><span><i class="k off"></i>Not started</span>';
    box.appendChild(leg);
    /* the note under the sky: same words as before */
    var dim=stars.filter(function(x){return x.n===0||x.days>=11;}).sort(function(a,b){return a.strength-b.strength;}).slice(0,2);
    var go=document.getElementById("skyGo"), t=document.getElementById("skyTitle"), l=document.getElementById("skyLine");
    if(!t||!l)return;
    if(!dim.length){ t.textContent="Every star is bright"; l.textContent="Nothing needs a revisit today."; if(go)go.classList.add("hide"); }
    else{
      t.textContent=dim.length>1?"Two stars are dimming":"One star is dimming";
      l.textContent=dim.map(function(x){return x.u.name+(x.n===0?" (not started)":" ("+x.days+" days)");}).join("  ·  ")+". Pip can slot "+(dim.length>1?"them":"it")+" into the path.";
      if(go){ go.classList.remove("hide"); go.textContent="Take me to "+dim[0].u.name; go.dataset.unit=dim[0].u.key; }
    }
  };
  try{ renderSky(); }catch(e){}
})();
