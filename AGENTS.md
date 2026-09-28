This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

This project uses **Bun** (`bun.lock`): `bun install`, `bun run <script>`, `bunx <tool>`. Never add a `package-lock.json`.

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

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `bunx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## This project

- `capacitor-app/` is the retired Capacitor app plus its old backend. Metro, TypeScript and ESLint ignore it; read from it, don't edit it.
- `website/` is the plain HTML/CSS/JS website (no framework, no bundler); Metro, TypeScript and ESLint ignore it. Its content pages are pre-rendered by `bun run build:website`; see `website/README.md`. Web-only strings go in `website/i18n-source/web-strings.json` in all 12 languages.
- `api/` is the Cloudflare Worker (Hono + D1) the app talks to; it has its own package.json, tsconfig and tests (`bun --cwd api run test`).
- Every visible string goes through `t()`/`tf()` from `@/i18n` and must exist in all 12 languages (`src/i18n/app-strings.ts`). Never ship English-only UI text.
- Icons: `src/components/icon.tsx` maps names to Phosphor icons imported one file at a time (`phosphor-react-native/src/icons/<Name>`); never import from the package root (bundles every icon).
- Gita content is generated: edit `scripts/build-gita-data.mjs` / `scripts/content-fixes.mjs`, then `bun run build:data` and `bun run audit:scripts`.
- All colors, spacing and type come from `src/theme`; screens use `Text`, `Group`/`Row`, `Button` from `src/components`.
- React Compiler is on: don't read mutable module state during render — expose it through `useSyncExternalStore` snapshots (see `src/lib/gita.ts`, `src/lib/storage.ts`).
