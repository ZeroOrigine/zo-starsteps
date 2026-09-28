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
      '<div class="g-row who-row"><button class="g-cancel" data-parent>Grown-ups</button>' +
      (closable ? '<button class="g-cancel" data-close>Not now</button>' : '') + '</div></div>');
    parentLink(back);
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
  function switchTile() {
    var tools = document.querySelector('.tools[data-sec="me"]'), a = A.acct();
    if (!tools || $id("whoBtn") || !a || !a.childId) return;
    var t = document.createElement("button");
    t.className = "tool"; t.id = "whoBtn";
    t.innerHTML = '<div class="ti" style="background:var(--mint-soft)" aria-hidden="true">\u{1F9D2}</div>' +
      '<div><div class="tt">Switch player</div><div class="ts"></div></div>';
    t.querySelector(".ts").textContent = "Playing as " + (a.childName || S.name);
    t.onclick = function () { kidsWithStars().then(function (k) { picker(k, true); }, function () {}); };
    var g = $id("grownBtn"); tools.insertBefore(t, g || null);
  }

  /* ---------- 5. start ---------- */
  function plan() { return A.refreshPlan(sb, A.uid()).then(updateTier, function () {}); }
  function afterSplash(fn) {
    (function wait() { try { if (splashUp) return setTimeout(wait, 300); } catch (e) {} fn(); })();
  }
  if (!A.hasStoredSession()) return;
  A.swReady().then(A.loadLib).then(function () {
    sb = A.client({ detectSessionInUrl: false });
    return A.session(sb);
  }).then(function (s) {
    if (!s) return;
    A.adoptSession(s.user.id);
    plan();
    A.flushStashes();
    var a = A.acct();
    if (a && a.childId) {
      switchTile();
      return A.pullActive(sb, { onServerWins: serverState, onChildGone: childGone }).then(function (r) {
        if (r === "applied") serverState();
        if (r === "gone") afterSplash(function () { kidsWithStars().then(function (k) { picker(k, true); }); });
      });
    }
    var shown = false; try { shown = sessionStorage.getItem("ss.picked") === "1"; sessionStorage.setItem("ss.picked", "1"); } catch (e) {}
    if (!shown) afterSplash(function () { kidsWithStars().then(function (k) { picker(k, true); }, function () {}); });
  }).catch(function () {});
})();
