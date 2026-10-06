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
@media (max-width:560px){.ss-doors .ss-home span{display:none}.hero-stats b{font-size:17px}.time{display:none}.nova-btn{bottom:14px}.topnav a{padding:7px 10px}.sect-h{padding-top:32px}}
"""
a=a.replace('\n.settings{display:flex;',tidycss+'\n.settings{display:flex;',1)

assert a.count('id="jsky"')==1 and 'id="journey"' in a and '/edge/vendor/three.min.js' in a
OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(a)
print('wrote',OUT,len(a),'bytes; journey css',len(jcss),'js',len(js))
