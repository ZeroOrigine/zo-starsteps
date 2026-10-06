# Star Steps: App Store and Google Play launch pack

Prepared 1 October 2026. Everything I could build is built. The steps marked **You** need your accounts, payments or identity.

## What is ready

| Item | Status |
|---|---|
| Android app (Google Play) | Built and signed: `star-steps-1.0.0.aab` (upload to Play) and `star-steps-1.0.0.apk` (install on a phone to test). Package `com.zeroorigine.starsteps`, version 1.0.0 (1), target Android 16 (API 36, meets Play's 31 Aug 2026 rule), works from Android 5. |
| Android upload key | New key made (`starsteps-upload.jks`, password in `PASSWORD.txt`). Keep both in your password manager. If lost, Play can reset an upload key, so it is not fatal, but it costs days. |
| iPhone/iPad app | Xcode project in GitHub `apps/ios` (Capacitor 8). **Compiled successfully on a real Mac** (GitHub Actions run "iOS compile check", 1 Oct 2026). Icon 1024 px and branded launch screen included. |
| iOS upload | Workflow "iOS build to TestFlight" in GitHub builds, signs and uploads to App Store Connect once 4 secrets are added (below). |
| Store mode | Live on the website: inside either app nothing is for sale, no prices, no trial, no Super offer, Pro-only steps hidden. Families who pay on the website log in and get their plan. This avoids Apple 3.1.1 and Google Play billing rules. |
| Screenshots | 45 images in `screenshots/` at the exact store sizes (9 scenes each: Today, lesson, path, rewards, sky, chess, Books Library, an open book, The Edge of Knowing journey): Play phone 1080×1920, Play 7-inch 1200×1920, Play 10-inch 1600×2560, iPhone 6.9-inch 1320×2868, iPad 13-inch 2064×2752. |
| Graphics | Play feature graphic 1024×500 (`feature-graphic.png`), Play icon 512×512 (`play-icon-512.png`). |

## Your steps, in order

1. **Confirm ZeroOrigine is a registered legal entity** (a company, not only a brand name). Company accounts on both stores need one. If it is not registered yet, either register it, or publish under your own name (personal account) and accept the Play rule in step 3.
2. **D-U-N-S number** for that company (free, from Dun & Bradstreet; Apple has a lookup tool in the enrolment flow). Usually 1 to 2 weeks.
3. **Google Play Console**, organisation account, US$25 once: play.google.com/console. A personal account would have to run a closed test with 12 testers for 14 days before going public; an organisation account does not.
4. **Apple Developer Program**, organisation, US$99 a year: developer.apple.com/programs/enroll.
5. **Google Play first upload** (tell me when you reach this):
   - Create app "Star Steps: Learning Game", default language English (United States), App, Free.
   - Upload `star-steps-1.0.0.aab` to **Internal testing** first.
   - Open **Test and release > App integrity > App signing** and send me the **SHA-256 of the app signing key**. I add it to the website's `/.well-known/assetlinks.json`; without it the app shows a browser address bar. (The upload key's fingerprint is already there.)
   - Fill the store listing, Data safety, Content rating, Target audience from the sections below, then promote to Production.
