/* Nova, Star Steps edition (v32, 2026-10-10).
   One small live chat for Play, Library and The Edge of Knowing. It talks to the Star Steps
   edge function /functions/v1/nova (Claude, kid-safe prompt, short answers, 10 free questions
   per device per day). Long or deep questions, and the 11th question, point to the full Nova AI
   at nova.zeroorigine.com (Advik's product). Inside the store apps that link goes through the
   grown-up gate in ss-store.js (data-nova).
   Use: <script src="/js/nova.js" data-page="library"></script>  (+ /js/nova.css)
   window.SSNova = { open(), close(), ask(q) } */
(function () {
  "use strict";
  var API = "https://eidwmxkkfnrgsiuingtm.supabase.co/functions/v1/nova";
  var FULL = "https://nova.zeroorigine.com/?src=starsteps";
  var me = document.currentScript, PAGE = (me && me.getAttribute("data-page")) || "star-steps";
  var DARK = me && me.getAttribute("data-theme") === "dark";
  var LIMIT = 10;
  var CHIPS = {
    play: ["Why do we have to sleep?", "How big is the Sun?", "What is a prime number?"],
    library: ["Why is the sky blue?", "How do magnets work?", "What is inside an atom?"],
    edge: ["What came before the Big Bang?", "Could we live on Mars?", "What is a black hole?"]
  };

  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function device() {
    var k = "ss.nova.dev", d = null;
    try { d = localStorage.getItem(k); } catch (e) {}
    if (!d) { d = ""; var a = "abcdefghijklmnopqrstuvwxyz0123456789"; var r = new Uint8Array(24); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(r) : r.forEach(function (_, i) { r[i] = Math.random() * 256; }); for (var i = 0; i < 24; i++) d += a[r[i] % a.length]; try { localStorage.setItem(k, d); } catch (e) {} }
    return d;
  }
  function grade() { try { var s = JSON.parse(localStorage.getItem("starsteps.v2") || "null"); var g = s && (s.grade != null ? s.grade : null); return g == null ? null : Number(g); } catch (e) { return null; } }

  // ----- markup -----
  var root = document.documentElement; root.classList.add("ssn-" + (PAGE === "play" ? "play" : PAGE)); if (DARK) root.classList.add("ssn-dark");
  var btn = el("button", "ssn-btn"); btn.type = "button"; btn.id = "ssnBtn"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "ssn"); btn.setAttribute("aria-label", "Ask Nova");
  btn.innerHTML = '<span class="ssn-orb" aria-hidden="true"></span><span class="ssn-l">Ask Nova</span>';
  var box = el("section", "ssn"); box.id = "ssn"; box.hidden = true; box.setAttribute("aria-label", "Nova, your guide");
  box.innerHTML =
    '<div class="ssn-head"><span class="ssn-orb" aria-hidden="true"></span><div class="ssn-t"><b>Nova</b><small id="ssnSub">Short answers · 10 free a day</small></div>' +
    '<a class="ssn-full" href="' + FULL + '" target="_blank" rel="noopener" data-nova>Full Nova AI <span>↗</span></a>' +
    '<button class="ssn-ico" id="ssnTalk" type="button" aria-pressed="false" aria-label="Read answers aloud" title="Read aloud">🔈</button>' +
    '<button class="ssn-ico" id="ssnX" type="button" aria-label="Close">✕</button></div>' +
    '<div class="ssn-log" id="ssnLog" aria-live="polite"></div>' +
    '<div class="ssn-chips" id="ssnChips"></div>' +
    '<form class="ssn-form" id="ssnForm"><input id="ssnIn" maxlength="240" placeholder="Ask a short question…" autocomplete="off" aria-label="Your question"><button type="submit" id="ssnSend">Ask</button></form>' +
    '<div class="ssn-foot"><span id="ssnLeft">10 free questions a day</span><span>Made by Advik</span></div>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var log = $("#ssnLog"), chips = $("#ssnChips"), form = $("#ssnForm"), inp = $("#ssnIn"), send = $("#ssnSend"), leftEl = $("#ssnLeft"), talkBtn = $("#ssnTalk");

  // ----- state -----
  var hist = [], busy = false, opened = false, left = null, talk = false, done = false;
  try { talk = localStorage.getItem("ss.nova.talk") === "1"; } catch (e) {}
  talkBtn.setAttribute("aria-pressed", String(talk)); talkBtn.textContent = talk ? "🔊" : "🔈";

  function say(text, who) { var m = el("div", "ssn-m " + (who || "n"), text); log.appendChild(m); log.scrollTop = log.scrollHeight; if ((who || "n") === "n") speak(text); return m; }
  function speak(t) { if (!talk || !window.speechSynthesis) return; try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(t); u.rate = 0.95; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) {} }
  function fullCard(title, sub) {
    var a = el("a", "ssn-card"); a.href = FULL; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("data-nova", "");
    a.innerHTML = '<span class="ssn-orb" aria-hidden="true"></span><span><b></b><small></small></span><span class="go">Open ↗</span>';
    a.querySelector("b").textContent = title; a.querySelector("small").textContent = sub; log.appendChild(a); log.scrollTop = log.scrollHeight;
  }
  function setLeft(n, lim) {
    if (n == null) return; left = n; LIMIT = lim || LIMIT;
    leftEl.innerHTML = ""; var b = el("b", "", String(n)); leftEl.appendChild(b); leftEl.appendChild(document.createTextNode(" of " + LIMIT + " free questions left today"));
    leftEl.classList.toggle("low", n <= 2);
    if (n <= 0) { done = true; inp.disabled = true; send.disabled = true; inp.placeholder = "All done for today. Come back tomorrow!"; }
  }
  function setChips(list) { chips.innerHTML = ""; (list || []).forEach(function (q) { var b = el("button", "", q); b.type = "button"; b.addEventListener("click", function () { ask(q); }); chips.appendChild(b); }); }
  function offline(q) { try { if (window.Nova && typeof Nova.answer === "function") return Nova.answer(q); } catch (e) {} return null; }

  function ask(q) {
    q = (q || "").trim(); if (!q || busy || done) return;
    busy = true; send.disabled = true; inp.value = ""; setChips([]);
    say(q, "u"); var th = say("Thinking", "n think"); th.classList.add("think"); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
    var body = { device: device(), q: q, page: PAGE, grade: grade(), history: hist.slice(-6) };
    var ctl = window.AbortController ? new AbortController() : null, timer = ctl && setTimeout(function () { ctl.abort(); }, 25000);
    fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); })
      .catch(function () { return { error: "network" }; })
      .then(function (j) {
        if (timer) clearTimeout(timer); th.remove();
        if (j.error) {
          var local = offline(q);
          if (local) { say(local); say("That is from my offline notes. The live Nova is resting right now.", "w"); }
          else if (j.error === "not_configured") { say("I am still waking up on this page. The full Nova AI is awake and free!"); fullCard("Ask the full Nova AI", "Live answers, voice chat, free. Open it with a grown-up."); }
          else { say("Hmm, I could not reach my brain just now. Try again in a moment, or ask the full Nova AI."); fullCard("Ask the full Nova AI", "Live answers, voice chat, free."); }
        } else {
          say(j.answer);
          if (!j.limited) { hist.push({ role: "user", content: q }, { role: "assistant", content: j.answer }); hist = hist.slice(-6); }
          if (j.limited) fullCard("Keep going in the full Nova AI", "No short limit there. Free, made by Advik. Open it with a grown-up.");
          else if (j.full) fullCard("The full Nova AI can go deep on this", "Long answers, step by step, voice too. Open it with a grown-up.");
          setLeft(j.left, j.limit);
        }
      })
      .then(function () { busy = false; if (!done) { send.disabled = false; inp.focus(); } });
  }

  function open() {
    box.hidden = false; btn.setAttribute("aria-expanded", "true");
    if (!opened) { opened = true; say("Hi! I'm Nova. Ask me a short question about space, science, maths, animals, anything. Big questions? The full Nova AI loves those."); setChips(CHIPS[PAGE] || CHIPS.library); }
    inp.focus();
  }
  function close() { box.hidden = true; btn.setAttribute("aria-expanded", "false"); try { speechSynthesis.cancel(); } catch (e) {} btn.focus(); }

  btn.addEventListener("click", open);
  $("#ssnX").addEventListener("click", close);
  form.addEventListener("submit", function (e) { e.preventDefault(); ask(inp.value); });
  talkBtn.addEventListener("click", function () { talk = !talk; talkBtn.setAttribute("aria-pressed", String(talk)); talkBtn.textContent = talk ? "🔊" : "🔈"; try { localStorage.setItem("ss.nova.talk", talk ? "1" : "0"); } catch (e) {} if (!talk) try { speechSynthesis.cancel(); } catch (e) {} });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) close(); });

  window.SSNova = { open: open, close: close, ask: ask };
})();
