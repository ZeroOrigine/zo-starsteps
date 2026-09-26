# Deploying Star Steps

Production is starsteps.zeroorigine.com (Netlify site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4).

Since 2026-09-26 the site has two edge functions, so deploy with the Netlify CLI, never the file-digest API
(a digest deploy without the functions removes the visit counter):

    project/
      netlify.toml            [build] publish = "public"
      package.json            dependency @netlify/blobs
      public/                 index.html, sw.js, manifest.webmanifest, icons/, .well-known/assetlinks.json
      netlify/edge-functions/ visits.ts, stats.ts

    NETLIFY_AUTH_TOKEN=<zo_config NETLIFY_API_TOKEN> netlify deploy --prod --no-build --dir public --site de6f5c47-4797-456a-a70d-cb8ad5a7f2d4

## Visit counter
- visits.ts runs on / and /index.html on Netlify's servers. It stores one Netlify Blob per app open,
  key = UTC day / country code / time+random. No IP, no user agent, no cookie, nothing on the page.
- Counted: a real navigation (first visit), or the service worker's background refresh marked
  x-ss-open: 1 (every later open from the offline cache). Not counted: precache fetches, bots, scripts.
- Read: https://starsteps.zeroorigine.com/_stats?t=<zo_config STARSTEPS_STATS_TOKEN>&days=30
  (404 without the key). Returns opens per day and per country.
- Bump the cache name in sw.js (starsteps-vN) on every deploy that changes a cached file.
