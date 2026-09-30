/* Star Steps website build: one cartoon chess set (2026-09-30, v17).
   Every board in the game (Mate in One, Challenge Pip, Chess School) is drawn by boardHTML().
   This swaps the font glyphs for six hand-drawn pieces in one chunky style, in two colours:
   cream for White and dark plum for Black, so every piece matches every other piece.
   Pieces drop in when a board opens, the chosen piece hops, and a moved piece lands with a bounce. */
(function(){
  "use strict";
  if(typeof window.boardHTML!=="function")return;
  var EDGE="#221A3D";
  /* shared base: a rounded plinth and collar */
  var BASE='<path d="M22 92h56a4 4 0 0 0 4-4v-3a6 6 0 0 0-6-6H24a6 6 0 0 0-6 6v3a4 4 0 0 0 4 4z"/>'+
           '<rect x="28" y="70" width="44" height="10" rx="5"/>';
  var ART={
    p:'<path d="M36 72c2-11 6-19 8-24h12c2 5 6 13 8 24z"/><rect x="36" y="42" width="28" height="8" rx="4"/><circle cx="50" cy="30" r="14"/>',
    r:'<path d="M32 72l3-34h30l3 34z"/><path d="M28 40V20h9v7h8v-7h10v7h8v-7h9v20z"/>',
    b:'<path d="M36 72c2-10 4-17 6-22h16c2 5 4 12 6 22z"/><path d="M50 13c14 9 17 23 9 36H41c-8-13-5-27 9-36z"/>'+
      '<path class="d" d="M56 23l-9 11" fill="none"/><circle cx="50" cy="10" r="5"/>',
    n:'<path d="M30 72c0-12 6-20 14-26-7 0-14 1-18-3-2-6 4-12 10-16 4-8 14-14 24-12 12 2 18 16 16 32-1 10-4 18-4 25z"/>'+
      '<path d="M52 17l4-11 7 10z"/><circle class="e" cx="52" cy="29" r="3.4"/><circle class="e" cx="31" cy="37" r="2"/>'+
      '<path class="d" d="M63 21c8 10 8 24 4 36" fill="none"/>',
    q:'<path d="M34 72c2-10 4-18 6-24h20c2 6 4 14 6 24z"/><path d="M28 24l8 20 4-24 7 22 3-26 3 26 7-22 4 24 8-20-5 24H33z"/>'+
      '<circle cx="28" cy="21" r="4.5"/><circle cx="40" cy="17" r="4.5"/><circle cx="50" cy="13" r="4.5"/><circle cx="60" cy="17" r="4.5"/><circle cx="72" cy="21" r="4.5"/>',
    k:'<path d="M34 72c2-11 4-19 6-26h20c2 7 4 15 6 26z"/><path d="M32 46c-2-11 5-19 18-19s20 8 18 19z"/><rect x="31" y="42" width="38" height="8" rx="4"/>'+
      '<path d="M46 5h8v8h8v8h-8v7h-8v-7h-8v-8h8z"/>'
  };
  var NAME={p:"pawn",r:"rook",b:"bishop",n:"knight",q:"queen",k:"king"};
  var BY_GLYPH={"♚":"k","♛":"q","♜":"r","♝":"b","♞":"n","♟":"p"};
  function piece(t,white){
    return '<svg class="pc '+(white?"pw":"pb")+'" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g>'+BASE+ART[t]+'</g>'+
      '<ellipse class="sh" cx="40" cy="30" rx="6" ry="9"/></svg>';
  }
  /* one hidden set of gradients for every piece */
  if(!document.getElementById("pcDefs")){
    var d=document.createElement("div"); d.id="pcDefs"; d.setAttribute("aria-hidden","true");
    d.style.cssText="position:absolute;width:0;height:0;overflow:hidden";
    d.innerHTML='<svg width="0" height="0"><defs>'+
      '<linearGradient id="pcW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F4EEDC"/><stop offset="1" stop-color="#D7CDB2"/></linearGradient>'+
      '<linearGradient id="pcB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A5A9E"/><stop offset=".5" stop-color="#3F3370"/><stop offset="1" stop-color="#241A45"/></linearGradient>'+
      '</defs></svg>';
    document.body.appendChild(d);
  }
  var orig=window.boardHTML;
  window.boardHTML=function(){
    var h=orig.apply(this,arguments), n=0;
    return h.replace(/<span class="(wp|bp)">([♚-♟])<\/span>/g,function(m,cls,g){
      var t=BY_GLYPH[g]; if(!t)return m;
      return '<span class="'+cls+' pcw" data-pc="'+t+'" style="--n:'+(n++)+'" title="'+(cls==="wp"?"White ":"Black ")+NAME[t]+'">'+piece(t,cls==="wp")+'</span>';
    });
  };
  /* a fresh board (a new puzzle or a new game) drops its pieces in; a move or a tap does not */
  function sig(b){ return [].map.call(b.querySelectorAll(".sq"),function(q){var p=q.querySelector("[data-pc]");return p?(p.classList.contains("wp")?"w":"b")+p.dataset.pc:".";}); }
  function watch(){
    document.querySelectorAll(".board").forEach(function(b){
      if(b.__pc)return; b.__pc=1;
      var host=b.parentNode, now=sig(b), old=host&&host.__pcSig, diff=0;
      if(old)for(var i=0;i<64;i++)if(old[i]!==now[i])diff++;
      if(host)host.__pcSig=now;
      if(!old||diff>3){ b.classList.add("pc-in"); setTimeout(function(){b.classList.remove("pc-in");},1500); }
    });
  }
  var mo=new MutationObserver(watch);
  ["sheetHost","viewPlay","viewPath"].forEach(function(id){var e=document.getElementById(id);if(e)mo.observe(e,{childList:true,subtree:true});});
})();
