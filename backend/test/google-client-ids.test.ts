import test from "node:test";
import assert from "node:assert/strict";
import { buildGoogleClientIds } from "../src/services/google-client-ids.js";

test("google client ids dedupe platform audiences", () => {
  const ids = buildGoogleClientIds("web", "android", "ios", "web");

  assert.deepEqual(ids, ["web", "android", "ios"]);
});
