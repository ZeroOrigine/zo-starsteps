/* Star Steps website build: Books (2026-10-06, v23).
   A "Books" tab in the bar opens the Books Library (/library/), and the Today screen gets a
   small "Read a book" card that remembers the book the child is in the middle of. Nothing in the
   game's state changes; the library keeps its own bookmarks in localStorage "ss.lib". */
(function(){
  "use strict";
  var bar=document.getElementById("tabbar"); if(!bar)return;
  var ICON='<svg viewBox="0 0 40 40" width="1em" height="1em" aria-hidden="true"><path d="M6 8h11a4 4 0 0 1 3 1.4A4 4 0 0 1 23 8h11v24H23a3 3 0 0 0-3 2 3 3 0 0 0-3-2H6Z" fill="#5B4EE0"/><path d="M8 10h9a2 2 0 0 1 2 2v19a4 4 0 0 0-2-1H8Z" fill="#fff"/><path d="M32 10h-9a2 2 0 0 0-2 2v19a4 4 0 0 1 2-1h9Z" fill="#FFF3D6"/><path d="M10 14h7M10 18h7M10 22h7M23 14h7M23 18h7M23 22h5" stroke="#9fa6c0" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function lib(){
    var p={};try{p=JSON.parse(localStorage.getItem("ss.lib")||"{}")||{};}catch(e){}
    var ids=Object.keys(p).filter(function(k){return p[k]&&!p[k].done&&p[k].p>0;}).sort(function(a,b){return (p[b].t||0)-(p[a].t||0);});
    return {cur:ids[0]||null,page:ids[0]?p[ids[0]].p+1:0,done:Object.keys(p).filter(function(k){return p[k]&&p[k].done;}).length};
  }
  /* the tab (a link, same origin, works inside the store apps too) */
  var a=document.createElement("a"); a.className="tab tab-books"; a.href="/library/?from=play";
  a.innerHTML='<span class="tico" aria-hidden="true">'+ICON+'</span><span>Books</span>';
  var games=bar.querySelector('.tab[data-tab="games"]');
  if(games&&games.nextSibling)bar.insertBefore(a,games.nextSibling); else bar.appendChild(a);
  /* Today: a card */
  var cont=document.getElementById("contBtn"); if(cont){
    var L=lib(), card=document.createElement("a"); card.className="book-card"; card.setAttribute("data-sec","today"); card.href=L.cur?"/library/?book="+encodeURIComponent(L.cur):"/library/?from=play";
    card.innerHTML='<span class="bc-ico" aria-hidden="true">'+ICON+'</span><span class="bc-txt"><b></b><span></span></span><span class="bc-go" aria-hidden="true">&#8594;</span>';
    card.querySelector("b").textContent=L.cur?"Keep reading your book":"Read a book";
    card.querySelector(".bc-txt span").textContent=L.cur?"You are on page "+L.page+". Tap to open it.":"32 illustrated science books, Kindergarten to Grade 7"+(L.done?" · "+L.done+" finished":"");
    var after=document.getElementById("superCta")||cont; after.parentNode.insertBefore(card,after.nextSibling);
    /* Nova AI: Advik's free AI helper, a separate app (the store apps show a grown-up gate first, see ss-store.js) */
    var nv=document.createElement("a"); nv.className="book-card nova-card"; nv.setAttribute("data-sec","today"); nv.href="https://nova.zeroorigine.com/?src=starsteps"; nv.target="_blank"; nv.rel="noopener"; nv.setAttribute("data-nova","");
    nv.innerHTML='<span class="bc-ico nc-ico" aria-hidden="true"><span class="nc-orb"></span></span><span class="bc-txt"><b>Ask Nova AI</b><span>Advik\'s free AI helper: ask anything, by typing or talking. Open it with a grown-up.</span></span><span class="bc-go" aria-hidden="true">&nearr;</span>';
    card.parentNode.insertBefore(nv,card.nextSibling);
  }
})();
