/* Star Steps: store-app mode inside the game (2026-10-01). See /js/ss-store.js.
   In the store apps nothing is for sale: the plan screen never opens, and steps or tools that need
   a plan the family does not have are left out instead of showing a locked offer. A family that
   already has Pro or Super on the website logs in and sees all of it. */
(function(){
  "use strict";
  if(!window.SS_STORE||typeof window.renderPlan!=="function")return;
  window.renderPlan=function(){ try{SFX.tap();}catch(e){} try{toast("That part is not in the app.","sparkle");}catch(e){} };
  function tidy(){
    try{
      var pro=hasProContent(), sup=isSuper();
      var hide=function(id,on){var el=document.getElementById(id); if(el)el.hidden=on;};
      hide("drillBtn",!pro); hide("practiceBtn",!sup); hide("reportBtn",!sup);
      if(!pro){
        var list=nodesFor(S.grade), btns=[].slice.call(document.querySelectorAll("#pathBody .node"));
        list.forEach(function(n,i){ if(n.pro&&btns[i]){ var slot=btns[i].closest(".node-slot"); if(slot)slot.hidden=true; } });
      }
    }catch(e){}
  }
  var orig=window.renderPath;
  window.renderPath=function(){ var r=orig.apply(this,arguments); tidy(); return r; };
  tidy();
})();
