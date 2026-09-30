/* Star Steps website build: accounts layer for the game (Phase B/C, 2026-09-28).
   1. Plans come only from the family's real subscription (no local trials, no free switches).
   2. A signed-in family picks who is learning; that child's progress is saved to their account.
   3. The plan screen hands the purchase to a grown-up in the parent area.
   Loaded after the game script and before grownups.js (which gates the plan screen). */
(function () {
  "use strict";
  var A = window.SSAcct;
  if (!A || typeof window.save !== "function") return;
  var $id = function (x) { return document.getElementById(x); };

  /* ---------- 1. entitlement ---------- */
  window.trialDaysLeft = function () { return 0; };
  window.tierNow = function () { return A.enforcedTier(); };
  function updateTier() {
    try {
      var t = A.enforcedTier();
      if (S.tier === t) return;
      S.tier = t; normaliseTier(); origSave(); syncTop(); Pip.retier();
      var v = document.body.dataset.view;
      if (v === "path") renderPath();
      else if (v === "plan") window.renderPlan();
    } catch (e) {}
  }

  /* ---------- 2. saving ---------- */
  var origSave = window.save, pushTimer = 0, sb = null;
  window.save = function () {
    origSave.apply(this, arguments);
    if (A.noteLocalSave()) { clearTimeout(pushTimer); pushTimer = setTimeout(push, 4000); }
  };
  function push(keepalive) {
    if (!sb || !A.uid()) return;
    A.pushActive({ keepalive: !!keepalive, onServerWins: serverState, onChildGone: childGone }).catch(function () {});
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) push(true);
    else if (sb) { var p = A.get("ss.plan"); if (!p || Date.now() - p.at > 36e5) plan(); }
  });
  addEventListener("pagehide", function () { push(true); });
  addEventListener("online", function () { push(false); });
  setInterval(function () { var a = A.acct(); if (a && a.dirty) push(false); }, 60000);

  /* the server copy replaced the device copy: redraw now, or after the lesson on screen ends */
  var pending = false;
  function safeNow() { var v = document.body.dataset.view; return v !== "play" && v !== "done"; }
  function reapply() {
    pending = false;
    try {
      load(); Sound.on = S.sound && !S.quiet; applyTheme(); applyLang(); syncTop(); Pip.retier();
      renderPath(); if (!S.onboarded) showIntro();
      savedNote();
    } catch (e) { location.reload(); }
  }
  function serverState() { if (safeNow()) reapply(); else pending = true; }
  var origShow = window.show;
  window.show = function (v) {
    origShow.apply(this, arguments);
    if (pending && v !== "play" && v !== "done") setTimeout(reapply, 0);
  };
  var origIntro = window.showIntro;
  window.showIntro = function () {
    origIntro.apply(this, arguments);
    prefillIntro();
  };
  function childGone() { location.reload(); }
  function prefillIntro() {
    var a = A.acct(), n = $id("introName");
    if (a && a.childId && n && !n.value) n.value = a.childName || "";
  }
  prefillIntro(); /* the game may already be showing the intro when this file loads */
  function savedNote() {
    var a = A.acct(), n = document.querySelector('.section-head[data-sec="me"] .note');
    if (n && a && a.childId) n.textContent = "Saved to your family account";
  }
  savedNote();

  /* ---------- 3. plan screen ---------- */
  function fmt(d) { try { return new Date(d).toLocaleDateString(undefined, { month: "long", day: "numeric" }); } catch (e) { return ""; } }
  var origRender = window.renderPlan;
  window.renderPlan = function () { origRender.apply(this, arguments); patchPlan(); };
  function focusNow() { return PRICE[planFocus] ? planFocus : "super"; }
  function patchPlan() {
    var focus = focusNow(), nm = TIER_NAME[focus];
    var cyc = (S[focus] && S[focus].cycle) || "monthly", pr = PRICE[focus][cyc] || PRICE[focus].monthly;
    var p = A.get("ss.plan"), cur = A.enforcedTier(), signed = A.hasStoredSession();
    var go = $id("planGo"), note = $id("planNote"), buy = $id("buyNote");
    if (cur === focus) {
      go.textContent = "Manage " + nm + " in the parent area";
      note.textContent = p && p.status === "trialing" ? "Free trial until " + fmt(p.trial_end) + "."
        : p && p.cancel_at_period_end ? nm + " ends on " + fmt(p.current_period_end) + "." : pr.note;
      buy.textContent = nm + " is on for your family. Switch plans, change the card or cancel in the parent area.";
    } else if (cur !== "free") {
      go.textContent = "Switch to " + nm;
      note.textContent = pr.note;
      buy.textContent = "Your family is on " + TIER_NAME[cur] + ". A grown-up can switch in the parent area; the price difference is worked out to the day.";
    } else {
      var trial = !(p && p.had_trial);
      go.textContent = trial ? "Start 7-day free trial" : "Get " + nm;
      note.textContent = (trial ? "7 days free, then " + pr.tier + "." : pr.tier + ".") + " One subscription covers up to 4 children.";
      buy.textContent = signed
        ? "A grown-up finishes this in the parent area. Payment is by card through Stripe, and you can cancel any time."
        : "A grown-up creates a free parent account first, then starts the trial. A card is needed. Cancel before day 7 and nothing is charged.";
    }
  }
  var goBtn = $id("planGo");
  if (goBtn) goBtn.onclick = function () {
    var focus = focusNow(), cyc = (S[focus] && S[focus].cycle) || "monthly";
    SFX.tap();
    location.href = A.enforcedTier() === focus ? "/parents/" : "/parents/?plan=" + focus + "_" + cyc;
  };

  /* ---------- 4. who is learning ---------- */
  var COLORS = ["#FF8A5B", "#5B8CFF", "#2DBE8C", "#B36BFF"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); }
  function overlay(html) {
    var back = document.createElement("div"); back.className = "gate-back who-back"; back.innerHTML = html;
    document.body.appendChild(back); return back;
  }
  function parentLink(back) {
    var b = back.querySelector("[data-parent]");
    if (b) b.onclick = function () { window.ssGate(function () { location.href = "/parents/"; }); };
  }
  function picker(kids, closable) {
    if (document.querySelector(".who-back")) return;
    var a = A.acct();
    var tiles = kids.map(function (k, i) {
      var cur = a && a.childId === k.id;
      return '<button class="who-kid' + (cur ? " cur" : "") + '" data-kid="' + i + '">' +
        '<span class="who-av" style="background:' + COLORS[i % 4] + '">' + esc((k.name || "?").charAt(0).toUpperCase()) + '</span>' +
        '<span class="who-nm">' + esc(k.name) + '</span>' +
        '<span class="who-sub">' + esc(k.grade === 0 ? "Senior K" : "Grade " + k.grade) + (k.stars ? " · " + k.stars + " ⭐" : "") + '</span></button>';
    }).join("");
    var body = kids.length
      ? '<div class="who-grid">' + tiles + '</div>'
      : '<p>There are no child profiles yet. A grown-up can add one in the parent area.</p>';
    var back = overlay('<div class="gate who" role="dialog" aria-modal="true" aria-labelledby="whoT">' +
      '<div class="g-kick">Star Steps</div><h2 id="whoT">Who is learning?</h2>' + body +
      '<div class="g-row who-row"><button class="g-cancel" data-parent>Parent area</button>' +
      '<button class="g-cancel" data-logout>Log out</button>' +
      (closable ? '<button class="g-cancel" data-close>Not now</button>' : '') + '</div></div>');
    parentLink(back);
    var lo = back.querySelector("[data-logout]"); if (lo) lo.onclick = function () { back.remove(); logOut(); };
    var c = back.querySelector("[data-close]"); if (c) c.onclick = function () { back.remove(); };
    back.querySelectorAll("[data-kid]").forEach(function (btn) {
      btn.onclick = function () { choose(kids[+btn.dataset.kid], back); };
    });
  }
  function choose(kid, back) {
    var a = A.acct();
    if (a && a.childId === kid.id) { back.remove(); return; }
    var g = kid.hasProgress ? null : A.guestInfo();
    if (!g) return go(kid, undefined, back);
    back.querySelector(".gate").innerHTML = '<div class="g-kick">Saved game found</div><h2>Is this your game, ' + esc(kid.name) + '?</h2>' +
      '<p>This device has a game with <b>' + g.stars + ' stars</b> and <b>' + g.lessons + ' lessons</b> played as "' + esc(g.name) + '".</p>' +
      '<div class="g-row"><button class="g-cancel" data-no>No, start new</button><button class="g-ok" data-yes>Yes, keep it</button></div>';
    back.querySelector("[data-yes]").onclick = function () { go(kid, "bring", back); };
    back.querySelector("[data-no]").onclick = function () { go(kid, "fresh", back); };
  }
  function go(kid, guest, back) {
    back.querySelector(".gate").innerHTML = '<h2>One moment…</h2><p>Getting ' + esc(kid.name) + '’s path ready.</p>';
    A.switchTo(sb, kid, guest).then(function () { location.reload(); }, function () {
      back.querySelector(".gate").innerHTML = '<h2>Could not switch</h2><p>Check the internet connection and try again.</p><div class="g-row"><button class="g-ok" data-close>OK</button></div>';
      back.querySelector("[data-close]").onclick = function () { back.remove(); };
    });
  }
  function kidsWithStars() {
    return sb.from("children").select("id,name,grade,created_at").order("created_at").then(function (r) {
      if (r.error) throw r.error;
      var kids = r.data || [];
      if (!kids.length) return kids;
      return sb.from("progress").select("child_id,stars:state->stars").in("child_id", kids.map(function (k) { return k.id; })).then(function (p) {
        var m = {}; (p.data || []).forEach(function (x) { m[x.child_id] = x; });
        kids.forEach(function (k) { k.hasProgress = !!m[k.id]; k.stars = m[k.id] ? (+m[k.id].stars || 0) : 0; });
        return kids;
      });
    });
  }
  /* ---------- family: who is playing, switch player, parent area, log out ---------- */
  function initial(n) { return esc((n || "?").trim().charAt(0).toUpperCase() || "?"); }
  function famButton(a) {
    var bar = document.querySelector(".topbar-in"); if (!bar) return;
    var b = $id("famBtn");
    if (!b) { b = document.createElement("button"); b.id = "famBtn"; b.className = "fam-btn"; bar.insertBefore(b, $id("soundBtn")); }
    var name = a && a.childId ? (a.childName || S.name) : "";
    b.innerHTML = name ? '<span class="fam-av">' + initial(name) + '</span>' : '<span class="fam-av fam-none" aria-hidden="true">?</span>';
    b.setAttribute("aria-label", name ? "Playing as " + name + ". Switch player" : "Choose who is learning");
    b.title = name ? "Playing as " + name : "Who is learning?";
    b.onclick = function () { try { SFX.tap(); } catch (e) {} kidsWithStars().then(function (k) { picker(k, true); }, function () { offline(); }); };
    document.body.classList.add("ss-family");
    /* signed in: the "this device only" wording is no longer true */
    var note = document.querySelector('#viewPath .section-head[data-sec="me"] .note');
    if (note) note.textContent = "Saved to your family account";
    var foot = document.querySelector('#viewPath .footnote[data-sec="me"]');
    if (foot && !foot.dataset.fam) { foot.dataset.fam = "1";
      var fe = foot.textContent.indexOf("Emoji art") >= 0 ? " Emoji art: Microsoft Fluent Emoji (MIT licence)." : "";
      foot.textContent = "Star Steps keeps every lesson free. Progress is saved to your family account, so it follows your child to any device." + fe; }
  }
  function famCard(kind, a, email) {
    var head = document.querySelector('#viewPath > .section-head[data-sec="me"]'); if (!head) return;
    var c = $id("famCard");
    if (!c) { c = document.createElement("div"); c.id = "famCard"; c.className = "fam-card"; c.setAttribute("data-sec", "me"); head.insertAdjacentElement("afterend", c); }
    var name = a && a.childId ? (a.childName || S.name) : "";
    if (kind === "guest") {
      c.innerHTML = '<div class="fam-top"><span class="fam-av fam-none" aria-hidden="true">\u{1F46A}</span><div><b>Keep this progress safe</b>' +
        '<span>A free parent account saves each child\u2019s stars and lets them play on any device.</span></div></div>' +
        '<div class="fam-acts"><button class="fam-go" data-act="signup">For grown-ups: create an account</button><button data-act="login">Parent log in</button></div>';
    } else if (kind === "expired") {
      c.innerHTML = '<div class="fam-top"><span class="fam-av fam-none" aria-hidden="true">\u{1F512}</span><div><b>Log in again to keep saving</b>' +
        '<span>This device is not connected to your family account right now. Progress is kept here until you log in.</span></div></div>' +
        '<div class="fam-acts"><button class="fam-go" data-act="login">Parent log in</button></div>';
    } else {
      c.innerHTML = '<div class="fam-top"><span class="fam-av">' + (name ? initial(name) : "?") + '</span><div><b>' + (name ? "Playing as " + esc(name) : "Who is learning?") + '</b>' +
        '<span>Family account' + (email ? ' \u00B7 ' + esc(email) : '') + '</span></div></div>' +
        '<div class="fam-acts"><button class="fam-go" data-act="switch">' + (name ? "Switch player" : "Choose player") + '</button>' +
        '<button data-act="parent">Parent area</button><button data-act="logout">Log out</button></div>';
    }
    c.querySelectorAll("[data-act]").forEach(function (btn) {
      btn.onclick = function () {
        var act = btn.dataset.act;
        if (act === "switch") kidsWithStars().then(function (k) { picker(k, true); }, function () { offline(); });
        else if (act === "logout") logOut();
        else window.ssGate(function () { location.href = act === "signup" ? "/parents/?signup=1" : "/parents/"; });
      };
    });
  }
  function offline() {
    var back = overlay('<div class="gate who" role="dialog" aria-modal="true"><h2>No connection</h2><p>Switching players needs the internet. Your progress on this device is safe.</p><div class="g-row"><button class="g-ok" data-close>OK</button></div></div>');
    back.querySelector("[data-close]").onclick = function () { back.remove(); };
  }
  /* log out on this device: a grown-up confirms, progress is uploaded first, then this family's data leaves the device */
  function logOut() {
    window.ssGate(function () {
      var back = overlay('<div class="gate who" role="dialog" aria-modal="true" aria-labelledby="loT"><div class="g-kick">Family account</div><h2 id="loT">Log out on this device?</h2>' +
        '<p>Progress is saved to your family account first. After logging out, this device plays without an account until a grown-up logs in again.</p>' +
        '<div class="g-row"><button class="g-cancel" data-close>Cancel</button><button class="g-ok" data-yes>Log out</button></div></div>');
      back.querySelector("[data-close]").onclick = function () { back.remove(); };
      back.querySelector("[data-yes]").onclick = function () {
        back.querySelector(".gate").innerHTML = "<h2>Saving progress\u2026</h2>";
        var finish = function () {
          A.forgetDevice();
          var done = function () { location.reload(); };
          (sb ? sb.auth.signOut({ scope: "local" }).catch(function () {}) : Promise.resolve()).then(done, done);
        };
        (sb ? A.pushActive() : Promise.resolve()).then(finish, function () {
          back.querySelector(".gate").innerHTML = '<h2>Some progress is not saved yet</h2><p>This device could not reach Star Steps. If you log out now, the newest progress on this device is lost.</p>' +
            '<div class="g-row"><button class="g-cancel" data-close>Stay logged in</button><button class="g-ok" data-yes>Log out anyway</button></div>';
          back.querySelector("[data-close]").onclick = function () { back.remove(); };
          back.querySelector("[data-yes]").onclick = finish;
        });
      };
    });
  }

  /* ---------- 5. start ---------- */
  function plan() { return A.refreshPlan(sb, A.uid()).then(updateTier, function () {}); }
  function afterSplash(fn) {
    (function wait() { try { if (splashUp) return setTimeout(wait, 300); } catch (e) {} fn(); })();
  }
  if (!A.hasStoredSession()) {
    var ga = A.acct();
    famCard(ga && ga.uid ? "expired" : "guest");
    return;
  }
  A.swReady().then(A.loadLib).then(function () {
    sb = A.client({ detectSessionInUrl: false });
    return A.session(sb);
  }).then(function (s) {
    if (!s) { famCard("expired"); return; }
    A.adoptSession(s.user.id);
    plan();
    A.flushStashes();
    var a = A.acct();
    famButton(a); famCard("family", a, s.user.email);
    if (a && a.childId) {
      return A.pullActive(sb, { onServerWins: serverState, onChildGone: childGone }).then(function (r) {
        if (r === "applied") serverState();
        if (r === "gone") afterSplash(function () { kidsWithStars().then(function (k) { picker(k, true); }); });
      });
    }
    var shown = false; try { shown = sessionStorage.getItem("ss.picked") === "1"; sessionStorage.setItem("ss.picked", "1"); } catch (e) {}
    if (!shown) afterSplash(function () { kidsWithStars().then(function (k) { picker(k, true); }, function () {}); });
  }).catch(function () { famCard("expired"); });
})();
