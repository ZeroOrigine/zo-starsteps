// Read-only visit totals for Star Steps. Needs ?t=<STATS_TOKEN>.
// Returns app opens per UTC day and per country. Nothing else exists to return.
import { getStore } from "@netlify/blobs";
import type { Config } from "https://edge.netlify.com";

export default async (req: Request) => {
  const url = new URL(req.url);
  const token = Netlify.env.get("STATS_TOKEN");
  if (!token || url.searchParams.get("t") !== token) return new Response("not found", { status: 404 });
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30));
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const store = getStore({ name: "starsteps-visits", consistency: "strong" });
  const out: Record<string, { total: number; play: number; home: number; countries: Record<string, number> }> = {};
  let total = 0, play = 0, home = 0;
  for await (const page of store.list({ paginate: true })) {
    for (const b of page.blobs) {
      const parts = b.key.split("/");
      const day = parts[0], cc = parts[1];
      // keys written before 2026-09-26 Phase A have no page part: those were all game opens
      const page = parts.length >= 4 ? parts[2] : "play";
      if (!day || day < since) continue;
      out[day] ??= { total: 0, play: 0, home: 0, countries: {} };
      out[day].total++; out[day][page === "home" ? "home" : "play"]++;
      out[day].countries[cc] = (out[day].countries[cc] || 0) + 1; total++;
      if (page === "home") home++; else play++;
    }
  }
  const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? 1 : -1)));
  return new Response(JSON.stringify({ site: "starsteps.zeroorigine.com", unit: "page opens (play = the game, home = the parent page)", since, total, play, home, days: sorted }, null, 1),
    { headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });
};

export const config: Config = { path: "/_stats", cache: "manual" };
