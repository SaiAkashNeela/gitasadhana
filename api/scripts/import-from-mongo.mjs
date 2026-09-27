#!/usr/bin/env node
// Converts a MongoDB export of the old backend into SQL for D1.
//
//   mongoexport --uri "$MONGODB_URI" --collection users --jsonArray --out users.json
//   mongoexport --uri "$MONGODB_URI" --collection chats --jsonArray --out chats.json
//   node scripts/import-from-mongo.mjs users.json chats.json > import.sql
//   npx wrangler d1 execute gita-sadhana --remote --file import.sql
//
// User ids stay the Mongo ObjectId strings, so tokens issued by the old backend keep working
// when the Worker uses the same JWT_SECRET.
import { readFileSync } from "node:fs";

const [usersFile, chatsFile] = process.argv.slice(2);
if (!usersFile) {
  console.error("usage: import-from-mongo.mjs users.json [chats.json]");
  process.exit(1);
}

const q = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const oid = (v) => (typeof v === "object" && v?.$oid ? v.$oid : String(v));
const date = (v) => (typeof v === "object" && v?.$date ? new Date(v.$date).toISOString() : v ?? new Date().toISOString());

const out = [];
for (const u of JSON.parse(readFileSync(usersFile, "utf8"))) {
  const id = oid(u._id);
  const authUser = { ...u.authUser, uid: id };
  out.push(
    `INSERT OR REPLACE INTO users (id, provider, provider_subject, auth_user, profile, created_at, updated_at) VALUES (${q(id)}, ${q(u.provider)}, ${q(u.providerSubject)}, ${q(JSON.stringify(authUser))}, ${q(JSON.stringify(u.profile))}, ${q(date(u.createdAt))}, ${q(date(u.updatedAt))});`,
  );
}
if (chatsFile) {
  for (const c of JSON.parse(readFileSync(chatsFile, "utf8"))) {
    out.push(
      `INSERT OR REPLACE INTO chats (user_id, language, messages, updated_at) VALUES (${q(c.userId)}, ${q(c.language ?? "en")}, ${q(JSON.stringify(c.messages ?? []))}, ${q(c.updatedAt ?? date(c.updatedAt))});`,
    );
  }
}
console.log(out.join("\n"));
