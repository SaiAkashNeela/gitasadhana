import test from "node:test";
import assert from "node:assert/strict";
import { resolveAppleBundleId } from "../src/services/apple-bundle-id.js";

test("resolveAppleBundleId prefers APPLE_BUNDLE_ID", () => {
  assert.equal(
    resolveAppleBundleId({
      APPLE_BUNDLE_ID: "com.gitasadhana.ios",
      APPLE_CLIENT_ID: "com.gitasadhana.web",
    }),
    "com.gitasadhana.ios",
  );
});

test("resolveAppleBundleId falls back to APPLE_CLIENT_ID", () => {
  assert.equal(
    resolveAppleBundleId({
      APPLE_CLIENT_ID: "com.gitasadhana.ios",
    }),
    "com.gitasadhana.ios",
  );
});
