// Star Steps shared server code: Stripe REST, Supabase REST, Resend, CORS, auth.
// No third-party imports: fast cold starts and nothing to supply-chain.

export const SITE = Deno.env.get("SITE_URL") ?? "https://starsteps.zeroorigine.com";
const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SB_ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? SITE).split(",").map((s) => s.trim());
export const STRIPE_VERSION = "2024-06-20";

// ---------- http helpers ----------
export function cors(req: Request): Record<string, string> {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.includes(o) ? o : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
export function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
export class HttpError extends Error {
  constructor(public status: number, public code: string, msg?: string) { super(msg ?? code); }
}

// ---------- auth: verify the caller's Supabase session with the auth server ----------
export async function requireUser(req: Request): Promise<{ id: string; email: string }> {
  const h = req.headers.get("authorization") ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new HttpError(401, "not_signed_in");
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new HttpError(401, "not_signed_in");
  const u = await r.json();
  if (!u?.id) throw new HttpError(401, "not_signed_in");
  if (!u.email_confirmed_at && !u.confirmed_at) throw new HttpError(403, "email_not_confirmed");
  return { id: u.id, email: u.email ?? "" };
}

// ---------- Supabase REST with the service role (server only) ----------
export async function db(method: string, path: string, body?: unknown, prefer?: string): Promise<any> {
  const headers: Record<string, string> = {
    apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}`, "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const t = await r.text();
  if (!r.ok) throw new Error(`db ${method} ${path.split("?")[0]} ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
}
export async function config(key: string): Promise<string | null> {
  const rows = await db("GET", `app_config?key=eq.${encodeURIComponent(key)}&select=value`);
  return rows?.[0]?.value ?? null;
}
export async function stripeMode(): Promise<"test" | "live"> {
  return (await config("stripe_mode")) === "live" ? "live" : "test";
}
export async function authAdminDelete(uid: string): Promise<void> {
  const r = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, {
    method: "DELETE", headers: { apikey: SB_SERVICE, Authorization: `Bearer ${SB_SERVICE}` },
  });
  if (!r.ok && r.status !== 404) throw new Error(`auth delete ${r.status} ${(await r.text()).slice(0, 200)}`);
}

// ---------- Stripe REST ----------
function stripeKey(mode: "test" | "live"): string {
  const k = Deno.env.get(mode === "live" ? "STRIPE_SECRET_KEY_LIVE" : "STRIPE_SECRET_KEY_TEST");
  if (!k) throw new Error(`stripe key for ${mode} not configured`);
  return k;
}
function flatten(obj: any, prefix = "", out: [string, string][] = []): [string, string][] {
  if (obj === undefined || obj === null) return out;
  if (Array.isArray(obj)) obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  else if (typeof obj === "object") for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}[${k}]` : k, out);
  else out.push([prefix, String(obj)]);
  return out;
}
export class StripeError extends Error {
  constructor(public status: number, public code: string, msg: string) { super(msg); }
}
export async function stripe(mode: "test" | "live", method: string, path: string, params?: any, idem?: string): Promise<any> {
  const qs = new URLSearchParams(flatten(params ?? {})).toString();
  const url = `https://api.stripe.com/v1/${path}` + (method === "GET" && qs ? `?${qs}` : "");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${stripeKey(mode)}`, "Stripe-Version": STRIPE_VERSION,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (idem) headers["Idempotency-Key"] = idem;
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(url, { method, headers, body: method === "GET" ? undefined : qs });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return j;
    const retryable = r.status === 429 || r.status >= 500 || r.headers.get("stripe-should-retry") === "true";
    if (retryable && attempt < 2) { await new Promise((s) => setTimeout(s, 400 * (attempt + 1))); continue; }
    throw new StripeError(r.status, j?.error?.code ?? "stripe_error", j?.error?.message ?? `stripe ${r.status}`);
  }
}

