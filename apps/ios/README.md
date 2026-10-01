# Star Steps for iPhone and iPad

A Capacitor 8 shell around https://starsteps.zeroorigine.com/play/?src=ios (store mode: nothing is sold in the app,
families who already have a plan on the website log in). Bundle ID `com.zeroorigine.starsteps`.

- `capacitor.config.json`: loads the live game, adds `StarStepsApp/1.0` to the user agent (the site's store-mode signal),
  limits navigation to the app-bound domain `starsteps.zeroorigine.com` (so the service worker works offline in WKWebView).
- `ios/App/App/Info.plist`: WKAppBoundDomains, ITSAppUsesNonExemptEncryption = false (HTTPS only).
- Icon: 1024 px drawn from the Star Steps mark; splash: Pip on the brand purple.
- Build: `.github/workflows/ios-testflight.yml` (macOS runner, automatic signing with an App Store Connect API key,
  uploads straight to App Store Connect). Build number = workflow run number.

Local build on a Mac: `npm install && npx cap sync ios && npx cap open ios`, pick your team, Product > Archive.
