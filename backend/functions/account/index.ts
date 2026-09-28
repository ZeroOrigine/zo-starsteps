// POST /functions/v1/account {action:"delete", confirm:"DELETE"}
// Deletes the parent account and everything under it (children, progress, plan row).
// Any running subscription is cancelled first so nobody is charged for a deleted account.
import { cors, json, HttpError, requireUser, db, stripeMode, stripe, authAdminDelete, sendEmail, emailShell } from "./common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    if (body.action !== "delete") throw new HttpError(400, "bad_action");
    if (body.confirm !== "DELETE") throw new HttpError(400, "confirm_required");

    const sub = (await db("GET", `subscriptions?parent_id=eq.${user.id}&select=stripe_customer_id`))?.[0];
    let cancelled = 0;
    if (sub?.stripe_customer_id) {
      const mode = await stripeMode();
      const cid = sub.stripe_customer_id;
      // unlink first so the cancellation webhooks do not email a family that is leaving
      await db("PATCH", `subscriptions?parent_id=eq.${user.id}`, { stripe_customer_id: null, stripe_subscription_id: null });
      try {
        await stripe(mode, "POST", `customers/${cid}`, { metadata: { parent_id: "", account_deleted: new Date().toISOString().slice(0, 10) } });
        const list = await stripe(mode, "GET", "subscriptions", { customer: cid, status: "all", limit: 20 });
        for (const s of list.data ?? []) {
          if (["active", "trialing", "past_due", "unpaid", "incomplete"].includes(s.status)) {
            await stripe(mode, "DELETE", `subscriptions/${s.id}`);
            cancelled++;
          }
        }
      } catch (e) {
        console.error("account delete stripe", String(e));
        await db("PATCH", `subscriptions?parent_id=eq.${user.id}`, { stripe_customer_id: cid }).catch(() => {});
        await stripe(mode, "POST", `customers/${cid}`, { metadata: { parent_id: user.id } }).catch(() => {});
        throw new HttpError(502, "billing_unavailable"); // never delete while a charge could continue
      }
    }
    await authAdminDelete(user.id); // cascades: parents -> children -> progress, subscriptions
    if (user.email) {
      await sendEmail(null, user.email, "account_deleted", "Your Star Steps account is deleted",
        emailShell("Your account is deleted", `<p>Your Star Steps parent account, your children's profiles and their saved progress have been deleted.${cancelled ? " Your paid plan was cancelled and you will not be charged again." : ""}</p><p>Progress already saved inside the app on a device stays on that device until you choose <b>Start over</b> or clear the browser's data.</p>`));
    }
    return json(req, 200, { deleted: true, cancelled });
  } catch (e) {
    if (e instanceof HttpError) return json(req, e.status, { error: e.code });
    console.error("account", e instanceof Error ? e.message : e);
    return json(req, 500, { error: "account_unavailable" });
  }
});
