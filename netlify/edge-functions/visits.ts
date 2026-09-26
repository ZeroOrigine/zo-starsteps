// Star Steps visit counter. Runs on Netlify's servers when the app page is
// served. It stores ONE thing per app open: the UTC day and a country code.
// No IP address, no user agent, no cookie, no identifier of any kind is kept,
// and nothing is added to the page itself.
import { getStore } from "@netlify/blobs";
import type { Config, Context } from "https://edge.netlify.com";

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|go-http/i;

export default async (req: Request, ctx: Context) => {
  const res = await ctx.next();
  try {
    if (req.method !== "GET") return res;
    const ua = req.headers.get("user-agent") || "";
    if (!ua || BOT.test(ua)) return res;
    // Count page opens only: a real navigation (first visit, no service worker yet),
    // or the service worker's background refresh marked x-ss-open (every later open).
    // The one-time precache fetches carry neither, so they are skipped.
    const dest = req.headers.get("sec-fetch-dest");
    const swOpen = req.headers.get("x-ss-open") === "1";   // app opened from the offline cache
    if (!swOpen && dest && dest !== "document") return res;
    if (res.status !== 200 && res.status !== 304) return res;
    const day = new Date().toISOString().slice(0, 10);
    const cc = (ctx.geo?.country?.code || "XX").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || "XX";
    const key = `${day}/${cc}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const store = getStore({ name: "starsteps-visits", consistency: "eventual" });
    ctx.waitUntil ? ctx.waitUntil(store.set(key, "")) : await store.set(key, "");
  } catch (_e) { /* counting must never break the app */ }
  return res;
};

export const config: Config = { path: ["/", "/index.html"], cache: "manual" };
