-- Gita Sadhana on Cloudflare D1 (SQLite).
-- Same data the Mongo backend kept: one row per signed-in user (auth identity + progress
-- profile as JSON), one chat history per user, and a daily Gita AI usage counter.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject TEXT NOT NULL UNIQUE,
  auth_user TEXT NOT NULL,   -- JSON AuthUser
  profile TEXT NOT NULL,     -- JSON UserProfile
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE chats (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL DEFAULT 'en',
  messages TEXT NOT NULL DEFAULT '[]', -- JSON ChatMessage[]
  updated_at TEXT NOT NULL
);

-- user_id is a users.id or "guest:<id>", so no foreign key.
CREATE TABLE ai_usage (
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
