# Gita Sadhana API (Cloudflare Worker + D1)

Replaces the Node/Express + MongoDB backend in `backend/` on the `archive/capacitor-app` branch with the same HTTP
contract, so both the new Expo app and the old Capacitor builds work against it.

- **Runtime:** Cloudflare Workers, [Hono](https://hono.dev)
- **Database:** D1 (SQLite) — `users` (identity + progress profile as JSON), `chats`, `ai_usage`
- **Sign-in:** Google ID tokens and Apple identity tokens verified with `jose` against the
  providers' public keys; the app gets its own 365-day HS256 token
- **Gita AI:** Gemini on Vertex AI (project `arivulabs-platform`, location `global`), called through
  the account's **AI Gateway "default"** via the Worker's `AI` binding. The gateway injects the
  Vertex credentials stored in it (BYOK), so no model key lives in the Worker, and every call is
  logged in the gateway dashboard. 30 requests per user (or guest device) per day
- **Mail:** Cloudflare Email Service (REST API) from `hello@mails.gitasadhana.com`; the
  `mails.gitasadhana.com` subdomain is onboarded to Email Sending with SPF, DKIM and DMARC

Live: `https://gita-sadhana-api.mrsan.workers.dev`

| Route | |
| --- | --- |
| `GET /health` | liveness |
| `POST /auth/google` · `POST /auth/apple` | exchange provider token → `{ token, user, isNewUser }` |
| `GET /auth/me` · `POST /auth/logout` | session |
| `GET /users/me` · `POST /users/me/sync` · `DELETE /users/me` | progress; sync `mode: "merge"` (sign-in) or `"replace"` |
| `GET /chat/me` · `PUT /chat/me` | Gita AI history |
| `POST /ai/chat` | Gita AI (bearer token or `x-guest-id`) |
| `POST /mail/contact` · `/correction` · `/newsletter` · `/welcome` | email |

## Develop

```bash
cd api
bun install
cp .dev.vars.example .dev.vars          # JWT_SECRET, CLOUDFLARE_EMAIL_TOKEN
bun run db:migrate:local
bun run dev                             # http://localhost:8787 (Gita AI needs `bunx wrangler dev --remote`)
bun run test
```

The model and location are Worker variables — change them any time in the Cloudflare dashboard
(Workers → gita-sadhana-api → Settings → Variables): `GEMINI_MODEL_ID` (default `gemini-3.8-flash`)
and `VERTEX_LOCATION` (always `global`). `keep_vars` in `wrangler.jsonc` stops deploys from
overwriting them.

Point the app at it with `EXPO_PUBLIC_API_BASE_URL=http://localhost:8787` in the root `.env`.

## Deploy

```bash
bun run db:migrate:remote               # after adding a file to migrations/
bunx wrangler secret put CLOUDFLARE_EMAIL_TOKEN   # account API token with only "Email Sending Write"
bun run deploy
```

Custom domain: add `"routes": [{ "pattern": "api.gitasadhana.com", "custom_domain": true }]` to
`wrangler.jsonc` (the zone must be on this Cloudflare account), deploy, and update
`EXPO_PUBLIC_API_BASE_URL`.

## Moving users over from MongoDB

```bash
mongoexport --uri "$MONGODB_URI" --collection users --jsonArray --out users.json
mongoexport --uri "$MONGODB_URI" --collection chats --jsonArray --out chats.json
node scripts/import-from-mongo.mjs users.json chats.json > import.sql
bunx wrangler d1 execute gita-sadhana --remote --file import.sql
```

User ids are kept, so if you also set the old backend's `JWT_SECRET` on the Worker, people who
were signed in stay signed in.
