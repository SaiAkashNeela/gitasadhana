# Gita Sadhana

A calm, devotional Bhagavad Gita companion for iOS, Android and the web.

All 18 chapters and 701 verses — Sanskrit, transliteration, word meanings, translation, reflection
and essence — in 12 languages, with verse-by-verse recitation, offline downloads, daily reminders,
reading streaks, notes, bookmarks, cloud sync and Gita AI.

| | |
| --- | --- |
| App | Expo SDK 57 · React Native 0.86 · Expo Router · React Compiler · iPhone, iPad, Android phones and tablets |
| Website | Plain HTML, CSS and JavaScript at gitasadhana.com, pre-rendered in 12 languages for search — [`website/`](website/README.md) |
| API | Cloudflare Worker (Hono) + D1 (SQLite) — [`api/`](api/README.md) |
| AI | Gemini on Vertex AI through Cloudflare AI Gateway |
| Package manager | **Bun** (`bun.lock`) |
| Legacy | The old Capacitor app and its Node/Mongo backend are on the [`archive/capacitor-app`](../../tree/archive/capacitor-app) branch |

```
app/       Expo app (iOS, Android, web)
website/   gitasadhana.com — see website/README.md
api/       Cloudflare Worker + D1 — see api/README.md
```

---

## Getting started

App commands run inside `app/`:

```bash
cd app
bun install
cp .env.example .env
bun run web            # browser, http://localhost:8081
```

On a phone or simulator:

```bash
bun run ios            # development build on the iOS simulator (needs Xcode)
bun run android        # development build on an Android emulator (needs Android Studio)
bunx expo start        # Expo Go — quick look only: Google/Apple sign-in and reminders need a dev build
```

Always add dependencies with `bunx expo install <package>` so versions match the SDK.

### Environment (`app/.env`)

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL. Production: `https://gita-sadhana-api.mrsan.workers.dev`; local: `http://localhost:8787` |
| `EXPO_PUBLIC_ANDROID_API_BASE_URL` / `EXPO_PUBLIC_IOS_API_BASE_URL` | Optional per-platform override (e.g. `http://10.0.2.2:8787` on the Android emulator) |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client — also the audience of native ID tokens |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client |

### Scripts

In `app/`:

| Command | |
| --- | --- |
| `bun run web` / `ios` / `android` | Run the app |
| `bun run typecheck` · `bun run lint` | Checks (run both before committing) |
| `bun run build:data` | Regenerate Gita content from `scripts/content/source/` |
| `bun run audit:scripts` | Find text written in the wrong script (e.g. Devanagari inside Bengali) |
| `bun run build:ios` · `bun run build:android` | Store builds with EAS |
| `bun run update:preview -- "msg"` · `bun run update:production -- "msg"` | Over-the-air update |

Website (from the repo root; no install needed):

| Command | |
| --- | --- |
| `bash website/scripts/build.sh` | Build the website's data and pre-rendered pages |
| `bunx http-server website -p 5500 -c-1` | Serve it on http://localhost:5500 |
| `bun website/scripts/build-website-og.mjs` · `bash website/scripts/build-website-images.sh` | Redraw its link-preview cards · resize its artwork |

API (in `api/`): `bun run dev` · `bun run deploy` — see [`api/README.md`](api/README.md).

---

## Languages and content

English, हिन्दी, संस्कृतम्, తెలుగు, தமிழ், ಕನ್ನಡ, മലയാളം, বাংলা, ગુજરાતી, मराठी, ਪੰਜਾਬੀ, नेपाली.
Every screen, message, notification and legal page is available in each of them.

All paths below are inside `app/`.

**Scripture** comes from the original app (saved in `scripts/content/source/`) and is generated into:

- `src/data/` — chapters, quotes and the Sanskrit / transliteration / word-meanings core (bundled)
- `assets/gita/<lang>.gita` — one translation file per language, loaded only when that language is chosen

Corrections live beside the generator, never in the sources:

- `scripts/content-fixes.mjs` — mixed-script letters and wrong-language text found in the original
- `scripts/content/` — translations the original lacked (Hindi and Sanskrit quotes, three empty verses)

**Interface text**, in lookup order:

