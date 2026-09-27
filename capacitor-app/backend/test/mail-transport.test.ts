import test from "node:test";
import assert from "node:assert/strict";

process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const { resolveMailTransportMode } = await import("../src/services/mail.js");

test("resolveMailTransportMode uses maildev in development", () => {
  assert.equal(resolveMailTransportMode("development"), "maildev");
});

test("resolveMailTransportMode uses ses in production", () => {
  assert.equal(resolveMailTransportMode("production"), "ses");
});

