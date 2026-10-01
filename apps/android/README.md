# Star Steps for Android (Google Play)

A Trusted Web Activity (Bubblewrap 1.25 template) that opens https://starsteps.zeroorigine.com/play/?src=android
full screen. Package `com.zeroorigine.starsteps`, target SDK 36, min SDK 21. `?src=android` turns on the site's
store mode (nothing is sold in the app; families with a plan from the website log in).

Build (JDK 17+, Android SDK 36): `gradle bundleRelease`, then sign the bundle with the upload key:
`jarsigner -keystore starsteps-upload.jks -sigalg SHA256withRSA -digestalg SHA-256 app-release.aab upload`.
The upload key is NOT in this repository; the founder keeps it. Play App Signing holds the real app signing key:
after the first upload, copy its SHA-256 from Play Console (App integrity) into /.well-known/assetlinks.json
on the site, or the app will show a browser address bar.

If this build fails on Maven Central rate limits, pass `-I mirror.gradle` (uses Google's Maven Central mirror).
