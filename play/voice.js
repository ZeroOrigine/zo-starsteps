/* Star Steps website build: read aloud (2026-09-30, v17).
   Children who cannot read yet (Senior Kindergarten, Grade 1) hear every lesson card and question.
   Uses the device's own voice (Web Speech API): free, no network, nothing sent anywhere.
   Setting (You > Read aloud): "Auto" reads each card as it opens and each answer as it is tapped;
   "Tap" reads only when the speaker button is pressed. Auto is the default up to Grade 1. */
(function(){
  "use strict";
  var synth=window.speechSynthesis;
  if(!synth||typeof window.SpeechSynthesisUtterance!=="function"||typeof window.renderStep!=="function")return;
  var voice=null;
  function pickVoice(){
    var vs=synth.getVoices()||[]; if(!vs.length)return;
    var en=vs.filter(function(v){return /^en[-_]/i.test(v.lang)||v.lang==="en";});
    var pref=["Samantha","Karen","Moira","Google US English","Google UK English Female","Microsoft Aria","Microsoft Jenny","Microsoft Zira"];
    for(var i=0;i<pref.length&&!voice;i++)voice=en.filter(function(v){return v.name.indexOf(pref[i])===0;})[0]||null;
    if(!voice)voice=en.filter(function(v){return v.localService;})[0]||en[0]||null;
  }
  pickVoice(); if(synth.addEventListener)synth.addEventListener("voiceschanged",pickVoice); else synth.onvoiceschanged=pickVoice;

  /* words a voice reads badly: symbols, emoji, blanks */
  var EMOJI=/(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[⃣️‍]|[\u{1F3FB}-\u{1F3FF}])+/gu;
  function clean(t){
    return String(t||"")
      .replace(EMOJI," ")
      .replace(/_{2,}|\?{2,}/g," blank ")
      .replace(/\s*=\s*\?/g," equals what?")
      .replace(/\s*=\s*/g," equals ")
      .replace(/\s*−\s*|\s+-\s+/g," minus ")
      .replace(/(?<=\d)\s*[\u00D7x]\s*(?=\d)/g," times ").replace(/\s*\u00D7\s*/g," times ")
      .replace(/\s*÷\s*/g," divided by ")
      .replace(/\s*\+\s*/g," plus ")
      .replace(/[→←↑↓↔↩↗↘]/g," ")
      .replace(/\s*·\s*/g,". ")
      .replace(/\s+/g," ").trim();
  }
  function hasWords(t){return /[A-Za-z0-9]/.test(clean(t));}

  function mode(){
    try{ if(S.readAloud==="auto"||S.readAloud==="tap")return S.readAloud; return (S.grade|0)<=1?"auto":"tap"; }
    catch(e){return "tap";}
  }
  var speaking=false;
  function say(text){
    var t=clean(text); if(!t)return;
    try{ synth.cancel(); }catch(e){}
    var u=new SpeechSynthesisUtterance(t);
    if(voice){u.voice=voice;u.lang=voice.lang;} else u.lang="en-US";
    var young=false; try{young=(S.grade|0)<=2;}catch(e){}
    u.rate=young?0.88:0.96; u.pitch=1.08; u.volume=1;
    u.onstart=function(){speaking=true;mark(true);};
    u.onend=u.onerror=function(){speaking=false;mark(false);};
    try{ synth.speak(u); }catch(e){}
  }
  function stop(){ try{synth.cancel();}catch(e){} speaking=false; mark(false); }
  function mark(on){ var b=document.getElementById("rdBtn"); if(b)b.classList.toggle("on",!!on); }

  /* what one card says, in reading order */
  function cardText(){
    var st=document.getElementById("stage"); if(!st)return "";
    var parts=[], h=st.querySelector("h2"), say1=st.querySelector(".say"), art=st.querySelector(".art"), q=st.querySelector(".qtext");
    if(h)parts.push(h.textContent);
    if(art&&!art.classList.contains("tiles")&&hasWords(art.textContent))parts.push(art.textContent);
    if(say1)parts.push(say1.textContent);
    if(q)parts.push(q.textContent);
    var opts=[].slice.call(st.querySelectorAll(".opt .otx")).map(function(o){return clean(o.textContent);}).filter(Boolean);
    if(opts.length>1&&opts.length<=5)parts.push("Is it "+opts.slice(0,-1).join(", ")+", or "+opts[opts.length-1]+"?");
    return parts.map(function(p){p=clean(p);return /[.!?]$/.test(p)?p:p+".";}).join(" ");
  }
  function addButton(){
    var st=document.getElementById("stage"); if(!st||document.getElementById("rdBtn"))return;
    var b=document.createElement("button");
    b.type="button"; b.id="rdBtn"; b.className="rd-btn";
    b.setAttribute("aria-label","Read this to me");
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.2v13.6l-4.8-4.3H4z" fill="currentColor"/><path d="M15.3 8.6a4.6 4.6 0 0 1 0 6.8M17.9 6a8.3 8.3 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    b.onclick=function(e){ e.stopPropagation(); if(speaking){stop();return;} say(cardText()); };
    st.insertBefore(b,st.firstChild);
  }
  var orig=window.renderStep;
  window.renderStep=function(){
    stop();
    var r=orig.apply(this,arguments);
    try{
      addButton();
      if(mode()==="auto"){ var t=cardText(); setTimeout(function(){ if(document.body.dataset.view==="play")say(t); },250); }
    }catch(e){}
    return r;
  };
  /* auto mode: tapping an answer reads it, so a child who cannot read can still choose */
  document.addEventListener("click",function(e){
    if(mode()!=="auto")return;
    var o=e.target.closest&&e.target.closest("#stage .opt"); if(!o)return;
    var x=o.querySelector(".otx"); if(x&&hasWords(x.textContent))say(x.textContent);
  },true);
  /* leaving the lesson stops the voice */
  if(typeof window.show==="function"){
    var origShow=window.show;
    window.show=function(v){ if(v!=="play")stop(); return origShow.apply(this,arguments); };
  }
  document.addEventListener("visibilitychange",function(){ if(document.hidden)stop(); });

  /* You > Read aloud */
  function row(){
    var list=document.querySelector('#viewPath .setlist'), snd=document.getElementById("soundRow");
    if(!list||document.getElementById("readRow"))return;
    var b=document.createElement("button"); b.className="setrow"; b.id="readRow";
    b.innerHTML='<span>Read aloud</span><b id="readVal"></b>';
    b.onclick=function(){
      S.readAloud=mode()==="auto"?"tap":"auto"; save(); paint();
      if(S.readAloud==="auto")say("I will read every card to you.");
      else stop();
    };
    (snd&&snd.nextSibling)?list.insertBefore(b,snd.nextSibling):list.appendChild(b);
    paint();
  }
  function paint(){ var v=document.getElementById("readVal"); if(v)v.textContent=mode()==="auto"?"Auto":"Tap the speaker"; }
  if(typeof window.renderMe==="function"){
    var origMe=window.renderMe;
    window.renderMe=function(){ var r=origMe.apply(this,arguments); try{row();paint();}catch(e){} return r; };
  }
  row();
  window.SSVoice={say:say,stop:stop,clean:clean,cardText:cardText,mode:mode};
})();
