import {
  describe,
  expect,
  it,
} from "vitest";
import { splitGraphemes, splitGraphemesFallback, splitWordTokens } from "../../src/shared/grapheme";

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
describe("splitGraphemesFallback", () => {
  it("keeps a family emoji in one cluster", () => {
    expect(splitGraphemesFallback("👩‍👩‍👧‍👦")).toEqual(["👩‍👩‍👧‍👦"]);
  });
  it("keeps one flag per regional-indicator pair", () => {
    expect(splitGraphemesFallback("🇵🇰🇺🇸")).toEqual(["🇵🇰", "🇺🇸"]);
  });
  it("attaches combining marks to their base", () => {
    expect(splitGraphemesFallback("café")).toEqual(["c", "a", "f", "é"]);
  });
  it("keeps skin-tone modifiers joined to the base", () => {
    expect(splitGraphemesFallback("👍🏽")).toEqual(["👍🏽"]);
  });
  it("handles emoji next to plain letters", () => {
    expect(splitGraphemesFallback("a👨‍💻b")).toEqual(["a", "👨‍💻", "b"]);
  });
  it("splits plain text into letters", () => {
    expect(splitGraphemesFallback("abc")).toEqual(["a", "b", "c"]);
  });
});
