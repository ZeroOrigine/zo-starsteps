/* Star Steps website build: 3D cartoon emoji (2026-09-30).
   Emoji in lessons and games are drawn with Microsoft's Fluent Emoji 3D artwork
   (MIT licence, /emoji/LICENSE.txt) instead of the device's flat emoji font.
   The emoji character stays in the page (only painted transparent over the picture),
   so reading the text, answers and screen readers all work exactly as before. */
(function(){
  "use strict";
  var MAP={"🤝":"1f91d","🔄":"1f504","🔍":"1f50d","⭐":"2b50","🤔":"1f914","🗣":"1f5e3-fe0f","🎯":"1f3af","🌍":"1f30d","👀":"1f440","⚖":"2696-fe0f","📊":"1f4ca","📏":"1f4cf","🍎":"1f34e","💡":"1f4a1","👂":"1f442","⏳":"23f3","🔴":"1f534","📋":"1f4cb","🏃":"1f3c3","🧊":"1f9ca","💧":"1f4a7","✅":"2705","🧠":"1f9e0","📦":"1f4e6","👤":"1f464","📈":"1f4c8","🔵":"1f535","☀":"2600-fe0f","🍪":"1f36a","🗺":"1f5fa-fe0f","👁":"1f441-fe0f","✂":"2702-fe0f","🔺":"1f53a","💬":"1f4ac","📝":"1f4dd","🔁":"1f501","⚡":"26a1","🔥":"1f525","🧪":"1f9ea","🌡":"1f321-fe0f","🏠":"1f3e0","🌊":"1f30a","😴":"1f634","1⃣":"0031-fe0f-20e3","📚":"1f4da","🌱":"1f331","🐛":"1f41b","🎵":"1f3b5","🎨":"1f3a8","🐟":"1f41f","🔗":"1f517","❌":"274c","♻":"267b-fe0f","📜":"1f4dc","🧱":"1f9f1","🔌":"1f50c","🌳":"1f333","📅":"1f4c5","🔑":"1f511","🧩":"1f9e9","💛":"1f49b","🧐":"1f9d0","➡":"27a1-fe0f","🤚":"1f91a","🌞":"1f31e","🌙":"1f319","📖":"1f4d6","🧼":"1f9fc","🚫":"1f6ab","⚠":"26a0-fe0f","🧮":"1f9ee","👥":"1f465","🐝":"1f41d","🌧":"1f327-fe0f","❄":"2744-fe0f","🌬":"1f32c-fe0f","🧲":"1f9f2","🪐":"1fa90","🧭":"1f9ed","📍":"1f4cd","🔎":"1f50e","🪨":"1faa8","➕":"2795","➖":"2796","🎲":"1f3b2","🏔":"1f3d4-fe0f","✏":"270f-fe0f","🗑":"1f5d1-fe0f","🛠":"1f6e0-fe0f","🔧":"1f527","🚩":"1f6a9","🐕":"1f415","🍌":"1f34c","🪙":"1fa99","⬇":"2b07-fe0f","🌿":"1f33f","🔋":"1f50b","🖼":"1f5bc-fe0f","🔒":"1f512","🛡":"1f6e1-fe0f","🚀":"1f680","🔊":"1f50a","🌌":"1f30c","🍞":"1f35e","🤖":"1f916","📉":"1f4c9","2⃣":"0032-fe0f-20e3","3⃣":"0033-fe0f-20e3","🔢":"1f522","⬛":"1f7e6","👏":"1f44f","🧹":"1f9f9","🌷":"1f337","⭕":"2b55","🐈":"1f408","☁":"2601-fe0f","💨":"1f4a8","🫁":"1fac1","🎻":"1f3bb","👩‍⚕":"1f469-200d-2695-fe0f","🌟":"1f31f","😊":"1f60a","⏱":"23f1-fe0f","🔬":"1f52c","🚗":"1f697","🎭":"1f3ad","⚙":"2699-fe0f","💪":"1f4aa","🛑":"1f6d1","📢":"1f4e2","🚢":"1f6a2","🚪":"1f6aa","🐶":"1f436","🟡":"1f7e1","🐦":"1f426","🛒":"1f6d2","🌋":"1f30b","✖":"2716-fe0f","🦠":"1f9a0","🥁":"1f941","🐱":"1f431","🥚":"1f95a","🦋":"1f98b","💭":"1f4ad","🗼":"1f5fc","🏛":"1f3db-fe0f","🌈":"1f308","💥":"1f4a5","🎼":"1f3bc","❓":"2753","🧾":"1f9fe","📵":"1f4f5","❤":"2764-fe0f","🚦":"1f6a6","🌲":"1f332","🏏":"1f3cf","⚽":"26bd","👪":"1f46a","🔨":"1f528","🗃":"1f5c3-fe0f","🏗":"1f3d7-fe0f","📄":"1f4c4","🏷":"1f3f7-fe0f","📱":"1f4f1","📡":"1f4e1","🏭":"1f3ed","🟥":"1f7e5","🍕":"1f355","🟢":"1f7e2","🥕":"1f955","🐬":"1f42c","🦴":"1f9b4","🌵":"1f335","🏅":"1f3c5","🎺":"1f3ba","🐻‍❄":"1f43b-200d-2744-fe0f","🌑":"1f311","🏫":"1f3eb","🏥":"1f3e5","🇮🇳":"1f1ee-1f1f3","👷":"1f477","🔇":"1f507","🔀":"1f500","🖥":"1f5a5-fe0f","💰":"1f4b0","🍬":"1f36c","🪥":"1faa5","🤧":"1f927","😢":"1f622","😠":"1f620","🌾":"1f33e","🍂":"1f342","🚰":"1f6b0","🪵":"1fab5","🏀":"1f3c0","🙏":"1f64f","🇫🇷":"1f1eb-1f1f7","🕊":"1f54a-fe0f","💻":"1f4bb","🔩":"1f529","🧵":"1f9f5","🙋":"1f64b","🚶":"1f6b6","🚧":"1f6a7","👟":"1f45f","0⃣":"0030-fe0f-20e3","🚒":"1f692","💙":"1f499","👋":"1f44b","🔐":"1f510","♟":"265f-fe0f","📐":"1f4d0","📞":"1f4de","⚛":"269b-fe0f","🏙":"1f3d9-fe0f","🌀":"1f300","✈":"2708-fe0f","🕳":"1f573-fe0f","🧰":"1f9f0","🐞":"1f41e","🦕":"1f995","🕛":"1f55b","👃":"1f443","🟣":"1f7e3","🟠":"1f7e0","🍇":"1f347","🐙":"1f419","🐭":"1f42d","🐘":"1f418","🍃":"1f343","🐇":"1f407","🍄":"1f344","➗":"2797","💉":"1f489","🌴":"1f334","🐍":"1f40d","💎":"1f48e","🧤":"1f9e4","🫀":"1fac0","🐸":"1f438","🐣":"1f423","🕑":"1f551","🏝":"1f3dd-fe0f","🇯🇵":"1f1ef-1f1f5","🌏":"1f30f","🇷🇺":"1f1f7-1f1fa","⛏":"26cf-fe0f","🏺":"1f3fa","🎹":"1f3b9","🧦":"1f9e6","⌨":"2328-fe0f","🐖":"1f416","🎮":"1f3ae","🗓":"1f5d3-fe0f","🧃":"1f9c3","🪖":"1fa96","🥩":"1f969","🌸":"1f338","🐪":"1f42a","🪹":"1fab9","🌎":"1f30e","🕸":"1f578-fe0f","🎾":"1f3be","🥽":"1f97d","🧑‍⚖":"1f9d1-200d-2696-fe0f","🧳":"1f9f3","🤸":"1f938","👕":"1f455","📎":"1f4ce","😀":"1f600","😨":"1f628","✌":"270c-fe0f","💝":"1f49d","🌉":"1f309","🧡":"1f9e1","⛓":"26d3-fe0f","🗂":"1f5c2-fe0f","⬅":"2b05-fe0f","👨‍🏫":"1f468-200d-1f3eb","💚":"1f49a","🏆":"1f3c6","⏰":"23f0","💔":"1f494","🧍":"1f9cd","🦶":"1f9b6","🗳":"1f5f3-fe0f","💸":"1f4b8","🔆":"1f506","🥄":"1f944","🩹":"1fa79","⛽":"26fd","🧬":"1f9ec","🌐":"1f310","🖨":"1f5a8-fe0f","🔤":"1f524","🦷":"1f9b7","✍":"270d-fe0f","🧴":"1f9f4","🥧":"1f967","🍲":"1f372","🛏":"1f6cf-fe0f","☄":"2604-fe0f","🌕":"1f315","🔭":"1f52d","🛰":"1f6f0-fe0f","⚫":"26ab","🧺":"1f9fa","🛫":"1f6eb","🎤":"1f3a4","🏢":"1f3e2","🚲":"1f6b2","🍩":"1f369","🐚":"1f41a","🪑":"1fa91","🗿":"1f5ff","👅":"1f445","✋":"270b","🕐":"1f550","🕞":"1f55e","🐜":"1f41c","🥦":"1f966","🦙":"1f999","🟦":"1f7e6","🦊":"1f98a","🍁":"1f341","🌻":"1f33b","♥":"2665-fe0f","💓":"1f493","🌪":"1f32a-fe0f","🐫":"1f42b","🥇":"1f947","🪟":"1fa9f","🧶":"1f9f6","🛞":"1f6de","🥤":"1f964","🪞":"1fa9e","🗒":"1f5d2-fe0f","⛰":"26f0-fe0f","🦒":"1f992","🐧":"1f427","🦘":"1f998","🇨🇦":"1f1e8-1f1e6","🇦🇺":"1f1e6-1f1fa","👨‍🚒":"1f468-200d-1f692","⛺":"26fa","🚤":"1f6a4","🕌":"1f54c","🏯":"1f3ef","⛵":"26f5","🖌":"1f58c-fe0f","🧑‍🎤":"1f9d1-200d-1f3a4","🔶":"1f536","⬆":"2b06-fe0f","🤯":"1f92f","📒":"1f4d2","💳":"1f4b3","🏦":"1f3e6","🤹":"1f939","🍚":"1f35a","🧀":"1f9c0","🍽":"1f37d-fe0f","🩸":"1fa78","🕷":"1f577-fe0f","🪶":"1fab6","🥐":"1f950","🛍":"1f6cd-fe0f","🐯":"1f42f","🦔":"1f994","🐼":"1f43c","🏉":"1f3c9","🥏":"1f94f","🥋":"1f94b","🇪🇸":"1f1ea-1f1f8","🇰🇷":"1f1f0-1f1f7","🏞":"1f3de-fe0f","😭":"1f62d","🪜":"1fa9c","5⃣":"0035-fe0f-20e3","🎶":"1f3b6","🏰":"1f3f0","4⃣":"0034-fe0f-20e3","🏘":"1f3d8-fe0f","🦁":"1f981","👨‍🍳":"1f468-200d-1f373","🥗":"1f957","🔮":"1f52e","⏸":"23f8-fe0f","🧂":"1f9c2","🙂":"1f642","🗝":"1f5dd-fe0f","⏪":"23ea","🪝":"1fa9d","🍝":"1f35d","⏩":"23e9","🔝":"1f51d","🐮":"1f42e","😄":"1f604","🅰":"1f170-fe0f","👄":"1f444","🏪":"1f3ea","🦵":"1f9b5","🐾":"1f43e","🪴":"1fab4","🖍":"1f58d-fe0f","🍋":"1f34b","🏎":"1f3ce-fe0f","☕":"2615","🏖":"1f3d6-fe0f","🧥":"1f9e5","🚿":"1f6bf","🛣":"1f6e3-fe0f","👇":"1f447","☢":"2622-fe0f","👨‍🔬":"1f468-200d-1f52c","👉":"1f449","🤒":"1f912","🎉":"1f389","👣":"1f463","✨":"2728","🌒":"1f312","🌠":"1f320","🌅":"1f305","🎒":"1f392","🍳":"1f373","🔪":"1f52a","🧽":"1f9fd","🦺":"1f9ba","💼":"1f4bc","🎣":"1f3a3","🎈":"1f388","🛗":"1f6d7","💾":"1f4be","📺":"1f4fa","👆":"1f446","📷":"1f4f7","😤":"1f624","♿":"267f","📁":"1f4c1","🚨":"1f6a8","🎬":"1f3ac","🫧":"1fae7","🩺":"1fa7a","🕵":"1f575-fe0f","🧗":"1f9d7","👑":"1f451"};
  var RE=/(?:[0-9#*]\uFE0F?\u20E3)|(?:[\u{1F1E6}-\u{1F1FF}]{2})|(?:[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\u2300-\u23FF]\uFE0F?[\u{1F3FB}-\u{1F3FF}]?(?:\u200D[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2640\u2642\u2695\u2696\u2708\u2764\u2B1B]\uFE0F?[\u{1F3FB}-\u{1F3FF}]?)*)/gu;
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,SELECT:1};
  function file(e){return MAP[e.replace(/\uFE0F/g,"")];}
  function paint(root){
    if(!root||root.nodeType!==1&&root.nodeType!==3||!root.isConnected)return;
    var base=root.nodeType===3?root.parentNode:root; if(!base||base.nodeType!==1)return;
    var walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode; if(!p||SKIP[p.nodeName]||p.closest&&(p.closest(".fe")||p.closest("svg")))return NodeFilter.FILTER_REJECT;
      RE.lastIndex=0; return RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
    var list=[],n; while((n=walker.nextNode()))list.push(n);
    list.forEach(function(t){
      var s=t.nodeValue, frag=document.createDocumentFragment(), last=0, m, any=false, i=0;
      RE.lastIndex=0;
      while((m=RE.exec(s))){
        var f=file(m[0]); if(!f)continue;
        any=true;
        if(m.index>last)frag.appendChild(document.createTextNode(s.slice(last,m.index)));
        var sp=document.createElement("span"); sp.className="fe"; sp.style.setProperty("--fe","url(/emoji/"+f+".webp)");
        sp.style.setProperty("--i",String(i++)); sp.textContent=m[0]; frag.appendChild(sp);
        last=m.index+m[0].length;
      }
      if(!any)return;
      if(last<s.length)frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag,t);
    });
  }
  var busy=false, queue=[];
  function flush(){busy=false;var q=queue;queue=[];q.forEach(paint);}
  var mo=new MutationObserver(function(recs){
    recs.forEach(function(r){
      if(r.type==="characterData"){queue.push(r.target);}
      else r.addedNodes.forEach(function(a){if(!(a.nodeType===1&&a.classList&&a.classList.contains("fe")))queue.push(a);});
    });
    if(!busy&&queue.length){busy=true;requestAnimationFrame(flush);}
  });
  ["stage","sheetHost","viewDone","viewPlay"].forEach(function(id){
    var el=document.getElementById(id); if(!el)return; paint(el);
    mo.observe(el,{childList:true,subtree:true,characterData:true});
  });
  /* credit, in the You tab small print */
  var fn=document.querySelector('#viewPath .footnote[data-sec="me"]');
  if(fn&&!fn.dataset.fe){fn.dataset.fe="1";fn.appendChild(document.createTextNode(" Emoji art: Microsoft Fluent Emoji (MIT licence)."));}
})();
