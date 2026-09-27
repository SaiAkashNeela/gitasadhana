# Gita Sadhana

Bhagavad Gita study companion for iOS, Android and web, built with Expo (SDK 57) and Expo Router.
All 18 chapters and 701 verses with Sanskrit, transliteration, word meanings, translations and
reflections in 13 languages, verse-by-verse audio recitation, offline downloads, daily reminders,
reading streaks, notes, bookmarks, cloud sync and Gita AI.

The previous Capacitor app (and the Node/MongoDB backend it talks to) lives in `capacitor-app/`.

## Run

```bash
npm install
cp .env.example .env        # API base URL + Google client IDs
npm run web                 # browser
npx expo start              # Expo Go (Google sign-in / notifications need a dev build)
npm run ios                 # development build on iOS simulator
npm run android             # development build on Android emulator
```

## Content

Gita content is generated from the original sources in `capacitor-app/`:

```bash
npm run build:data     # writes src/data/*.json and assets/gita/<lang>.gita
npm run audit:scripts  # flags text written in the wrong script (e.g. Devanagari inside Bengali)
```

`scripts/content-fixes.mjs` and `src/i18n/fixes.ts` hold corrections to errors found in the
original content; the source files are left untouched.

Translations ship as one asset per language and load on demand, so the JS bundle stays small.
Recitations stream from `https://gita.saiakash.dev/<lang>/complete/<chapter>_<verse>.wav`
(Sanskrit has no recordings; the English recitation plays with a notice).

## Layout

```
src/app/         routes only (Expo Router)
src/screens/     screen bodies
src/components/  shared UI (text, buttons, grouped lists, player, tab bar)
src/providers/   theme, progress/sync, audio
src/lib/         data, API, auth, storage, downloads, reminders
src/i18n/        UI strings (carried over from the Capacitor app) + fixes
src/theme/       design tokens
```

## Release

`eas.json` defines development / preview / production profiles. Bundle IDs match the store apps:
`com.gitasadhana.ios` and `com.gitasadhana.android`.
