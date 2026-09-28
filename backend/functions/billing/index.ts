// POST /functions/v1/billing  {action:"checkout", plan:"pro_monthly"|...} | {action:"portal"} | {action:"sync"}
import { cors, json, HttpError, StripeError, requireUser, db, config, stripeMode, stripe, syncCustomer, SITE } from "./common.ts";

const PLANS = ["pro_monthly", "pro_yearly", "super_monthly", "super_yearly"];
const ACTIVE = ["active", "trialing", "past_due", "unpaid", "incomplete"];

async function ensureCustomer(mode: "test" | "live", user: { id: string; email: string }, sub: any): Promise<string> {
  if (sub?.stripe_customer_id) {
    try {
      const c = await stripe(mode, "GET", `customers/${sub.stripe_customer_id}`);
      if (!c.deleted) return c.id;
    } catch (e) {
      if (!(e instanceof StripeError) || e.status !== 404) throw e; // other mode or deleted: make a new one
    }
  }
  // look for one we created earlier (e.g. a crash between create and save)
  let found: any = { data: [] };
  try { found = await stripe(mode, "GET", "customers/search", { query: `metadata['parent_id']:'${user.id}'` }); } catch (_) { /* search not available */ }
  const c = found.data?.find((x: any) => !x.deleted) ??
    await stripe(mode, "POST", "customers", { email: user.email, metadata: { parent_id: user.id, app: "starsteps" } },
      `ss-cust-${user.id}-${mode}`);
  await db("PATCH", `subscriptions?parent_id=eq.${user.id}`, { stripe_customer_id: c.id, updated_at: new Date().toISOString() });
  return c.id;
}

async function portalUrl(mode: "test" | "live", customer: string, flow?: string): Promise<string> {
  const conf = await config(`portal_config_${mode}`);
  const p: any = { customer, return_url: `${SITE}/parents/?from=billing` };
  if (conf) p.configuration = conf;
  if (flow === "payment_method_update") p.flow_data = { type: "payment_method_update" };
  const s = await stripe(mode, "POST", "billing_portal/sessions", p);
  return s.url;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const mode = await stripeMode();
    const sub = (await db("GET", `subscriptions?parent_id=eq.${user.id}&select=*`))?.[0];
    if (!sub) throw new HttpError(404, "no_parent_row");

    if (body.action === "checkout") {
      if (!PLANS.includes(body.plan)) throw new HttpError(400, "bad_plan");
      const price = (await db("GET", `prices?key=eq.${body.plan}_${mode}&select=stripe_price_id`))?.[0];
      if (!price) throw new HttpError(500, "price_not_configured");
      const customer = await ensureCustomer(mode, user, sub);
      // never sell a second subscription: anyone already subscribed goes to the portal to switch plans
      const existing = await stripe(mode, "GET", "subscriptions", { customer, status: "all", limit: 10 });
      if ((existing.data ?? []).some((s: any) => ACTIVE.includes(s.status))) {
        await syncCustomer(customer, mode);
        return json(req, 200, { url: await portalUrl(mode, customer), portal: true });
      }
      // close any older unfinished checkout so two tabs cannot create two subscriptions
      const open = await stripe(mode, "GET", "checkout/sessions", { customer, status: "open", limit: 10 });
      for (const s of open.data ?? []) {
        try { await stripe(mode, "POST", `checkout/sessions/${s.id}/expire`); } catch (_) { /* already done */ }
      }
      const fresh = await syncCustomer(customer, mode); // had_trial is re-derived from Stripe history
      const trial = !fresh.had_trial;
      const session = await stripe(mode, "POST", "checkout/sessions", {
        mode: "subscription",
        customer,
        client_reference_id: user.id,
        line_items: [{ price: price.stripe_price_id, quantity: 1 }],
        payment_method_collection: "always",
        allow_promotion_codes: "true",
        billing_address_collection: "auto",
        subscription_data: {
          ...(trial ? { trial_period_days: 7, trial_settings: { end_behavior: { missing_payment_method: "cancel" } } } : {}),
          metadata: { parent_id: user.id, plan: body.plan, app: "starsteps" },
        },
        metadata: { parent_id: user.id, plan: body.plan },
        success_url: `${SITE}/parents/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE}/parents/?checkout=cancel`,
      });
      return json(req, 200, { url: session.url, trial });
    }

    if (body.action === "portal") {
      if (!sub.stripe_customer_id) throw new HttpError(409, "no_billing_account");
      return json(req, 200, { url: await portalUrl(mode, sub.stripe_customer_id, body.flow) });
    }

    if (body.action === "sync") {
      if (!sub.stripe_customer_id) return json(req, 200, { tier: "free", status: "none" });
      const r = await syncCustomer(sub.stripe_customer_id, mode);
      return json(req, 200, { tier: r.tier, status: r.status, cycle: r.cycle, trial_end: r.trial_end, current_period_end: r.current_period_end });
    }

    throw new HttpError(400, "bad_action");
  } catch (e) {
    if (e instanceof HttpError) return json(req, e.status, { error: e.code });
    console.error("billing", e instanceof Error ? e.message : e);
    return json(req, 502, { error: "billing_unavailable" });
  }
});
