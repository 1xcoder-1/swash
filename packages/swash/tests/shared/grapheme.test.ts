import { describe, expect, it } from "vitest";
import { splitGraphemes, splitWordTokens } from "../../src/shared/grapheme";

describe("splitGraphemes", () => {
  it("keeps family emoji as one unit", () => {
    expect(splitGraphemes("a👨‍👩‍👧b")).toEqual(["a", "👨‍👩‍👧", "b"]);
  });
  it("keeps combining marks attached", () => {
    expect(splitGraphemes("é")).toEqual(["é"]);
  });
  it("handles RTL text without mangling", () => {
    expect(splitGraphemes("مرحبا")).toHaveLength(5);
  });
  it("returns empty array for empty string", () => {
    expect(splitGraphemes("")).toEqual([]);
  });
});

describe("splitWordTokens", () => {
  it("preserves spaces as flagged tokens", () => {
    expect(splitWordTokens("hi there")).toEqual([
      { text: "hi", space: false },
      { text: " ", space: true },
      { text: "there", space: false },
    ]);
  });
});
