// Stripe -> Star Steps. Signature checked, each event processed once, state re-read from Stripe.
import { db, stripeMode, stripe, syncCustomer, verifyStripeSig, sendEmail, emailShell, money, day, TIER_NAME, SITE } from "./common.ts";

const ok = (b: unknown = { received: true }) => new Response(JSON.stringify(b), { status: 200, headers: { "Content-Type": "application/json" } });

async function parentEmail(parentId: string): Promise<string | null> {
  return (await db("GET", `parents?id=eq.${parentId}&select=email`))?.[0]?.email ?? null;
}

async function emailsFor(event: any, mode: "test" | "live", parentId: string, sync: any) {
  const to = await parentEmail(parentId);
  if (!to) return;
  const o = event.data.object;
  const tierName = TIER_NAME[sync.tier] ?? "Pro";
  const dash = { href: `${SITE}/parents/`, label: "Open your parent dashboard" };
  switch (event.type) {
    case "checkout.session.completed": {
      if (o.mode !== "subscription" || o.status !== "complete") return;
      const trial = sync.status === "trialing" && sync.trial_end;
      const body = trial
        ? `<p>Your 7-day free trial of Star Steps ${tierName} has started. Every child profile in your family now has ${tierName}.</p>
           <p>Your first payment is on <b>${day(sync.trial_end)}</b>. Cancel before then from your parent dashboard and you will not be charged. We will remind you 3 days before.</p>`
        : `<p>Thank you. Star Steps ${tierName} is now on for every child profile in your family.</p>
           <p>Your plan renews on <b>${day(sync.current_period_end)}</b>. You can switch or cancel any time from your parent dashboard.</p>`;
      return sendEmail(parentId, to, "welcome", trial ? `Your Star Steps ${tierName} trial has started` : `Welcome to Star Steps ${tierName}`, emailShell(trial ? "Your free trial has started" : `Welcome to ${tierName}`, body, dash));
    }
    case "customer.subscription.trial_will_end": {
      if (o.status !== "trialing" || o.cancel_at_period_end) return;
      const price = o.items?.data?.[0]?.price;
      const amt = price ? money(price.unit_amount, price.currency) : "";
      const per = price?.recurring?.interval === "year" ? "year" : "month";
      return sendEmail(parentId, to, "trial_ending", "Your Star Steps trial ends in 3 days",
        emailShell("Your free trial ends soon", `<p>Your Star Steps ${tierName} trial ends on <b>${day(o.trial_end)}</b>. After that your card will be charged <b>${amt} per ${per}</b>.</p><p>Nothing to do if you want to keep ${tierName}. To stop, cancel from your parent dashboard before ${day(o.trial_end)}.</p>`, dash));
    }
    case "invoice.payment_failed": {
      if (!o.subscription) return;
      return sendEmail(parentId, to, "payment_failed", "We could not take your Star Steps payment",
        emailShell("Your payment did not go through", `<p>We tried to charge <b>${money(o.amount_due, o.currency)}</b> for Star Steps ${tierName} and the payment failed.</p><p>Your plan stays on for now while we retry. Please update your card so your child keeps their ${tierName} content.</p>`,
          { href: `${SITE}/parents/?update_card=1`, label: "Update your card" }));
    }
    case "customer.subscription.updated": {
      const prev = event.data.previous_attributes ?? {};
      const nowCancelling = o.cancel_at_period_end || !!o.cancel_at;
      const wasCancelling = ("cancel_at_period_end" in prev ? prev.cancel_at_period_end : o.cancel_at_period_end) ||
        ("cancel_at" in prev ? !!prev.cancel_at : !!o.cancel_at);
      if (nowCancelling && !wasCancelling) {
        const end = o.cancel_at ?? o.current_period_end;
        return sendEmail(parentId, to, "cancel_scheduled", "Your Star Steps plan is set to end",
          emailShell("Your plan is set to end", `<p>You cancelled Star Steps ${tierName}. It stays on until <b>${day(end)}</b> and you will not be charged again.</p><p>Changed your mind? You can turn it back on from your parent dashboard before then.</p>`, dash));
      }
      return;
    }
    case "customer.subscription.deleted": {
      if (sync.status === "active" || sync.status === "trialing") return; // another plan is still running
      return sendEmail(parentId, to, "plan_ended", "Your Star Steps plan has ended",
        emailShell("Your plan has ended", `<p>Star Steps ${TIER_NAME[(await planOf(o))] ?? "Pro"} has ended for your family. Your children keep all their stars, streaks and progress, and the free lessons stay open.</p><p>You can come back to a paid plan any time.</p>`, dash));
    }
  }
}

