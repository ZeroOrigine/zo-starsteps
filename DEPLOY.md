# Deploying Star Steps

Production: https://starsteps.zeroorigine.com (Netlify site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4).

## Layout (Phase A 2026-09-26, Phase B/C accounts + billing 2026-09-28)
    netlify.toml                [build] publish = "public"
    package.json                dependency @netlify/blobs
    netlify/edge-functions/     visits.ts (counter), stats.ts (read-only totals)
    public/index.html           parent homepage (this repo's root index.html)
    public/play/index.html      the game (built from Advik's artifact 5b068533)
    public/play/grownups.js     parental gate + "For grown-ups" tile
    public/play/grownups.css    hides the kid-facing Super offer, styles the gate
    public/privacy/index.html   privacy page (covers accounts, payments, processors)
    public/terms/index.html     terms (plans, trial, auto-renewal, cancel, refunds)
    public/parents/index.html   parent area SPA: sign up / log in / reset, children, plan + billing, export, delete
    public/js/ss-account.js     shared account + progress sync logic (parent area and game)
    public/play/account-pre.js  runs before the game loads its save: plan in the save = real plan
    public/play/account.js      game layer: server entitlement, save sync, "Who is learning?" picker, plan screen -> parent area
    public/vendor/supabase-2.117.2.js  self-hosted supabase-js UMD
    public/play/app.js          the game script (moved out of index.html so the launch screen paints first)
    public/play/ux.css, ux.js   layout layer (2026-09-30): tabs on every screen size (floating dock above 900px),
                                Today in two columns above 1100px, Path shows one subject at a time,
                                readable small labels
    public/play/fe.js           3D cartoon emoji (2026-09-30, v15): paints every emoji in lessons, games and the done screen
                                with Microsoft Fluent Emoji 3D art from /emoji/<codepoint>.webp. The emoji character stays
                                in the page (pushed out of its box), so answers, reading and screen readers are unchanged.
    public/emoji/               445 Fluent Emoji 3D webp files (MIT, emoji/LICENSE.txt), ~2 MB, served with a 1-year immutable
                                cache header (netlify.toml). Binary, not archived here: rebuild from the npm package
                                @lobehub/fluent-emoji-3d (files named by codepoint, 256px), using the MAP in fe.js, or
                                download from https://starsteps.zeroorigine.com/emoji/<stem>.webp
    public/img/                 pip.webp, app-path.webp, app-lesson.webp (binary, not archived here:
                                download from https://starsteps.zeroorigine.com/img/<name>)
    public/sw.js, manifest.webmanifest (start_url /play/), icons/, .well-known/assetlinks.json

In this repo the files under public/ sit at the root (index.html, play/, privacy/, img/ ...).

## Deploy
Always with the Netlify CLI (a file-digest API deploy drops the edge functions):

    NETLIFY_AUTH_TOKEN=<zo_config NETLIFY_API_TOKEN> netlify deploy --prod --no-build --dir public --site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4

Bump the cache name in sw.js (starsteps-vN) whenever a cached file changes. Current: starsteps-v17.
netlify.toml also sets `Cache-Control: public, max-age=31536000, immutable` for /emoji/*.

## v17 (2026-09-30): read aloud, levels, achievements, sky, chess set, games polish
    public/play/voice.js    read aloud (device voice, Web Speech API, nothing sent anywhere): speaker button on every
                            lesson card; "Auto" (default up to Grade 1) reads each card and each tapped answer;
                            You > Read aloud switches Auto / Tap the speaker (S.readAloud). Test: v15/voicetest.mjs (14)
    public/play/rewards.js  levels from stars (level L needs 25*L*(L-1) stars), 11 more achievements pushed onto BADGES
                            (35 total), Rewards page (level card, wallet, achievements with progress, closest 8 first),
                            Today level strip, lesson-done level bar, one-time level-up celebration (S.levelSeen).
                            Stickers already earned on first run are added silently. Test: v17/rw.mjs (8)
    public/play/chess.js    one drawn chess set (6 SVG pieces, cream and plum) replacing font glyphs in boardHTML();
                            fe.js no longer paints the chess board. Test: v17/chess.mjs (6)
    public/play/sky.js      Your sky as a grid of subject stars (size and glow = the game's strength score), legend,
                            tap a star to open the subject. Test: v17/sky.mjs (7)
    ux.css                  games polish (score chips, Memory card backs and flip, Recall glow, Hanoi pole and discs),
                            no reader text under 12px, done-screen tally boxes, first-visit welcome screen shown as
                            plain HTML from the first paint (html.ss-new, set by the head script) so nothing jumps.
    account.js              signed-in families: "Saved to your family account" instead of "this device only".
    index.html (home)       26 subjects (was "16"): 20 tiles + "Grades 5 and 6 add six more", 3D icons; Advik's
                            parent-managed YouTube/Instagram/Discord in "Built by a kid". The game itself has no links out.

## Launch screen rule (v16, 2026-09-30)
The launch animation is a welcome back, not a toll. It plays on the first open ever and after 30 minutes away
(no tap/key since then, or the page hidden since then). Sooner comebacks (tab switch, reload, reopening the app)
go straight in: a tiny inline script in play/index.html adds html.ss-warm when localStorage ss.seen is under
30 minutes old; ux.css then freezes the splash and ux.js removes it as soon as the app is drawn. ux.js also wraps
the game's comeBack() with the 30-minute check. Never during a lesson. Test: v15/splashtest.mjs (8 checks).

## Path layout (v15, 2026-09-30)
One course bar on top, like the first design: chapter switch (beside the title on screens >=1100px), all grades in
one row (numbers only below 1100px, with the chosen grade's ages under the row), then the subjects as ONE row that
scrolls sideways and sticks under the top bar (arrow buttons on mouse screens, added by ux.js), then the path,
centred at 760px. Only one subject's path shows at a time.

## Rebuilding the game from Advik's artifact
1. Take the artifact body, strip the `[SS-launch] temporary timing probe`, apply the em dash rule.
2. Replace the PRICE table with the live prices (Pro 7.99/59.99, Super 12.99/89.99).
3. Title "Play Star Steps", canonical /play/. In head: `<link rel="stylesheet" href="/play/grownups.css">`,
   `<script src="/js/ss-account.js"></script>`, `<script src="/play/account-pre.js"></script>`.
   Move the game's big inline <script> into public/play/app.js. In its place put the small loader that,
   after the first frame, adds all of these at once (they download together and run in this order):
   /play/app.js, /play/account.js, /play/grownups.js, /play/ux.js, /play/fe.js, /play/voice.js, /play/rewards.js,
   /play/chess.js, /play/sky.js. The head also preloads /play/app.js (fetchpriority low).
   Add `<link rel="stylesheet" href="/play/ux.css">` after the grownups.css link.
4. Save as public/play/index.html.

## Installed apps
The homepage sends installed launches (display-mode standalone, iOS navigator.standalone, or an
android-app:// referrer from the Android TWA) straight to /play/. `?stay=1` keeps a grown-up on the
parent page (used by the in-game "For grown-ups" tile).

## Visit counter
- visits.ts runs on /, /index.html, /play, /play/, /play/index.html. One Netlify Blob per open,
  key = UTC day / country / page (home|play) / time+random. No IP, no user agent, no cookie.
- Counted: real page navigations, and cached app opens marked by the service worker with x-ss-open: 1.
  Not counted: precache fetches, bots and scripts (user agent filter), the privacy page.
- Read: /_stats?t=<zo_config STARSTEPS_STATS_TOKEN>&days=30 returns total, play, home, per day and per country.
  Keys written before Phase A have no page part and are counted as play.

## Backend (Phase B/C)
Supabase project `starsteps` (ref eidwmxkkfnrgsiuingtm, ca-central-1, ZeroOrigine org). Source in backend/:
    backend/sql/001_schema.sql        parents, children (max 4), progress (rev), subscriptions, prices, app_config,
                                      stripe_events, email_log; RLS own-family only; RPCs save_progress, my_plan
    backend/sql/002_prices_test.sql   Stripe TEST price ids, portal config, stripe_mode=test
    backend/sql/003_prices_live.sql   Stripe LIVE price ids, live portal config
    backend/sql/004_rls_perf.sql      policies use (select auth.uid())
    backend/sql/t_rls.sql             RLS test suite (needs users rls-a/rls-b@starsteps.test; ends with ROLLBACK_OK)
    backend/functions/billing         checkout (7-day trial once per family, existing subscribers -> portal), portal, sync
    backend/functions/stripe-webhook  signature check (test + live secrets), idempotent via stripe_events, re-reads Stripe, emails
    backend/functions/account         delete account: cancels live subscriptions, then deletes user (cascade)
    backend/functions/_shared/common.ts  copied next to each index.ts at deploy (Management API multipart deploy, verify_jwt off;
                                      the functions check the user token themselves)
Function secrets: STRIPE_SECRET_KEY_TEST, STRIPE_WEBHOOK_SECRET_TEST, STRIPE_SECRET_KEY_LIVE, STRIPE_WEBHOOK_SECRET_LIVE,
RESEND_API_KEY (sending-only, zeroorigine.com), SITE_URL, ALLOWED_ORIGINS.
Mode switch: `update app_config set value='live' where key='stripe_mode'` (webhook ignores events from the other mode).

Stripe: products "Star Steps Pro" / "Star Steps Super" (metadata app=starsteps), lookup keys starsteps_{tier}_{cycle},
USD 7.99 / 59.99 / 12.99 / 89.99. Webhook -> /functions/v1/stripe-webhook. Catalog script is idempotent (reuses products/prices).

Entitlement: my_plan() entitled = tier paid AND status active|trialing|past_due AND period end > now - 3 days.
The device caches the plan (ss.plan) for offline play for up to 14 days.

## Tests (all passing 2026-09-28)
- t_billing.py (47 checks, Stripe test clock: trial -> paid -> cancel -> failed renewal -> deleted, webhook replay/tamper/stale, delete)
- e2e.mjs Playwright on the live domain (45 checks: guest, sign-up, HIBP, email link, children, guest-game claim,
  sync, conflicts both ways, picker, checkout, trial, game unlock, portal, remove child, export, logout, delete)
- swtest.mjs: upgrade from the v7 service worker (which cached other origins) is safe.
