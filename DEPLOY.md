# Deploying Star Steps

Production: https://starsteps.zeroorigine.com (Netlify site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4).

## Layout (since Phase A, 2026-09-26)
    netlify.toml                [build] publish = "public"
    package.json                dependency @netlify/blobs
    netlify/edge-functions/     visits.ts (counter), stats.ts (read-only totals)
    public/index.html           parent homepage (this repo's root index.html)
    public/play/index.html      the game (built from Advik's artifact 5b068533)
    public/play/grownups.js     parental gate + "For grown-ups" tile
    public/play/grownups.css    hides the kid-facing Super offer, styles the gate
    public/privacy/index.html   privacy page
    public/img/                 pip.webp, app-path.webp, app-lesson.webp (binary, not archived here:
                                download from https://starsteps.zeroorigine.com/img/<name>)
    public/sw.js, manifest.webmanifest (start_url /play/), icons/, .well-known/assetlinks.json

In this repo the files under public/ sit at the root (index.html, play/, privacy/, img/ ...).

## Deploy
Always with the Netlify CLI (a file-digest API deploy drops the edge functions):

    NETLIFY_AUTH_TOKEN=<zo_config NETLIFY_API_TOKEN> netlify deploy --prod --no-build --dir public --site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4

Bump the cache name in sw.js (starsteps-vN) whenever a cached file changes.

## Rebuilding the game from Advik's artifact
1. Take the artifact body, strip the `[SS-launch] temporary timing probe`, apply the em dash rule.
2. Replace the PRICE table with the live prices (Pro 7.99/59.99, Super 12.99/89.99).
3. Title "Play Star Steps", canonical /play/, add `<link rel="stylesheet" href="/play/grownups.css">` in head and
   `<script src="/play/grownups.js"></script>` right before the service worker registration script.
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
