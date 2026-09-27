import { describe, expect, it } from "vitest";

import { signAppToken, verifyAppToken, bearerToken } from "../src/lib/jwt";
import { mergeUserProfile, newProfile, replaceUserProfile } from "../src/lib/profile";

const base = () => ({
  ...newProfile("Arjuna", "a@example.com", "2026-01-01T00:00:00.000Z"),
  bookmarks: ["2.47"],
  notes: [{ id: "n1", verseId: "2.47", title: "t", body: "b", date: "Jan 1" }],
});

describe("mergeUserProfile (sign-in)", () => {
  it("unions lists without duplicates", () => {
    const merged = mergeUserProfile(base(), {
      bookmarks: ["2.47", "18.66"],
      notes: [{ id: "n1", verseId: "2.47", title: "t", body: "b", date: "Jan 1" }, { id: "n2", verseId: "6.5", title: "x", body: "y", date: "Jan 2" }],
    });
    expect(merged.bookmarks).toEqual(["2.47", "18.66"]);
    expect(merged.notes.map((n) => n.id)).toEqual(["n1", "n2"]);
  });

  it("keeps stored lists the device did not send", () => {
    expect(mergeUserProfile(base(), { streak: 4 }).bookmarks).toEqual(["2.47"]);
  });
});

describe("replaceUserProfile (regular sync)", () => {
  it("lets a removed bookmark stay removed", () => {
    const next = replaceUserProfile(base(), { bookmarks: [], streak: 2 });
    expect(next.bookmarks).toEqual([]);
    expect(next.notes).toHaveLength(1);
    expect(next.streak).toBe(2);
  });
});

describe("app tokens", () => {
  it("round-trips the user id", async () => {
    const token = await signAppToken("secret", { userId: "u1", provider: "google" });
    expect((await verifyAppToken("secret", token)).userId).toBe("u1");
    await expect(verifyAppToken("other", token)).rejects.toThrow();
  });

  it("parses bearer headers", () => {
    expect(bearerToken("Bearer abc")).toBe("abc");
    expect(bearerToken("Basic abc")).toBeNull();
    expect(bearerToken(undefined)).toBeNull();
  });
});
