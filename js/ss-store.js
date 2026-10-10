/* Star Steps: store-app mode (2026-10-01).
   The Android (Google Play) and iPhone/iPad (App Store) apps open this same site. Store rules say
   digital plans bought inside an app must use the store's own billing, so the store apps sell
   nothing: every lesson is free, and a family that already pays on the website simply logs in.
   The app is recognised by its start address (?src=android / ?src=ios), the Android app referrer,
   or the iOS app's user agent. The flag lives in sessionStorage, so the same phone's normal browser
   is never affected. */
(function(){
  "use strict";
  var st=null;
  try{
    var m=/[?&]src=(android|ios)\b/.exec(location.search);
    if(m)st=m[1];
    else if(document.referrer.indexOf("android-app://com.zeroorigine.starsteps")===0)st="android";
    else if(window.Capacitor||/StarStepsApp/.test(navigator.userAgent))st="ios";
    if(st)sessionStorage.setItem("ss.store",st); else st=sessionStorage.getItem("ss.store");
  }catch(e){}
  window.SS_STORE=st||null;
  if(!st)return;
  var de=document.documentElement; de.classList.add("ss-store","ss-store-"+st);
  var css=document.createElement("style");
  css.textContent=
    /* game: no plan screen, no Super offer, no plan-only tiles */
    "html.ss-store #superCta,html.ss-store #planBtn,html.ss-store .tier-tag{display:none!important}"+
    /* homepage (if ever reached): no prices or trials */
    "html.ss-store #plans,html.ss-store [data-buy],html.ss-store .maker .soc,html.ss-store .maker .soc-lead,html.ss-store .maker .soc-note{display:none!important}";
  (document.head||de).appendChild(css);
  /* Nova AI (nova.zeroorigine.com) is a separate app: inside the store apps a grown-up answers a sum before the link leaves the app */
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[data-nova]"); if(!a)return;
    e.preventDefault(); e.stopPropagation();
    if(document.getElementById("ssNovaGate"))return;
    var x=3+Math.floor(Math.random()*6),y=2+Math.floor(Math.random()*7);
    var g=document.createElement("div"); g.id="ssNovaGate";
    g.innerHTML='<div class="sng-card" role="dialog" aria-modal="true" aria-labelledby="sngT"><b id="sngT">Ask a grown-up first</b><p>Nova AI is a separate app by Advik. A grown-up should open it with you.<br>Grown-up, what is <strong>'+x+' \u00d7 '+y+'</strong>?</p><form><input inputmode="numeric" aria-label="Answer" placeholder="Answer" autocomplete="off"><button type="submit">Go</button><button type="button" class="sng-x">Cancel</button></form></div>';
    var st=document.createElement("style"); st.textContent="#ssNovaGate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(0,0,0,.55);padding:16px;font-family:ui-rounded,'SF Pro Rounded','Nunito','Quicksand','Avenir Next',system-ui,sans-serif}#ssNovaGate .sng-card{width:min(360px,100%);background:#fff;color:#1d1b33;border-radius:18px;padding:18px;display:grid;gap:10px;box-shadow:0 20px 50px rgba(0,0,0,.4)}#ssNovaGate b{font-size:18px}#ssNovaGate p{margin:0;font-size:15px;line-height:1.45;color:#444}#ssNovaGate form{display:flex;gap:8px;flex-wrap:wrap}#ssNovaGate input{flex:1 1 90px;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border-radius:12px;border:2px solid #cfc9e8}#ssNovaGate button{font:inherit;font-weight:800;padding:10px 14px;border-radius:12px;border:0;background:#5b4ee0;color:#fff;cursor:pointer}#ssNovaGate .sng-x{background:#eee;color:#333}";
    g.appendChild(st); document.body.appendChild(g);
    var inp=g.querySelector("input"); inp.focus();
    g.querySelector(".sng-x").addEventListener("click",function(){g.remove();});
    g.addEventListener("click",function(ev){if(ev.target===g)g.remove();});
    g.querySelector("form").addEventListener("submit",function(ev){ev.preventDefault();if(+inp.value===x*y){g.remove();window.open(a.href,"_blank","noopener");}else{inp.value="";inp.placeholder="Try again";}});
  },true);
  /* inside the app the parent page is the parent area, not the marketing page */
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[href]"); if(!a)return;
    var h=a.getAttribute("href");
    if(h==="/"||h==="/?stay=1"||h.indexOf("/?stay=1#")===0||h.indexOf("/#")===0){ e.preventDefault(); location.href="/parents/"; }
  },true);
})();