async function planOf(sub: any): Promise<string> {
  const pid = sub.items?.data?.[0]?.price?.id;
  const r = pid ? (await db("GET", `prices?stripe_price_id=eq.${pid}&select=tier`))?.[0] : null;
  return r?.tier ?? "pro";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const secrets: ["test" | "live", string | undefined][] = [
    ["test", Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST")], ["live", Deno.env.get("STRIPE_WEBHOOK_SECRET_LIVE")]];
  let signedBy: "test" | "live" | null = null;
  for (const [m, s] of secrets) if (s && await verifyStripeSig(payload, sig, s)) { signedBy = m; break; }
  if (!signedBy) return new Response("bad signature", { status: 400 });

  let event: any;
  try { event = JSON.parse(payload); } catch { return new Response("bad json", { status: 400 }); }
  const evMode = event.livemode ? "live" : "test";
  if (evMode !== signedBy) return new Response("mode mismatch", { status: 400 });

  // record first; a replay of an already processed event is acknowledged and skipped
  const ins = await db("POST", "stripe_events?on_conflict=id",
    { id: event.id, type: event.type, livemode: !!event.livemode }, "resolution=ignore-duplicates,return=representation");
  if (!ins?.length) {
    const prev = (await db("GET", `stripe_events?id=eq.${encodeURIComponent(event.id)}&select=processed_at`))?.[0];
    if (prev?.processed_at) return ok({ received: true, duplicate: true });
  }

  const active = await stripeMode();
  if (evMode !== active) {
    await db("PATCH", `stripe_events?id=eq.${encodeURIComponent(event.id)}`, { processed_at: new Date().toISOString(), error: `ignored: ${evMode} event while ${active}` });
    return ok({ received: true, ignored: true });
  }

  try {
    const o = event.data?.object ?? {};
    const customer: string | null = typeof o.customer === "string" ? o.customer : o.customer?.id ?? null;
    let result: any = { skipped: "no_customer" };
    if (customer) {
      result = await syncCustomer(customer, evMode);
      if (result.parentId) await emailsFor(event, evMode, result.parentId, result);
      // safety net: a family should never hold two subscriptions. Unpaid leftovers are cancelled;
      // anything paid is never touched automatically, the founder is alerted to refund by hand.
      const extras: string[] = result.extra_live_subs ?? [];
      const paidExtras: string[] = [];
      for (const id of extras) {
        const s = await stripe(evMode, "GET", `subscriptions/${id}`);
        if (s.status === "incomplete") { try { await stripe(evMode, "DELETE", `subscriptions/${id}`); } catch (_) { /* */ } }
        else paidExtras.push(id);
      }
      if (paidExtras.length) {
        await sendEmail(result.parentId, "reply@zeroorigine.com", "ops_double_subscription", "Star Steps: family has two subscriptions",
          emailShell("Double subscription", `<p>Parent ${result.parentId} (customer ${customer}) has more than one live subscription: kept ${result.stripe_subscription_id}, extra ${paidExtras.join(", ")}. Cancel and refund the extra one in Stripe.</p>`));
      }
    }
    await db("PATCH", `stripe_events?id=eq.${encodeURIComponent(event.id)}`, { processed_at: new Date().toISOString(), error: result.skipped ?? null });
    return ok();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("webhook", event.type, msg);
    try { await db("PATCH", `stripe_events?id=eq.${encodeURIComponent(event.id)}`, { error: msg.slice(0, 500) }); } catch (_) { /* */ }
    return new Response("processing failed", { status: 500 }); // Stripe retries
  }
});
