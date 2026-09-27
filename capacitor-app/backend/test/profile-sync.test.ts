import test from "node:test";
import assert from "node:assert/strict";

import { mergeUserProfile } from "../src/lib/profile.js";

test("mergeUserProfile unions synced lists without dropping local data", () => {
  const existing = {
    name: "Seeker",
    email: "local@example.com",
    streak: 2,
    versesRead: 7,
    bookmarks: ["1.1", "2.47"],
    notes: [{ id: "n1", verseId: "1.1", title: "Local", body: "A", date: "2026-06-12" }],
    history: [{ id: "h1", chapter: 1, verse: 1, date: "2026-06-12T00:00:00.000Z" }],
    favorites: ["2.47"],
    completedVerses: ["1.1"],
    readVerses: ["1.1"],
    readDates: ["2026-06-12"],
    downloadedVerses: ["1.1"],
    downloadedChapters: [1],
    isGitaDownloaded: false,
    language: "en",
    minutes: 12,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
  };

  const patch = {
    name: "Seeker",
    email: "remote@example.com",
    streak: 5,
    versesRead: 9,
    bookmarks: ["2.47", "3.5"],
    notes: [{ id: "n2", verseId: "2.47", title: "Remote", body: "B", date: "2026-06-12" }],
    history: [{ id: "h2", chapter: 2, verse: 47, date: "2026-06-12T01:00:00.000Z" }],
    favorites: ["3.5"],
    completedVerses: ["3.5"],
    readVerses: ["3.5"],
    readDates: ["2026-06-13"],
    downloadedVerses: ["3.5"],
    downloadedChapters: [2],
    isGitaDownloaded: true,
    language: "hi",
    minutes: 30,
    createdAt: "2026-06-01T00:00:00.000Z",
  };

  const merged = mergeUserProfile(existing, patch);

  assert.deepEqual(merged.bookmarks, ["1.1", "2.47", "3.5"]);
  assert.deepEqual(merged.notes.map((note) => note.id), ["n1", "n2"]);
  assert.deepEqual(merged.history.map((item) => item.id), ["h1", "h2"]);
  assert.deepEqual(merged.favorites, ["2.47", "3.5"]);
  assert.deepEqual(merged.completedVerses, ["1.1", "3.5"]);
  assert.deepEqual(merged.readVerses, ["1.1", "3.5"]);
  assert.deepEqual(merged.readDates, ["2026-06-12", "2026-06-13"]);
  assert.deepEqual(merged.downloadedVerses, ["1.1", "3.5"]);
  assert.deepEqual(merged.downloadedChapters, [1, 2]);
  assert.equal(merged.isGitaDownloaded, true);
  assert.equal(merged.language, "hi");
  assert.equal(merged.minutes, 30);
  assert.equal(merged.email, "remote@example.com");
});

