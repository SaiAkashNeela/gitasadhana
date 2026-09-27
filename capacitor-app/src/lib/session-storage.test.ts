import test from "node:test";
import assert from "node:assert/strict";

import { createSessionStore } from "./session-storage";

test("session store restores saved sessions across reloads", async () => {
  const backing = new Map<string, string>();
  const store = createSessionStore({
    async getItem(key) {
      return backing.get(key) ?? null;
    },
    async setItem(key, value) {
      backing.set(key, value);
    },
    async removeItem(key) {
      backing.delete(key);
    },
  });

  await store.save({ token: "abc", user: { uid: "u1", email: "a@b.com", displayName: "A", metadata: { creationTime: "1", lastSignInTime: "1" } } });

  const restored = await store.load();
  assert.equal(restored?.token, "abc");
  assert.equal(restored?.user.uid, "u1");
});

test("session store clears only when told to", async () => {
  const backing = new Map<string, string>();
  const store = createSessionStore({
    async getItem(key) {
      return backing.get(key) ?? null;
    },
    async setItem(key, value) {
      backing.set(key, value);
    },
    async removeItem(key) {
      backing.delete(key);
    },
  });

  await store.save({ token: "abc", user: { uid: "u1", email: "a@b.com", displayName: "A", metadata: { creationTime: "1", lastSignInTime: "1" } } });
  await store.clear();

  const restored = await store.load();
  assert.equal(restored, null);
});

