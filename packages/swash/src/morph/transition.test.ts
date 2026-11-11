import { describe, expect, it } from "vitest";
import { planTransition } from "./transition";

/**
 * The plan is what makes a morph cheap: everything both strings agree on stays
 * where it is, and only the disagreement between them moves. These cases are
 * read as "what does the reader see change".
 */
describe("planTransition", () => {
  it("keeps what the two strings share", () => {
    expect(planTransition("2019", "2015")).toEqual({ keep: 3, out: ["9"], in_: ["5"] });
    expect(planTransition("cat", "car")).toEqual({ keep: 2, out: ["t"], in_: ["r"] });
    expect(planTransition("", "hi")).toEqual({ keep: 0, out: [], in_: ["h", "i"] });
    expect(planTransition("hello", "hello")).toEqual({ keep: 5, out: [], in_: [] });
  });

  it("counts a shared ending as kept too", () => {
    expect(planTransition("2024", "1024")).toEqual({ keep: 0, out: ["2"], in_: ["1"] });
    expect(planTransition("2024", "202")).toEqual({ keep: 3, out: ["4"], in_: [] });
  });

  it("moves whole graphemes, never half an emoji", () => {
    expect(planTransition("🚀x", "🚀y").out).toEqual(["x"]);
    expect(planTransition("👍🏽 go", "👍🏽 go!")).toEqual({
      keep: 4,
      out: [],
      in_: ["!"],
    });
  });

  it("never keeps the same grapheme twice", () => {
    // The prefix and the suffix of two strings can overlap; the tail it puts
    // back must be what is actually missing, not both readings of one letter.
    expect(planTransition("aaa", "aa")).toEqual({ keep: 2, out: ["a"], in_: [] });
    expect(planTransition("ab", "bab").out).toEqual([]);
    expect(planTransition("ab", "bab").in_).toEqual(["b"]);
  });
});
