import test from "node:test";
import assert from "node:assert/strict";
import { resolveAiChatIdentity } from "../src/services/chat-identity.js";

test("resolves a guest ai chat identity from the guest header", async () => {
  const identity = await resolveAiChatIdentity({
    headers: {
      "x-guest-id": "device-123",
    },
  } as any);

  assert.deepEqual(identity, {
    userId: "guest:device-123",
    isGuest: true,
  });
});
