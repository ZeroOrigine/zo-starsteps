/* Star Steps accounts: shared by the parent area and the game (2026-09-28).
   What lives on the device:
     starsteps.v2      the game's own save: whoever is playing right now
     ss.acct           {uid, childId, childName, rev, dirty, seq}  which child that save belongs to
     ss.stash.<id>     {uid, state, rev}  a child's save that could not be uploaded yet (offline)
     ss.plan           {uid, tier, entitled, status, trial_end, current_period_end, at}  last plan seen
   The server copy is the source of truth; the device copy lets the game run offline. */
(function () {
  "use strict";
  var SB_URL = "https://eidwmxkkfnrgsiuingtm.supabase.co";
  var SB_KEY = "sb_publishable_aqlZKxwjrG0Tw80DorRL7w_7eVr5lKk";
  var LIB = "/vendor/supabase-2.117.2.js";
  var GAME = "starsteps.v2", ACCT = "ss.acct", PLAN = "ss.plan", STASH = "ss.stash.";
  var SESSION_KEY = "sb-eidwmxkkfnrgsiuingtm-auth-token";
  var PLAN_TTL = 14 * 864e5, GRACE = 3 * 864e5;

  function get(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function rawGame() { try { return localStorage.getItem(GAME); } catch (e) { return null; } }

  var sbClient = null, libPromise = null, token = null, uid = null;

  function hasStoredSession() { return !!get(SESSION_KEY); }
  function loadLib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    if (libPromise) return libPromise;
    libPromise = new Promise(function (res, rej) {
      var s = document.createElement("script"); s.src = LIB; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { libPromise = null; rej(new Error("lib")); };
      document.head.appendChild(s);
    });
    return libPromise;
  }
  function client(opts) {
    if (sbClient) return sbClient;
    sbClient = window.supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: !!(opts && opts.detectSessionInUrl), flowType: "implicit" }
    });
    sbClient.auth.onAuthStateChange(function (_e, session) {
      token = session ? session.access_token : null; uid = session ? session.user.id : null;
    });
    return sbClient;
  }
  function session(sb) {
    return sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      token = s ? s.access_token : null; uid = s ? s.user.id : null;
      return s;
    });
  }

  /* An older service worker (starsteps-v7) also cached replies from other sites. Before any
     account call, make sure the current worker is in control. Resolves within 4 seconds at most. */
  function swReady() {
    var sw = navigator.serviceWorker;
    if (!sw || !sw.controller) return Promise.resolve();
    return new Promise(function (res) {
      var done = false, finish = function () { if (!done) { done = true; res(); } };
      sw.addEventListener("message", function (e) { if (e.data && e.data.ssVersion) finish(); });
      sw.addEventListener("controllerchange", finish);
      try { if (sw.startMessages) sw.startMessages(); sw.controller.postMessage("ss-version"); } catch (e) {}
      setTimeout(function () {
        if (done) return;
        sw.getRegistration().then(function (r) { if (r) r.update().catch(function () {}); });
      }, 400);
      setTimeout(finish, 4000);
    });
  }

  /* ---------- plan (entitlement) ---------- */
  function enforcedTier() {
    var p = get(PLAN), a = get(ACCT), now = Date.now();
    if (!p || !a || p.uid !== a.uid || !p.entitled) return "free";
    if (now - (p.at || 0) > PLAN_TTL) return "free";
    var end = p.status === "trialing" && p.trial_end ? Date.parse(p.trial_end) : (p.current_period_end ? Date.parse(p.current_period_end) : NaN);
    if (!isNaN(end) && now > end + GRACE) return "free";
    return p.tier === "pro" || p.tier === "super" ? p.tier : "free";
  }
  function refreshPlan(sb, userId) {
    return sb.rpc("my_plan").then(function (r) {
      if (r.error) throw r.error;
      var row = (r.data && r.data[0]) || { tier: "free", entitled: false, status: "none" };
      var p = { uid: userId, tier: row.tier, entitled: !!row.entitled, status: row.status, cycle: row.cycle,
        trial_end: row.trial_end, current_period_end: row.current_period_end, cancel_at_period_end: row.cancel_at_period_end,
        had_trial: row.had_trial, at: Date.now() };
      put(PLAN, p);
      return p;
    });
  }

  /* ---------- progress ---------- */
  function score(s) { return s ? ((+s.lessonsDone || 0) * 1000 + (+s.stars || 0)) : -1; }
  function parseGame() { try { var r = rawGame(); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function guestInfo() {
    var a = get(ACCT); if (a && a.childId) return null;
    var s = parseGame();
    if (!s || (!(+s.stars) && !(+s.lessonsDone))) return null;
    return { name: s.name || "Friend", stars: +s.stars || 0, lessons: +s.lessonsDone || 0 };
  }
  /* called by the game after every local save */
  function noteLocalSave() {
    var a = get(ACCT); if (!a || !a.childId) return false;
    a.dirty = true; a.seq = (a.seq || 0) + 1; put(ACCT, a); return true;
  }
  function rpcSave(childId, state, baseRev, keepalive) {
    if (!token) return Promise.reject(new Error("no_session"));
    var body = JSON.stringify({ p_child: childId, p_state: state, p_base_rev: baseRev });
    return fetch(SB_URL + "/rest/v1/rpc/save_progress", {
      method: "POST", keepalive: !!keepalive && body.length < 60000,
      headers: { apikey: SB_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: body
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) { var e = new Error(j && j.message || "save_failed"); e.status = r.status; e.code = j && j.code; throw e; }
        return j[0];
      });
    });
  }
  /* upload the active child's save if it changed. onServerWins(state) is called when another device got further. */
  var pushing = null;
  function pushActive(opts) {
    opts = opts || {};
    if (pushing && !opts.keepalive) return pushing;
    var a = get(ACCT);
    if (!a || !a.childId || !a.dirty || a.uid !== uid) return Promise.resolve({ skipped: true });
    var raw = rawGame(); if (!raw) return Promise.resolve({ skipped: true });
    var state; try { state = JSON.parse(raw); } catch (e) { return Promise.resolve({ skipped: true }); }
    var seq0 = a.seq || 0;
    var run = rpcSave(a.childId, state, a.rev || 0, opts.keepalive).then(function (r) {
      if (!r.conflict) return done(r.rev);
      /* someone else saved first: the save with more progress wins */
      if (score(state) >= score(r.server_state)) {
        return rpcSave(a.childId, state, r.rev, false).then(function (r2) {
          if (r2.conflict) throw new Error("conflict_again");
          return done(r2.rev);
        });
      }
      applyServer(a.childId, r.server_state, r.rev);
      if (opts.onServerWins) opts.onServerWins(r.server_state);
      return { rev: r.rev, serverWon: true };
    }).catch(function (e) {
      if (e && (e.code === "42501" || e.code === "23503")) { childGone(a.childId); if (opts.onChildGone) opts.onChildGone(); }
      throw e;
    });
    function done(rev) {
      var cur = get(ACCT);
      if (cur && cur.childId === a.childId) { cur.rev = rev; if ((cur.seq || 0) === seq0) cur.dirty = false; put(ACCT, cur); }
      return { rev: rev };
    }
    if (!opts.keepalive) { pushing = run; run.then(clear, clear); }
    function clear() { pushing = null; }
    return run;
  }
  function applyServer(childId, state, rev) {
    var a = get(ACCT) || {};
    put(GAME, state);
    a.childId = childId; a.rev = rev; a.dirty = false; a.seq = (a.seq || 0) + 1;
    put(ACCT, a);
  }
  function childGone(childId) {
    var a = get(ACCT);
    if (a && a.childId === childId) { del(ACCT); del(GAME); if (a.uid) put(ACCT, { uid: a.uid }); }
    del(STASH + childId);
  }
  /* pull the active child's server copy; returns "applied" when the device copy was replaced */
  function pullActive(sb, opts) {
    var a = get(ACCT);
    if (!a || !a.childId) return Promise.resolve("none");
    return sb.from("progress").select("state,rev").eq("child_id", a.childId).maybeSingle().then(function (r) {
      if (r.error) throw r.error;
      var srv = r.data;
      if (!srv) {
        return sb.from("children").select("id").eq("id", a.childId).maybeSingle().then(function (c) {
          if (!c.error && !c.data) { childGone(a.childId); return "gone"; }
          var cur = get(ACCT); if (cur) { cur.dirty = true; cur.rev = 0; put(ACCT, cur); }
          return pushActive(opts).then(function () { return "pushed"; });
        });
      }
      if (srv.rev === (a.rev || 0)) return a.dirty ? pushActive(opts).then(function () { return "pushed"; }) : "same";
      if (!a.dirty) { applyServer(a.childId, srv.state, srv.rev); return "applied"; }
      if (score(parseGame()) >= score(srv.state)) {
        var cur = get(ACCT); cur.rev = srv.rev; put(ACCT, cur);
        return pushActive(opts).then(function () { return "pushed"; });
      }
      applyServer(a.childId, srv.state, srv.rev); return "applied";
    });
  }
  /* uploads saves stashed while offline */
  function flushStashes() {
    var jobs = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(STASH) === 0) jobs.push(k);
      }
    } catch (e) {}
    return Promise.all(jobs.map(function (k) {
      var st = get(k), id = k.slice(STASH.length);
      if (!st || st.uid !== uid) { del(k); return null; }
      return rpcSave(id, st.state, st.rev || 0).then(function (r) {
        if (!r.conflict || score(st.state) < score(r.server_state)) { del(k); return null; }
        return rpcSave(id, st.state, r.rev).then(function () { del(k); });
      }).catch(function (e) { if (e && (e.code === "42501" || e.code === "23503")) del(k); });
    }));
  }
  /* make `child` the one playing on this device. guest: "bring" | "fresh" | undefined */
  function switchTo(sb, child, guest) {
    var a = get(ACCT);
    var first = (a && a.childId && a.childId !== child.id && a.uid === uid)
      ? pushActive().catch(function () { put(STASH + a.childId, { uid: a.uid, state: parseGame(), rev: a.rev || 0 }); })
      : Promise.resolve();
    return first.then(function () {
      return sb.from("progress").select("state,rev").eq("child_id", child.id).maybeSingle();
    }).then(function (r) {
      if (r.error) throw r.error;
      var stash = get(STASH + child.id);
      if (stash && stash.uid === uid && (!r.data || score(stash.state) >= score(r.data.state))) {
        put(GAME, stash.state); put(ACCT, { uid: uid, childId: child.id, childName: child.name, rev: r.data ? r.data.rev : 0, dirty: true, seq: 1 });
        del(STASH + child.id); return pushActive().catch(function () {});
      }
      if (r.data) {
        var s = r.data.state || {}; s.name = child.name;
        put(GAME, s); put(ACCT, { uid: uid, childId: child.id, childName: child.name, rev: r.data.rev, dirty: false, seq: 1 });
        return;
      }
      var cur = get(ACCT), gs = parseGame();
      var fresh = guest === "bring" && gs && !(cur && cur.childId) ? gs : null;
      var state = fresh || { name: child.name, grade: child.grade, onboarded: false };
      state.name = child.name;
      if (!fresh) state.grade = child.grade;
      put(GAME, state);
      put(ACCT, { uid: uid, childId: child.id, childName: child.name, rev: 0, dirty: true, seq: 1 });
      return pushActive().catch(function () {});
    });
  }
  /* before signing out: upload, then forget this family's data on the device */
  function forgetDevice() {
    del(ACCT); del(PLAN); del(GAME);
    try {
      var ks = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(STASH) === 0) ks.push(k); }
      ks.forEach(del);
    } catch (e) {}
  }
  /* a different parent signed in on this device: the previous family's data must not leak into this account */
  function adoptSession(userId) {
    var a = get(ACCT);
    if (a && a.uid && a.uid !== userId) forgetDevice();
    var p = get(PLAN); if (p && p.uid !== userId) del(PLAN);
    if (!get(ACCT)) put(ACCT, { uid: userId });
  }

  window.SSAcct = {
    SB_URL: SB_URL, SB_KEY: SB_KEY, get: get, put: put, del: del,
    hasStoredSession: hasStoredSession, loadLib: loadLib, swReady: swReady, client: client, session: session,
    enforcedTier: enforcedTier, refreshPlan: refreshPlan, noteLocalSave: noteLocalSave,
    pushActive: pushActive, pullActive: pullActive, flushStashes: flushStashes, switchTo: switchTo,
    guestInfo: guestInfo, forgetDevice: forgetDevice, adoptSession: adoptSession, score: score,
    acct: function () { return get(ACCT); }, uid: function () { return uid; }
  };
})();