1. `src/i18n/fixes.ts` — corrections to broken strings in the original dictionary
2. `src/i18n/strings.ts` — the original app's dictionary
3. `src/i18n/app-strings.ts` — strings added by this app, in all 12 languages

Use `t("key", language)` or `tf("key", language, { n: 3 })` for anything shown to people — never a
string literal.

### Translating

`scripts/translate.mjs` translates new strings with Gemini through AI Gateway and rejects any
result that loses a `{placeholder}` or line break or mixes scripts. It talks to a small relay that
forwards `{ system, prompt }` to the model — any Worker with the `AI` binding calling
`env.AI.gateway("default").run({ provider: "google-vertex-ai", … })`, run with
`bunx wrangler dev --remote --port 8799`.

```bash
cd app && node scripts/translate.mjs strings new-strings.en.json new-strings.out.json
```

Have a native speaker read new translations before release.

### Audio

Recitations stream from `https://gita.saiakash.dev/<lang>/complete/<chapter>_<verse>.wav`
(about 4.5 MB each). There is no Sanskrit recording yet; the English recitation plays with a
notice. Downloads are saved per language with `expo-file-system` (native only).

---

## Sign-in

| | iOS | Android | Web |
| --- | --- | --- | --- |
| Sign in with Apple (Apple's native button) | ✓ | — | — |
| Continue with Google (official Google button) | ✓ | ✓ | ✓ |

The app sends the provider's token to the API (`/auth/google`, `/auth/apple`), which verifies it
and returns its own session token (kept in the Keychain / Keystore; localStorage on web).

Before release, in Google Cloud Console (project `822836118890`, OAuth clients):

- **Web client** — add every web origin under *Authorized JavaScript origins*, e.g.
  `http://localhost:8081` and the production web URL.
- **Android client** (`com.gitasadhana.app`) — create one for this package and list the SHA-1 of
  the EAS upload key (`bunx eas-cli credentials -p android`) and the Play App Signing SHA-1 from
  Play Console.

Apple: the App ID `com.gitasadhana.ios` already has the Sign in with Apple capability.

---

## Releasing

### Store builds

```bash
bunx eas-cli login
bun run build:ios
bun run build:android
```

Bundle identifiers: `com.gitasadhana.ios` (the existing App Store app) and `com.gitasadhana.app`
(a new Google Play app in the business developer account; the old personal-account app
`com.gitasadhana.android` is retired). EAS creates and keeps the signing keys.

### Over-the-air updates

Text, content, translations, images, styling and any JavaScript change can ship without a store
review:

```bash
bun run update:preview -- "Fix Telugu title of chapter 3"      # test on preview builds first
bun run update:production -- "Fix Telugu title of chapter 3"
```

Installed apps look for an update whenever they're opened, download it in the background and offer a
one-tap restart (`src/hooks/use-ota-updates.ts`). Changes to native code or native libraries still
need a store build.

One-time setup (Expo account):

```bash
bunx eas-cli login
bunx eas-cli init              # links the project
bunx eas-cli update:configure  # adds updates.url, runtimeVersion and build-profile channels
```

---

## Project layout

All inside `app/` except the last two.

```
src/app/         routes only (Expo Router)
src/screens/     screen bodies
src/components/  shared UI: text, buttons, grouped lists, player, tab bar, sign-in buttons, icons
src/providers/   theme, progress + cloud sync, audio
src/lib/         content, API, auth, storage, downloads, reminders, sharing
src/i18n/        interface strings (see Languages)
src/theme/       design tokens: colours, spacing, type, radius
src/data/        generated content
store/           App Store / Google Play listing, screenshots and privacy answers (see store/README.md)
assets/          artwork, icons, per-language translation files
scripts/         content pipeline and its source data, audits, translation
../api/          Cloudflare Worker + D1
../website/      the website (plain HTML/CSS/JS, see website/README.md)
```

**Design.** Ink-and-stone palette with a single Krishna-blue accent and lamp-gold for devotional
marks; light and dark. Titles in Marcellus, scripture in EB Garamond, Sanskrit in Noto Serif
Devanagari. Icons are [Phosphor](https://phosphoricons.com), imported one file at a time
(`phosphor-react-native/src/icons/<Name>`) so only the icons used are bundled.

---

Made by [Sai Akash Neela](https://saiakashneela.com) · [GitHub](https://github.com/SaiAkashNeela)
