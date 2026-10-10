#!/usr/bin/env python3
"""Build /edge/index.html for Star Steps from Advik's two artifacts.
A = "The Edge of Knowing" (base). B = "Before You Were You" (its journey is added as a section).
Nothing is dropped: every section of A stays; B's stage, two paths, rail, cosmic calendar,
five cards, the four "why" ideas and its sound design become the "Journey" section."""
import re, pathlib
SRC=pathlib.Path(__file__).parent/'src'
OUT=pathlib.Path(__file__).parent.parent/'ssproj/public/edge/index.html'
A=(SRC/'A.html').read_text().split('\n'); B=(SRC/'B.html').read_text().split('\n')
L=lambda arr,a,b: '\n'.join(arr[a-1:b])   # 1-based inclusive

# ---------- B: unique CSS (lines 26-81), scoped under .journey, ids prefixed ----------
IDS=['sky','play','sound','prev','next','count','era','when','rail','months','marker','calDate','info','you','what','how','meter','realLabel','realNote','unknown','whyCard','why','bookBtn','bookName','bookMeta']
def jid(s):
    for i in IDS:
        s=re.sub(r'id="%s"'%i,'id="j%s"'%i,s)
        s=re.sub(r"\$\('%s'\)"%i,"$('j%s')"%i,s)
        s=re.sub(r"getElementById\('%s'\)"%i,"getElementById('j%s')"%i,s)
        s=re.sub(r'#%s\b'%i,'#j%s'%i,s)
    return s
css=L(B,26,81)
css=css.replace('canvas{display:block;width:100%;height:clamp(340px,62vh,640px)}','#jsky{display:block;width:100%;height:clamp(340px,62vh,640px)}')
css=css.replace('button:focus-visible{outline:3px solid var(--star);outline-offset:2px}\n','')
def scope(block):
    out=[];
    for rule in re.findall(r'([^{}]+)\{([^{}]*)\}',block):
        sel,body=rule; sels=[s.strip() for s in sel.split(',') if s.strip()]
        out.append(','.join('.journey '+s for s in sels)+'{'+body+'}')
    return '\n'.join(out)
parts=re.split(r'(@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\s*\})',css)
scoped=[]
for p in parts:
    if p.startswith('@media'):
        m=re.match(r'(@media[^{]+)\{(.*)\}\s*$',p,re.S); scoped.append(m.group(1)+'{'+scope(m.group(2))+'}')
    else: scoped.append(scope(p))
jcss=jid('\n'.join(scoped))
jcss+='\n.journey .play{top:14px}\n.journey .foot{margin:0}\n.journey{display:grid;gap:14px}\n'

# ---------- B: journey HTML (stage .. foot) ----------
jhtml=jid(L(B,157,188))
jhtml=jhtml.replace('<button class="play" id="jplay" aria-pressed="false">▶ Take the tour</button>','<button class="play" id="jplay" aria-pressed="false">▶ Take the tour</button>')
journey=('<div class="sect-h" id="journey"><div class="eyebrow">Journey</div><h2>Before You Were You</h2>'
 '<p class="muted">The atoms in your body are 13.8 billion years old. Follow them two ways: from the Big Bang to you, or out beyond Earth to black holes, alien worlds and the end of everything. At every stop, look for one question: where were <em>you</em>?</p></div>\n'
 '<div class="journey">\n'+jhtml+'\n</div>')

# ---------- B: journey script (its own sound engine stays local; no window.Snd) ----------
js=L(B,830,1079)
js=js.replace('window.Snd=Snd;\n','')
js=jid(js)
js=js.replace("document.querySelectorAll('.paths button')","document.querySelectorAll('.journey .paths button')")
# no global arrow keys (the film player owns them)
js=re.sub(r"document\.addEventListener\('keydown'.*?\n",'',js)
# only draw while the journey is on screen; pause the film when the tour or its sound starts
js=js.replace("function loop(now){frame(now);requestAnimationFrame(loop);}",
 "let jvis=true;try{new IntersectionObserver(es=>es.forEach(e=>{jvis=e.isIntersecting;}),{rootMargin:'120px'}).observe(cv);}catch(e){}\nfunction loop(now){if(jvis)frame(now);requestAnimationFrame(loop);}")
js=js.replace("$('jplay').addEventListener('click',()=>{if(playing){stop();return;}playing=true;",
 "$('jplay').addEventListener('click',()=>{if(playing){stop();return;}if(window.EdgeFilm)EdgeFilm.pause();playing=true;")
js=js.replace("$('jsound').addEventListener('click',()=>{const o=Snd.toggle();","$('jsound').addEventListener('click',()=>{const o=Snd.toggle();if(o&&window.EdgeFilm)EdgeFilm.pause();")
assert "$('jsky')" in js or "getElementById('jsky')" in js
# v26 tabs: let the tab bar stop the tour and its sound when the reader leaves the Journey tab
_jstop="function stop(){playing=false;clearInterval(timer);$('jplay').textContent='▶ Take the tour';$('jplay').setAttribute('aria-pressed','false');}"
assert _jstop in js
js=js.replace(_jstop,_jstop+"\nwindow.EdgeJourney={stop(){stop();try{Snd.stopBed();}catch(e){}}};",1)
jscript='<script>\n'+js+'\n</script>'

