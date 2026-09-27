import test from "node:test";
import assert from "node:assert/strict";

import { createNowPlayingMetadata } from "../src/lib/mediaSession.js";

test("creates now playing metadata with branded artwork", () => {
  const metadata = createNowPlayingMetadata({
    chapterId: 1,
    chapterTitle: "Arjuna Visada Yoga",
    verseId: 1,
  });

  assert.equal(metadata.title, "Arjuna Visada Yoga • Verse 1");
  assert.equal(metadata.artist, "Gita Sadhana");
  assert.equal(metadata.album, "Bhagavad Gita");
  assert.deepEqual(metadata.artwork?.map((entry) => entry.sizes), ["96x96", "256x256", "512x512"]);
  assert.equal(metadata.artwork?.[0].src, "/favicon-logo.png");
});
