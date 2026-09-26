/* Star Steps website build: grown-ups layer (Phase A, 2026-09-26).
   1. Every route into the plan screen (which shows prices) asks a grown-up
      question first. Re-renders inside the plan screen are not gated.
   2. A "For grown-ups" tile in the You tab and the Star Steps logo in the
      top bar lead, through the same gate, to the parent page at the site root.
   Nothing here is stored or sent anywhere. */
(function(){
  "use strict";
  var WORDS={3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",9:"nine",12:"twelve",13:"thirteen",
    14:"fourteen",15:"fifteen",16:"sixteen",17:"seventeen",18:"eighteen",19:"nineteen"};
  var PASS_MS=3*60*1000, passedAt=0, fails=0, lockUntil=0;
  function rint(a,b){return a+Math.floor(Math.random()*(b-a+1));}
  function passedRecently(){return Date.now()-passedAt<PASS_MS;}

  function gate(onPass){
    if(passedRecently()){onPass();return;}
    var a=rint(12,19), b=rint(3,9), ans=a*b;
    var back=document.createElement("div"); back.className="gate-back";
    back.innerHTML='<div class="gate" role="dialog" aria-modal="true" aria-labelledby="gTitle">'+
      '<div class="g-kick">For grown-ups</div><h2 id="gTitle">Ask a grown-up</h2>'+
      '<p>Plans and settings are for parents. A grown-up can answer this to continue.</p>'+
      '<div class="g-q">What is '+WORDS[a]+' times '+WORDS[b]+'?</div>'+
      '<input id="gAns" inputmode="numeric" autocomplete="off" aria-label="Answer" maxlength="4">'+
      '<div class="g-msg" id="gMsg" aria-live="polite"></div>'+
      '<div class="g-row"><button class="g-cancel" id="gCancel">Back</button>'+
      '<button class="g-ok" id="gOk">Continue</button></div></div>';
    document.body.appendChild(back);
    var inp=back.querySelector("#gAns"), msg=back.querySelector("#gMsg"), ok=back.querySelector("#gOk");
    function close(){back.remove();}
    function lockedMsg(){
      var s=Math.ceil((lockUntil-Date.now())/1000);
      if(s>0){msg.textContent="Too many tries. Try again in "+s+" seconds.";ok.disabled=true;
        setTimeout(lockedMsg,1000);} else {ok.disabled=false;msg.textContent="";}
    }
    function check(){
      if(Date.now()<lockUntil){lockedMsg();return;}
      if(parseInt(inp.value,10)===ans){passedAt=Date.now();fails=0;close();onPass();return;}
      fails++; inp.value="";
      if(fails>=3){fails=0;lockUntil=Date.now()+30000;lockedMsg();}
      else msg.textContent="That is not right. Please ask a grown-up.";
      inp.focus();
    }
    ok.onclick=check;
    back.querySelector("#gCancel").onclick=close;
    back.addEventListener("click",function(e){if(e.target===back)close();});
    inp.addEventListener("keydown",function(e){if(e.key==="Enter")check();if(e.key==="Escape")close();});
    if(Date.now()<lockUntil)lockedMsg();
    setTimeout(function(){inp.focus();},50);
  }
  window.ssGate=gate;

  /* gate the plan screen: only when entering it from somewhere else */
  if(typeof window.renderPlan==="function"){
    var orig=window.renderPlan;
    window.renderPlan=function(){
      var self=this,args=arguments;
      if(document.body.dataset.view==="plan")return orig.apply(self,args);
      gate(function(){orig.apply(self,args);});
    };
  }

  /* the Star Steps logo in the top bar leads home, through the same gate */
  var brand=document.querySelector(".topbar .brand");
  if(brand&&!brand.dataset.home){
    brand.dataset.home="1";
    brand.setAttribute("role","link"); brand.setAttribute("tabindex","0");
    brand.setAttribute("aria-label","Star Steps home, for grown-ups");
    brand.title="Star Steps home (grown-ups)";
    var goHome=function(){gate(function(){location.href="/?stay=1";});};
    brand.addEventListener("click",goHome);
    brand.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();goHome();}});
  }

  /* "For grown-ups" tile in the You tab */
  var tools=document.querySelector('.tools[data-sec="me"]');
  if(tools&&!document.getElementById("grownBtn")){
    var t=document.createElement("button");
    t.className="tool"; t.id="grownBtn";
    t.innerHTML='<div class="ti" style="background:var(--sky-soft)" aria-hidden="true">\u{1F46A}</div>'+
      '<div><div class="tt">For grown-ups</div><div class="ts">Plans, privacy and help</div></div>';
    t.onclick=function(){gate(function(){location.href="/?stay=1#parents";});};
    tools.appendChild(t);
  }
})();