# ---------- A: assemble ----------
a='\n'.join(A)
# head: real document head for the live site (the artifact service used to add it)
head_old=a[:a.index('<title>The Edge of Knowing</title>')]
head_new='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>The Edge of Knowing: 14 films in 3D, a journey through time and 28 books, by Advik · Star Steps</title>
<meta name="description" content="Where philosophy runs out of words, science keeps going. 14 films in 3D, a 21-stop journey from the Big Bang to you, 28 illustrated books and pop quizzes. Free, made by a kid for kids.">
<link rel="canonical" href="https://starsteps.zeroorigine.com/edge/">
<meta property="og:title" content="The Edge of Knowing · Star Steps"><meta property="og:description" content="14 films in 3D, a journey through time, 28 illustrated books. Free."><meta property="og:image" content="https://starsteps.zeroorigine.com/img/og-edge.jpg"><meta property="og:type" content="website"><meta property="og:url" content="https://starsteps.zeroorigine.com/edge/">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icons/icon-192.png"><link rel="apple-touch-icon" href="/icons/icon-180.png"><meta name="theme-color" content="#06070C">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"The Edge of Knowing","url":"https://starsteps.zeroorigine.com/edge/","isPartOf":{"@type":"WebSite","name":"Star Steps","url":"https://starsteps.zeroorigine.com/"},"about":["astronomy","physics","cosmology"],"audience":{"@type":"EducationalAudience","educationalRole":"student"},"creator":{"@type":"Person","name":"Advik"}}</script>
<style>:root{box-sizing:border-box}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style>
<script src="/js/ss-store.js"></script>
<link rel="stylesheet" href="/js/doors.css"><link rel="stylesheet" href="/js/nova.css">
</head><body>
<nav class="ss-doors" aria-label="Star Steps"><a class="ss-home" href="/"><img src="/icons/icon-192.png" alt="" width="26" height="26">Star Steps</a><div class="ss-doors-links"><a href="/play/">Play</a><a href="/library/">Library</a><a href="/edge/" aria-current="page">Edge<span class="ss-long"> of Knowing</span></a><a class="ss-nova" href="https://nova.zeroorigine.com/?src=starsteps" target="_blank" rel="noopener" data-nova><span class="ss-orb" aria-hidden="true"></span>Nova AI</a></div></nav>
'''
a=head_new+a[len(head_old):]
a=a.replace('<title>The Edge of Knowing</title>\n','')
# header copy
a=a.replace('<div class="eyebrow">14 films in 3D, up to 4K · 28 illustrated books · a guide who answers anything</div>',
 '<div class="eyebrow">14 films in 3D · a 21-stop journey through time · 28 illustrated books · pop quizzes · a guide</div>')
a=a.replace('Use the menu to jump between the films, the facts, the library and the gallery.</p>',
 'Use the menu to jump between the films, the facts, the journey, the library and the gallery.</p>\n  <p class="byline">Made by <b>Advik</b> with help from Claude, for Star Steps. Every picture is built live in your browser: no videos, no photos.</p>')
a=a.replace('<a href="#about" data-s="about">Facts</a>','<a href="#about" data-s="about">Facts</a><a href="#journey" data-s="journey">Journey</a>')
a=a.replace("['watch','about','library','gallery'].forEach","['watch','about','journey','library','gallery'].forEach")
a=a.replace('<p>Turn your sound up. 14 films in four parts, pop quizzes, 28 illustrated books, and a guide who answers anything.</p>',
 '<p>Turn your sound up. 14 films in four parts, pop quizzes, a 21-stop journey through time, 28 illustrated books, and a guide.</p>')
# the journey section goes between About and Library
marker='<div class="sect-h" id="library">'
a=a.replace(marker,journey+'\n\n'+marker,1)
# CSS: journey + byline + credit
a=a.replace('\n.settings{display:flex;','\n/* ---- journey (from "Before You Were You") ---- */\n'+jcss+'\n.byline{margin:0;color:var(--muted);font-size:15px}.byline b{color:var(--star);font-weight:600}\n.settings{display:flex;',1)
# Three.js from our own server
a=re.sub(r'<script src="https://cdn\.jsdelivr\.net/npm/three@0\.128\.0/[^"]*/([^"/]+)"></script>',r'<script src="/edge/vendor/\1"></script>',a)
# film pause hook for the journey
a=a.replace("function syncPlay(){$('play').textContent=playing?'❚❚':'▶';$('play').setAttribute('aria-label',playing?'Pause':'Play');}",
 "function syncPlay(){$('play').textContent=playing?'❚❚':'▶';$('play').setAttribute('aria-label',playing?'Pause':'Play');}\nwindow.EdgeFilm={pause(){if(playing){playing=false;syncPlay();Snd.pause(true);Voice.pause();}}};")
# Nova: on this site there is no Claude sampling; the offline notes answer, and the hint points to Star Steps
a=a.replace("For anything harder, ask Claude in the chat!","For anything harder, ask a grown-up or look it up in the Library!")
a=a.replace("For anything else, ask Claude in the chat!","For anything else, try the Library or ask a grown-up!")
a=a.replace("Ask Nova, ask a grown-up, or ask Claude.","Ask Nova, ask a grown-up, or look in the Library.")
# the 3D film player boots after first paint, so the header, nav and journey show at once even on slow GPUs
old_start="(function(){\nconst $=id=>document.getElementById(id);\n/* ---- SOUND ENGINE"
assert a.count(old_start)==1
a=a.replace(old_start,"function edgeFilmBoot(){\nconst $=id=>document.getElementById(id);\n/* ---- SOUND ENGINE")
old_end="requestAnimationFrame(draw);})();\n})();\n</script>"
assert a.count(old_end)==1
a=a.replace(old_end,"requestAnimationFrame(draw);})();\n}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(edgeFilmBoot,30));else setTimeout(edgeFilmBoot,30);\n</script>")
# journey script after the film script, then footer credit
foot_credit='<footer class="ss-foot"><p>The Edge of Knowing was made by Advik with help from Claude, as part of <a href="/">Star Steps</a>. Sizes and distances are squeezed to fit on screen; the real numbers are in the tables. <a href="/library/">Books Library</a> · <a href="/play/">Play</a> · <a href="/privacy/">Privacy</a></p></footer>\n'
a=a.replace('\n</body></html>','\n'+jscript+'\n'+foot_credit+'<script>try{var _bq=new URLSearchParams(location.search).get("book");if(_bq&&window.Book&&Book.has(_bq))setTimeout(function(){Book.open(_bq);},400);}catch(e){}\nif("serviceWorker" in navigator){addEventListener("load",function(){navigator.serviceWorker.register("/sw.js").catch(function(){});});}</script>\n</body></html>')

# ---------- v24 tidy: one hero, numbered chapters, facts under the player, settings in a drawer ----------
import re as _re
def grab(pattern):
    m=_re.search(pattern,a,_re.S); assert m, pattern[:40]; return m.group(0)
# phone bar: brand text in a span (so it can hide on tiny screens)
a=a.replace('<img src="/icons/icon-192.png" alt="" width="26" height="26">Star Steps</a>','<img src="/icons/icon-192.png" alt="" width="26" height="26"><span>Star Steps</span></a>')
# hero: numbers as chips, shorter lede, the gate no longer repeats the title
a=a.replace('<div class="eyebrow">14 films in 3D · a 21-stop journey through time · 28 illustrated books · pop quizzes · a guide</div>',
 '<div class="eyebrow">A science cinema, made by Advik</div>')
a=_re.sub(r'<p class="lede">Where philosophy runs out of words.*?</p>\n',
 '<p class="lede">Where philosophy runs out of words, science keeps going. Travel from the first second of time, across black holes and planets, to the inside of a single atom of you.</p>\n'
 '<ul class="hero-stats" aria-label="What is here"><li><b>14</b>films in 3D</li><li><b>21</b>stops through time</li><li><b>28</b>illustrated books</li><li><b>20</b>living pictures</li><li><b>1</b>guide, Nova</li></ul>\n',a,count=1)
a=a.replace('<div class="gate-in"><div class="eyebrow">A journey in fourteen films</div><h2>The Edge of <i>Knowing</i></h2><p>Turn your sound up. 14 films in four parts, pop quizzes, a 21-stop journey through time, 28 illustrated books, and a guide.</p>',
 '<div class="gate-in"><div class="eyebrow">Film 1 of 14 · The Big Bang</div><h2 class="gate-t">Turn your <i>sound up</i></h2><p>Fourteen short films, each with a pop quiz. Drag to look around while they play.</p>')
# numbered chapters in the nav and section heads
a=a.replace('<a href="#watch" data-s="watch">Watch</a><a href="#about" data-s="about">Facts</a><a href="#journey" data-s="journey">Journey</a><a href="#library" data-s="library">Library</a><a href="#gallery" data-s="gallery">Gallery</a>',
 '<a href="#watch" data-s="watch"><i>01</i>Watch</a><a href="#about" data-s="about"><i>02</i>Facts</a><a href="#journey" data-s="journey"><i>03</i>Journey</a><a href="#library" data-s="library"><i>04</i>Library</a><a href="#gallery" data-s="gallery"><i>05</i>Gallery</a>')
a=a.replace('<div class="sect-h" id="watch"><div class="eyebrow">Watch</div>','<div class="sect-h" id="watch"><div class="eyebrow">01 · Watch</div>')
a=a.replace('<div class="sect-h" id="about"><div class="eyebrow">Learn</div>','<div class="sect-h" id="about"><div class="eyebrow">02 · Facts</div>')
a=a.replace('<div class="sect-h" id="journey"><div class="eyebrow">Journey</div>','<div class="sect-h" id="journey"><div class="eyebrow">03 · Journey</div>')
a=a.replace('<div class="sect-h" id="library"><div class="eyebrow">Read</div>','<div class="sect-h" id="library"><div class="eyebrow">04 · Library</div>')
a=a.replace('<section class="gallery" aria-labelledby="galH"><div class="eyebrow">Explore · every picture is alive</div><h2 id="galH">Moments of the Universe</h2><p class="lede" style="font-size:16px">',
 '<section class="gallery" aria-labelledby="galH"><div class="sect-h" id="gallery"><div class="eyebrow">05 · Gallery</div><h2 id="galH">Moments of the Universe</h2><p class="muted">')
a=a.replace('Tap any one to open its illustrated book.</p><div class="gal" id="gal">','Tap any one to open its illustrated book.</p></div><div class="gal" id="gal">')
a=a.replace('<div id="gallery"></div>\n','')
a=a.replace("Everything about the film that is playing. Switch between the tabs for numbers, evidence, extra facts and the people who discovered it.","Numbers, evidence, extra facts and the people behind the film that is playing. It changes with every film.")
# move the facts right under the player; the film list and the settings drawer follow
settings=grab(r'<div class="settings">.*?</div>\n'); vhelp=grab(r'<details class="vhelp".*?</details>\n'); reel=grab(r'<nav class="reel".*?</nav>\n')
about=grab(r'<div class="sect-h" id="about">.*?</div></div>\n\n')
for x in (settings,vhelp,reel,about): a=a.replace(x,'',1)
drawer=('<details class="cfg" id="cfg"><summary><span>⚙ Voices and picture quality</span><small>narrator · Nova · 4K / HD / Smooth</small></summary>\n'+settings+vhelp+'</details>\n')
films_h='<div class="sub-h" id="allfilms"><h3>All 14 films</h3><p class="muted">Jump to any film. They play in order and each ends with a quiz.</p></div>\n'
a=a.replace('</section>\n\n',  '</section>\n\n'+about+films_h+reel+drawer+'\n',1)
assert a.count('id="reel"')==1 and a.count('id="cfg"')==1
# journey cards: a fixed layout; one note for all the pictures
a=a.replace('<article class="card you"><h3>Where were YOU?</h3><p id="jyou"></p></article>','<article class="card you" style="grid-area:you"><h3>Where were YOU?</h3><p id="jyou"></p></article>')
a=a.replace('<div class="bookrow">','<div class="bookrow" style="grid-area:book">')
a=a.replace('<article class="card"><h3>What happened</h3>','<article class="card" style="grid-area:what"><h3>What happened</h3>')
a=a.replace('<article class="card"><h3>How do we know?</h3>','<article class="card" style="grid-area:how"><h3>How do we know?</h3>')
a=a.replace('<article class="card"><h3>Is it real?</h3>','<article class="card" style="grid-area:real"><h3>Is it real?</h3>')
a=a.replace('<article class="card unknown">','<article class="card unknown" style="grid-area:unk">')
a=a.replace('<article class="card why" id="jwhyCard" hidden>','<article class="card why" id="jwhyCard" style="grid-area:why" hidden>')
jfoot=grab(r'<p class="foot">These pictures are not photos.*?</p>\n'); a=a.replace(jfoot,'',1)
a=_re.sub(r'<p class="foot">Everything on the screen is built live.*?</p>\n',
 '<p class="foot"><b>How these pictures are made.</b> Nothing here is a photo or a video file. Every scene is drawn by code, live in your browser, from science data and maths, so it moves and changes every time you visit. Sizes and distances are squeezed so things fit on screen; the real numbers are in the tables. Where scientists still argue, the "Is it real?" meter says so.</p>\n',a,count=1)
a=a.replace('as part of <a href="/">Star Steps</a>. Sizes and distances are squeezed to fit on screen; the real numbers are in the tables. <a href="/library/">','as part of <a href="/">Star Steps</a>. <a href="/library/">')
tidycss=r"""
/* ---- v24 tidy ---- */
:root{--body:ui-rounded,"SF Pro Rounded","Nunito","Quicksand","Avenir Next",system-ui,sans-serif}
.bk-in p,.bk-dl dd,.bk-q,.bk-fact,.bk-fig figcaption,.bk-sub{font-family:var(--body)}
.wrap{gap:16px}
header{padding-block:34px 0}
.hero-stats{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.hero-stats li{display:flex;align-items:baseline;gap:6px;padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--panel);font-family:var(--mono);font-size:12px;color:var(--muted)}
.hero-stats b{font-family:var(--display);font-weight:400;font-size:20px;color:var(--star)}
.topnav a i{font-style:normal;color:var(--star);margin-right:6px;opacity:.8}
.sect-h{padding-top:44px;margin-top:16px;border-top:1px solid var(--line);gap:4px}
.sect-h h2,.gallery h2{font-size:clamp(28px,3.6vw,42px)}
.sect-h .muted{font-size:16px}
#watch{border-top:0;margin-top:0;padding-top:12px}
.gate h2.gate-t{font-size:clamp(34px,5vw,56px)}
.sub-h{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-top:8px}
.sub-h h3{margin:0;font-family:var(--display);font-weight:400;font-size:24px}
.sub-h .muted{font-size:14px}
.cfg{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:0 14px}
.cfg>summary{cursor:pointer;list-style:none;display:flex;align-items:baseline;gap:10px;padding:12px 0;font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--ink)}
.cfg>summary::-webkit-details-marker{display:none}
.cfg>summary small{color:var(--muted);letter-spacing:0;font-size:12px}
.cfg>summary::after{content:"+";margin-left:auto;color:var(--star);font-size:18px}
.cfg[open]>summary::after{content:"–"}
.cfg .settings{padding:4px 0 12px}.cfg .vhelp{margin-bottom:14px}
.aboutg{margin-top:4px}
.journey .grid{grid-template-columns:2fr 1fr;grid-template-areas:"you you" "what book" "how real" "how unk" "why why"}
.journey .grid .card,.journey .grid .bookrow{min-width:0}
.journey .bookrow .book-btn{height:100%}
.journey .why ul{grid-template-columns:repeat(4,minmax(0,1fr))}
.journey .cal{margin-top:-4px}
.foot{padding-top:10px}
nav#reel{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px;align-items:start}
.reel .part{display:grid;gap:8px;padding:12px;border:1px solid var(--line);border-radius:14px;background:rgba(14,16,24,.5)}
.reel .part h3{margin:0 0 2px}
.reel .pgrid{grid-template-columns:1fr;gap:8px}
.reel .fb{display:grid;gap:2px;grid-template-columns:auto 1fr;align-items:baseline;column-gap:10px}
.reel .fb>small:first-child{grid-row:1/3;align-self:center;color:var(--star)}
.reel .fb b{font-size:19px}
@media (max-width:900px){nav#reel{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media (max-width:560px){nav#reel{grid-template-columns:1fr!important}}
.nova-btn{bottom:calc(20px + env(safe-area-inset-bottom,0px))}
@media (max-width:900px){.journey .grid{grid-template-columns:1fr;grid-template-areas:"you" "what" "book" "how" "real" "unk" "why"}.journey .why ul{grid-template-columns:1fr 1fr}}
/* tap targets and small text (store review: 44px targets, 11px+ text) */
.topnav a,.topnav button{min-height:36px;display:inline-flex;align-items:center}
.topnav{top:46px}
@media (max-width:640px){.topnav{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;gap:4px}.topnav::-webkit-scrollbar{display:none}.topnav a,.topnav button{flex:0 0 auto;white-space:nowrap}.topnav button{margin-left:4px}}
.sect-h,#gallery{scroll-margin-top:110px}
#quiet.ghost{padding:12px 16px;min-height:44px}
.bar button.ico{min-width:38px;flex:0 0 auto}
.bar button{min-height:38px}
.settings .voice-pick,.topbook,.settings .q button{min-height:38px}
.journey .months div{font-size:11px}
.journey .cal-head b{font-size:24px}
@media (max-width:760px){.journey .months div{font-size:11px;padding-inline:0}.journey .months div:nth-of-type(even){color:transparent}}
@media (max-width:420px){.bar{gap:6px 8px;padding:8px 10px 12px;flex-wrap:wrap}.bar .track{flex:1 1 100%;order:-1;height:18px}.bar button{font-size:11px;padding:8px 9px}.sub{font-size:15px;bottom:92px}}
.gal .tile small,.bk-cover .bk-lib,.bk-fact b,.bk-big b{font-size:11px!important}
@media (max-width:560px){.ss-doors .ss-home span{display:none}.hero-stats b{font-size:17px}.time{display:none}.nova-btn{bottom:14px}.topnav a{padding:7px 10px}.sect-h{padding-top:32px}}
"""
_i=a.index('</style>',a.index('.settings{display:flex;'))
a=a[:_i]+tidycss+'\n'+a[_i:]

# ---------- v26 tabs: four panels (Films · Journey · Library · Gallery) instead of one long scroll ----------
# 1. the section menu becomes a real tab bar
_oldnav=grab(r'<nav class="topnav" id="topnav" aria-label="Sections">.*?</nav>\n')
assert '<button id="navNova">Ask Nova</button>' in _oldnav
def _tab(key,n,label,sub,sel,th):
    return ('<button class="tab" role="tab" id="tab-'+key+'" data-tab="'+key+'" aria-selected="'+('true' if sel else 'false')+'" aria-controls="p-'+key+'"'+('' if sel else ' tabindex="-1"')+
            '><span class="th"><canvas data-th="'+th+'" aria-hidden="true"></canvas><i>'+n+'</i></span><span class="tx"><b>'+label+'</b><small>'+sub+'</small></span></button>')
_newnav=('<nav class="topnav" id="topnav" role="tablist" aria-label="Sections">'+
 _tab('films','01','Films','14 films in 3D',True,'hole')+
 _tab('journey','02','Journey','21 stops in time',False,'kilonova')+
 _tab('library','03','Library','28 illustrated books',False,'shelf')+
 _tab('gallery','04','Gallery','20 living pictures',False,'saturnart')+
 '<button id="navNova">✦ Ask Nova</button></nav>\n')
a=a.replace(_oldnav,_newnav,1)
# 2. wrap the blocks into panels (ids and order untouched, so the film, journey and gallery scripts find everything)
def _wrap_before(marker,key,label):
    global a
    assert a.count(marker)==1, marker[:50]
    a=a.replace(marker,'<section class="panel" id="p-'+key+'" role="tabpanel" aria-labelledby="tab-'+key+'" hidden>\n'+marker,1)
def _close_before(marker):
    global a
    assert a.count(marker)==1, marker[:50]
    a=a.replace(marker,'</section>\n'+marker,1)
_wrap_before('<div class="sect-h" id="watch">','films','Films')
_close_before('<div class="sect-h" id="journey">'); _wrap_before('<div class="sect-h" id="journey">','journey','Journey')
_close_before('<div class="sect-h" id="library">'); _wrap_before('<div class="sect-h" id="library">','library','Library')
_close_before('<section class="gallery" aria-labelledby="galH">'); _wrap_before('<section class="gallery" aria-labelledby="galH">','gallery','Gallery')
_close_before('<p class="foot"><b>How these pictures are made.</b>')
assert a.count('class="panel"')==4
# chapter numbers follow the tabs; Facts is a part of Films
a=a.replace('<div class="sect-h" id="watch"><div class="eyebrow">01 · Watch</div><h2>14 films in four parts</h2><p class="muted">Press play and they run in order, from the first second of time to the inside of an atom. Or jump to any film below. Each ends with a pop quiz.</p>',
 '<div class="sect-h" id="watch"><div class="eyebrow">01 · Films</div><h2>14 films in four parts</h2><p class="muted">Press play and they run in order, from the first second of time to the inside of an atom. The facts and the full film list are below the screen. Each film ends with a pop quiz.</p>')
a=a.replace('<div class="sect-h" id="about"><div class="eyebrow">02 · Facts</div>','<div class="sect-h" id="about"><div class="eyebrow">Facts · about the film playing</div>')
a=a.replace('<div class="sect-h" id="journey"><div class="eyebrow">03 · Journey</div>','<div class="sect-h" id="journey"><div class="eyebrow">02 · Journey</div>')
a=a.replace('<div class="sect-h" id="library"><div class="eyebrow">04 · Library</div>','<div class="sect-h" id="library"><div class="eyebrow">03 · Library</div>')
a=a.replace('<div class="sect-h" id="gallery"><div class="eyebrow">05 · Gallery</div>','<div class="sect-h" id="gallery"><div class="eyebrow">04 · Gallery</div>')
# the old scroll-spy has nothing to highlight any more
_spy=grab(r"\(function\(\)\{const links=\[\.\.\.document\.querySelectorAll\('#topnav a'\)\];.*?\}\)\(\);\n")
a=a.replace(_spy,'',1)
tabcss=r"""
/* ---- v26 tabs ---- */
.panel{display:grid;gap:16px}
.panel[hidden]{display:none!important}
.topnav{top:46px;display:flex;flex-wrap:nowrap;align-items:stretch;gap:6px;padding:10px 0 0;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line)}
.topnav::-webkit-scrollbar{display:none}
.topnav .tab{--acc:#F2C46D;--acc-rgb:242,196,109;flex:1 1 0;min-width:0;margin:0 0 -1px;display:flex;align-items:center;gap:12px;padding:10px 14px 12px 10px;border:1px solid transparent;border-bottom:0;border-radius:14px 14px 0 0;background:none;color:var(--muted);cursor:pointer;text-align:left;position:relative;font-family:var(--body);min-height:68px;transition:background .25s}
.topnav .tab[data-tab="journey"]{--acc:#8fb8ff;--acc-rgb:143,184,255}
.topnav .tab[data-tab="library"]{--acc:#9ff5c9;--acc-rgb:159,245,201}
.topnav .tab[data-tab="gallery"]{--acc:#ffb28a;--acc-rgb:255,178,138}
.topnav .tab .th{position:relative;flex:0 0 auto;width:70px;height:48px;border-radius:10px;overflow:hidden;background:#0d0f18;box-shadow:0 0 0 1px var(--line);filter:saturate(.7) brightness(.8);transition:filter .3s,box-shadow .3s,transform .3s}
.topnav .tab .th canvas{display:block;width:100%;height:100%}
.topnav .tab .th i{position:absolute;left:4px;top:4px;font:600 11px/1 var(--mono);font-style:normal;color:#1b1206;background:var(--acc);padding:3px 5px;border-radius:6px;letter-spacing:.04em;margin:0;opacity:1}
.topnav .tab .tx{display:grid;min-width:0}
.topnav .tab b{font-family:var(--display);font-weight:400;font-size:22px;line-height:1.05;color:var(--ink);opacity:.78;transition:opacity .25s}
.topnav .tab small{font:12px/1.3 var(--mono);color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.02em}
.topnav .tab:hover{background:rgba(255,255,255,.035)}
.topnav .tab:hover .th{filter:saturate(1) brightness(1)}
.topnav .tab:hover b{opacity:1}
.topnav .tab:focus-visible{outline:2px solid var(--acc);outline-offset:-2px}
.topnav .tab[aria-selected="true"]{background:linear-gradient(180deg,rgba(var(--acc-rgb),.17),rgba(var(--acc-rgb),.04) 70%,rgba(var(--acc-rgb),0));border-color:rgba(var(--acc-rgb),.32)}
.topnav .tab[aria-selected="true"]::after{content:"";position:absolute;left:14px;right:14px;bottom:0;height:3px;border-radius:3px 3px 0 0;background:var(--acc);box-shadow:0 0 16px rgba(var(--acc-rgb),.75)}
.topnav .tab[aria-selected="true"] .th{filter:none;box-shadow:0 0 0 1px rgba(var(--acc-rgb),.65),0 10px 24px -8px rgba(var(--acc-rgb),.8);transform:scale(1.05)}
.topnav .tab[aria-selected="true"] b{opacity:1}
.topnav .tab[aria-selected="true"] small{color:var(--acc)}
.topnav #navNova{flex:0 0 auto;align-self:center;margin:0 0 10px 10px}
#watch,#journey,#library,#gallery{border-top:0;margin-top:0;padding-top:14px}
.gallery{padding-top:0}
#about{padding-top:34px}
@media (max-width:900px){.topnav .tab{gap:10px;padding:8px 10px 10px 8px;min-height:60px}.topnav .tab .th{width:58px;height:40px}.topnav .tab b{font-size:18px}.topnav .tab small{display:none}}
@media (max-width:640px){.topnav{gap:2px;padding-top:6px}.topnav .tab{flex:1 1 0;flex-direction:column;justify-content:flex-start;gap:5px;padding:6px 3px 9px;min-height:0;border-radius:10px 10px 0 0}.topnav .tab .th{width:min(100%,76px);height:34px;border-radius:8px}.topnav .tab .th i{display:none}.topnav .tab .tx{display:block}.topnav .tab b{font:700 13px/1.1 var(--body);text-align:center;display:block;opacity:.75}.topnav .tab[aria-selected="true"] .th{transform:none}.topnav .tab[aria-selected="true"]::after{left:8px;right:8px}.topnav #navNova{display:none}#watch,#journey,#library,#gallery{padding-top:10px}}
@media (prefers-reduced-motion:reduce){.topnav .tab,.topnav .tab .th,.topnav .tab b{transition:none}}
"""
_i=a.index('</style>',a.index('/* ---- v24 tidy ---- */'))
a=a[:_i]+tabcss+'\n'+a[_i:]
tabjs=r"""<script>
(function(){
const $=id=>document.getElementById(id);
const tabs=[...document.querySelectorAll('#topnav .tab')];
const panels={films:$('p-films'),journey:$('p-journey'),library:$('p-library'),gallery:$('p-gallery')};
const alias={films:'films',watch:'films',about:'films',reel:'films',cfg:'films',journey:'journey',library:'library',shelves:'library',gallery:'gallery',gal:'gallery'};
let cur=null;
function setTab(t,o){o=o||{};t=panels[t]?t:'films';if(t===cur)return;const prev=cur;cur=t;
 tabs.forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',on?'true':'false');if(on)b.removeAttribute('tabindex');else b.tabIndex=-1;});
 for(const k in panels)panels[k].hidden=k!==t;
 if(prev==='films'&&window.EdgeFilm)try{EdgeFilm.pause();}catch(e){}
 if(prev==='journey'&&window.EdgeJourney)try{EdgeJourney.stop();}catch(e){}
 if(!o.silent)try{history.replaceState(null,'',location.pathname+location.search+'#'+t);}catch(e){}
 try{window.dispatchEvent(new Event('resize'));}catch(e){}
 if(o.scroll){const h=document.querySelector('header');if(h){const y=h.getBoundingClientRect().bottom+scrollY-48;if(o.force||scrollY>y)scrollTo({top:y,behavior:'auto'});}}
 if(o.focus){const b=tabs.find(x=>x.dataset.tab===t);if(b)b.focus();}
}
tabs.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab,{scroll:true})));
$('topnav').addEventListener('keydown',e=>{const i=tabs.findIndex(b=>b===document.activeElement);if(i<0)return;let n=null;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==null){e.preventDefault();setTab(tabs[n].dataset.tab,{scroll:true,focus:true});}});
const fromHash=()=>alias[location.hash.replace('#','')]||null;
const q=new URLSearchParams(location.search).get('book');
const h0=fromHash();setTab(h0||(q?'library':'films'),{silent:true});
if(h0)addEventListener('load',()=>setTimeout(()=>{const h=document.querySelector('header');if(h)scrollTo({top:h.getBoundingClientRect().bottom+scrollY-48,behavior:'auto'});},60));
addEventListener('hashchange',()=>{const t=fromHash();if(t)setTab(t,{scroll:true});});
window.EdgeTabs={set:setTab,current:()=>cur};
})();
/* living thumbnails on the tabs: a black hole, colliding stars, a shelf of books, Saturn; drawn by the same code as the gallery */
(function(){
const cvs=[...document.querySelectorAll('#topnav canvas[data-th]')];if(!cvs.length)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
const BOOKC=[['#ffcf7a','#c2421c'],['#7fc0ff','#0b2a55'],['#9ff5c9','#04303a'],['#c9b6ff','#3a1d6b'],['#ffd65a','#3a1a10'],['#e07a4a','#4a1a0e'],['#cfe0ff','#3b4aa0']];
const CUSTOM={shelf(c,w,h,t){const g0=c.createLinearGradient(0,0,0,h);g0.addColorStop(0,'#1a1626');g0.addColorStop(1,'#0c0a14');c.fillStyle=g0;c.fillRect(0,0,w,h);
 const n=BOOKC.length,bw=(w*.86)/n,x0=w*.07;
 for(let i=0;i<n;i++){const x=x0+i*bw,bh=h*.56+Math.sin(i*1.9+.4)*h*.07,y=h*.86-bh;const g=c.createLinearGradient(x,y,x+bw,y+bh);g.addColorStop(0,BOOKC[i][0]);g.addColorStop(1,BOOKC[i][1]);c.fillStyle=g;rr(c,x+.6,y,bw-1.6,bh,1.6);c.fill();c.fillStyle='rgba(255,255,255,.28)';c.fillRect(x+bw*.22,y+bh*.14,bw*.56,1);c.fillRect(x+bw*.22,y+bh*.14+3,bw*.56,1);}
 c.fillStyle='#7a5a2e';c.fillRect(0,h*.86,w,h*.05);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(0,h*.91,w,h*.09);
 if(!reduce){const gx=(((t*.18)%1.6)-.3)*w;const gg=c.createLinearGradient(gx-14,0,gx+14,0);gg.addColorStop(0,'rgba(255,255,255,0)');gg.addColorStop(.5,'rgba(255,255,255,.16)');gg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gg;c.fillRect(0,0,w,h*.86);}}};
const items=cvs.map((cv,n)=>({cv,k:cv.dataset.th,n,st:null,sc:null,real:false}));
let vis=true;try{new IntersectionObserver(es=>es.forEach(e=>{vis=e.isIntersecting;}),{rootMargin:'60px'}).observe(document.getElementById('topnav'));}catch(e){}
let last=0;const t0=performance.now();
function paint(now){const d=Math.min(2,devicePixelRatio||1),t=(now-t0)/1000;
 items.forEach(it=>{const w=it.cv.clientWidth,h=it.cv.clientHeight;if(!w||!h)return;if(it.cv.width!==Math.round(w*d)||it.cv.height!==Math.round(h*d)){it.cv.width=Math.round(w*d);it.cv.height=Math.round(h*d);}
  const c=it.cv.getContext('2d');c.setTransform(d,0,0,d,0,0);c.save();
  try{if(CUSTOM[it.k]){CUSTOM[it.k](c,w,h,t);it.real=true;}
   else if(window.ART&&ART.scenes&&ART.scenes[it.k]){if(!it.st){it.sc=ART.scenes[it.k];it.st=it.sc.init(ART.h.rng(it.n*131+7));}it.sc.draw(c,w,h,reduce?1.5:(it.k==='kilonova'?.4+t%5.5:t+4),it.st);it.real=true;}
   else{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#1a1830');g.addColorStop(1,'#0a0b14');c.fillStyle=g;c.fillRect(0,0,w,h);}}catch(e){}
  c.restore();});}
function draw(now){requestAnimationFrame(draw);if(!vis||document.hidden)return;if(now-last<50)return;last=now;if(reduce&&items.every(i=>i.real))return;paint(now);}
requestAnimationFrame(draw);
/* a first picture even before the first animation frame (hidden tabs, screenshots): paint on a timer until the real scenes exist */
const first=setInterval(()=>{paint(performance.now());if(items.every(i=>i.real))clearInterval(first);},400);setTimeout(()=>clearInterval(first),15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint(performance.now());});
})();
</script>
"""
# the tab script sits right after the panels, so it runs as soon as they exist and long before the film boots
_fm='</section>\n<p class="foot"><b>How these pictures are made.</b>'
assert a.count(_fm)==1
a=a.replace(_fm,'</section>\n'+tabjs+'<p class="foot"><b>How these pictures are made.</b>',1)
# without JS nothing on this page works anyway, but the Films panel is at least visible from the first byte
a=a.replace('id="p-films" role="tabpanel" aria-labelledby="tab-films" hidden>','id="p-films" role="tabpanel" aria-labelledby="tab-films">',1)
assert a.count('id="p-films"')==1 and 'EdgeTabs' in a and a.count('data-th=')==4


# ---------- no-WebGL fallback: the library, gallery and journey still work without the 3D films ----------
m_sh=_re.search(r"const SHELVES=(\[.*?\]\]\]);",a,_re.S); m_g=_re.search(r"const G=(\[\['bang'.*?\]\]);",a,_re.S)
assert m_sh and m_g
no3d='<script>\n(function(){function go(){if(!document.querySelector(".err"))return;/* 3D failed: build the shelves and gallery here */\n'+\
 'var SHELVES='+m_sh.group(1)+';var G='+m_g.group(1)+';\n'+\
 'document.querySelectorAll(".bar,#cfg,#allfilms,#reel,#about,.aboutg").forEach(function(e){e.style.display="none";});\n'+\
 'var err=document.querySelector(".err");err.innerHTML="<div><p style=\\"font-size:18px;color:#EDE9F5;margin:0 0 6px\\">The 3D films need a device with WebGL graphics.</p><p style=\\"margin:0\\">Everything else works: use the tabs above for the journey through time, the 28 books and the gallery.</p></div>";\n'+\
 'var sh=document.getElementById("shelves");if(sh&&!sh.children.length)SHELVES.forEach(function(pair){var row=document.createElement("div");row.className="shelf";row.innerHTML="<h3></h3><div class=\\"books\\"></div>";row.firstChild.textContent=pair[0];pair[1].forEach(function(id){var b=BOOKS[id];if(!b)return;var btn=document.createElement("button");btn.className="bookc";btn.id="book-"+id;btn.innerHTML="<span class=\\"cov\\"><i></i><b></b></span><small></small>";btn.querySelector(".cov").style.background="linear-gradient(160deg,"+b.c[0]+","+b.c[1]+")";btn.querySelector("b").textContent=b.t;btn.querySelector("small").textContent=b.s+" · "+b.pages.length+" chapters";btn.addEventListener("click",function(){Book.open(id);});row.lastChild.appendChild(btn);});sh.appendChild(row);});\n'+\
 'var gal=document.getElementById("gal");if(gal&&!gal.children.length){var tiles=[];G.forEach(function(g,n){var b=document.createElement("button");b.className="tile";b.id="tile-"+g[0];b.innerHTML="<canvas aria-hidden=\\"true\\"></canvas><span><b></b><small>OPEN THE BOOK →</small></span>";b.querySelector("b").textContent=g[2];b.addEventListener("click",function(){Book.open(g[3]);});gal.appendChild(b);tiles.push({cv:b.querySelector("canvas"),sc:ART.scenes[g[0]],st:ART.scenes[g[0]].init(ART.h.rng(n*97+5)),t0:g[1]});});var start=performance.now();(function draw(now){requestAnimationFrame(draw);var d=Math.min(1.5,devicePixelRatio||1);tiles.forEach(function(t){var w=t.cv.clientWidth,h=Math.round(w*.75);if(!w)return;if(t.cv.width!==Math.round(w*d)){t.cv.width=Math.round(w*d);t.cv.height=Math.round(h*d);}var c=t.cv.getContext("2d");c.setTransform(d,0,0,d,0,0);c.save();try{t.sc.draw(c,w,h,t.t0+(now-start)/1000,t.st);}catch(e){}c.restore();});})(performance.now());}\n'+\
 'var q=new URLSearchParams(location.search).get("book");if(q&&window.Book&&Book.has(q))setTimeout(function(){Book.open(q);},300);}\n'+\
 'setTimeout(go,400);})();\n</script>\n'
a=a.replace('\n'+jscript,'\n'+no3d+jscript,1)

assert a.count('id="jsky"')==1 and 'id="journey"' in a and '/edge/vendor/three.min.js' in a
# ---------- v29: the full Nova AI (nova.zeroorigine.com, by Advik) ----------
NOVA_URL='https://nova.zeroorigine.com/?src=starsteps'
# 1. a one-line link in the guide's header (second line under the title), so the chat keeps all its room
_nv='<small id="novaMode">Offline notes + calculator</small>'
assert a.count(_nv)==1
a=a.replace(_nv,_nv+'<a class="nova-up" id="novaUp" href="'+NOVA_URL+'" target="_blank" rel="noopener"><span class="nu-orb" aria-hidden="true"></span>Try the full Nova AI <b>↗</b></a>',1)
# 2. the offline notes point to it where they run out
for old,new in [
 ("For anything harder, ask a grown-up or look it up in the Library!","For anything harder, open the full Nova AI below with a grown-up, or look it up in the Library!"),
 ("For anything else, try the Library or ask a grown-up!","For anything else, try the Library, or open the full Nova AI below with a grown-up."),
 (" Modes need Claude; right now I am using my offline notes."," Thinking modes work in the full Nova AI; here I use my offline notes.")]:
    assert a.count(old)==1, old[:40]; a=a.replace(old,new)
# 3. footer link
a=a.replace('<a href="/library/">Books Library</a> · <a href="/play/">Play</a> · <a href="/privacy/">Privacy</a></p></footer>',
 '<a href="/library/">Books Library</a> · <a href="/play/">Play</a> · <a href="'+NOVA_URL+'" target="_blank" rel="noopener">Nova AI ↗</a> · <a href="/privacy/">Privacy</a></p></footer>',1)
assert a.count('Nova AI ↗')==1
novacss=r"""
/* ---- v29 full Nova AI ---- */
.nova-head>div{min-width:0;display:grid;gap:1px}
.nova-head small#novaMode{max-width:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11.5px}
.nova-up{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--star);text-decoration:none;line-height:1.2;white-space:nowrap;justify-self:start}
.nova-up:hover{text-decoration:underline}
.nova-up:focus-visible{outline:2px solid var(--star);outline-offset:2px;border-radius:4px}
.nova-up .nu-orb{width:11px;height:11px;border-radius:50%;flex:0 0 auto;background:radial-gradient(circle at 35% 30%,#fff 0%,#cfe4ff 30%,#4b6fd6 70%,#141a3a 100%);box-shadow:0 0 8px rgba(143,184,255,.8)}
.nova-up b{font-weight:700}
.nova-gate{margin:0 14px 10px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:#1d1a24;display:grid;gap:8px;font-size:14px;line-height:1.4}
.nova .nova-gate form{display:flex;gap:6px;padding:0;border-top:0}
.nova .nova-gate form .nvc{background:none;color:var(--muted);border:1px solid var(--line)}
.ss-foot a[target="_blank"]{color:var(--star)}
.nova-gate{grid-template-columns:minmax(0,1fr);min-width:0}
.nova .nova-gate form{flex-wrap:wrap}
.nova .nova-gate input{flex:1 1 90px;min-width:0}
.nova .nova-gate form button{padding:0 12px;min-height:38px}
@media (max-width:640px){.depth{padding:6px 14px 8px}.depth #dpDesc{display:none}.nova{max-height:min(560px,78vh)}}
"""
_i=a.index('</style>',a.index('/* ---- v26 tabs ---- */'))
a=a[:_i]+novacss+'\n'+a[_i:]
novajs=r"""<script>
/* Nova AI link: a plain link on the web; inside the store apps a grown-up answers a sum first (store rules for links that leave the app) */
(function(){
const up=document.getElementById('novaUp');if(!up)return;
up.addEventListener('click',function(e){
 if(!document.documentElement.classList.contains('ss-store'))return;
 e.preventDefault();
 var g=document.getElementById('novaGate');if(g){g.querySelector('input').focus();return;}
 var x=3+Math.floor(Math.random()*6),y=2+Math.floor(Math.random()*7);
 g=document.createElement('div');g.className='nova-gate';g.id='novaGate';
 g.innerHTML='<div><b>Ask a grown-up first.</b> Nova AI is a separate app by Advik; a grown-up should open it with you. Grown-up, what is '+x+' × '+y+'?</div><form><input inputmode="numeric" aria-label="Answer" placeholder="Answer"><button type="submit">Go</button><button type="button" class="nvc">Cancel</button></form>';
 document.getElementById('novaLog').before(g);
 g.querySelector('.nvc').addEventListener('click',function(){g.remove();});
 g.querySelector('form').addEventListener('submit',function(ev){ev.preventDefault();var inp=g.querySelector('input');if(+inp.value===x*y){g.remove();window.open(up.href,'_blank','noopener');}else{inp.value='';inp.placeholder='Try again';}});
 g.querySelector('input').focus();
});
})();
</script>
"""
a=a.replace('<footer class="ss-foot">',novajs+'<footer class="ss-foot">',1)
assert a.count('id="novaGate"')==0 and 'novaUp' in a

# ---------- v32: the live Nova (shared widget) replaces the offline guide panel ----------
# Advik's offline notes stay as the fallback: expose answer() and keep his panel in the page, hidden
assert a.count('return{film};})();')==1
a=a.replace('return{film};})();','return{film,answer};})();',1)
_nn="$('navNova').addEventListener('click',()=>$('novaBtn').click());"
assert a.count(_nn)==1
a=a.replace(_nn,"$('navNova').addEventListener('click',()=>{if(window.SSNova)SSNova.open();else $('novaBtn').click();});",1)
_nb="$('novaBtn').addEventListener('click',toggle);$('novaBtn2').addEventListener('click',toggle);"
assert a.count(_nb)==1
a=a.replace(_nb,"$('novaBtn').addEventListener('click',toggle);$('novaBtn2').addEventListener('click',()=>{if(window.SSNova)SSNova.open();else toggle();});",1)
a=a.replace('<p class="muted">Numbers, evidence, extra facts and the people behind the film that is playing. It changes with every film.</p>','<p class="muted">Numbers, evidence, extra facts and the people behind the film that is playing. It changes with every film.</p>',1)
# the "Ask Nova" button in the tab bar keeps its look; the old floating button and panel are hidden
_i=a.index('</style>',a.index('/* ---- v29 full Nova AI ---- */'))
a=a[:_i]+'\n/* ---- v32 live Nova ---- */\n#nova,#novaBtn{display:none!important}\n.ssn-dark .ssn-btn{bottom:calc(20px + env(safe-area-inset-bottom,0px))}\n'+a[_i:]
a=a.replace('<footer class="ss-foot">','<script src="/js/nova.js" data-page="edge" data-theme="dark" defer></script>\n<footer class="ss-foot">',1)
assert a.count('/js/nova.js')==1

OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(a)
print('wrote',OUT,len(a),'bytes; journey css',len(jcss),'js',len(js))
