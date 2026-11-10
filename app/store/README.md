# Store listing

Everything the App Store and Google Play ask for, ready to upload.

| Path | What |
| --- | --- |
| `store.config.json` | App Store listing (name, subtitle, description, keywords, URLs, age rating, review notes) for EAS Metadata |
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
Drag the two screenshot folders into App Store Connect → the version → Previews and Screenshots
(iPhone 6.9" Display and iPad 13" Display).

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
| Customer support: contact and correction forms | App functionality | No |

Age rating: no objectionable content (all answers "None"). The Gita is set on a battlefield; the
art shows warriors and chariots but no graphic violence. Review this before submitting.

## Before submitting

- [ ] Optional: route `api.gitasadhana.com` to the Worker, then switch `EXPO_PUBLIC_API_BASE_URL`
      (in `eas.json` and the EAS environment variables) from the workers.dev address.
- [ ] Bump `ios.buildNumber` / `android.versionCode` in `app.json` for each store build.
- [ ] Google sign-in on Android: create an Android OAuth client for `app.gitasadhana.com` with the
      EAS upload-key SHA-1 and the Play App Signing SHA-1.
- [ ] Test a production build on a real iPhone, iPad and Android phone/tablet (`eas build --profile preview`).
