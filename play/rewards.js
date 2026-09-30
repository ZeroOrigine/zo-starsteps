/* Star Steps website build: levels, achievements and the Rewards page (2026-09-30, v17).
   Stars are the experience points: they only ever go up, so a level is simply read from them.
   Nothing new is stored except the last level shown (so a level-up is celebrated once).
   The stickers the game already awards are the achievements; this adds eleven more that the
   game already counts (levels, subjects tried, the strategy games) and shows every one with
   its progress, on the Rewards page itself instead of behind a button. */
(function(){
  "use strict";
  if(typeof window.renderWallet!=="function"||typeof BADGES==="undefined")return;

  /* ── levels: level L needs 25 x L x (L-1) stars: 0, 50, 150, 300, 500, 750, 1050 ... ── */
  function need(L){return 25*L*(L-1);}
  function levelOf(stars){var L=1;while(need(L+1)<=stars)L++;return L;}
  function info(stars){
    stars=Math.max(0,stars|0); var L=levelOf(stars), a=need(L), b=need(L+1);
    return {level:L,stars:stars,from:a,to:b,left:b-stars,pct:Math.round((stars-a)/(b-a)*100)};
  }
  window.SSLevel={info:info,need:need};

  /* ── achievements the game already counts, added to its sticker list ── */
  function unitsTried(s){
    var seen={}, n=0;
    try{ for(var g=0;g<=6;g++) nodesFor(g).forEach(function(x){
      if(x.type==="skill"&&x.unit&&(s.crown[x.id]||0)>0&&!seen[x.unit.key]){seen[x.unit.key]=1;n++;} }); }catch(e){}
    return n;
  }
  var G=function(s,k){return (s.games&&s.games[k])||0;};
  var MORE=[
    {id:"lv5",  ico:"stars2",name:"Level 5",       desc:"Reach level 5",               test:function(s){return levelOf(s.stars)>=5;}},
    {id:"lv10", ico:"peak",  name:"Level 10",      desc:"Reach level 10",              test:function(s){return levelOf(s.stars)>=10;}},
    {id:"sub5", ico:"globe", name:"Explorer",      desc:"Learn in 5 subjects",         test:function(s){return unitsTried(s)>=5;}},
    {id:"sub12",ico:"rocket",name:"All-Rounder",   desc:"Learn in 12 subjects",        test:function(s){return unitsTried(s)>=12;}},
    {id:"g_mate",ico:"crown",name:"Checkmate",     desc:"Solve a Mate in One",         test:function(s){return G(s,"chess")>=1;}},
    {id:"g_pip", ico:"trophy",name:"Beat Pip",     desc:"Win a chess game against Pip",test:function(s){return G(s,"pipW")>=1;}},
    {id:"g_mem", ico:"sparkle",name:"Sharp Memory",desc:"Clear Memory Match",          test:function(s){return G(s,"memory")>0;}},
    {id:"g_sdk", ico:"aim",  name:"Sudoku Solver", desc:"Solve a Mini Sudoku",         test:function(s){return G(s,"sudoku")>=1;}},
    {id:"g_hnoi",ico:"rock", name:"Tower Mover",   desc:"Finish the Tower of Hanoi",   test:function(s){return G(s,"hanoi")>0;}},
    {id:"g_rec", ico:"bolt", name:"Pattern Pro",   desc:"Repeat a pattern of 6",       test:function(s){return G(s,"recall")>=6;}},
    {id:"g_ana", ico:"burst",name:"Word Hunter",   desc:"Score 5 in Anagram Hunt",     test:function(s){return G(s,"anagram")>=5;}}
  ];
  MORE.forEach(function(b){ if(!BADGES.some(function(x){return x.id===b.id;})) BADGES.push(b); });

  /* how far along each achievement is: [now, goal] */
  function prog(b,s){
    var c=function(v,g){return [Math.min(v|0,g),g];};
    switch(b.id){
      case "first":return c(s.lessonsDone,1); case "ten":return c(s.lessonsDone,10); case "fifty":return c(s.lessonsDone,50);
      case "perf":return c(s.perfects,1); case "perf5":return c(s.perfects,5);
      case "s3":return c(s.bestStreak,3); case "s7":return c(s.bestStreak,7); case "s30":return c(s.bestStreak,30);
      case "c250":return c(s.stars,250); case "c1000":return c(s.stars,1000);
      case "combo":return c(s.bestCombo,6); case "combo12":return c(s.bestCombo,12);
      case "endless":return c(s.endlessBest,30); case "speedy":return c(s.speedBest,20);
      case "dapper":return c((s.hats||[]).length,3);
      case "ice1":return c(s.freezesEver,1); case "ice3":return c(s.freezesEver,3); case "ice10":return c(s.freezesEver,10);
      case "saved1":return c(s.savedEver,1);
      case "lv5":return c(levelOf(s.stars),5); case "lv10":return c(levelOf(s.stars),10);
      case "sub5":return c(unitsTried(s),5); case "sub12":return c(unitsTried(s),12);
      case "g_rec":return c(G(s,"recall"),6); case "g_ana":return c(G(s,"anagram"),5);
      default:return null;
    }
  }

  /* first run after this update: stickers already earned are added quietly, no shower of toasts */
  (function quiet(){
    var changed=false;
    BADGES.forEach(function(b){ try{ if(!S.badges.includes(b.id)&&b.test(S)){S.badges.push(b.id);changed=true;} }catch(e){} });
    if(typeof S.levelSeen!=="number"){S.levelSeen=levelOf(S.stars);changed=true;}
    if(changed)try{save();}catch(e){}
  })();

  /* strategy-game wins are saved outside lessons: check stickers there too */
  if(typeof window.save==="function"&&typeof window.checkBadges==="function"){
    var origSave=window.save, busy=false;
    window.save=function(){
      if(!busy&&document.body.dataset.view!=="play"){ busy=true; try{checkBadges();levelCheck();}catch(e){} busy=false; }
      return origSave.apply(this,arguments);
    };
  }

  /* ── level up: celebrated once, after the lesson screen ── */
  function levelCheck(){
    var L=levelOf(S.stars);
    if(typeof S.levelSeen!=="number"){S.levelSeen=L;return;}
    if(L>S.levelSeen){ S.levelSeen=L; setTimeout(function(){celebrate(L);},900); }
  }
  function celebrate(L){
    var old=document.getElementById("lvUp"); if(old)old.remove();
    var d=document.createElement("div"); d.id="lvUp"; d.className="lv-up"; d.setAttribute("role","status");
    d.innerHTML='<div class="lv-card"><div class="lv-burst" aria-hidden="true"></div>'+
      '<div class="lv-num"><small>Level</small><b></b></div><h3></h3><p></p>'+
      '<button type="button" class="lv-ok">Keep climbing</button></div>';
    d.querySelector(".lv-num b").textContent=L;
    d.querySelector("h3").textContent="Level up!";
    var i=info(S.stars);
    d.querySelector("p").textContent="You are now "+rankFor(S.stars)+". "+i.left+" stars to level "+(L+1)+".";
    var close=function(){d.classList.add("out");setTimeout(function(){d.remove();},260);};
    d.querySelector(".lv-ok").onclick=close; d.onclick=function(e){if(e.target===d)close();};
    document.body.appendChild(d);
    try{SFX.crown();}catch(e){} try{FX.confetti(140);}catch(e){}
    try{ if(window.SSVoice&&SSVoice.mode()==="auto")SSVoice.say("Level up! You reached level "+L+"."); }catch(e){}
    setTimeout(function(){ var b=d.querySelector(".lv-ok"); if(b)b.focus(); },50);
  }

  /* ── done screen: the stars just won fill the level bar ── */
  function doneBar(gained){
    var host=document.querySelector("#viewDone .result"); if(!host)return;
    var box=document.getElementById("lvDone");
    if(!box){ box=document.createElement("div"); box.id="lvDone"; box.className="lv-done";
      box.innerHTML='<div class="lv-row"><span class="lv-chip"></span><span class="lv-txt"></span></div><div class="lv-bar"><i></i></div>';
      var ref=document.getElementById("streakUp"); host.insertBefore(box,ref||null); }
    var now=info(S.stars), before=info(S.stars-(gained|0));
    box.querySelector(".lv-chip").textContent="Level "+now.level;
    box.querySelector(".lv-txt").textContent=now.left+" stars to level "+(now.level+1);
    var bar=box.querySelector(".lv-bar i");
    bar.style.transition="none"; bar.style.width=(before.level<now.level?0:before.pct)+"%";
    requestAnimationFrame(function(){requestAnimationFrame(function(){ bar.style.transition=""; bar.style.width=now.pct+"%"; });});
  }
  if(typeof window.finish==="function"){
    var origFinish=window.finish;
    window.finish=function(){
      var s0=S.stars, r=origFinish.apply(this,arguments);
      try{ doneBar(S.stars-s0); levelCheck(); save(); }catch(e){}
      return r;
    };
  }

  /* ── the Rewards page ── */
  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
  var expanded=false;
  function render(){
    var head=document.querySelector('#viewPath .section-head[data-sec="rewards"]'); if(!head)return;
    var box=document.getElementById("rwBox");
    if(!box){ box=el("div","rw"); box.id="rwBox"; box.setAttribute("data-sec","rewards"); head.insertAdjacentElement("afterend",box); }
    var i=info(S.stars), rank=rankFor(S.stars);
    var nextRank=null; try{ for(var k=0;k<RANKS.length;k++) if(RANKS[k][0]>S.stars){nextRank=RANKS[k];break;} }catch(e){}
    box.innerHTML="";
    /* level card */
    var lv=el("div","rw-level");
    lv.innerHTML='<div class="rw-badge" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="M50 4l12.9 26.2 28.9 4.2-20.9 20.4 4.9 28.8L50 70.1 24.2 83.6l4.9-28.8L8.2 34.4l28.9-4.2z"/></svg><b></b></div>'+
      '<div class="rw-lvtext"><small>Level</small><h3></h3><p class="rw-rank"></p><div class="rw-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i></div><p class="rw-left"></p></div>';
    lv.querySelector(".rw-badge b").textContent=i.level;
    lv.querySelector("h3").textContent="Level "+i.level;
    lv.querySelector(".rw-rank").textContent=rank+(nextRank?" · next title: "+nextRank[1]+" at "+nextRank[0]+" stars":" · top title");
    var bar=lv.querySelector(".rw-bar"); bar.setAttribute("aria-valuenow",i.pct); bar.setAttribute("aria-label","Level progress");
    lv.querySelector(".rw-bar i").style.width=i.pct+"%";
    lv.querySelector(".rw-left").textContent=(S.stars-i.from)+" of "+(i.to-i.from)+" stars · "+i.left+" to level "+(i.level+1);
    box.appendChild(lv);
    /* wallet */
    var w=el("div","rw-wallet");
    [["star",S.stars,"Stars","every right answer"],["gem",S.gems,"Gems","spend in the shop"],["trophy",S.badges.length+"/"+BADGES.length,"Stickers","achievements"]].forEach(function(r){
      var t=el("div","rw-tile"); var ic=el("span","rw-ico"); ic.setAttribute("aria-hidden","true");
      try{ic.innerHTML=drawn(r[0]);}catch(e){}
      t.appendChild(ic); var tx=el("div"); tx.appendChild(el("b",null,String(r[1]))); tx.appendChild(el("span",null,r[2])); t.appendChild(tx); w.appendChild(t);
    });
    box.appendChild(w);
    /* achievements: closest first, then the rest, earned ones last */
    var list=BADGES.map(function(b){var got=S.badges.includes(b.id),p=null;try{p=prog(b,S);}catch(e){}return {b:b,got:got,p:p,r:got?2:(p?p[0]/p[1]:0)};});
    var todo=list.filter(function(x){return !x.got;}).sort(function(a,b){return b.r-a.r;}), done=list.filter(function(x){return x.got;});
    var h=el("div","rw-h"); h.appendChild(el("h3",null,"Achievements")); h.appendChild(el("span",null,done.length+" of "+list.length+" earned")); box.appendChild(h);
    var grid=el("div","rw-grid");
    todo.concat(done).forEach(function(x,ix){
      var c=el("div","rw-ach"+(x.got?" got":"")+(!x.got&&ix<3?" near":"")); c.style.setProperty("--i",ix);
      var ic=el("span","rw-aico"); ic.setAttribute("aria-hidden","true"); try{ic.innerHTML=drawn(x.b.ico);}catch(e){}
      c.appendChild(ic);
      var t=el("div","rw-atx"); t.appendChild(el("b",null,x.b.name)); t.appendChild(el("span",null,x.b.desc));
      if(!x.got&&x.p){ var pb=el("div","rw-pbar"); var fill=el("i"); fill.style.width=Math.round(x.p[0]/x.p[1]*100)+"%"; pb.appendChild(fill); t.appendChild(pb);
        t.appendChild(el("small",null,x.p[0]+" / "+x.p[1])); }
      if(x.got)t.appendChild(el("small","rw-done","Earned"));
      c.appendChild(t); c.setAttribute("aria-label",x.b.name+": "+x.b.desc+(x.got?". Earned.":x.p?". "+x.p[0]+" of "+x.p[1]+".":". Not yet."));
      grid.appendChild(c);
    });
    box.appendChild(grid);
    /* the closest few show first; the whole list is one tap away */
    var SHOW=8, all=grid.children.length;
    if(all>SHOW&&!expanded){
      [].slice.call(grid.children,SHOW).forEach(function(c){c.hidden=true;});
      var more=el("button","rw-more","Show all "+all+" achievements"); more.type="button";
      more.onclick=function(){ expanded=true; [].slice.call(grid.children).forEach(function(c){c.hidden=false;}); more.remove(); try{SFX.tap();}catch(e){} };
      box.appendChild(more);
    }
    var sb=document.getElementById("statsBtn"); if(sb)sb.hidden=true;
    var wl=document.getElementById("wallet"); if(wl)wl.hidden=true;
  }
  /* Today: a level strip inside the hero card; tapping it opens Rewards */
  function strip(){
    var hero=document.querySelector('#viewPath .pip-hero'); if(!hero)return;
    var b=document.getElementById("lvStrip");
    if(!b){ b=el("button","lv-strip"); b.id="lvStrip"; b.type="button";
      b.innerHTML='<span class="lv-chip"></span><span class="lv-mid"><span class="lv-bar"><i></i></span><small></small></span>';
      b.onclick=function(){ try{SFX.tap();}catch(e){} try{setTab("rewards");}catch(e){} };
      hero.appendChild(b); }
    var i=info(S.stars);
    b.querySelector(".lv-chip").textContent="Level "+i.level;
    b.querySelector(".lv-bar i").style.width=i.pct+"%";
    b.querySelector("small").textContent=i.left+" stars to level "+(i.level+1);
    b.setAttribute("aria-label","Level "+i.level+". "+i.left+" stars to level "+(i.level+1)+". Open rewards.");
  }
  var origWallet=window.renderWallet;
  window.renderWallet=function(){ var r=origWallet.apply(this,arguments); try{render();strip();}catch(e){} return r; };

  /* You: "Level 4 · Explorer · Grade 2" */
  if(typeof window.renderMe==="function"){
    var origMe=window.renderMe;
    window.renderMe=function(){ var r=origMe.apply(this,arguments);
      try{ var m=document.getElementById("meRank"); if(m&&m.textContent.indexOf("Level ")!==0)m.textContent="Level "+levelOf(S.stars)+" · "+m.textContent; }catch(e){} return r; };
  }
  /* top bar (wide screens): "Level 4 · Explorer · Grade 2" */
  if(typeof window.syncTop==="function"){
    var origTop=window.syncTop;
    window.syncTop=function(){ var r=origTop.apply(this,arguments);
      try{ var rl=document.getElementById("rankLabel"); if(rl&&rl.textContent.indexOf("Level ")!==0)rl.textContent="Level "+levelOf(S.stars)+" \u00B7 "+rl.textContent; }catch(e){} return r; };
  }
  try{ render(); strip(); renderMe(); syncTop(); }catch(e){}
})();
