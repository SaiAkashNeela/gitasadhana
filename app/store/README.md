# Store listing

Everything the App Store and Google Play ask for, ready to upload.

| Path | What |
| --- | --- |
| `store.config.json` | App Store listing (name, subtitle, description, keywords, URLs, categories, age rating) for EAS Metadata |
| `play-listing.md` | Google Play listing text to paste into Play Console |
| `screenshots/ios-iphone-6.9/` | 6 × 1320×2868 — App Store, iPhone 6.9" (Apple scales these down for smaller iPhones) |
| `screenshots/ios-ipad-13/` | 6 × 2064×2752 — App Store, iPad 13" (required now that the app supports iPad) |
| `screenshots/play-phone/` | 6 × 1080×1920 — Google Play phone |
| `screenshots/play-tablet/` | 6 × 1600×2560 — Google Play 7" and 10" tablet (use the same set for both) |
| `screenshots/play-feature-graphic.jpg` | 1024×500 — Google Play feature graphic |
| `screenshots/play-icon.png` | 512×512 — Google Play icon |
| `raw/` | The untouched simulator captures the cards are made from |
| `compose.mjs` | Turns `raw/` into `screenshots/` |

## Upload

**App Store.** From `app/`: `bunx eas-cli metadata:push` uploads `store.config.json` (found through
`metadataPath` in `eas.json`; it authenticates with the App Store Connect API key stored on EAS). Run
`bunx eas-cli metadata:pull` first if the listing was edited in App Store Connect, and merge. EAS
Metadata can't set Apple's newer age-rating questions; answer those in App Store Connect.
Screenshots go to App Store Connect → the version → Previews and Screenshots (iPhone 6.9" Display
and iPad 13" Display); 1.1.1's were uploaded through the App Store Connect API. App Store Connect
app id: `6833198350`.

**Google Play.** Play Console → Grow → Store presence → Main store listing: paste the text from
`play-listing.md`, upload the icon, the feature graphic, `play-phone/` as phone screenshots and
`play-tablet/` as both 7-inch and 10-inch tablet screenshots.

## Retaking screenshots

1. Run a development build on the iPhone 17 Pro Max and iPad Pro 13-inch (M5) simulators
   (`bunx expo run:ios --device "<name>"`). Set a clean status bar first:
   `xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3`.
2. Save captures as `raw/iphone/<name>.png` and `raw/ipad/<name>.png` with
   `xcrun simctl io booted screenshot <file>`. Names map to captions in `compose.mjs`:
   `01-home`, `02-verse` (verse 2.47), `03-chapters`, `04-player`, `05-ai`, `06-wisdom`.
3. From `app/`: `bun --install=force store/compose.mjs` (needs Google Chrome).

Play screenshots are made from the iOS captures with the status bar cropped off. Retake them on an
Android emulator if you'd rather show Android system UI.

## App Review information

Set once in App Store Connect (App Review Information), not in `store.config.json`, so the contact
phone stays out of this public repo. Contact: Sai Akash Neela, hello@gitasadhana.com. Sign-in
required: no. Notes:

> No account is needed: every feature except cloud backup works signed out. Sign in with Apple or Google is optional and only backs up bookmarks, notes and reading progress. Gita AI answers questions about the Bhagavad Gita; it is limited per day and moderated by the model provider. Audio recitations stream from our own server.

## App Store privacy answers ("App Privacy")

Data is collected only when someone signs in or uses Gita AI. Nothing is used for tracking, and
there are no ads or analytics.

| Data type | Collected for | Linked to user |
| --- | --- | --- |
| Name, email address (from Sign in with Apple / Google) | App functionality (account, cloud backup) | Yes |
| User content: notes, bookmarks, reading progress | App functionality (cloud backup) | Yes |
| User content: Gita AI questions | App functionality | Yes when signed in |
| Customer support: contact and correction forms | App functionality | Yes |
| Identifiers: user ID (the account ID after sign-in) | App functionality | Yes |
| Identifiers: device ID (random guest ID that limits Gita AI per device) | App functionality | No |

Age rating: every answer "None" or "No" (no ads, gambling, user-to-user chat, social features,
user-generated content shared with others, web browsing or weapons). The Gita is set on a
battlefield; the art shows warriors and chariots but no graphic violence. Content rights: does not
use third-party content.

## Google Play answers

- **Category:** Books & Reference. Contact: hello@gitasadhana.com, https://gitasadhana.com.
- **App access:** all functionality without special access. **Ads:** none.
- **Content rating:** Reference, News, or Educational; every question "No".
- **Target audience:** 13 and over (avoids the Families policy, which is strict for AI chat).
- **Data safety:** collects data, shares none; encrypted in transit; deletion via
  https://gitasadhana.com/settings.html (sign in → Delete account) or in the app. Types, all optional
  and for app functionality: name, email, user IDs, other user-generated content (notes, bookmarks,
  progress, Gita AI questions), and device or other IDs (guest ID, also for fraud prevention).

## Every store release

- [ ] Native change? Bump `version` in `app.json` (new OTA runtime). Always bump
      `ios.buildNumber` / `android.versionCode`.
- [ ] Test a production build on a real iPhone, iPad and Android phone or tablet (TestFlight and
      Play internal testing).
- [ ] Update `store.config.json` / `play-listing.md` and release notes, then `bunx eas-cli metadata:push`.
- [ ] Optional: route `api.gitasadhana.com` to the Worker, then switch `EXPO_PUBLIC_API_BASE_URL`
      (in `eas.json` and the EAS environment variables) from the workers.dev address.