6. **Apple first build**:
   - App Store Connect > Apps > new app: name "Star Steps: Learning Game", bundle ID `com.zeroorigine.starsteps` (register it under Identifiers first), SKU `starsteps-ios`.
   - Users and Access > Integrations > App Store Connect API > generate a key with **App Manager** access, download the .p8 once.
   - GitHub repo ZeroOrigine/zo-starsteps > Settings > Secrets and variables > Actions, add: `APPLE_TEAM_ID`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_P8` (paste the whole .p8 text). Do not paste these in chat.
   - Actions > "iOS build to TestFlight" > Run workflow. The build appears in TestFlight in about 15 to 30 minutes.
   - Fill the listing and App Privacy from below, choose the build, submit for review.
7. **Demo login for reviewers**: Apple (and sometimes Google) ask for one. Say the word and I will create a reviewer parent account with one child and give you the login for the review notes.

## Google Play listing

- **App name (30):** Star Steps: Learning Game
- **Short description (80):** Free learning game, 32 science books & a 3D science cinema for kids 5 to 12
- **Full description:**

  Little steps. Big climbs.

  Star Steps is a learning game for children aged 5 to 12, from Senior Kindergarten to Grade 6. Pip, a friendly star, explains each new idea, then short questions practise it.

  - 810 skills in 26 subjects: math, reading and writing, science, thinking skills, coding with real Python, money, health, feelings, space, how things work, AI and smart machines, and more. Grades 5 and 6 add physics, chemistry, history, geography, debate and statistics.
  - Books Library: 32 illustrated science books in grade order, Kindergarten to Grade 7, on physics, chemistry, biology, Earth, space, the human body, inventions and maths. Every page has a picture drawn live by code, read-aloud, quizzes and a bookmark.
  - The Edge of Knowing: 14 short films in 3D, a 21-stop journey from the Big Bang to you, 28 more illustrated books and pop quizzes.
  - Every lesson is free. No ads.
  - Read-aloud: young children hear every card and every answer.
  - Five rounds: after the first round every step comes back a level harder. Grade 2 alone is 870 lessons.
  - Stars, levels, 39 achievements, a daily streak and a sky that lights up as subjects grow stronger.
  - 11 thinking games: chess against Pip, chess lessons, Memory Match, Pattern Recall, Mini Sudoku, Tower of Hanoi and more.
  - Works offline after the first visit.
  - Optional free parent account: up to 4 children, progress saved on every device. Children never need an email or password.
  - A grown-up gate protects settings and the parent area.

  Built by a kid, for kids. Made by Advik, looked after by ZeroOrigine.

- **Category:** Education. **Tags:** Educational, Kids, Learning, Math, Reading.
- **Contact:** reply@zeroorigine.com. **Website:** https://starsteps.zeroorigine.com. **Privacy policy:** https://starsteps.zeroorigine.com/privacy/
- **Ads:** No. **In-app purchases:** No (store mode).
- **Target audience:** 5 and under, 6 to 8, 9 to 12 (Families policy applies; the app already has no ads, no chat and a grown-up gate).
- **Content rating (IARC questionnaire):** Reference/education. No violence, fear, sexuality, gambling, drugs or bad language. Users cannot talk to each other. No user-generated content shared. Does not share the user's location. No digital purchases in the app. Expected result: Everyone / PEGI 3.
- **Data safety** (my recommended answers; you are legally responsible for them, please read the privacy page once):
  - Collected only with an optional parent account: **Email address** (account management), **Name** (the child's first name, app functionality), **App activity: other actions** (lesson progress, app functionality). Linked to the account. Not shared with third parties. Not used for advertising.
  - Without an account: progress stays on the device; the server only counts app opens per day and country. Country is derived from the network address and not stored with it; to be safe, declare **Approximate location: collected for analytics, not linked to a person, not shared**.
  - Encrypted in transit: Yes. Users can request deletion: Yes (parent area > Delete account, and reply@zeroorigine.com).

## App Store listing

- **Name (30):** Star Steps: Learning Game
- **Subtitle (30):** Games, books & a science cinema
- **Promotional text:** 810 skills, 32 illustrated science books and 14 films in 3D for ages 5 to 12. All free, no ads, read-aloud for young kids.
- **Description:** same as the Google Play full description.
- **Keywords (100):** learning,math,reading,science,books,physics,space,coding,kindergarten,grade,homeschool,spelling
- **Category:** Education. **Kids Category:** recommended, band **Ages 6–8** (Apple allows one band; the app already meets the Kids rules: no ads, no third-party analytics, purchases and links only behind the grown-up gate, and in the app nothing is sold).
- **Age rating:** 4+.
- **URLs:** Support https://starsteps.zeroorigine.com (contact reply@zeroorigine.com), Marketing https://starsteps.zeroorigine.com, Privacy https://starsteps.zeroorigine.com/privacy/
- **App Privacy:** Data linked to the user (only with a parent account): Contact info: email; Name (child first name); Usage data: product interaction (progress). Purpose: App functionality. Not used for tracking. Data not linked to the user: Coarse location (country count), purpose Analytics.
- **Encryption:** already set in the app (standard HTTPS only, exempt).
- **Review notes (paste):** "Star Steps is a learning game for ages 5 to 12. Nothing is sold in the app: every lesson is free; families who subscribe on our website can log in to the optional parent area to unlock their plan (the app has no purchase buttons or links to buy). The parent area and settings sit behind a grown-up gate (multiplication written in words). Account deletion: parent area > Delete account. Demo parent login: [email] / [password]."

## v23 (6 Oct 2026): the complete app
The store apps open the live site, so the Books Library (/library/) and The Edge of Knowing (/edge/) are already inside both apps through the Books tab and the home links; no new build is needed. Both pages run in store mode (no prices, home links go to the parent area). Checked at 360, 390, 820 (iPad portrait), 1180 (iPad landscape) and 1440 px: no horizontal scroll, text 11 px or larger, tap targets 36–44 px. Apple reviewers may test the 3D films on an older iPad: the Smooth quality setting is in the "Voices and picture quality" drawer.

## Known risks, plainly

- **Apple 4.2 (minimum functionality):** Apple sometimes rejects apps that wrap a website. Star Steps is a full interactive game that works offline, which usually passes, but a rejection is possible. If it happens, the fix is to bundle the game inside the app instead of loading it from the website (about a day of work).
- **Store mode and existing subscribers:** allowed on both stores (reader-style access to a plan bought elsewhere), as long as the app shows no purchase buttons or links to buy, which it does not.
- **Android address bar:** if the Play app signing SHA-256 is not added to assetlinks.json, the Android app shows a thin browser bar. Step 5 fixes it.
