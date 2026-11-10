import type { AuthUser, ChatMessage, Provider, UserProfile, UserRow } from "../types";

export type User = { id: string; provider: Provider; authUser: AuthUser; profile: UserProfile };

const parse = (row: UserRow): User => ({
  id: row.id,
  provider: row.provider,
  authUser: JSON.parse(row.auth_user),
  profile: JSON.parse(row.profile),
});

export async function findUserById(db: D1Database, id: string) {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
  return row ? parse(row) : null;
}

export async function findUserBySubject(db: D1Database, subject: string) {
  const row = await db.prepare("SELECT * FROM users WHERE provider_subject = ?").bind(subject).first<UserRow>();
  return row ? parse(row) : null;
}

export async function insertUser(db: D1Database, user: User & { subject: string }, now: string) {
  await db
    .prepare(
      "INSERT INTO users (id, provider, provider_subject, auth_user, profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(user.id, user.provider, user.subject, JSON.stringify(user.authUser), JSON.stringify(user.profile), now, now)
    .run();
}

export async function updateAuthUser(db: D1Database, id: string, authUser: AuthUser, now: string) {
  await db.prepare("UPDATE users SET auth_user = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(authUser), now, id).run();
}

export async function updateProfile(db: D1Database, id: string, profile: UserProfile, now: string) {
  await db.prepare("UPDATE users SET profile = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(profile), now, id).run();
}

export async function deleteUser(db: D1Database, id: string) {
  // Chat rows cascade only when foreign keys are enforced; delete explicitly to be sure.
  await db.batch([
    db.prepare("DELETE FROM chats WHERE user_id = ?").bind(id),
    db.prepare("DELETE FROM ai_usage WHERE user_id = ?").bind(id),
    db.prepare("DELETE FROM users WHERE id = ?").bind(id),
  ]);
}

export async function getChat(db: D1Database, userId: string) {
  const row = await db.prepare("SELECT language, messages FROM chats WHERE user_id = ?").bind(userId).first<{ language: string; messages: string }>();
  return row ? { language: row.language, messages: JSON.parse(row.messages) as ChatMessage[] } : null;
}

export async function putChat(db: D1Database, userId: string, messages: ChatMessage[], language: string, now: string) {
  await db
    .prepare(
      `INSERT INTO chats (user_id, language, messages, updated_at) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, messages = excluded.messages, updated_at = excluded.updated_at`,
    )
    .bind(userId, language, JSON.stringify(messages), now)
    .run();
}

/**
 * Atomically count one use of `key` today; returns the count after incrementing.
 * Gita AI quotas use user ids, guest ids and IPs as keys; mail throttling uses `mail-*` keys.
 */
export async function incrementDailyCount(db: D1Database, key: string, day: string) {
  const row = await db
    .prepare(
      `INSERT INTO ai_usage (user_id, day, count) VALUES (?, ?, 1)
       ON CONFLICT(user_id, day) DO UPDATE SET count = count + 1
       RETURNING count`,
    )
    .bind(key, day)
    .first<{ count: number }>();
  return row?.count ?? 1;
}
