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
<link rel="stylesheet" href="/js/doors.css">
</head><body>
<nav class="ss-doors" aria-label="Star Steps"><a class="ss-home" href="/"><img src="/icons/icon-192.png" alt="" width="26" height="26">Star Steps</a><div class="ss-doors-links"><a href="/play/">Play</a><a href="/library/">Library</a><a href="/edge/" aria-current="page">Edge of Knowing</a></div></nav>
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
films_h='<div class="sub-h" id="films"><h3>All 14 films</h3><p class="muted">Jump to any film. They play in order and each ends with a quiz.</p></div>\n'
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
def _tab(key,n,label,sub,sel):
    return ('<button class="tab" role="tab" id="tab-'+key+'" data-tab="'+key+'" aria-selected="'+('true' if sel else 'false')+'" aria-controls="p-'+key+'"'+('' if sel else ' tabindex="-1"')+
            '><i>'+n+'</i><span><b>'+label+'</b><small>'+sub+'</small></span></button>')
_newnav=('<nav class="topnav" id="topnav" role="tablist" aria-label="Sections">'+
 _tab('films','01','Films','14 in 3D · facts · quizzes',True)+
 _tab('journey','02','Journey','21 stops through time',False)+
 _tab('library','03','Library','28 illustrated books',False)+
 _tab('gallery','04','Gallery','20 living pictures',False)+
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
.topnav{top:46px;display:flex;flex-wrap:nowrap;align-items:stretch;gap:4px;padding:8px 0 0;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--line)}
.topnav::-webkit-scrollbar{display:none}
.topnav .tab{flex:1 1 0;min-width:0;margin:0;display:flex;align-items:center;gap:10px;padding:10px 14px 12px;border:0;border-radius:12px 12px 0 0;background:none;color:var(--muted);cursor:pointer;text-align:left;position:relative;font-family:var(--body);min-height:58px}
.topnav .tab i{font-family:var(--mono);font-style:normal;font-size:12px;color:var(--star);width:28px;height:28px;border-radius:9px;border:1px solid var(--line);display:grid;place-items:center;flex:0 0 auto;margin:0;opacity:1;transition:background .2s,color .2s}
.topnav .tab span{display:grid;min-width:0}
.topnav .tab b{font-family:var(--display);font-weight:400;font-size:21px;line-height:1.05;color:var(--ink)}
.topnav .tab small{font-size:12px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--mono);letter-spacing:.02em}
.topnav .tab:hover{background:rgba(255,255,255,.04)}
.topnav .tab:focus-visible{outline:2px solid var(--star);outline-offset:-2px}
.topnav .tab[aria-selected="true"]{background:var(--panel)}
.topnav .tab[aria-selected="true"]::after{content:"";position:absolute;left:12px;right:12px;bottom:-1px;height:3px;border-radius:3px;background:var(--star)}
.topnav .tab[aria-selected="true"] i{background:var(--star);color:#1b1206;border-color:var(--star)}
.topnav #navNova{flex:0 0 auto;align-self:center;margin:0 0 8px 10px}
#watch,#journey,#library,#gallery{border-top:0;margin-top:0;padding-top:14px}
.gallery{padding-top:0}
#about{padding-top:34px}
@media (max-width:900px){.topnav .tab{padding:10px 10px 12px;gap:8px;min-height:52px}.topnav .tab b{font-size:18px}.topnav .tab small{display:none}}
@media (max-width:640px){.topnav{gap:0;padding-top:4px}.topnav .tab{flex:1 1 0;justify-content:center;padding:9px 4px 11px;min-height:46px}.topnav .tab i{display:none}.topnav .tab b{font-size:15px;font-family:var(--body);font-weight:700;color:var(--muted)}.topnav .tab[aria-selected="true"] b{color:var(--ink)}.topnav .tab[aria-selected="true"]::after{left:8px;right:8px}.topnav #navNova{display:none}#watch,#journey,#library,#gallery{padding-top:10px}}
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
 if(o.scroll){const h=document.querySelector('header');if(h){const y=h.getBoundingClientRect().bottom+scrollY-48;if(scrollY>y)scrollTo({top:y,behavior:'auto'});}}
 if(o.focus){const b=tabs.find(x=>x.dataset.tab===t);if(b)b.focus();}
}
tabs.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab,{scroll:true})));
$('topnav').addEventListener('keydown',e=>{const i=tabs.findIndex(b=>b===document.activeElement);if(i<0)return;let n=null;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==null){e.preventDefault();setTab(tabs[n].dataset.tab,{scroll:true,focus:true});}});
const fromHash=()=>alias[location.hash.replace('#','')]||null;
const q=new URLSearchParams(location.search).get('book');
setTab(fromHash()||(q?'library':'films'),{silent:true});
addEventListener('hashchange',()=>{const t=fromHash();if(t)setTab(t,{scroll:true});});
window.EdgeTabs={set:setTab,current:()=>cur};
})();
</script>
"""
# the tab script sits right after the panels, so it runs as soon as they exist and long before the film boots
_fm='</section>\n<p class="foot"><b>How these pictures are made.</b>'
assert a.count(_fm)==1
a=a.replace(_fm,'</section>\n'+tabjs+'<p class="foot"><b>How these pictures are made.</b>',1)
# without JS nothing on this page works anyway, but the Films panel is at least visible from the first byte
a=a.replace('id="p-films" role="tabpanel" aria-labelledby="tab-films" hidden>','id="p-films" role="tabpanel" aria-labelledby="tab-films">',1)
assert a.count('id="p-films"')==1 and 'EdgeTabs' in a


# ---------- no-WebGL fallback: the library, gallery and journey still work without the 3D films ----------
m_sh=_re.search(r"const SHELVES=(\[.*?\]\]\]);",a,_re.S); m_g=_re.search(r"const G=(\[\['bang'.*?\]\]);",a,_re.S)
assert m_sh and m_g
no3d='<script>\n(function(){function go(){if(!document.querySelector(".err"))return;/* 3D failed: build the shelves and gallery here */\n'+\
 'var SHELVES='+m_sh.group(1)+';var G='+m_g.group(1)+';\n'+\
 'document.querySelectorAll(".bar,#cfg,#films,#reel,#about,.aboutg").forEach(function(e){e.style.display="none";});\n'+\
 'var err=document.querySelector(".err");err.innerHTML="<div><p style=\\"font-size:18px;color:#EDE9F5;margin:0 0 6px\\">The 3D films need a device with WebGL graphics.</p><p style=\\"margin:0\\">Everything else works: use the tabs above for the journey through time, the 28 books and the gallery.</p></div>";\n'+\
 'var sh=document.getElementById("shelves");if(sh&&!sh.children.length)SHELVES.forEach(function(pair){var row=document.createElement("div");row.className="shelf";row.innerHTML="<h3></h3><div class=\\"books\\"></div>";row.firstChild.textContent=pair[0];pair[1].forEach(function(id){var b=BOOKS[id];if(!b)return;var btn=document.createElement("button");btn.className="bookc";btn.id="book-"+id;btn.innerHTML="<span class=\\"cov\\"><i></i><b></b></span><small></small>";btn.querySelector(".cov").style.background="linear-gradient(160deg,"+b.c[0]+","+b.c[1]+")";btn.querySelector("b").textContent=b.t;btn.querySelector("small").textContent=b.s+" · "+b.pages.length+" chapters";btn.addEventListener("click",function(){Book.open(id);});row.lastChild.appendChild(btn);});sh.appendChild(row);});\n'+\
 'var gal=document.getElementById("gal");if(gal&&!gal.children.length){var tiles=[];G.forEach(function(g,n){var b=document.createElement("button");b.className="tile";b.id="tile-"+g[0];b.innerHTML="<canvas aria-hidden=\\"true\\"></canvas><span><b></b><small>OPEN THE BOOK →</small></span>";b.querySelector("b").textContent=g[2];b.addEventListener("click",function(){Book.open(g[3]);});gal.appendChild(b);tiles.push({cv:b.querySelector("canvas"),sc:ART.scenes[g[0]],st:ART.scenes[g[0]].init(ART.h.rng(n*97+5)),t0:g[1]});});var start=performance.now();(function draw(now){requestAnimationFrame(draw);var d=Math.min(1.5,devicePixelRatio||1);tiles.forEach(function(t){var w=t.cv.clientWidth,h=Math.round(w*.75);if(!w)return;if(t.cv.width!==Math.round(w*d)){t.cv.width=Math.round(w*d);t.cv.height=Math.round(h*d);}var c=t.cv.getContext("2d");c.setTransform(d,0,0,d,0,0);c.save();try{t.sc.draw(c,w,h,t.t0+(now-start)/1000,t.st);}catch(e){}c.restore();});})(performance.now());}\n'+\
 'var q=new URLSearchParams(location.search).get("book");if(q&&window.Book&&Book.has(q))setTimeout(function(){Book.open(q);},300);}\n'+\
 'setTimeout(go,400);})();\n</script>\n'
a=a.replace('\n'+jscript,'\n'+no3d+jscript,1)

assert a.count('id="jsky"')==1 and 'id="journey"' in a and '/edge/vendor/three.min.js' in a
OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(a)
print('wrote',OUT,len(a),'bytes; journey css',len(jcss),'js',len(js))
