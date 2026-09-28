/* Runs before the game loads its save: the plan in the save always matches
   the plan the family actually has (Free for anyone without a paid account). */
(function () {
  var A = window.SSAcct; if (!A) return;
  try {
    var raw = localStorage.getItem("starsteps.v2"); if (!raw) return;
    var s = JSON.parse(raw), t = A.enforcedTier();
    if (s.tier === t && !(s.pro && s.pro.on && t !== "pro") && !(s.super && s.super.on && t !== "super")) return;
    s.tier = t;
    s.pro = Object.assign({}, s.pro || {}, { on: t === "pro" });
    s.super = Object.assign({}, s.super || {}, { on: t === "super" });
    localStorage.setItem("starsteps.v2", JSON.stringify(s));
  } catch (e) {}
})();