// Stripe signature check (v1 scheme, 5 minute tolerance, constant-time compare)
export async function verifyStripeSig(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${payload}`)));
  const hex = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  return sigs.some((s) => {
    if (s.length !== hex.length) return false;
    let d = 0;
    for (let i = 0; i < s.length; i++) d |= s.charCodeAt(i) ^ hex.charCodeAt(i);
    return d === 0;
  });
}

// ---------- subscription sync: Stripe is the source of truth, this copies it into our table ----------
const LIVE_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];
const RANK: Record<string, number> = { active: 5, trialing: 5, past_due: 4, unpaid: 3, incomplete: 2 };

export async function parentForCustomer(customerId: string, mode: "test" | "live"): Promise<string | null> {
  const rows = await db("GET", `subscriptions?stripe_customer_id=eq.${encodeURIComponent(customerId)}&select=parent_id`);
  if (rows?.[0]?.parent_id) return rows[0].parent_id;
  try {
    const c = await stripe(mode, "GET", `customers/${customerId}`);
    const pid = c?.metadata?.parent_id;
    if (pid && /^[0-9a-f-]{36}$/.test(pid)) {
      const p = await db("GET", `parents?id=eq.${pid}&select=id`);
      if (p?.[0]) return pid;
    }
  } catch (_) { /* deleted customer */ }
  return null;
}

export async function syncCustomer(customerId: string, mode: "test" | "live"): Promise<any> {
  const parentId = await parentForCustomer(customerId, mode);
  if (!parentId) return { skipped: "unknown_customer" };
  const list = await stripe(mode, "GET", "subscriptions", { customer: customerId, status: "all", limit: 20 });
  const subs: any[] = list.data ?? [];
  const live = subs.filter((s) => LIVE_STATUSES.includes(s.status))
    .sort((a, b) => (RANK[b.status] - RANK[a.status]) || (b.created - a.created));
  const best = live[0] ?? subs.sort((a, b) => b.created - a.created)[0] ?? null;
  const prev = (await db("GET", `subscriptions?parent_id=eq.${parentId}&select=*`))?.[0] ?? {};
  const hadTrial = !!prev.had_trial || subs.some((s) => s.trial_start || s.trial_end);
  let row: Record<string, unknown>;
  if (!best) {
    row = { tier: "free", cycle: null, status: "none", stripe_subscription_id: null, current_period_end: null,
      trial_end: null, cancel_at_period_end: false };
  } else {
    const priceId = best.items?.data?.[0]?.price?.id;
    const pr = priceId ? (await db("GET", `prices?stripe_price_id=eq.${encodeURIComponent(priceId)}&select=tier,cycle`))?.[0] : null;
    if (!pr) throw new Error(`unknown price ${priceId}`);
    const isLive = LIVE_STATUSES.includes(best.status);
    row = {
      tier: isLive ? pr.tier : "free", cycle: pr.cycle, status: best.status, stripe_subscription_id: best.id,
      current_period_end: best.current_period_end ? new Date(best.current_period_end * 1000).toISOString() : null,
      trial_end: best.trial_end ? new Date(best.trial_end * 1000).toISOString() : null,
      cancel_at_period_end: !!(best.cancel_at_period_end || (best.cancel_at && best.status !== "canceled")),
    };
  }
  row = { ...row, stripe_customer_id: customerId, had_trial: hadTrial, livemode: mode === "live", updated_at: new Date().toISOString() };
  await db("PATCH", `subscriptions?parent_id=eq.${parentId}`, row);
  return { parentId, ...row, extra_live_subs: live.length > 1 ? live.slice(1).map((s) => s.id) : [] };
}

// ---------- email via Resend ----------
const FROM = "Star Steps <starsteps@zeroorigine.com>";
export function emailShell(title: string, bodyHtml: string, cta?: { href: string; label: string }): string {
  const btn = cta
    ? `<p style="margin:26px 0"><a href="${cta.href}" style="background:#5B2FD6;color:#fff;text-decoration:none;font-weight:800;padding:13px 22px;border-radius:14px;display:inline-block">${cta.label}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#EEF0FE;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#221A3D">
<div style="max-width:520px;margin:0 auto;padding:28px 18px">
<div style="font-weight:900;font-size:20px;color:#5B2FD6;margin-bottom:14px">&#11088; Star Steps</div>
<div style="background:#fff;border:3px solid #221A3D;border-radius:20px;padding:24px 22px">
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
<div style="font-size:16px;line-height:1.55">${bodyHtml}</div>${btn}
</div>
<p style="font-size:12.5px;color:#5A5280;margin-top:16px;line-height:1.5">You get this email because you have a Star Steps parent account. Questions? Just reply.<br>
<a href="${SITE}/privacy/" style="color:#5A5280">Privacy</a> &middot; <a href="${SITE}/terms/" style="color:#5A5280">Terms</a> &middot; Star Steps is part of ZeroOrigine.</p>
</div></body></html>`;
}
export async function sendEmail(parentId: string | null, to: string, kind: string, subject: string, html: string): Promise<void> {
  let status = 0, error: string | null = null;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], reply_to: "reply@zeroorigine.com", subject, html }),
    });
    status = r.status;
    if (!r.ok) error = (await r.text()).slice(0, 300);
  } catch (e) { error = String(e).slice(0, 300); }
  try { await db("POST", "email_log", { parent_id: parentId, kind, to_email: to, status, error }); } catch (_) { /* never block */ }
}
export function money(cents: number, cur = "usd"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format(cents / 100);
}
export function day(ts: number | string | null | undefined): string {
  if (!ts) return "";
  const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
export const TIER_NAME: Record<string, string> = { pro: "Pro", super: "Super", free: "Free" };
