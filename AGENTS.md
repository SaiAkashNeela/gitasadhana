This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `app/package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Repository layout

```
app/       Expo app: src/, assets/, scripts/, app.json, eas.json, its own package.json
website/   plain HTML/CSS/JS site; its build scripts are in website/scripts/
api/       Cloudflare Worker (Hono + D1), its own package.json
```

The repo root only holds docs: no package.json, no node_modules. App commands run inside `app/`, API commands inside `api/`, and the website's build scripts run with plain `bun` from the root. The retired Capacitor app lives on the `archive/capacitor-app` branch, not here.

## Commands

This project uses **Bun** (`bun.lock`): `bun install`, `bun run <script>`, `bunx <tool>`. Never add a `package-lock.json`.

Run these from `app/`:

```bash
bunx expo install <package> # ALWAYS use instead of bun add — resolves SDK-compatible versions
bunx expo start             # start the dev server
bun run lint                # lint
bun run typecheck           # typecheck
bunx expo-doctor            # diagnose dependency and config issues
bunx expo install --fix     # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `app/src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `app/src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `app/ios/` and `app/android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app/app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `bunx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project

- **This repository is public (MIT).** Never commit secrets, API tokens, keys (`.p8`, `.jks`, service-account JSON), `.env` / `.dev.vars` files, personal phone numbers or user data. Secrets live in Worker secrets, EAS credentials and environment variables, and App Store Connect; `.env.example` and `.dev.vars.example` hold names only.

- Paths below under `src/` and `scripts/` are relative to `app/`.
- `website/` is the plain HTML/CSS/JS website (no framework, no bundler). Its content pages are pre-rendered by `bash website/scripts/build.sh` (run from the repo root), using the app's content and strings; see `website/README.md`. Web-only strings go in `website/i18n-source/web-strings.json` in all 12 languages.
- `api/` is the Cloudflare Worker (Hono + D1) the app talks to; it has its own package.json, tsconfig and tests (`bun --cwd api run test`).
- Every visible string goes through `t()`/`tf()` from `@/i18n` and must exist in all 12 languages (`src/i18n/app-strings.ts`). Never ship English-only UI text.
- Icons: `src/components/icon.tsx` maps names to Phosphor icons imported one file at a time (`phosphor-react-native/src/icons/<Name>`); never import from the package root (bundles every icon).
- Gita content is generated from `scripts/content/source/` (never edit those files): edit `scripts/build-gita-data.mjs` / `scripts/content-fixes.mjs`, then `bun run build:data` and `bun run audit:scripts`.
- Tablets are supported (iPad rotates; phones are portrait). Wrap content in `Column` (capped at `layout.maxWidth`), use `useColumnInset()` for horizontal scrollers, and don't size art with `aspectRatio` + `maxHeight` (it shrinks the width on wide screens; compute a height instead).
- Store listing, screenshots and privacy answers live in `app/store/` (see `app/store/README.md`). The App Store listing is pushed with `bunx eas-cli metadata:push` (App Store Connect app `6833198350`; the App Store Connect API key is stored on EAS). Google Play listing text is in `app/store/play-listing.md`.
- Releases: JS/content changes ship as EAS updates (`bun run update:production -- "msg"`) to both iOS and Android. `runtimeVersion` follows `version` in `app.json`, so any native change (new native library, permission, plugin, icon) needs a `version` bump and new store builds. Bump `ios.buildNumber` / `android.versionCode` for every store build. Bundle ID: `app.gitasadhana.com` on iOS and Android (Expo account `isan333`; iOS on Sai Akash Neela's personal Apple Developer account, Android on the company Google Play account).
- `EXPO_PUBLIC_*` values are set in `eas.json` (builds) and as EAS environment variables (updates); change both together.
- Pushing to `main` deploys the website (Cloudflare Pages `gita-sadhana`). The API deploys only with `cd api && bun run deploy`; run `bun run typecheck` and `bun run test` in `api/` first.
- API mail goes through Cloudflare Email Service's REST API (not a `send_email` binding) from `hello@mails.gitasadhana.com`, with the Email Sending-only secret `CLOUDFLARE_EMAIL_TOKEN`. The unauthenticated `/mail/*` routes are limited per IP and per recipient (a signed-in user mailing their own address is exempt), and guest Gita AI is limited per guest id and per IP; keep those limits when changing these routes.
- All colors, spacing and type come from `src/theme`; screens use `Text`, `Group`/`Row`, `Button` from `src/components`.
- React Compiler is on: don't read mutable module state during render — expose it through `useSyncExternalStore` snapshots (see `src/lib/gita.ts`, `src/lib/storage.ts`).
