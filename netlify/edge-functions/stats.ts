// Read-only visit totals for Star Steps. Needs ?t=<STATS_TOKEN>.
// Returns app opens per UTC day and per country. Nothing else exists to return.
// Scale: each finished day (older than yesterday) is counted once and saved as a
// small summary blob sum/<day>; later requests read the summary instead of listing
// every open again. Today and yesterday are always counted live.
import { getStore } from "@netlify/blobs";
import type { Config } from "https://edge.netlify.com";

type Day = { total: number; play: number; home: number; countries: Record<string, number> };

export default async (req: Request) => {
  const url = new URL(req.url);
  const token = Netlify.env.get("STATS_TOKEN");
  if (!token || url.searchParams.get("t") !== token) return new Response("not found", { status: 404 });
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10) || 30));
  const now = Date.now();
  const since = new Date(now - (days - 1) * 86400000).toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
  const store = getStore({ name: "starsteps-visits", consistency: "strong" });

  async function countDay(day: string): Promise<Day> {
    const d: Day = { total: 0, play: 0, home: 0, countries: {} };
    for await (const page of store.list({ prefix: `${day}/`, paginate: true })) {
      for (const b of page.blobs) {
        const parts = b.key.split("/");
        // keys written before 2026-09-26 (Phase A) have no page part: those were all game opens
        const pg = parts.length >= 4 ? parts[2] : "play";
        d.total++; d[pg === "home" ? "home" : "play"]++;
        d.countries[parts[1]] = (d.countries[parts[1]] || 0) + 1;
      }
    }
    return d;
  }

  const out: Record<string, Day> = {};
  let total = 0, play = 0, home = 0;
  for (let i = 0; i < days; i++) {
    const day = new Date(now - i * 86400000).toISOString().slice(0, 10);
    let d: Day | null = null;
    if (day < yesterday) {
      d = (await store.get(`sum/${day}`, { type: "json" })) as Day | null;
      if (!d) { d = await countDay(day); await store.setJSON(`sum/${day}`, d); }
    } else d = await countDay(day);
    if (!d.total) continue;
    out[day] = d; total += d.total; play += d.play; home += d.home;
  }
  return new Response(JSON.stringify({ site: "starsteps.zeroorigine.com", unit: "page opens (play = the game, home = the parent page)", since, total, play, home, days: out }, null, 1),
    { headers: { "content-type": "application/json", "cache-control": "no-store", "x-robots-tag": "noindex" } });
};

export const config: Config = { path: "/_stats", cache: "manual" };
