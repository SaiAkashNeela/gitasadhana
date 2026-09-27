import test from "node:test";
import assert from "node:assert/strict";
import { buildDailyUsageUpdate } from "../src/services/ai-usage.js";

test("buildDailyUsageUpdate does not set count on insert", () => {
  const update = buildDailyUsageUpdate("guest:abc", "2026-06-13");

  assert.deepEqual(update, {
    $inc: { count: 1 },
    $setOnInsert: { userId: "guest:abc", day: "2026-06-13" },
  });
});
