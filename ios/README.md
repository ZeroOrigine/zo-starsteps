# Star Steps iOS + iPad build

Runs once on the Mac, after the Apple Developer enrollment is approved.
Requires: Xcode from the Mac App Store, and CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`).

    git clone https://github.com/ZeroOrigine/zo-starsteps
    cd zo-starsteps/ios
    npm install
    mkdir -p www
    # copy the exact same files the PWA serves:
    curl -s https://starsteps.zeroorigine.com/ -o www/index.html
    curl -s https://starsteps.zeroorigine.com/manifest.webmanifest -o www/manifest.webmanifest
    mkdir -p www/icons && for i in icon-192 icon-512 icon-180 maskable-512; do curl -s https://starsteps.zeroorigine.com/icons/$i.png -o www/icons/$i.png; done
    npx cap add ios
    npx cap open ios
    # In Xcode: select your Team (appears after enrollment), set the app icon
    # from ../icons/icon-512.png in Assets, then Product > Archive > Distribute.

Notes that matter for review:
- One app covers iPhone and iPad (universal is the Xcode default). Test both simulators.
- Kids Category: no third party analytics or ads exist in this app, which is exactly what Apple requires. Keep it that way.
- Apple guideline 4.2 (minimum functionality): thin wrappers around websites get rejected. This app is fully offline with bundled assets, generated audio and no network calls, which is a real app posture, but be ready to explain that in the review notes.
- Before submitting, use the build where the Super screen hides prices (see STORE_LAUNCH_KIT.md: prices without a working In-App Purchase are a rejection).
- The service worker is unnecessary inside the wrapper (assets are local); it is harmless if included.
