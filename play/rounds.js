/* Star Steps website build: path rounds (2026-10-01, v20).
   Every step already has five crown levels (six with Super), and each crown asks harder questions
   (the question makers take the crown as their level). Before this, once every step had one crown
   the path simply ended: nothing said "next". Now the path runs in rounds, like a long course:
   Round 1 opens every step; Round 2 (Silver) brings every step back one level harder; then Gold,
   Diamond, Master, and Legendary with Super. The path always has a NEXT step until every step of
   the grade is at the top level. Nothing new is stored: the round is read from the crowns. */
(function(){
  "use strict";
  if(typeof window.renderPath!=="function"||typeof nodesFor!=="function")return;
  var ROUNDS=[null,
    {name:"Explorer", c1:"#8EE3A8",c2:"#2FAE62"},
    {name:"Silver",   c1:"#EEF2F8",c2:"#9AA7BD"},
    {name:"Gold",     c1:"#FFE08A",c2:"#E0A000"},
    {name:"Diamond",  c1:"#BDEBFF",c2:"#3AA6E0"},
    {name:"Master",   c1:"#E4CCFF",c2:"#8C5BE0"},
    {name:"Legendary",c1:"#FFC2E0",c2:"#E0468F"}];
  function steps(g){ return nodesFor(g).filter(function(n){return !n.bonus;}); }
  function state(g){
    var list=steps(g), cap=crownCap(), min=Infinity, atTop=0, left=0;
    list.forEach(function(n){ var c=crownOf(n.id); if(c<min)min=c; if(c>=cap)atTop++; left+=Math.max(0,cap-c); });
    if(!list.length)min=0;
    var done=min>=cap, r=done?cap:min+1;
    var inRound=list.filter(function(n){return crownOf(n.id)>=r;}).length;
    return {round:r,done:done,cap:cap,total:list.length,inRound:inRound,left:left,list:list};
  }
  function target(g){
    var s=state(g); if(s.done||s.round<2)return null;
    for(var i=0;i<s.list.length;i++) if(crownOf(s.list[i].id)<s.round) return s.list[i];
    return null;
  }
  window.SSRounds={state:state,target:target,ROUNDS:ROUNDS};

  /* ── the path: a round banner on top, and the NEXT step moved to the round's next step ── */
  function banner(){
    var body=document.getElementById("pathBody"); if(!body)return;
    var s=state(S.grade), R=ROUNDS[Math.min(s.round,6)];
    var b=document.getElementById("rndBar");
    if(!b){ b=document.createElement("div"); b.id="rndBar"; b.className="rnd"; }
    body.insertBefore(b,body.firstChild);
    b.style.setProperty("--m1",R.c1); b.style.setProperty("--m2",R.c2);
    var pct=s.total?Math.round(s.inRound/s.total*100):0;
    b.innerHTML='<div class="rnd-medal" aria-hidden="true"><b></b></div><div class="rnd-tx"><small></small><h3></h3>'+
      '<div class="rnd-bar"><i></i></div><p></p></div>';
    b.querySelector(".rnd-medal b").textContent=s.done?"★":s.round;
    b.querySelector("small").textContent=s.done?"Every round done":"Round "+s.round+" of "+s.cap;
    b.querySelector("h3").textContent=s.done?gradeLabel(S.grade)+" mastered":R.name+" round";
    b.querySelector(".rnd-bar i").style.width=(s.done?100:pct)+"%";
    b.querySelector("p").textContent=s.done
      ? "All "+s.total+" steps are at the top level. Try the next grade, or keep sharp in Practice."
      : s.round===1
        ? s.inRound+" of "+s.total+" steps open. After this round, every step comes back a level harder."
        : s.inRound+" of "+s.total+" steps at "+R.name+". Every step comes back a level harder: "+s.left+" lessons left in this grade.";
  }
  function moveHere(){
    var t=target(S.grade); if(!t)return false;
    var body=document.getElementById("pathBody"); if(!body)return false;
    var btns=[].slice.call(body.querySelectorAll(".node"));
    var list=nodesFor(S.grade), idx=list.findIndex(function(n){return n.id===t.id;});
    if(idx<0||!btns[idx])return false;
    btns.forEach(function(x){x.classList.remove("here"); var tg=x.querySelector(".node-tag"); if(tg)tg.remove();});
    var b=btns[idx]; b.classList.add("here");
    var tag=document.createElement("span"); tag.className="node-tag"; tag.textContent="NEXT"; b.appendChild(tag);
    return true;
  }
  var origPath=window.renderPath;
  window.renderPath=function(){
    var r=origPath.apply(this,arguments);
    try{ banner(); if(moveHere()&&window.SSUxApply)SSUxApply(); }catch(e){}
    return r;
  };
  /* "Next step" after a lesson follows the round */
  if(typeof window.nextNodeAfter==="function"){
    var origNext=window.nextNodeAfter;
    window.nextNodeAfter=function(node){
      var s=state(S.grade);
      if(s.round>=2&&!s.done){
        var i=s.list.findIndex(function(n){return n.id===node.id;});
        for(var k=i+1;k<s.list.length;k++) if(crownOf(s.list[k].id)<s.round) return s.list[k];
        for(k=0;k<i;k++) if(crownOf(s.list[k].id)<s.round) return s.list[k];
        return null;
      }
      return origNext.apply(this,arguments);
    };
  }
  /* Today: the big button names the round */
  if(typeof window.renderContinue==="function"){
    var origCont=window.renderContinue;
    window.renderContinue=function(){
      var r=origCont.apply(this,arguments);
      try{
        var t=target(S.grade), s=state(S.grade);
        if(t){
          var ico=document.getElementById("contIco");
          if(ico)ico.innerHTML=t.type==="boss"?dIco("rock"):t.type==="mini"?dIco("memo"):icoHTML(t.unit);
          document.getElementById("contTitle").textContent=(t.type==="boss"?t.title:t.type==="mini"?"Checkpoint "+t.title.replace("Check ",""):t.title)+" · "+ROUNDS[s.round].name;
          document.getElementById("contSub").textContent=t.unit.name+" · "+gradeLabel(S.grade)+" · round "+s.round+" of "+s.cap;
        }
      }catch(e){}
      return r;
    };
  }
  /* achievements for finishing rounds, in any grade */
  function anyGrade(k){ for(var g=0;g<=6;g++){ try{ var l=steps(g); if(l.length&&l.every(function(n){return crownOf(n.id)>=k;}))return true; }catch(e){} } return false; }
  if(typeof BADGES!=="undefined"){
    [{id:"rnd1",ico:"sprout",name:"Path Opened",  desc:"Open every step in a grade",   test:function(){return anyGrade(1);}},
     {id:"rnd2",ico:"medal", name:"Silver Round", desc:"Finish the Silver round",       test:function(){return anyGrade(2);}},
     {id:"rnd3",ico:"crown", name:"Gold Round",   desc:"Finish the Gold round",         test:function(){return anyGrade(3);}},
     {id:"rnd5",ico:"trophy",name:"Grade Master", desc:"Every step in a grade at crown 5",test:function(){return anyGrade(5);}}
    ].forEach(function(b){ if(!BADGES.some(function(x){return x.id===b.id;}))BADGES.push(b); });
    try{ BADGES.forEach(function(b){ if(/^rnd/.test(b.id)&&!S.badges.includes(b.id)&&b.test(S))S.badges.push(b.id); }); }catch(e){}
  }
  /* redraw once so the round shows now; never while the welcome screen or a lesson is up
     (the game's own redraw would switch the view back to the path) */
  try{ var v=document.body.dataset.view; if(v!=="intro"&&v!=="play"&&v!=="done")renderPath(); else { banner(); } }catch(e){}
})();
